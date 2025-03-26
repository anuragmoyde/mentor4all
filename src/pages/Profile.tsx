
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [switchingType, setSwitchingType] = useState(false);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
      });
      setAvatarUrl(profile.avatar_url);
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
        avatar_url: avatarUrl,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Upload the file to supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
      await updateProfile({ avatar_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Helper function to get badge color based on user type
  const getUserTypeColor = (userType?: string) => {
    if (userType === 'mentor') return 'default';
    if (userType === 'mentee') return 'secondary';
    return 'outline';
  };

  // Handle account type switching
  const handleAccountTypeSwitch = async () => {
    if (!user || !profile) return;
    
    setSwitchingType(true);
    
    try {
      const newType = profile.user_type === 'mentee' ? 'mentor' : 'mentee';
      
      // Update profile type in the database
      const { error } = await updateProfile({
        user_type: newType,
      });
      
      if (error) throw error;
      
      // If switching to mentor, create a mentor record if it doesn't exist
      if (newType === 'mentor') {
        // Check if mentor record already exists
        const { data: existingMentor } = await supabase
          .from('mentors')
          .select('id')
          .eq('id', user.id)
          .single();
          
        if (!existingMentor) {
          // Create mentor record
          const { error: mentorError } = await supabase
            .from('mentors')
            .insert({
              id: user.id,
              hourly_rate: 0, // Default hourly rate
              expertise: [], // Empty expertise array
            });
            
          if (mentorError) throw mentorError;
        }
      }
      
      toast({
        title: "Account type changed successfully",
        description: `You are now a ${newType}. You will be redirected to the ${newType} dashboard.`,
      });
      
      // Redirect to the appropriate dashboard
      setTimeout(() => {
        navigate(newType === 'mentor' ? '/mentor-dashboard' : '/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Error switching account type:', error);
      toast({
        title: "Error changing account type",
        description: "There was an error changing your account type. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSwitchingType(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              Manage your personal information
            </p>
            <Badge variant={getUserTypeColor(profile?.user_type)}>
              {profile?.user_type === 'mentor' ? 'Mentor' : 'Mentee'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(profile?.user_type === 'mentor' ? '/mentor-dashboard' : '/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload a profile picture to personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={avatarUrl || undefined} alt={profile?.first_name || "User"} />
              <AvatarFallback>
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name[0]}${profile.last_name[0]}`
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm">
                  {uploading ? 'Uploading...' : 'Upload New Picture'}
                </div>
                <input
                  type="file"
                  id="avatar"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPEG, PNG. Max size: 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Account Type Information */}
            <div className="mb-6 p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Account Type</h3>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={getUserTypeColor(profile?.user_type)} className="text-sm py-1">
                    {profile?.user_type === 'mentor' ? 'Mentor' : 'Mentee'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {profile?.user_type === 'mentor' 
                      ? 'You can offer mentorship sessions and receive bookings from mentees.' 
                      : 'You can book sessions with mentors to help with your growth.'}
                  </p>
                </div>
                
                {/* Account Type Switch */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Switch to {profile?.user_type === 'mentor' ? 'Mentee' : 'Mentor'}</h4>
                    <p className="text-xs text-muted-foreground">
                      {profile?.user_type === 'mentor' 
                        ? 'Switch to mentee mode to book sessions with other mentors.'
                        : 'Switch to mentor mode to offer mentorship sessions to others.'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleAccountTypeSwitch}
                    disabled={switchingType}
                    className="min-w-[100px]"
                  >
                    {switchingType ? 'Switching...' : 'Switch'}
                  </Button>
                </div>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
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
                    control={form.control}
                    name="last_name"
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
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a bit about yourself"
                          className="resize-none min-h-[100px]"
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
                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
