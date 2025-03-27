
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SessionsTab from './SessionsTab';

interface SessionData {
  id: string;
  title: string;
  date_time: string;
  duration: number;
  price: number;
  mentors?: {
    profiles: {
      first_name: string;
      last_name: string;
    };
  };
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface SessionsTabsProps {
  upcomingSessions: SessionData[];
  pastSessions: SessionData[];
  isLoading: boolean;
  isMentor?: boolean;
}

const SessionsTabs: React.FC<SessionsTabsProps> = ({
  upcomingSessions,
  pastSessions,
  isLoading,
  isMentor = false,
}) => {
  return (
    <Tabs defaultValue="upcoming" className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
        <TabsTrigger value="past">Session History</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="space-y-4">
        <SessionsTab
          sessions={upcomingSessions}
          isLoading={isLoading}
          isMentor={isMentor}
          emptyMessage="You don't have any upcoming sessions."
          emptyActionButton={!isMentor ? {
            text: "Find a Mentor",
            route: "/mentors"
          } : undefined}
        />
      </TabsContent>
      <TabsContent value="past" className="space-y-4">
        <SessionsTab
          sessions={pastSessions}
          isLoading={isLoading}
          isMentor={isMentor}
          emptyMessage="You don't have any past sessions yet."
        />
      </TabsContent>
    </Tabs>
  );
};

export default SessionsTabs;
