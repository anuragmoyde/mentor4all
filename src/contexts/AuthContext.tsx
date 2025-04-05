
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
    console.log('AuthProvider: Initializing auth state');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        // Update session and user synchronously
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If we have a session, fetch the profile asynchronously
        if (currentSession?.user) {
          // Use setTimeout to avoid potential Supabase auth deadlocks
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user!.id)
                .single();
                
              if (error) {
                console.error('Error fetching profile:', error);
                setProfile(null);
              } else {
                console.log('Profile loaded:', data);
                setProfile(data as Profile);
              }
              
              // Set loading to false after profile is loaded
              setIsLoading(false);
            } catch (err) {
              console.error('Exception fetching profile:', err);
              setProfile(null);
              setIsLoading(false);
            }
          }, 0);
        } else {
          // No user, so no profile to fetch
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session');
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
      console.log('AuthProvider: Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Signing in with email:', email);
    setIsLoading(true);
    
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) {
        console.error('Sign in error:', result.error);
        toast({
          title: "Login failed",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        console.log('Sign in successful');
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        });
      }
      return { error: result.error };
    } catch (err) {
      console.error('Exception during sign in:', err);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { error: err };
    } finally {
      // Don't set isLoading to false here, it will be updated by the auth state listener
    }
  };

  const signInWithGoogle = async (userType: 'mentor' | 'mentee') => {
    try {
      console.log('Signing in with Google as:', userType);
      setIsLoading(true);
      
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
        console.error('Google sign in error:', error);
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      console.log('Google sign in initiated:', data);
    } catch (error) {
      console.error('Google sign in exception:', error);
      toast({
        title: "Google sign in failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      throw error;
    }
    // Don't set isLoading to false here since we're redirecting to Google
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, userType: 'mentor' | 'mentee' = 'mentee') => {
    console.log('Signing up with email:', email, 'as', userType);
    setIsLoading(true);
    
    try {
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
        console.error('Sign up error:', result.error);
        toast({
          title: "Sign up failed",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        console.log('Sign up successful');
        
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
    } catch (err) {
      console.error('Exception during sign up:', err);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { error: err, data: null };
    } finally {
      // Don't set isLoading to false here, it will be updated by the auth state listener
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      setIsLoading(true);
      
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
        
        console.log('Signed out successfully');
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      console.error('Cannot update profile: No user logged in');
      return { error: new Error('No user logged in') };
    }

    try {
      console.log('Updating profile for user:', user.id, updates);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Profile updated successfully:', data);
        setProfile(data as Profile);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }

      return { error };
    } catch (err) {
      console.error('Exception updating profile:', err);
      toast({
        title: "Update failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { error: err };
    }
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
