
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import { useMenteeSessions } from '@/hooks/useMenteeSessions';

const Dashboard: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or if user is a mentor
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (profile?.user_type === 'mentor') {
        console.log('Redirecting to mentor dashboard, user type:', profile.user_type);
        navigate('/mentor-dashboard');
        return;
      }
    }
  }, [user, profile, isLoading, navigate]);
  
  // Use the custom hook to fetch sessions
  const { upcomingSessions, pastSessions, dashboardLoading, sessionsLoading } = 
    useMenteeSessions(user?.id, profile?.user_type);

  // If auth is still loading or we're redirecting
  if (isLoading) {
    return <DashboardLoading />;
  }

  // If not logged in, show nothing (will redirect)
  if (!user) {
    return null;
  }

  // If user is a mentor, show nothing (will redirect)
  if (profile?.user_type === 'mentor') {
    return null;
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Welcome back,"
        userFirstName={profile?.first_name}
      />

      <DashboardContent
        dashboardLoading={dashboardLoading}
        sessionsLoading={sessionsLoading}
        upcomingSessions={upcomingSessions}
        pastSessions={pastSessions}
      />
    </div>
  );
};

export default Dashboard;
