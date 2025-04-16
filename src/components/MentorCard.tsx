
import React, { useState } from 'react';
import { Star, Clock, Calendar, X, Award, Briefcase, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import BookingCalendar from './calendar/BookingCalendar';
import { motion } from 'framer-motion';

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
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      {/* Top badge */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-primary/80 to-primary p-1.5 px-3 text-xs font-medium text-white rounded-bl-lg">
        <div className="flex items-center">
          <span>₹{hourlyRate}/hr</span>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <img 
            src={avatarUrl || '/placeholder.svg'} 
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" 
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold leading-tight text-gray-800 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center mt-1">
            <Briefcase className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
            <p className="text-sm text-gray-600">
              {title} {company && `at ${company}`}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center mt-3">
        <div className="flex items-center">
          <Star size={16} fill="currentColor" className={getRatingColor(rating)} />
          <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
        <span className="mx-1 text-gray-300">·</span>
        <span className="text-sm text-gray-500">{reviewCount} reviews</span>
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
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2 text-primary/70" />
            <span>
              {availabilityCount 
                ? `${availabilityCount} available slots` 
                : "Check availability"}
            </span>
          </div>
          <div className="flex items-center">
            <BadgeCheck size={16} className="mr-1.5 text-primary" />
            <span className="text-sm font-medium text-gray-700">{industry}</span>
          </div>
        </div>
        
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <div className="flex gap-3">
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/30"
              >
                <Calendar size={16} className="mr-2" />
                Book Session
              </Button>
            </DialogTrigger>
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 bg-primary hover:bg-primary/90"
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
    </motion.div>
  );
};

export default MentorCard;
