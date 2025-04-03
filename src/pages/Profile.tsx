
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfilePictureCard from '@/components/profile/ProfilePictureCard';
import AccountTypeSection from '@/components/profile/AccountTypeSection';
import MentorProfileCompleteCard from '@/components/profile/MentorProfileCompleteCard';
import MentorAvailabilitySection from '@/components/profile/MentorAvailabilitySection';
import MentorProfileForm from '@/components/profile/MentorProfileForm';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, profile, isLoading, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handleMentorProfileComplete = () => {
    toast({
      title: "Profile updated successfully",
      description: "Your mentor profile has been updated.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 h-screen flex justify-center items-center">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <motion.div 
      className="container mx-auto py-12 px-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ProfileHeader
        firstName={profile.first_name || ''}
        lastName={profile.last_name || ''}
        userType={profile.user_type}
        avatarUrl={profile.avatar_url}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="mentor" disabled={profile.user_type !== 'mentor'}>
            Mentor Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfilePictureCard avatarUrl={profile.avatar_url} />
            
            <AccountTypeSection 
              userType={profile.user_type}
              userId={user.id}
              onUserTypeChange={(newUserType) => {
                if (updateProfile) {
                  updateProfile({ ...profile, user_type: newUserType });
                }
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="mentor" className="mt-6 space-y-8">
          {profile.user_type === 'mentor' && (
            <>
              <MentorProfileForm onProfileUpdated={handleMentorProfileComplete} />
              <MentorAvailabilitySection />
              <MentorProfileCompleteCard />
            </>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Profile;
