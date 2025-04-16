import React, { useState } from 'react';
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AvailabilitySlot, BookingCalendarProps } from './types';
import TimeSlotStep from './booking/TimeSlotStep';
import SessionDetailsStep from './booking/SessionDetailsStep';
import { useAvailability } from './booking/useAvailability';
import { useMeetingUrl } from './booking/useMeetingUrl';

const MentorBookingCalendar: React.FC<BookingCalendarProps> = ({
  mentorId,
  mentorName,
  hourlyRate,
  onBookingComplete
}) => {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [step, setStep] = useState(1);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();
  const { availableSlots, isLoading, refreshAvailability } = useAvailability(mentorId);
  const { createMeetingUrl } = useMeetingUrl();

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
  };

  const handleBookSession = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a session.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedSlot) {
      toast({
        title: "No time slot selected",
        description: "Please select a time slot for your session.",
        variant: "destructive"
      });
      return;
    }

    // Check if the slot is in the past
    const slotDateTime = new Date(`${selectedSlot.day}T${selectedSlot.startTime}`);
    if (slotDateTime < new Date()) {
      toast({
        title: "Invalid time slot",
        description: "You cannot book a session in the past.",
        variant: "destructive"
      });
      return;
    }

    if (!sessionTitle.trim()) {
      toast({
        title: "Session title required",
        description: "Please provide a title for your session.",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);

    try {
      // First, check if the slot is still available
      const { data: slotCheck, error: slotCheckError } = await supabase
        .from('mentor_availability')
        .select('is_booked')
        .eq('id', selectedSlot.id)
        .single();
        
      if (slotCheckError) throw slotCheckError;
      
      if (slotCheck.is_booked) {
        toast({
          title: "Time slot unavailable",
          description: "This time slot has been booked by someone else. Please select another time slot.",
          variant: "destructive"
        });
        refreshAvailability();
        setIsBooking(false);
        return;
      }

      // Create ISO-8601 formatted datetime string
      const dateTimeISO = `${selectedSlot.day}T${selectedSlot.startTime}:00`;
      
      console.log('Session booking time details:', {
        day: selectedSlot.day,
        startTime: selectedSlot.startTime,
        formattedISOString: dateTimeISO,
        localTimeString: new Date(dateTimeISO).toLocaleString(),
      });

      // Calculate session price based on hourly rate and duration
      const startDateTime = new Date(`${selectedSlot.day}T${selectedSlot.startTime}`);
      const endDateTime = new Date(`${selectedSlot.day}T${selectedSlot.endTime}`);
      const durationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
      const sessionPrice = (hourlyRate / 60) * durationMinutes;

      // IMPORTANT: Mark the slot as booked first to prevent double bookings
      const { error: slotError } = await supabase
        .from('mentor_availability')
        .update({ is_booked: true })
        .eq('id', selectedSlot.id);

      if (slotError) throw slotError;
      
      console.log('Slot marked as booked:', selectedSlot.id);

      // Create the session with the original time string to maintain consistency
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          date_time: dateTimeISO,
          duration: durationMinutes,
          price: sessionPrice,
          title: sessionTitle,
          description: sessionDescription,
          status: 'scheduled',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Generate meeting URL (even if it's close to the session time)
      const meetingUrl = await createMeetingUrl({
        sessionId: sessionData.id,
        sessionTitle: sessionTitle || `Session with ${mentorName}`,
        startTime: dateTimeISO,
        durationMinutes
      });

      // Update the session with the meeting URL if it was created
      if (meetingUrl) {
        await supabase
          .from('sessions')
          .update({ meeting_url: meetingUrl })
          .eq('id', sessionData.id);
      }

      // Format date for display in toast notification - in local timezone
      const formattedDate = slotDateTime.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });

      toast({
        title: "Session booked successfully!",
        description: `Your session with ${mentorName} is scheduled for ${formattedDate} at ${selectedSlot.startTime}.`,
      });

      // Refresh availability to reflect the changes
      refreshAvailability();

      // If there's a callback for booking completion, call it
      if (onBookingComplete) {
        onBookingComplete();
      }
      
      // Reset the form state
      setSelectedSlot(null);
      setSessionTitle("");
      setSessionDescription("");
      setStep(1);
      
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error booking session",
        description: "There was a problem booking your session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Book a Session with {mentorName}
        </CardTitle>
        <CardDescription>
          {step === 1 
            ? "Select an available time slot for your mentorship session."
            : "Provide details about what you'd like to discuss in this session."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <TimeSlotStep
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            availableSlots={availableSlots}
            selectedSlot={selectedSlot}
            handleSlotSelect={handleSlotSelect}
            onContinue={() => setStep(2)}
            isLoading={isLoading}
            hourlyRate={hourlyRate}
          />
        ) : (
          <SessionDetailsStep
            selectedSlot={selectedSlot}
            sessionTitle={sessionTitle}
            setSessionTitle={setSessionTitle}
            sessionDescription={sessionDescription}
            setSessionDescription={setSessionDescription}
            onBack={() => setStep(1)}
            onBook={handleBookSession}
            isBooking={isBooking}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MentorBookingCalendar;
