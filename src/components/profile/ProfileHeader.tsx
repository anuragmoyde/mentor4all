
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { User, LogOut, ArrowLeft, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  firstName?: string;
  lastName?: string;
  userType?: string;
  avatarUrl?: string;
  signOut: () => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  firstName, 
  lastName, 
  userType,
  signOut 
}) => {
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

  const userTypeIcon = userType === 'mentor' ? Shield : User;

  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-100 to-white p-6 mb-10 shadow-sm border border-slate-100"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/5"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 to-transparent"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-800">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {firstName ? `${firstName}'s ` : 'My '} Profile
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-slate-600">
              Manage your personal information and preferences
            </p>
            <Badge 
              variant={getUserTypeColor(userType)}
              className={cn(
                "ml-1 transition-all",
                userType === 'mentor' ? "bg-primary/10 text-primary hover:bg-primary/20" : 
                                       "bg-secondary/10 text-secondary hover:bg-secondary/20"
              )}
            >
              <userTypeIcon className="h-3 w-3 mr-1" />
              {userType === 'mentor' ? 'Mentor' : 'Mentee'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(userType === 'mentor' ? '/mentor-dashboard' : '/dashboard')}
            className="group transition-all duration-300 hover:bg-slate-50 border-slate-200"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
            Dashboard
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="group transition-all duration-300"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
            Sign Out
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
