
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Import Reusable Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCards from '@/components/dashboard/StatCards';
import SessionsTabs from '@/components/dashboard/SessionsTabs';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

const Dashboard: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [pastSessions, setPastSessions] = useState<any[]>([]);

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

  // Fetch sessions data only if the user is a mentee
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ['mentee-sessions', user?.id],
    queryFn: async () => {
      if (!user) return { upcoming: [], past: [] };
      
      // Don't fetch if the user is a mentor
      if (profile?.user_type === 'mentor') {
        return { upcoming: [], past: [] };
      }
      
      try {
        const now = new Date().toISOString();
        
        // Fetch upcoming sessions
        const { data: upcoming, error: upcomingError } = await supabase
          .from('sessions')
          .select(`
            *,
            mentors (
              *,
              profiles (
                first_name,
                last_name,
                avatar_url
              )
            )
          `)
          .eq('mentee_id', user.id)
          .gte('date_time', now)
          .order('date_time', { ascending: true });
        
        if (upcomingError) {
          console.error('Error fetching upcoming sessions:', upcomingError);
          throw upcomingError;
        }
        
        // Fetch past sessions
        const { data: past, error: pastError } = await supabase
          .from('sessions')
          .select(`
            *,
            mentors (
              *,
              profiles (
                first_name,
                last_name,
                avatar_url
              )
            )
          `)
          .eq('mentee_id', user.id)
          .lt('date_time', now)
          .order('date_time', { ascending: false });
        
        if (pastError) {
          console.error('Error fetching past sessions:', pastError);
          throw pastError;
        }
        
        return { 
          upcoming: upcoming || [], 
          past: past || [] 
        };
      } catch (error) {
        console.error('Error in session query:', error);
        throw error;
      }
    },
    enabled: !!user && !!profile && profile.user_type === 'mentee',
  });

  useEffect(() => {
    // Set sessions data once fetched
    if (sessionsData) {
      console.log('Sessions data received:', sessionsData);
      setUpcomingSessions(sessionsData.upcoming);
      setPastSessions(sessionsData.past);
      setDashboardLoading(false);
    }
  }, [sessionsData]);

  useEffect(() => {
    // Handle errors in the sessions query
    if (sessionsError) {
      console.error('Session query error:', sessionsError);
      toast({
        title: "Error loading sessions",
        description: "There was a problem loading your sessions. Please try again.",
        variant: "destructive"
      });
      setDashboardLoading(false);
    }
  }, [sessionsError]);

  // If auth is still loading or we're redirecting
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <div className="animate-pulse">Loading authentication...</div>
      </div>
    );
  }

  // If not logged in, show nothing (will redirect)
  if (!user) {
    return null;
  }

  // If user is a mentor, show nothing (will redirect)
  if (profile?.user_type === 'mentor') {
    return null;
  }

  // Prepare stats for the StatCards component
  const stats = [
    {
      title: "Upcoming Sessions",
      value: upcomingSessions.length,
      description: upcomingSessions.length === 0 
        ? 'No upcoming sessions' 
        : upcomingSessions.length === 1 
          ? '1 session scheduled' 
          : `${upcomingSessions.length} sessions scheduled`,
      icon: 'calendar'
    },
    {
      title: "Session Hours",
      value: pastSessions.reduce((total, session) => total + (session.duration || 0), 0) / 60,
      description: "Total hours spent in sessions",
      icon: 'clock'
    },
    {
      title: "Total Spent",
      value: `₹${pastSessions.reduce((total, session) => total + (session.price || 0), 0).toFixed(2)}`,
      description: "Investment in your growth",
      icon: 'money'
    },
    {
      title: "Group Sessions",
      value: 0,
      description: "Group sessions attended",
      icon: 'users'
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Welcome back,"
        userFirstName={profile?.first_name}
      />

      {dashboardLoading || sessionsLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <StatCards stats={stats} />
          <SessionsTabs 
            upcomingSessions={upcomingSessions} 
            pastSessions={pastSessions} 
            isLoading={false} 
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
