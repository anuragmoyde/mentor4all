
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Check } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AvailabilitySlot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

interface MentorBookingCalendarProps {
  mentorId: string;
  mentorName: string;
  hourlyRate: number;
  onSessionBooked?: () => void;
}

const MentorBookingCalendar: React.FC<MentorBookingCalendarProps> = ({
  mentorId,
  mentorName,
  hourlyRate,
  onSessionBooked
}) => {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [datesWithSlots, setDatesWithSlots] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  
  // Fetch all available slots for this mentor
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

        // Extract unique dates with slots
        const uniqueDates = [...new Set(formattedSlots.map(slot => slot.day))];
        setDatesWithSlots(uniqueDates.map(dateStr => new Date(dateStr)));
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
  }, [mentorId]);

  // Filter slots for the selected date
  const slotsForSelectedDate = selectedDate 
    ? availableSlots.filter(slot => 
        slot.day === format(selectedDate, 'yyyy-MM-dd')
      )
    : [];

  // Book a session
  const handleBookSession = async (slot: AvailabilitySlot) => {
    if (!user || !profile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a session.",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);
    setSelectedSlot(slot);

    try {
      const startDateTime = new Date(`${slot.day}T${slot.startTime}`);
      const endDateTime = new Date(`${slot.day}T${slot.endTime}`);
      const durationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
      
      // Calculate price based on duration and hourly rate
      const sessionPrice = (hourlyRate / 60) * durationMinutes;

      // Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          date_time: `${slot.day}T${slot.startTime}`,
          duration: durationMinutes,
          price: sessionPrice,
          title: `Session with ${mentorName}`,
          status: 'scheduled',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Mark slot as booked
      const { error: slotError } = await supabase
        .from('mentor_availability')
        .update({ is_booked: true })
        .eq('id', slot.id);

      if (slotError) throw slotError;

      toast({
        title: "Session booked!",
        description: `Your session with ${mentorName} is confirmed for ${format(new Date(slot.day), 'EEEE, MMMM d')} at ${slot.startTime}.`,
      });

      // Remove the booked slot from available slots
      setAvailableSlots(availableSlots.filter(s => s.id !== slot.id));

      if (onSessionBooked) {
        onSessionBooked();
      }
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Booking failed",
        description: "There was a problem booking your session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
      setSelectedSlot(null);
    }
  };

  // Check if a date has available slots
  const isDayWithSlots = (date: Date) => {
    return datesWithSlots.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Book a Session with {mentorName}
        </CardTitle>
        <CardDescription>
          Select an available time slot for your mentorship session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-2">1. Select a date</p>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                <div className="animate-pulse">Loading availability...</div>
              </div>
            ) : (
              <Calendar 
                mode="single" 
                selected={selectedDate} 
                onSelect={setSelectedDate}
                className="rounded-md border shadow-sm"
                modifiers={{
                  available: (date) => isDayWithSlots(date),
                }}
                modifiersClassNames={{
                  available: "border-2 border-primary bg-primary/10",
                }}
                disabled={(date) => 
                  date < new Date() || // Past dates
                  !isDayWithSlots(date) // Dates without slots
                }
                fromDate={new Date()}
              />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              2. Choose an available time slot
            </p>
            
            {selectedDate && (
              <div className="mt-2">
                <p className="text-sm font-medium">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </p>
                {slotsForSelectedDate.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 mt-3 max-h-[300px] overflow-y-auto pr-2">
                    {slotsForSelectedDate
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot, index) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-between p-3 h-auto"
                          onClick={() => handleBookSession(slot)}
                          disabled={isBooking && selectedSlot?.id === slot.id}
                        >
                          <span className="flex flex-col items-start">
                            <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                            <span className="text-xs text-slate-500">
                              {(() => {
                                const startTime = new Date(`2000-01-01T${slot.startTime}`);
                                const endTime = new Date(`2000-01-01T${slot.endTime}`);
                                const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
                                const price = (hourlyRate / 60) * durationMinutes;
                                return `₹${price.toFixed(2)} · ${durationMinutes} minutes`;
                              })()}
                            </span>
                          </span>
                          {isBooking && selectedSlot?.id === slot.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent" />
                          ) : (
                            <Check className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8 border border-dashed rounded-md">
                    <p className="text-sm text-muted-foreground">No time slots available for this date</p>
                  </div>
                )}
              </div>
            )}
            
            {!selectedDate && (
              <div className="flex items-center justify-center p-8 border border-dashed rounded-md">
                <p className="text-sm text-muted-foreground">Select a date to see available time slots</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorBookingCalendar;
