
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AvailabilityCalendar, { TimeSlot } from '@/components/calendar/AvailabilityCalendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Define an extended version of TimeSlot that includes isBooked
interface AvailabilitySlot extends TimeSlot {
  isBooked?: boolean;
}

const MentorAvailabilitySection = () => {
  const { user, profile } = useAuth();
  const [showCalendar, setShowCalendar] = useState(false);
  const [existingSlots, setExistingSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id && profile?.user_type === 'mentor') {
      fetchAvailability();
    } else {
      setIsLoading(false);
    }
  }, [user, profile]);

  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', user?.id)
        .order('day', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      // Convert to the format expected by the AvailabilityCalendar component
      const formattedSlots = data.map((slot): AvailabilitySlot => ({
        id: slot.id,
        day: new Date(slot.day),
        startTime: slot.start_time.substring(0, 5), // Format: HH:MM
        endTime: slot.end_time.substring(0, 5),
        isBooked: slot.is_booked || false
      }));
      
      setExistingSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error loading availability",
        description: "Could not load your availability slots.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowCalendar = () => {
    setShowCalendar(true);
  };

  const handleSlotsUpdated = () => {
    fetchAvailability();
    setShowCalendar(false);
  };

  if (!user || profile?.user_type !== 'mentor') {
    return null;
  }

  if (showCalendar) {
    return (
      <AvailabilityCalendar 
        mentorId={user.id} 
        existingSlots={existingSlots}
        onSlotsUpdated={handleSlotsUpdated}
      />
    );
  }

  const getDateDisplay = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEEE, MMMM d');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-slate-200 shadow-md bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Your Availability
          </CardTitle>
          <CardDescription>
            Set your availability to let mentees book sessions with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="py-8 flex justify-center items-center">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-primary/60 rounded-full animate-bounce"></div>
                <div className="h-4 w-4 bg-primary/70 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-4 w-4 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <span className="ml-2 text-slate-500">Loading availability...</span>
              </div>
            </div>
          ) : existingSlots.length > 0 ? (
            <>
              <div className="mb-5 space-y-2">
                <h3 className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1.5 text-primary" />
                  You have {existingSlots.length} available time slots:
                </h3>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {existingSlots.map((slot) => (
                    <motion.div 
                      key={slot.id} 
                      className={cn(
                        "p-3 rounded-md flex justify-between border",
                        slot.isBooked 
                          ? "bg-purple-50 border-purple-200 shadow-sm" 
                          : "bg-slate-50 border-slate-200 hover:bg-white hover:shadow-sm transition-all"
                      )}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white",
                          slot.isBooked ? "bg-purple-400" : "bg-primary/80"
                        )}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{getDateDisplay(new Date(slot.day))}</div>
                          <div className="text-sm text-muted-foreground">{slot.startTime} - {slot.endTime}</div>
                        </div>
                      </div>
                      {slot.isBooked && (
                        <div className="text-xs bg-purple-100 text-purple-600 font-medium px-2 py-1 rounded-full self-center flex items-center">
                          Booked
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
              <Button onClick={handleShowCalendar} className="w-full bg-gradient-to-r from-primary to-primary/90 shadow-sm">
                <CalendarPlus className="w-4 h-4 mr-2" />
                Update Availability
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center px-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CalendarPlus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No availability set</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Setting your availability allows mentees to book sessions with you. You won't appear in search results until you've set some available time slots.
              </p>
              <Button onClick={handleShowCalendar} className="px-6 bg-gradient-to-r from-primary to-primary/90 shadow-sm">
                <CalendarPlus className="w-4 h-4 mr-2" />
                Set Your Availability
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MentorAvailabilitySection;
