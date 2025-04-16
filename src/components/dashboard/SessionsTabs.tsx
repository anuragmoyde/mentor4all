
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SessionsTab from './SessionsTab';
import { Calendar, Clock, Sparkles } from 'lucide-react';

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
  onRefresh?: () => void;
}

const SessionsTabs: React.FC<SessionsTabsProps> = ({
  upcomingSessions,
  pastSessions,
  isLoading,
  isMentor = false,
  onRefresh,
}) => {
  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger 
          value="upcoming" 
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Upcoming Sessions ({upcomingSessions.length})
        </TabsTrigger>
        <TabsTrigger 
          value="past"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <Clock className="h-4 w-4 mr-2" />
          Session History ({pastSessions.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming" className="space-y-4 mt-0">
        {upcomingSessions.length > 0 && (
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-3 mb-4 flex items-start gap-2">
            <Sparkles className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary-800">Upcoming sessions</p>
              <p className="text-sm text-primary-700">
                {upcomingSessions.length === 1 
                  ? "You have 1 upcoming session. Join on time to make the most of your mentoring."
                  : `You have ${upcomingSessions.length} upcoming sessions. Join on time to make the most of your mentoring.`
                }
              </p>
            </div>
          </div>
        )}
        
        <SessionsTab
          sessions={upcomingSessions}
          isLoading={isLoading}
          isMentor={isMentor}
          emptyMessage="You don't have any upcoming sessions."
          emptyActionButton={!isMentor ? {
            text: "Find a Mentor",
            route: "/mentors"
          } : undefined}
          onRefresh={onRefresh}
        />
      </TabsContent>
      
      <TabsContent value="past" className="space-y-4 mt-0">
        <SessionsTab
          sessions={pastSessions}
          isLoading={isLoading}
          isMentor={isMentor}
          emptyMessage="You don't have any past sessions yet."
          onRefresh={onRefresh}
        />
      </TabsContent>
    </Tabs>
  );
};

export default SessionsTabs;
