
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AvailabilitySlot } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useAvailability = (mentorId: string) => {
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvailability = async () => {
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

        setAvailableSlots(formattedSlots);
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
    };

    if (mentorId) {
      fetchAvailability();
    }
  }, [mentorId, toast]);

  return { availableSlots, isLoading };
};
