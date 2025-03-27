
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  userFirstName?: string | null;
  showEditProfileButton?: boolean;
  showAvailabilityButton?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  userFirstName,
  showEditProfileButton = true,
  showAvailabilityButton = false,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">
          {subtitle} {userFirstName || 'User'}!
        </p>
      </div>
      <div className="flex gap-3">
        {showEditProfileButton && (
          <Button onClick={() => navigate('/profile')}>
            Edit Profile
          </Button>
        )}
        {showAvailabilityButton && (
          <Button variant="outline" onClick={() => {}}>
            Set Availability
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
