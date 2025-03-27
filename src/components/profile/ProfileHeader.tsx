
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  userType?: string;
  signOut: () => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userType, signOut }) => {
  const navigate = useNavigate();

  // Helper function to get badge color based on user type
  const getUserTypeColor = (userType?: string) => {
    if (userType === 'mentor') return 'default';
    if (userType === 'mentee') return 'secondary';
    return 'outline';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
          <Badge variant={getUserTypeColor(userType)}>
            {userType === 'mentor' ? 'Mentor' : 'Mentee'}
          </Badge>
        </div>
      </div>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(userType === 'mentor' ? '/mentor-dashboard' : '/dashboard')}
        >
          Back to Dashboard
        </Button>
        <Button variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
