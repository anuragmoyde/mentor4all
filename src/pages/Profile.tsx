
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, User, Save, ArrowLeft } from 'lucide-react';

// Import Reusable Components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfilePictureCard from '@/components/profile/ProfilePictureCard';
import AccountTypeSection from '@/components/profile/AccountTypeSection';
import { toast } from '@/hooks/use-toast';

const profileSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  last_name: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
  const { user, profile, isLoading, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      bio: profile?.bio || '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await updateProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        bio: values.bio,
      });
      
      // Show save animation
      setShowSaveAnimation(true);
      setTimeout(() => setShowSaveAnimation(false), 2000);
      
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-lg font-medium text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProfileHeader 
            userType={profile?.user_type} 
            signOut={signOut} 
          />
        </motion.div>
        
        {/* Profile banner with decoration */}
        <div className="relative mb-8 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-1">
          <div className="absolute top-0 right-0 p-3">
            <Sparkles className="h-6 w-6 text-primary/60" />
          </div>
          <div className="rounded-lg bg-white/40 backdrop-blur-sm p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-center">Welcome to your personal space</h2>
            <p className="text-muted-foreground text-center mt-2">
              Update your profile to help others know you better
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          <motion.div 
            className="md:col-span-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProfilePictureCard 
              avatarUrl={profile?.avatar_url}
              firstName={profile?.first_name}
              lastName={profile?.last_name}
              userId={user.id}
              updateProfile={updateProfile}
            />
          </motion.div>

          <motion.div 
            className="md:col-span-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="overflow-hidden border-2 shadow-md">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-6">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details to enhance your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Account Type Information */}
                <AccountTypeSection 
                  userType={profile?.user_type}
                  userId={user.id}
                  updateProfile={updateProfile}
                />
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">First Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John" 
                                {...field} 
                                className="bg-slate-50/50 transition-all focus:bg-white" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Doe" 
                                {...field} 
                                className="bg-slate-50/50 transition-all focus:bg-white" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us a bit about yourself and your expertise..."
                              className="resize-none min-h-[150px] bg-slate-50/50 transition-all focus:bg-white"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be displayed on your public profile
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between items-center pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => navigate(profile?.user_type === 'mentor' ? '/mentor-dashboard' : '/dashboard')}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className={`relative ${showSaveAnimation ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        {showSaveAnimation ? (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Saved!
                          </motion.div>
                        ) : (
                          <span className="flex items-center gap-2">
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
