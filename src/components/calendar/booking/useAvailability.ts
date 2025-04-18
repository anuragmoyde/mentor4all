import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AvailabilitySlot } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useAvailability = (mentorId: string) => {
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAvailability = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching availability for mentor:', mentorId);
      
      // Get current date and time in local timezone
      const now = new Date();
      
      // Format date as YYYY-MM-DD for database query (in local timezone)
      const currentDate = now.toISOString().split('T')[0];
      
      // Get current time in 24-hour format (HH:MM) in local timezone
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      console.log('Current date and time for filtering:', {
        date: currentDate,
        time: currentTimeString,
        fullDate: now.toString(),
        timezoneOffset: now.getTimezoneOffset()
      });
      
      // Fetch all slots for the mentor, including booked ones
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .gte('day', currentDate);

      if (availabilityError) throw availabilityError;

      // Fetch all scheduled sessions for the mentor
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('date_time')
        .eq('mentor_id', mentorId)
        .eq('status', 'scheduled')
        .gte('date_time', `${currentDate}T${currentTimeString}:00`);

      if (sessionsError) throw sessionsError;

      // Create a set of booked time slots from both availability and sessions
      const bookedSlots = new Set([
        ...availabilityData.filter(slot => slot.is_booked).map(slot => `${slot.day}T${slot.start_time}`),
        ...sessionsData.map(session => session.date_time)
      ]);

      console.log('Booked slots:', Array.from(bookedSlots));

      // Format the data and filter out booked slots
      const formattedSlots = availabilityData
        .filter(slot => {
          const slotKey = `${slot.day}T${slot.start_time}`;
          return !bookedSlots.has(slotKey);
        })
        .map(slot => ({
          id: slot.id,
          day: slot.day,
          startTime: slot.start_time.slice(0, 5), // Format time to HH:MM
          endTime: slot.end_time.slice(0, 5),
          isBooked: slot.is_booked
        }));

      // Filter out past time slots for today
      const filteredSlots = formattedSlots.filter(slot => {
        if (slot.day > currentDate) return true;
        if (slot.day === currentDate && slot.startTime > currentTimeString) return true;
        return false;
      });

      console.log('Filtered availability slots:', filteredSlots);
      setAvailableSlots(filteredSlots);
    } catch (error) {
      console.error('Error fetching mentor availability:', error);
      toast({
        title: "Error loading availability",
        description: "Could not load mentor's available time slots.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [mentorId, toast]);

  useEffect(() => {
    if (mentorId) {
      fetchAvailability();

      // Set up real-time subscriptions for both availability and sessions
      const availabilitySubscription = supabase
        .channel('mentor_availability_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mentor_availability',
            filter: `mentor_id=eq.${mentorId}`
          },
          (payload) => {
            console.log('Received availability update:', payload);
            fetchAvailability();
          }
        )
        .subscribe();

      const sessionsSubscription = supabase
        .channel('mentor_sessions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sessions',
            filter: `mentor_id=eq.${mentorId}`
          },
          (payload) => {
            console.log('Received sessions update:', payload);
            fetchAvailability();
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        availabilitySubscription.unsubscribe();
        sessionsSubscription.unsubscribe();
      };
    }
  }, [mentorId, fetchAvailability]);

  const refreshAvailability = useCallback(() => {
    if (mentorId) {
      console.log('Refreshing availability for mentor:', mentorId);
      fetchAvailability();
    }
  }, [mentorId, fetchAvailability]);

  return { availableSlots, isLoading, refreshAvailability };
};
