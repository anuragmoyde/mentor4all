
import React from 'react';
import StatCards, { StatCardProps } from '@/components/dashboard/StatCards';
import SessionsTabs from '@/components/dashboard/SessionsTabs';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

interface DashboardContentProps {
  dashboardLoading: boolean;
  sessionsLoading: boolean;
  upcomingSessions: any[];
  pastSessions: any[];
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboardLoading,
  sessionsLoading,
  upcomingSessions,
  pastSessions,
}) => {
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

  if (dashboardLoading || sessionsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <StatCards stats={stats} />
      <SessionsTabs 
        upcomingSessions={upcomingSessions} 
        pastSessions={pastSessions}
        isLoading={false} 
      />
    </>
  );
};

export default DashboardContent;
