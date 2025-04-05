
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AvailabilityCalendar, { TimeSlot } from '@/components/calendar/AvailabilityCalendar';
import { format } from 'date-fns';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Your Availability</CardTitle>
        <CardDescription>
          Set your availability to let mentees book sessions with you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-pulse">Loading availability...</div>
          </div>
        ) : existingSlots.length > 0 ? (
          <>
            <div className="mb-4 space-y-2">
              <h3 className="text-sm font-medium">You have {existingSlots.length} available time slots:</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {existingSlots.map((slot) => (
                  <div 
                    key={slot.id} 
                    className={`p-3 rounded-md flex justify-between border ${slot.isBooked ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div>
                      <div className="font-medium">{format(new Date(slot.day), 'EEEE, MMMM d, yyyy')}</div>
                      <div className="text-sm text-muted-foreground">{slot.startTime} - {slot.endTime}</div>
                    </div>
                    {slot.isBooked && <div className="text-xs text-purple-600 font-medium">Booked</div>}
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleShowCalendar} className="w-full">
              <CalendarPlus className="w-4 h-4 mr-2" />
              Update Availability
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No availability set</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Setting your availability allows mentees to book sessions with you. You won't appear in search results until you've set some available time slots.
            </p>
            <Button onClick={handleShowCalendar}>
              <CalendarPlus className="w-4 h-4 mr-2" />
              Set Your Availability
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MentorAvailabilitySection;
