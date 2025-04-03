import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  userType: z.enum(['mentor', 'mentee'], { 
    required_error: "Please select whether you're joining as a mentor or mentee" 
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth: React.FC = () => {
  const { signIn, signUp, signInWithGoogle, user, profile, updateProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'mentor' | 'mentee'>('mentee');
  const [processingOAuth, setProcessingOAuth] = useState(false);

  useEffect(() => {
    const userTypeParam = searchParams.get('user_type');
    
    const checkRedirectState = async () => {
      if (user && !authLoading && (!profile?.user_type || profile.user_type === 'mentee') && userTypeParam === 'mentor') {
        setProcessingOAuth(true);
        try {
          console.log('Updating user type to mentor after OAuth redirect');
          await updateProfile({
            user_type: 'mentor'
          });
          
          const { error } = await fetch('/api/create-mentor-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id }),
          }).then(res => res.json());
          
          if (error) {
            console.error('Error creating mentor profile:', error);
          }
          
          navigate('/mentor-dashboard');
        } catch (err) {
          console.error('Error setting user type after OAuth:', err);
        } finally {
          setProcessingOAuth(false);
        }
      }
    };
    
    if (userTypeParam && user && !authLoading) {
      checkRedirectState();
    }
  }, [user, profile, searchParams, navigate, updateProfile, authLoading]);

  useEffect(() => {
    if (user && profile && !processingOAuth) {
      if (profile.user_type === 'mentor') {
        navigate('/mentor-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, profile, navigate, processingOAuth]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'mentee',
    },
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        setAuthError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const { error } = await signUp(
        values.email,
        values.password,
        values.firstName,
        values.lastName,
        values.userType
      );
      if (error) {
        setAuthError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setShowRoleSelection(true);
  };

  const handleRoleSelectionComplete = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle(selectedRole);
    } catch (error) {
      setAuthError((error as Error).message);
    } finally {
      setIsLoading(false);
      setShowRoleSelection(false);
    }
  };

  if (authLoading || processingOAuth) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (showRoleSelection) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <h1 className="text-xl font-bold">Choose Your Role</h1>
            <p className="text-muted-foreground mt-2">
              How would you like to join Mentor4All?
            </p>
          </div>
          
          <RadioGroup 
            defaultValue={selectedRole} 
            onValueChange={(value) => setSelectedRole(value as 'mentor' | 'mentee')}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="mentee" id="mentee" />
              <label htmlFor="mentee" className="flex-1 cursor-pointer">
                <div className="font-medium">Join as a Mentee</div>
                <div className="text-sm text-muted-foreground">I'm looking for guidance and expertise</div>
              </label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="mentor" id="mentor" />
              <label htmlFor="mentor" className="flex-1 cursor-pointer">
                <div className="font-medium">Join as a Mentor</div>
                <div className="text-sm text-muted-foreground">I want to share my knowledge and expertise</div>
              </label>
            </div>
          </RadioGroup>
          
          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowRoleSelection(false)} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRoleSelectionComplete} 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to Mentor4All</h1>
          <p className="text-muted-foreground mt-2">
            Connect with experienced mentors to grow your skills
          </p>
        </div>

        {authError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start space-x-2">
            <AlertCircle size={18} className="mt-0.5" />
            <p className="text-sm">{authError}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.8452 8.18758C15.8452 7.52549 15.7891 6.97608 15.6656 6.4043H8.12422V9.35483H12.5312C12.4301 10.0983 11.9668 11.1816 10.9258 11.9077L10.9077 12.0192L13.2663 13.8332L13.4351 13.8496C14.9387 12.4724 15.8452 10.5181 15.8452 8.18758Z" fill="#4285F4" />
                <path d="M8.12423 16C10.3106 16 12.1227 15.2839 13.4352 13.8496L10.9258 11.9077C10.2637 12.3585 9.34985 12.6692 8.12423 12.6692C5.99383 12.6692 4.20622 11.2919 3.56454 9.35794L3.46091 9.36615L0.995853 11.2526L0.961426 11.3529C2.26352 14.0754 4.96876 16 8.12423 16Z" fill="#34A853" />
                <path d="M3.56448 9.35793C3.3961 8.78636 3.28871 8.17672 3.28871 7.53907C3.28871 6.90138 3.3961 6.29178 3.55826 5.72025L3.55241 5.60159L1.04804 3.67822L0.961367 3.72524C0.350282 4.85748 0 6.15592 0 7.53907C0 8.92222 0.350282 10.2207 0.961367 11.3529L3.56448 9.35793Z" fill="#FBBC05" />
                <path d="M8.12423 2.40894C9.64644 2.40894 10.7031 2.95834 11.3072 3.52988L13.5481 1.36971C12.1165 0.0581971 10.3106 -0.109091 8.12423 0.0478153C4.96876 0.0478153 2.26352 1.97245 0.961426 4.69492L3.5583 6.72023C4.20626 4.78625 5.99383 2.40894 8.12423 2.40894Z" fill="#EB4335" />
              </svg>
              <span>Google</span>
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-6">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signupForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I want to join as a</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="mentee" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Mentee (seeking guidance)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="mentor" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Mentor (offering expertise)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.8452 8.18758C15.8452 7.52549 15.7891 6.97608 15.6656 6.4043H8.12422V9.35483H12.5312C12.4301 10.0983 11.9668 11.1816 10.9258 11.9077L10.9077 12.0192L13.2663 13.8332L13.4351 13.8496C14.9387 12.4724 15.8452 10.5181 15.8452 8.18758Z" fill="#4285F4" />
                <path d="M8.12423 16C10.3106 16 12.1227 15.2839 13.4352 13.8496L10.9258 11.9077C10.2637 12.3585 9.34985 12.6692 8.12423 12.6692C5.99383 12.6692 4.20622 11.2919 3.56454 9.35794L3.46091 9.36615L0.995853 11.2526L0.961426 11.3529C2.26352 14.0754 4.96876 16 8.12423 16Z" fill="#34A853" />
                <path d="M3.56448 9.35793C3.3961 8.78636 3.28871 8.17672 3.28871 7.53907C3.28871 6.90138 3.3961 6.29178 3.55826 5.72025L3.55241 5.60159L1.04804 3.67822L0.961367 3.72524C0.350282 4.85748 0 6.15592 0 7.53907C0 8.92222 0.350282 10.2207 0.961367 11.3529L3.56448 9.35793Z" fill="#FBBC05" />
                <path d="M8.12423 2.40894C9.64644 2.40894 10.7031 2.95834 11.3072 3.52988L13.5481 1.36971C12.1165 0.0581971 10.3106 -0.109091 8.12423 0.0478153C4.96876 0.0478153 2.26352 1.97245 0.961426 4.69492L3.5583 6.72023C4.20626 4.78625 5.99383 2.40894 8.12423 2.40894Z" fill="#EB4335" />
              </svg>
              <span>Google</span>
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
