
import React, { useState } from 'react';
import { Star, Clock, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import BookingCalendar from './calendar/BookingCalendar';

interface MentorCardProps {
  id: string;
  name: string;
  title: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  expertise: string[];
  industry: string;
  bio: string;
  avatarUrl: string;
  company?: string;
  className?: string;
  availabilityCount?: number;
}

const MentorCard: React.FC<MentorCardProps> = ({ 
  id, 
  name, 
  title, 
  hourlyRate, 
  rating, 
  reviewCount, 
  expertise, 
  industry, 
  bio, 
  avatarUrl,
  company = "",
  availabilityCount,
  className 
}) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/mentors/${id}`);
  };

  // Function to determine rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-500";
    if (rating >= 4.0) return "text-lime-500";
    if (rating >= 3.5) return "text-yellow-500";
    if (rating >= 3.0) return "text-amber-500";
    return "text-orange-500";
  };

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
            src={avatarUrl || '/placeholder.svg'} 
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" 
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {title} {company && `at ${company}`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center mt-3">
        <div className="flex">
          <Star size={16} fill="currentColor" className={getRatingColor(rating)} />
          <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
        <span className="mx-1 text-gray-300">·</span>
        <span className="text-sm text-muted-foreground">{reviewCount} reviews</span>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {expertise.slice(0, 3).map((skill, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
          >
            {skill}
          </span>
        ))}
        {expertise.length > 3 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            +{expertise.length - 3}
          </span>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock size={16} className="mr-1" />
            <span>
              {availabilityCount 
                ? `${availabilityCount} available slots` 
                : "Check availability"}
            </span>
          </div>
          <div className="text-base font-semibold">₹{hourlyRate}/hour</div>
        </div>
        
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <div className="flex gap-3">
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar size={16} className="mr-2" />
                Book Session
              </Button>
            </DialogTrigger>
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
          </div>
          
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">{name}</h2>
              <button 
                onClick={() => setIsBookingOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <BookingCalendar 
              mentorId={id}
              mentorName={name}
              hourlyRate={hourlyRate}
              onBookingComplete={() => setIsBookingOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MentorCard;
