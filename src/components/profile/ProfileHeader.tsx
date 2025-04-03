
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { User, LogOut, ArrowLeft } from 'lucide-react';

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
    <motion.div 
      className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          My Profile
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
          <Badge 
            variant={getUserTypeColor(userType)}
            className="animate-pulse"
          >
            <User className="h-3 w-3 mr-1" />
            {userType === 'mentor' ? 'Mentor' : 'Mentee'}
          </Badge>
        </div>
      </div>
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => navigate(userType === 'mentor' ? '/mentor-dashboard' : '/dashboard')}
          className="group transition-all duration-300 hover:border-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:text-primary" />
          Dashboard
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          className="group transition-all duration-300"
        >
          <LogOut className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
          Sign Out
        </Button>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
