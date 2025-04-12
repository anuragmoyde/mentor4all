
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
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('is_booked', false)
        .gte('day', new Date().toISOString().split('T')[0]); // Only fetch future dates

      if (error) throw error;

      // Format the data
      const formattedSlots = data.map(slot => ({
        id: slot.id,
        day: slot.day,
        startTime: slot.start_time.slice(0, 5), // Format time to HH:MM
        endTime: slot.end_time.slice(0, 5),
        isBooked: slot.is_booked
      }));

      // Filter out past time slots for today
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const filteredSlots = formattedSlots.filter(slot => {
        if (slot.day > today) return true;
        if (slot.day === today && slot.startTime > currentTime) return true;
        return false;
      });

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
      fetchAvailability();
    }
  }, [mentorId, fetchAvailability]);

  return { availableSlots, isLoading, refreshAvailability };
};
