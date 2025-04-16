
import React from 'react';
import StatCards, { StatCardProps } from '@/components/dashboard/StatCards';
import SessionsTabs from '@/components/dashboard/SessionsTabs';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, Sparkles, TrendingUp } from 'lucide-react';

interface DashboardContentProps {
  dashboardLoading: boolean;
  sessionsLoading: boolean;
  upcomingSessions: any[];
  pastSessions: any[];
  onRefresh?: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboardLoading,
  sessionsLoading,
  upcomingSessions,
  pastSessions,
  onRefresh,
}) => {
  // Calculate dashboard insights
  const totalSessionHours = pastSessions.reduce((total, session) => total + (session.duration || 0), 0) / 60;
  const totalSpent = pastSessions.reduce((total, session) => total + (session.price || 0), 0).toFixed(2);
  const hasUpcomingSessions = upcomingSessions.length > 0;
  const hasPastSessions = pastSessions.length > 0;
  
  // Get next session if available
  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;
  
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
      value: totalSessionHours,
      description: "Total hours spent in sessions",
      icon: 'clock'
    },
    {
      title: "Total Invested",
      value: `₹${totalSpent}`,
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

  if (dashboardLoading || sessionsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <span>Mentorship Progress</span>
            </CardTitle>
            <CardDescription>Your journey so far</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Hours Invested</span>
                <span className="text-2xl font-bold text-primary-800">{totalSessionHours.toFixed(1)}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Sessions</span>
                <span className="text-2xl font-bold text-primary-800">{pastSessions.length}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Investment</span>
                <span className="text-2xl font-bold text-primary-800">₹{totalSpent}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Upcoming</span>
                <span className="text-2xl font-bold text-primary-800">{upcomingSessions.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning-600" />
              <span>Next Session</span>
            </CardTitle>
            <CardDescription>Coming up soon</CardDescription>
          </CardHeader>
          <CardContent>
            {nextSession ? (
              <div className="flex flex-col space-y-2">
                <div className="font-semibold text-warning-900">{nextSession.title}</div>
                <div className="text-sm text-muted-foreground">
                  with {nextSession.mentors?.profiles.first_name} {nextSession.mentors?.profiles.last_name}
                </div>
                <div className="text-sm font-medium text-warning-800">
                  {new Date(nextSession.date_time).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <BookOpen className="h-8 w-8 text-warning-300 mb-2" />
                <div className="text-sm text-muted-foreground text-center">
                  No upcoming sessions scheduled
                </div>
                <div className="mt-2">
                  <a 
                    href="/mentors" 
                    className="text-sm text-warning-700 hover:text-warning-800 font-medium inline-flex items-center"
                  >
                    Find a mentor
                    <TrendingUp className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <StatCards stats={stats} />
      
      {/* Sessions Tabs */}
      <div className="bg-white rounded-xl border p-1 shadow-sm">
        <SessionsTabs 
          upcomingSessions={upcomingSessions} 
          pastSessions={pastSessions}
          isLoading={false}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
};

export default DashboardContent;
