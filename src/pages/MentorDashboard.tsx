import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, BadgeIndianRupee } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Fix for type error: Convert number to string for toFixed
  const totalEarnings = sessionsData?.past?.reduce((total, session) => 
    total + (session.price || 0), 0) || 0;
  const formattedEarnings = totalEarnings.toFixed(2);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      navigate('/auth');
      return;
    }

    // Redirect based on user type
    if (!isLoading && user && profile) {
      if (profile.user_type !== 'mentor') {
        navigate('/dashboard');
        return;
      }
      // Stay on this page for mentors
    }
  }, [user, profile, isLoading, navigate]);

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

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name || 'Mentor'}!
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/profile')}>
            Edit Profile
          </Button>
          <Button variant="outline" onClick={() => {}}>
            Set Availability
          </Button>
        </div>
      </div>

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
            <p className="text-xs text-muted-foreground">Total hours spent mentoring</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{formattedEarnings}</div>
            <p className="text-xs text-muted-foreground">Earnings from sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(pastSessions.map(session => session.mentee_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique mentees helped</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Session History</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          {dashboardLoading ? (
            <div className="text-center py-8 animate-pulse">Loading sessions...</div>
          ) : upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You don't have any upcoming sessions.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle>{session.title}</CardTitle>
                    <CardDescription>
                      with {session.profiles?.first_name} {session.profiles?.last_name}
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
          {dashboardLoading ? (
            <div className="text-center py-8 animate-pulse">Loading sessions...</div>
          ) : pastSessions.length === 0 ? (
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
                      with {session.profiles?.first_name} {session.profiles?.last_name}
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
    </div>
  );
};

export default MentorDashboard;
