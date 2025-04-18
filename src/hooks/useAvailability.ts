import { useState, useCallback, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export const useAvailability = (mentorId: string) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchAvailableSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all slots for the mentor
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .order('day', { ascending: true })
        .order('start_time', { ascending: true });

      if (availabilityError) throw availabilityError;

      // Fetch all sessions for the mentor
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('date_time, duration')
        .eq('mentor_id', mentorId)
        .eq('status', 'scheduled');

      if (sessionsError) throw sessionsError;

      // Create a set of booked time slots from both availability and sessions
      const bookedSlots = new Set<string>();
      
      // Add slots marked as booked in availability
      availabilityData?.forEach(slot => {
        if (slot.is_booked) {
          bookedSlots.add(`${slot.day}T${slot.start_time}`);
        }
      });

      // Add slots that have sessions
      sessionsData?.forEach(session => {
        const sessionDate = new Date(session.date_time);
        const sessionEnd = new Date(sessionDate.getTime() + session.duration * 60000);
        
        // Add the session time slot to booked slots
        bookedSlots.add(session.date_time);
        
        // Also mark the end time if it's a full hour
        if (session.duration % 60 === 0) {
          bookedSlots.add(sessionEnd.toISOString());
        }
      });

      // Filter out booked slots and past time slots
      const now = new Date();
      const filteredSlots = availabilityData
        ?.filter(slot => {
          const slotDateTime = new Date(`${slot.day}T${slot.start_time}`);
          return (
            !bookedSlots.has(`${slot.day}T${slot.start_time}`) &&
            slotDateTime >= now
          );
        })
        .map(slot => ({
          id: slot.id,
          day: slot.day,
          startTime: slot.start_time,
          endTime: slot.end_time,
          isBooked: false
        })) || [];

      setAvailableSlots(filteredSlots);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to fetch available time slots');
    } finally {
      setIsLoading(false);
    }
  }, [mentorId, supabase]);

  // Set up real-time subscription for availability updates
  useEffect(() => {
    const subscription = supabase
      .channel('availability_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentor_availability',
          filter: `mentor_id=eq.${mentorId}`
        },
        () => {
          fetchAvailableSlots();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [mentorId, supabase, fetchAvailableSlots]);

  // Initial fetch
  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  return {
    availableSlots,
    isLoading,
    error,
    refreshAvailability: fetchAvailableSlots
  };
}; 