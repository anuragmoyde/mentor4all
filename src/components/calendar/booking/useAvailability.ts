
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
      
      // This is the critical query - we ONLY fetch slots that are NOT booked (is_booked = false)
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('is_booked', false) // Only get slots that are not booked
        .gte('day', currentDate); // Only fetch future dates

      if (error) throw error;

      console.log('Raw availability data:', data);

      // Format the data
      const formattedSlots = data.map(slot => ({
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
