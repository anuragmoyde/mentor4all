
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfilePictureCard from '@/components/profile/ProfilePictureCard';
import AccountTypeSection from '@/components/profile/AccountTypeSection';
import MentorProfileCompleteCard from '@/components/profile/MentorProfileCompleteCard';
import MentorAvailabilitySection from '@/components/profile/MentorAvailabilitySection';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, profile, isLoading, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if the location state contains an activeTab
    const locationState = location.state as { activeTab?: string } | null;
    if (locationState?.activeTab) {
      setActiveTab(locationState.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 h-screen flex justify-center items-center">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-4 w-4 bg-primary rounded-full animate-bounce"></div>
          <span className="text-lg font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <motion.div 
      className="container mx-auto py-12 px-4 max-w-7xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ProfileHeader
        firstName={profile.first_name || ''}
        lastName={profile.last_name || ''}
        userType={profile.user_type}
        avatarUrl={profile.avatar_url}
        signOut={signOut}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="w-full max-w-md grid grid-cols-2 mb-8 mx-auto">
          <TabsTrigger value="general" className="text-base py-3">
            General
          </TabsTrigger>
          <TabsTrigger 
            value="mentor" 
            disabled={profile.user_type !== 'mentor'}
            className="text-base py-3"
          >
            Mentor Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfilePictureCard 
              avatarUrl={profile.avatar_url}
              firstName={profile.first_name}
              lastName={profile.last_name}
              userId={user.id}
              updateProfile={updateProfile}
            />
            
            <AccountTypeSection 
              userType={profile.user_type}
              userId={user.id}
              updateProfile={updateProfile}
            />
          </div>
        </TabsContent>

        <TabsContent value="mentor" className="mt-6 space-y-8">
          {profile.user_type === 'mentor' && (
            <>
              <MentorAvailabilitySection />
              <MentorProfileCompleteCard userId={user.id} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Profile;
