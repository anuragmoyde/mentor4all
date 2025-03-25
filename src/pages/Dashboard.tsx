
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Dashboard: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      try {
        setDashboardLoading(true);
        
        // Upcoming sessions query
        const { data: upcoming, error: upcomingError } = await supabase
          .from('sessions')
          .select(`
            *,
            mentors:mentor_id(
              id,
              profiles:id(first_name, last_name, avatar_url)
            )
          `)
          .eq('mentee_id', user.id)
          .gte('date_time', new Date().toISOString())
          .order('date_time', { ascending: true });

        if (upcomingError) throw upcomingError;
        setUpcomingSessions(upcoming || []);

        // Past sessions query
        const { data: past, error: pastError } = await supabase
          .from('sessions')
          .select(`
            *,
            mentors:mentor_id(
              id,
              profiles:id(first_name, last_name, avatar_url)
            )
          `)
          .eq('mentee_id', user.id)
          .lt('date_time', new Date().toISOString())
          .order('date_time', { ascending: false });

        if (pastError) throw pastError;
        setPastSessions(past || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${pastSessions.reduce((total, session) => total + (session.price || 0), 0).toFixed(2)}
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
          {dashboardLoading ? (
            <div className="text-center py-8 animate-pulse">Loading sessions...</div>
          ) : upcomingSessions.length === 0 ? (
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
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">${session.price}</span>
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
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">${session.price}</span>
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

export default Dashboard;
