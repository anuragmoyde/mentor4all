
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BadgeIndianRupee } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

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

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name || 'User'}!
          </p>
        </div>
        <Button onClick={() => navigate('/profile')}>
          Edit Profile
        </Button>
      </div>

      {dashboardLoading || sessionsLoading ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-2" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-full max-w-[120px] mb-1" />
                    <Skeleton className="h-4 w-full max-w-[180px]" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingSessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingSessions.length === 0 ? 'No upcoming sessions' : upcomingSessions.length === 1 ? '1 session scheduled' : `${upcomingSessions.length} sessions scheduled`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Session Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pastSessions.reduce((total, session) => total + (session.duration || 0), 0) / 60}
                </div>
                <p className="text-xs text-muted-foreground">Total hours spent in sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{pastSessions.reduce((total, session) => total + (session.price || 0), 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Investment in your growth</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Group Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Group sessions attended</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
              <TabsTrigger value="past">Session History</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don't have any upcoming sessions.</p>
                  <Button className="mt-4" onClick={() => navigate('/mentors')}>
                    Find a Mentor
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingSessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <CardTitle>{session.title}</CardTitle>
                        <CardDescription>
                          with {session.mentors.profiles.first_name} {session.mentors.profiles.last_name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(session.date_time).toLocaleDateString()} at {new Date(session.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{session.duration} minutes</span>
                          </div>
                          <div className="flex items-center">
                            <BadgeIndianRupee className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">₹{session.price}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="past" className="space-y-4">
              {pastSessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don't have any past sessions yet.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastSessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <CardTitle>{session.title}</CardTitle>
                        <CardDescription>
                          with {session.mentors.profiles.first_name} {session.mentors.profiles.last_name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(session.date_time).toLocaleDateString()} at {new Date(session.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{session.duration} minutes</span>
                          </div>
                          <div className="flex items-center">
                            <BadgeIndianRupee className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">₹{session.price}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Dashboard;
