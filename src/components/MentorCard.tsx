
import React, { useState } from 'react';
import { Star, Clock, Calendar, X } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';
import BookingCalendar from './calendar/BookingCalendar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface MentorCardProps {
  mentor: {
    id: string;
    name: string;
    title: string;
    company: string;
    expertise: string[];
    rating: number;
    reviewCount: number;
    hourlyRate: number;
    availability: string;
    image: string;
    availabilityCount?: number;
  };
  className?: string;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, className }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div 
      className={cn(
        "glass-card p-6 flex flex-col h-full group hover-lift overflow-hidden",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <img 
            src={mentor.image} 
            alt={mentor.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" 
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {mentor.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {mentor.title} at {mentor.company}
          </p>
        </div>
      </div>
      
      <div className="flex items-center mt-3">
        <div className="flex text-amber-400">
          <Star size={16} fill="currentColor" className="text-amber-400" />
          <span className="ml-1 text-sm font-medium">{mentor.rating.toFixed(1)}</span>
        </div>
        <span className="mx-1 text-gray-300">·</span>
        <span className="text-sm text-muted-foreground">{mentor.reviewCount} reviews</span>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {mentor.expertise.slice(0, 3).map((skill, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
          >
            {skill}
          </span>
        ))}
        {mentor.expertise.length > 3 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            +{mentor.expertise.length - 3}
          </span>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock size={16} className="mr-1" />
            <span>
              {mentor.availabilityCount 
                ? `${mentor.availabilityCount} available slots` 
                : mentor.availability}
            </span>
          </div>
          <div className="text-base font-semibold">₹{mentor.hourlyRate}/hour</div>
        </div>
        
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <div className="flex gap-3">
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar size={16} className="mr-2" />
                Book Session
              </Button>
            </DialogTrigger>
            <Button variant="primary" size="sm" className="flex-1">
              View Profile
            </Button>
          </div>
          
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">{mentor.name}</h2>
              <button 
                onClick={() => setIsBookingOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <BookingCalendar 
              mentorId={mentor.id}
              mentorName={mentor.name}
              hourlyRate={mentor.hourlyRate}
              onBookingComplete={() => setIsBookingOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MentorCard;
