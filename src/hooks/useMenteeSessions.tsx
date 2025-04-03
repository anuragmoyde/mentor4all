
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SessionsData {
  upcoming: any[];
  past: any[];
}

export const useMenteeSessions = (userId: string | undefined, userType: string | undefined) => {
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ['mentee-sessions', userId],
    queryFn: async () => {
      if (!userId) return { upcoming: [], past: [] };
      
      // Don't fetch if the user is a mentor
      if (userType === 'mentor') {
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
          .eq('mentee_id', userId)
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
          .eq('mentee_id', userId)
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
    enabled: !!userId && userType === 'mentee',
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

  return {
    upcomingSessions,
    pastSessions,
    dashboardLoading,
    sessionsLoading
  };
};
