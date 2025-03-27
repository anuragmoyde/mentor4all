
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Import Reusable Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCards, { StatCardProps } from '@/components/dashboard/StatCards';
import SessionsTabs from '@/components/dashboard/SessionsTabs';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

const MentorDashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not logged in or if user is a mentee
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (profile?.user_type !== 'mentor') {
        console.log('Redirecting to mentee dashboard, user type:', profile?.user_type);
        navigate('/dashboard');
        return;
      }
    }
  }, [user, profile, isLoading, navigate]);

  // Fetch mentor data
  const { data: mentorData, isLoading: mentorLoading } = useQuery({
    queryKey: ['mentor-data', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('mentors')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching mentor data:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user && profile?.user_type === 'mentor',
  });
  
  // Fetch mentor sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['mentor-sessions', user?.id],
    queryFn: async () => {
      if (!user) return { upcoming: [], past: [] };
      
      const now = new Date().toISOString();
      
      // Fetch upcoming sessions
      const { data: upcoming, error: upcomingError } = await supabase
        .from('sessions')
        .select(`
          *,
          profiles:mentee_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('mentor_id', user.id)
        .gte('date_time', now)
        .order('date_time', { ascending: true });
      
      if (upcomingError) {
        console.error('Error fetching upcoming sessions:', upcomingError);
      }
      
      // Fetch past sessions
      const { data: past, error: pastError } = await supabase
        .from('sessions')
        .select(`
          *,
          profiles:mentee_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('mentor_id', user.id)
        .lt('date_time', now)
        .order('date_time', { ascending: false });
      
      if (pastError) {
        console.error('Error fetching past sessions:', pastError);
      }
      
      return { 
        upcoming: upcoming || [], 
        past: past || [] 
      };
    },
    enabled: !!user && profile?.user_type === 'mentor',
  });

  if (isLoading || !user || !profile) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const upcomingSessions = sessionsData?.upcoming || [];
  const pastSessions = sessionsData?.past || [];
  const dashboardLoading = mentorLoading || sessionsLoading;
  
  // Fix for type error: Convert number to string for toFixed
  const totalEarnings = pastSessions.reduce((total, session) => 
    total + (session.price || 0), 0) || 0;
  const formattedEarnings = totalEarnings.toFixed(2);

  // Prepare stats for the StatCards component
  const stats: StatCardProps[] = [
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
      description: "Total hours spent mentoring",
      icon: 'clock'
    },
    {
      title: "Total Earnings",
      value: `₹${formattedEarnings}`,
      description: "Earnings from sessions",
      icon: 'money'
    },
    {
      title: "Mentees",
      value: new Set(pastSessions.map(session => session.mentee_id)).size,
      description: "Unique mentees helped",
      icon: 'users'
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <DashboardHeader 
        title="Mentor Dashboard" 
        subtitle="Welcome back,"
        userFirstName={profile?.first_name}
        showAvailabilityButton={true}
      />

      {dashboardLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <StatCards stats={stats} />
          <SessionsTabs 
            upcomingSessions={upcomingSessions} 
            pastSessions={pastSessions} 
            isLoading={false} 
            isMentor={true}
          />
        </>
      )}
    </div>
  );
};

export default MentorDashboard;
