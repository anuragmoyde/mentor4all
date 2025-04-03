
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  user_type: 'mentor' | 'mentee';
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, userType?: 'mentor' | 'mentee') => Promise<{ error: any, data: any }>;
  signInWithGoogle: (userType: 'mentor' | 'mentee') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
              
            if (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
            } else {
              console.log('Profile loaded:', data);
              setProfile(data as Profile);
            }
          } catch (err) {
            console.error('Exception fetching profile:', err);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Initial session check:', currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
              
            if (error) {
              console.error('Error fetching profile on init:', error);
              setProfile(null);
            } else {
              console.log('Initial profile loaded:', data);
              setProfile(data as Profile);
            }
          } catch (err) {
            console.error('Exception fetching profile on init:', err);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Error getting session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      toast({
        title: "Login failed",
        description: result.error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
    }
    return { error: result.error };
  };

  const signInWithGoogle = async (userType: 'mentor' | 'mentee') => {
    try {
      // Store the user type preference in localStorage so we can access it after redirect
      localStorage.setItem('preferred_user_type', userType);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth?user_type=${userType}`,
          queryParams: {
            // Pass the user type as a custom parameter
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        title: "Google sign in failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, userType: 'mentor' | 'mentee' = 'mentee') => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          user_type: userType
        }
      }
    });
    
    if (result.error) {
      toast({
        title: "Sign up failed",
        description: result.error.message,
        variant: "destructive"
      });
    } else {
      // If the user is signing up as a mentor, we need to create a record in the mentors table
      if (userType === 'mentor' && result.data.user) {
        const { error: mentorError } = await supabase
          .from('mentors')
          .insert({
            id: result.data.user.id,
            hourly_rate: 0, // Default hourly rate
            expertise: [], // Empty expertise array
          });
          
        if (mentorError) {
          console.error('Error creating mentor profile:', mentorError);
          toast({
            title: "Mentor profile creation failed",
            description: "Your account was created, but there was an issue setting up your mentor profile. Please contact support.",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Account created",
        description: "You have successfully created your account.",
      });
    }
    
    return { error: result.error, data: result.data };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Clear all auth state explicitly
        setUser(null);
        setSession(null);
        setProfile(null);
        
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }
    } catch (err) {
      console.error('Exception during sign out:', err);
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setProfile(data as Profile);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
