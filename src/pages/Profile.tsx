
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Save, Sparkles, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Import Reusable Components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfilePictureCard from '@/components/profile/ProfilePictureCard';
import AccountTypeSection from '@/components/profile/AccountTypeSection';
import MentorProfileCompleteCard from '@/components/profile/MentorProfileCompleteCard';
import AvailabilityCalendar from '@/components/calendar/AvailabilityCalendar';
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
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [isMentorAvailable, setIsMentorAvailable] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  // Check if mentor account exists
  useEffect(() => {
    const checkMentorProfile = async () => {
      if (user && profile?.user_type === 'mentor') {
        try {
          const { data, error } = await supabase
            .from('mentors')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!error && data) {
            setIsMentorAvailable(true);
            
            // If on mentor tab but no mentor profile, switch to personal tab
            if (activeTab === 'mentor-availability' && !isMentorAvailable) {
              setActiveTab('mentor-profile');
            }
          }
        } catch (err) {
          console.error('Error checking mentor profile:', err);
        }
      }
    };
    
    checkMentorProfile();
  }, [user, profile, activeTab]);

  // Fetch mentor availability slots
  useEffect(() => {
    const fetchAvailabilitySlots = async () => {
      if (user && profile?.user_type === 'mentor') {
        try {
          const { data, error } = await supabase
            .from('mentor_availability')
            .select('*')
            .eq('mentor_id', user.id);
            
          if (!error && data) {
            setAvailabilitySlots(data);
          }
        } catch (err) {
          console.error('Error fetching availability slots:', err);
        }
      }
    };
    
    fetchAvailabilitySlots();
  }, [user, profile]);

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
      
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMentorProfileUpdated = () => {
    setIsMentorAvailable(true);
    toast({
      title: "Mentor profile updated",
      description: "Your mentor profile has been successfully updated.",
    });
  };

  const handleAvailabilitySlotsUpdated = () => {
    // Refetch availability slots
    const fetchAvailabilitySlots = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('mentor_availability')
            .select('*')
            .eq('mentor_id', user.id);
            
          if (!error && data) {
            setAvailabilitySlots(data);
          }
        } catch (err) {
          console.error('Error fetching availability slots:', err);
        }
      }
    };
    
    fetchAvailabilitySlots();
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
        <motion.div 
          className="relative mb-8 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute top-0 right-0 p-3">
            <Sparkles className="h-6 w-6 text-primary/60" />
          </div>
          <div className="rounded-lg bg-white/70 backdrop-blur-sm p-6 md:p-8">
            <motion.h2 
              className="text-2xl font-semibold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Welcome to your personal space
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Update your profile and settings to customize your experience
            </motion.p>
          </div>
        </motion.div>

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
            
            {profile?.user_type === 'mentor' && (
              <div className="mt-6">
                <Card className="border-2 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                    <CardTitle className="text-lg font-semibold">Mentor Dashboard</CardTitle>
                    <CardDescription>
                      Manage your mentor profile and availability
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveTab('mentor-profile')}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Mentor Profile
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveTab('mentor-availability')}
                        disabled={!isMentorAvailable}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Manage Availability
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/mentor-dashboard')}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>

          <motion.div 
            className="md:col-span-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="personal"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Personal Info
                </TabsTrigger>
                {profile?.user_type === 'mentor' && (
                  <TabsTrigger 
                    value="mentor-profile"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Mentor Profile
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="personal">
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
                                <Save className="h-4 w-4" />
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                              </span>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="mentor-profile">
                <MentorProfileCompleteCard 
                  userId={user.id} 
                  onProfileUpdate={handleMentorProfileUpdated}
                />
              </TabsContent>
              
              <TabsContent value="mentor-availability">
                {isMentorAvailable ? (
                  <AvailabilityCalendar 
                    mentorId={user.id}
                    existingSlots={availabilitySlots}
                    onSlotsUpdated={handleAvailabilitySlotsUpdated}
                  />
                ) : (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>Complete Your Mentor Profile First</CardTitle>
                      <CardDescription>
                        Please complete your mentor profile before setting availability.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-8">
                      <Button 
                        onClick={() => setActiveTab('mentor-profile')}
                      >
                        Go to Mentor Profile
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
