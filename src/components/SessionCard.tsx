
import React from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    mentor: {
      name: string;
      image: string;
    };
    date: string;
    duration: string;
    capacity: number;
    enrolled: number;
    price: number;
    category: string;
  };
  className?: string;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, className }) => {
  const capacityPercentage = (session.enrolled / session.capacity) * 100;
  const spotsLeft = session.capacity - session.enrolled;
  
  return (
    <div 
      className={cn(
        "glass-card p-6 flex flex-col h-full group hover-lift",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {session.category}
        </span>
        <div className="text-lg font-semibold">${session.price}</div>
      </div>
      
      <h3 className="mt-3 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
        {session.title}
      </h3>
      
      <div className="flex items-center mt-4">
        <img 
          src={session.mentor.image} 
          alt={session.mentor.name}
          className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" 
        />
        <span className="ml-2 text-sm">Led by <span className="font-medium">{session.mentor.name}</span></span>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar size={16} className="mr-2" />
          <span>{session.date}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock size={16} className="mr-2" />
          <span>{session.duration}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Users size={16} className="mr-2" />
          <span>{spotsLeft} spots left</span>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${capacityPercentage}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-1.5">
        {session.enrolled} enrolled of {session.capacity} capacity
      </div>
      
      <div className="mt-auto pt-4">
        <Button variant="primary" className="w-full">
          Enroll Now
        </Button>
      </div>
    </div>
  );
};

export default SessionCard;
