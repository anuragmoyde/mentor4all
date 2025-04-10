import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

export type AvailabilitySlot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

interface BookingCalendarProps {
  mentorId: string;
  mentorName: string;
  hourlyRate: number;
  onBookingComplete?: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  mentorId,
  mentorName,
  hourlyRate,
  onBookingComplete
}) => {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [step, setStep] = useState(1);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
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

  const getSlotsForDate = (date: Date | undefined) => {
    if (!date) return [];
    const formattedDate = format(date, 'yyyy-MM-dd');
    return availableSlots.filter(slot => slot.day === formattedDate);
  };

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
  };

  const moveToSessionDetails = () => {
    if (!selectedSlot) {
      toast({
        title: "No time slot selected",
        description: "Please select a time slot to continue",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
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
      // Calculate session price based on hourly rate and duration
      const startDateTime = new Date(`${selectedSlot.day}T${selectedSlot.startTime}`);
      const endDateTime = new Date(`${selectedSlot.day}T${selectedSlot.endTime}`);
      const durationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
      const sessionPrice = (hourlyRate / 60) * durationMinutes;

      // Create the session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          date_time: `${selectedSlot.day}T${selectedSlot.startTime}`,
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

      // Mark availability slot as booked
      const { error: slotError } = await supabase
        .from('mentor_availability')
        .update({ is_booked: true })
        .eq('id', selectedSlot.id);

      if (slotError) throw slotError;

      toast({
        title: "Session booked successfully!",
        description: `Your session with ${mentorName} is scheduled for ${format(new Date(selectedSlot.day), 'MMMM d, yyyy')} at ${selectedSlot.startTime}.`,
      });

      // If there's a callback for booking completion, call it
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

  const renderTimeSlotStep = () => (
    <div>
      <div className="space-y-4">
        <p>Select a date:</p>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
        />
        {selectedDate && (
          <div>
            <p>Available Time Slots:</p>
            {getSlotsForDate(selectedDate).map((slot) => (
              <Button
                key={slot.id}
                variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                onClick={() => handleSlotSelect(slot)}
              >
                {slot.startTime} - {slot.endTime}
              </Button>
            ))}
          </div>
        )}
      </div>
      {selectedSlot && (
        <div className="mt-6 flex justify-end">
          <Button onClick={moveToSessionDetails}>
            Continue to Session Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderSessionDetailsStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
        <CalendarIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-700">Selected Time Slot</p>
          <p className="text-sm text-blue-600">
            {selectedSlot && (
              <>
                {format(new Date(selectedSlot.day), "MMMM d, yyyy")} at {selectedSlot.startTime} - {selectedSlot.endTime}
              </>
            )}
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="sessionTitle" className="text-base">
          Session Title <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          Provide a title that describes what you want to discuss in this session
        </p>
        <Input
          id="sessionTitle"
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          placeholder="e.g., Career transition advice, Startup funding guidance"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="sessionDescription" className="text-base">
          What would you like to discuss?
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          Share some details about what you'd like to get from this mentoring session
        </p>
        <Textarea
          id="sessionDescription"
          value={sessionDescription}
          onChange={(e) => setSessionDescription(e.target.value)}
          placeholder="e.g., I'm looking for advice on transitioning from a technical role to a product management position. I'd like to discuss the key skills needed and how to position my experience."
          className="mt-1 min-h-32"
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => setStep(1)}>
          Back to Time Selection
        </Button>
        <Button 
          onClick={handleBookSession} 
          disabled={isBooking || !sessionTitle.trim()}
        >
          {isBooking ? "Booking..." : "Book Session"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <CalendarIcon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Book a Session with {mentorName}</h2>
      </div>
      
      {step === 1 ? renderTimeSlotStep() : renderSessionDetailsStep()}
    </div>
  );
};

export default BookingCalendar;
