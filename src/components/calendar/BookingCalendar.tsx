
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
      
      // Log details about the time being booked
      console.log('Session booking time details:', {
        day: selectedSlot.day,
        startTime: selectedSlot.startTime,
        formattedISOString: dateTimeISO,
        localTimeString: new Date(dateTimeISO).toLocaleString(),
        localTimeStringIndia: new Date(dateTimeISO).toLocaleString('en-IN'),
      });
      
      const startDateTime = new Date(`${selectedSlot.day}T${selectedSlot.startTime}`);
      const endDateTime = new Date(`${selectedSlot.day}T${selectedSlot.endTime}`);
      const durationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
      const sessionPrice = (hourlyRate / 60) * durationMinutes;

      // Mark the slot as booked first to prevent double bookings
      const { error: slotError } = await supabase
        .from('mentor_availability')
        .update({ is_booked: true })
        .eq('id', selectedSlot.id);

      if (slotError) throw slotError;

      // Create the session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          date_time: dateTimeISO, // Store as ISO string
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

      // Generate meeting URL for the session immediately
      console.log('Generating meeting URL for newly created session');
      console.log('Session data for meeting URL creation:', {
        sessionId: sessionData.id,
        startTime: dateTimeISO,
        duration: durationMinutes
      });
      
      const meetingUrl = await createMeetingUrl({
        sessionId: sessionData.id,
        sessionTitle: sessionTitle || `Session with ${mentorName}`,
        startTime: dateTimeISO,
        durationMinutes
      });

      if (meetingUrl) {
        console.log('Successfully generated meeting URL:', meetingUrl);
        await supabase
          .from('sessions')
          .update({ meeting_url: meetingUrl })
          .eq('id', sessionData.id);
      } else {
        console.warn('Could not generate meeting URL during booking');
      }

      // Format date for display in toast
      const formattedDate = slotDateTime.toLocaleDateString('en-IN', {
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
