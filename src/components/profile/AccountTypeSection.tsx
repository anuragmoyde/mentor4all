
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AccountTypeSectionProps {
  userType?: string;
  userId?: string;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}

const AccountTypeSection: React.FC<AccountTypeSectionProps> = ({
  userType,
  userId,
  updateProfile,
}) => {
  const navigate = useNavigate();
  const [switchingType, setSwitchingType] = useState(false);

  // Helper function to get badge color based on user type
  const getUserTypeColor = (userType?: string) => {
    if (userType === 'mentor') return 'default';
    if (userType === 'mentee') return 'secondary';
    return 'outline';
  };

  // Handle account type switching
  const handleAccountTypeSwitch = async () => {
    if (!userId) return;
    
    setSwitchingType(true);
    
    try {
      const newType = userType === 'mentee' ? 'mentor' : 'mentee';
      
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
          .eq('id', userId)
          .single();
          
        if (!existingMentor) {
          // Create mentor record
          const { error: mentorError } = await supabase
            .from('mentors')
            .insert({
              id: userId,
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

  return (
    <div className="mb-6 p-4 bg-muted rounded-md">
      <h3 className="font-medium mb-2">Account Type</h3>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={getUserTypeColor(userType)} className="text-sm py-1">
            {userType === 'mentor' ? 'Mentor' : 'Mentee'}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {userType === 'mentor' 
              ? 'You can offer mentorship sessions and receive bookings from mentees.' 
              : 'You can book sessions with mentors to help with your growth.'}
          </p>
        </div>
        
        {/* Account Type Switch */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Switch to {userType === 'mentor' ? 'Mentee' : 'Mentor'}</h4>
            <p className="text-xs text-muted-foreground">
              {userType === 'mentor' 
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
  );
};

export default AccountTypeSection;
