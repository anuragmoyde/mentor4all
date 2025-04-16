
import React from 'react';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all",
        className
      )}
    >
      {/* Top badge */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-primary/80 to-primary p-1.5 px-3 text-xs font-medium text-white rounded-bl-lg">
        <div className="flex items-center">
          <span>₹{session.price}</span>
        </div>
      </div>

      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        {session.category}
      </span>
      
      <h3 className="mt-3 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
        {session.title}
      </h3>
      
      <div className="flex items-center mt-4">
        <img 
          src={session.mentor.image || '/placeholder.svg'} 
          alt={session.mentor.name}
          className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" 
        />
        <span className="ml-2 text-sm">Led by <span className="font-medium">{session.mentor.name}</span></span>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={16} className="mr-2 text-primary/70" />
          <span>{session.date}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock size={16} className="mr-2 text-primary/70" />
          <span>{session.duration}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Users size={16} className="mr-2 text-primary/70" />
          <span>{spotsLeft} spots left</span>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${capacityPercentage}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-gray-500 mt-1.5">
        {session.enrolled} enrolled of {session.capacity} capacity
      </div>
      
      <div className="mt-auto pt-4">
        <Button 
          variant="primary" 
          className="w-full group bg-primary hover:bg-primary/90 relative overflow-hidden"
          onClick={() => navigate(`/group-sessions/${session.id}`)}
        >
          <span className="relative z-10 flex items-center justify-center">
            Enroll Now
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          <span className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        </Button>
      </div>
    </motion.div>
  );
};

export default SessionCard;
