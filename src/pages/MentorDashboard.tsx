
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Star, 
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MentorDashboard: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in or not a mentor
    if (!isLoading && (!user || profile?.user_type !== 'mentor')) {
      navigate('/dashboard');
    }
  }, [user, isLoading, profile, navigate]);

  useEffect(() => {
    const fetchMentorData = async () => {
      if (!user) return;

      try {
        setDashboardLoading(true);
        
        // Fetch mentor profile
        const { data: mentorData, error: mentorError } = await supabase
          .from('mentors')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (mentorError) throw mentorError;
        setMentorProfile(mentorData);
        setAverageRating(mentorData.average_rating || 0);
        
        // Upcoming sessions query
        const { data: upcoming, error: upcomingError } = await supabase
          .from('sessions')
          .select(`
            *,
            mentees:mentee_id(
              id,
              profiles:id(first_name, last_name, avatar_url)
            )
          `)
          .eq('mentor_id', user.id)
          .gte('date_time', new Date().toISOString())
          .order('date_time', { ascending: true });

        if (upcomingError) throw upcomingError;
        setUpcomingSessions(upcoming || []);

        // Past sessions query
        const { data: past, error: pastError } = await supabase
          .from('sessions')
          .select(`
            *,
            mentees:mentee_id(
              id,
              profiles:id(first_name, last_name, avatar_url)
            )
          `)
          .eq('mentor_id', user.id)
          .lt('date_time', new Date().toISOString())
          .order('date_time', { ascending: false });

        if (pastError) throw pastError;
        setPastSessions(past || []);
        
        // Calculate stats
        const completedSessions = past?.filter(session => session.status === 'completed') || [];
        setSessionCount(completedSessions.length);
        
        const earnings = completedSessions.reduce((total, session) => {
          return total + (session.payment_status === 'paid' ? parseFloat(session.price) : 0);
        }, 0);
        setTotalEarnings(earnings);
      } catch (error) {
        console.error('Error fetching mentor data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchMentorData();
  }, [user]);

  if (isLoading || !user || dashboardLoading) {
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
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name || 'Mentor'}!
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </Button>
          <Button onClick={() => navigate('/add-session')}>
            <Calendar className="h-4 w-4 mr-2" />
            Create Session
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
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {sessionCount} completed sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={`${
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mentorProfile?.hourly_rate || 0}/hr</div>
            <p className="text-xs text-muted-foreground">
              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate('/profile')}>
                Update your rate
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Session History</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You don't have any upcoming sessions.</p>
              <Button className="mt-4" onClick={() => navigate('/add-session')}>
                Create a Session
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentee</TableHead>
                  <TableHead>Session Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.mentees?.profiles?.first_name} {session.mentees?.profiles?.last_name}
                    </TableCell>
                    <TableCell>{session.title}</TableCell>
                    <TableCell>
                      {new Date(session.date_time).toLocaleDateString()} at {new Date(session.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>{session.duration} minutes</TableCell>
                    <TableCell>${session.price}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {session.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {pastSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You don't have any past sessions yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentee</TableHead>
                  <TableHead>Session Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.mentees?.profiles?.first_name} {session.mentees?.profiles?.last_name}
                    </TableCell>
                    <TableCell>{session.title}</TableCell>
                    <TableCell>
                      {new Date(session.date_time).toLocaleDateString()} at {new Date(session.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>{session.duration} minutes</TableCell>
                    <TableCell>${session.price}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : session.status === 'cancelled' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : session.payment_status === 'refunded'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.payment_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        
        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>
                Summary of your earnings from mentoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Earnings</h3>
                    <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">This Month</h3>
                    <p className="text-2xl font-bold">$0.00</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Pending</h3>
                    <p className="text-2xl font-bold">$0.00</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Payment History</h3>
                  {pastSessions.filter(s => s.payment_status === 'paid').length === 0 ? (
                    <p className="text-muted-foreground">No payment history available yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Session</TableHead>
                          <TableHead>Mentee</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pastSessions
                          .filter(s => s.payment_status === 'paid')
                          .map((session) => (
                            <TableRow key={session.id}>
                              <TableCell className="font-medium">
                                {new Date(session.date_time).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{session.title}</TableCell>
                              <TableCell>
                                {session.mentees?.profiles?.first_name} {session.mentees?.profiles?.last_name}
                              </TableCell>
                              <TableCell className="text-right">${session.price}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback & Reviews</CardTitle>
              <CardDescription>
                See what mentees are saying about your sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Your Overall Rating</h3>
                    <p className="text-muted-foreground">Based on completed sessions and reviews</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={`${
                            star <= Math.round(averageRating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Recent Reviews</h3>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet. Reviews will appear here after your mentees leave feedback.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorDashboard;
