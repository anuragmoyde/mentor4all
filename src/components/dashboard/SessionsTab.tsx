
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SessionCard from './SessionCard';

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

interface SessionsTabProps {
  sessions: SessionData[];
  isLoading: boolean;
  isMentor?: boolean;
  emptyMessage?: string;
  emptyActionButton?: {
    text: string;
    route: string;
  };
}

const SessionsTab: React.FC<SessionsTabProps> = ({
  sessions,
  isLoading,
  isMentor = false,
  emptyMessage = "You don't have any sessions.",
  emptyActionButton,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="text-center py-8 animate-pulse">Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
        {emptyActionButton && (
          <Button className="mt-4" onClick={() => navigate(emptyActionButton.route)}>
            {emptyActionButton.text}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => {
        // For mentee dashboard, the person is the mentor
        // For mentor dashboard, the person is the mentee
        const personName = isMentor 
          ? session.profiles?.first_name || 'User'
          : session.mentors?.profiles.first_name || 'Mentor';
        
        const personLastName = isMentor
          ? session.profiles?.last_name || ''
          : session.mentors?.profiles.last_name || '';
        
        return (
          <SessionCard
            key={session.id}
            id={session.id}
            title={session.title}
            personName={personName}
            personLastName={personLastName}
            dateTime={session.date_time}
            duration={session.duration}
            price={session.price}
          />
        );
      })}
    </div>
  );
};

export default SessionsTab;
