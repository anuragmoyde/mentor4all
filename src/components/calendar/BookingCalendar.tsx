import React, { useState } from 'react';
import { CalendarIcon } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookingCalendarProps, AvailabilitySlot } from './types';
import TimeSlotStep from './booking/TimeSlotStep';
import SessionDetailsStep from './booking/SessionDetailsStep';
import { useAvailability } from './booking/useAvailability';
import { useMeetingUrl } from './booking/useMeetingUrl';

const BookingCalendar: React.FC<BookingCalendarProps> = ({
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
        .select('is_booked, id')
        .eq('id', selectedSlot.id)
        .single();
        
      if (slotCheckError) throw slotCheckError;
      
      // If the slot is already booked, show an error and refresh the availability
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

      // Calculate duration and price
      const startDateTime = new Date(`${selectedSlot.day}T${selectedSlot.startTime}`);
      const endDateTime = new Date(`${selectedSlot.day}T${selectedSlot.endTime}`);
      const durationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
      const sessionPrice = (hourlyRate / 60) * durationMinutes;

      // Create ISO-8601 formatted datetime string
      const dateTimeISO = `${selectedSlot.day}T${selectedSlot.startTime}:00`;

      // Start a transaction to book the session
      const { data: sessionData, error: sessionError } = await supabase.rpc('book_session', {
        p_mentor_id: mentorId,
        p_mentee_id: user.id,
        p_date_time: dateTimeISO,
        p_duration: durationMinutes,
        p_price: sessionPrice,
        p_title: sessionTitle,
        p_description: sessionDescription,
        p_availability_id: selectedSlot.id
      });

      if (sessionError) {
        console.error('Error booking session:', sessionError);
        toast({
          title: "Error booking session",
          description: "There was a problem booking your session. Please try again.",
          variant: "destructive"
        });
        setIsBooking(false);
        return;
      }

      // Generate meeting URL for the session
      const meetingUrl = await createMeetingUrl({
        sessionId: sessionData.id,
        sessionTitle: sessionTitle || `Session with ${mentorName}`,
        startTime: dateTimeISO,
        durationMinutes
      });

      if (meetingUrl) {
        await supabase
          .from('sessions')
          .update({ meeting_url: meetingUrl })
          .eq('id', sessionData.id);
      }

      // Format date for display in toast
      const formattedDate = new Date(dateTimeISO).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      toast({
        title: "Session booked successfully!",
        description: `Your session with ${mentorName} is scheduled for ${formattedDate} at ${selectedSlot.startTime}.`,
      });

      // Refresh availability to reflect the changes
      refreshAvailability();

      if (onBookingComplete) {
        onBookingComplete();
      }
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
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <CalendarIcon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Book a Session with {mentorName}</h2>
      </div>
      
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
    </div>
  );
};

export default BookingCalendar;
