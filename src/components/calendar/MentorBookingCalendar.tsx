
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Check, Info, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  
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
    setCurrentStep(2);
  };

  // Book a session
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
      const startDateTime = new Date(`${selectedSlot.day}T${selectedSlot.startTime}`);
      const endDateTime = new Date(`${selectedSlot.day}T${selectedSlot.endTime}`);
      const durationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
      
      // Calculate price based on duration and hourly rate
      const sessionPrice = (hourlyRate / 60) * durationMinutes;

      // Create session
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

      // Mark slot as booked
      const { error: slotError } = await supabase
        .from('mentor_availability')
        .update({ is_booked: true })
        .eq('id', selectedSlot.id);

      if (slotError) throw slotError;

      toast({
        title: "Session booked!",
        description: `Your session with ${mentorName} is confirmed for ${format(new Date(selectedSlot.day), 'EEEE, MMMM d')} at ${selectedSlot.startTime}.`,
      });

      // Remove the booked slot from available slots
      setAvailableSlots(availableSlots.filter(s => s.id !== selectedSlot.id));

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
      setSessionTitle("");
      setSessionDescription("");
      setCurrentStep(1);
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

  const renderTimeSlotSelection = () => (
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
                      variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                      className="w-full justify-between p-3 h-auto"
                      onClick={() => handleSlotSelect(slot)}
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
                      {selectedSlot?.id === slot.id && <Check className="h-4 w-4" />}
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
      
      {selectedSlot && (
        <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
          <Button onClick={moveToSessionDetails}>
            Continue to Session Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderSessionDetailsForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 mb-6">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-700">Selected Time Slot</p>
          <p className="text-sm text-blue-600">
            {selectedSlot && (
              <>
                {format(new Date(selectedSlot.day), "EEEE, MMMM d, yyyy")} at {selectedSlot.startTime} - {selectedSlot.endTime}
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

      <div className="flex justify-between items-center gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setCurrentStep(1);
          }}
        >
          Back to Time Slots
        </Button>
        <Button 
          type="button" 
          onClick={handleBookSession}
          disabled={isBooking || !sessionTitle.trim()}
        >
          {isBooking ? "Booking..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Book a Session with {mentorName}
        </CardTitle>
        <CardDescription>
          {currentStep === 1 
            ? "Select an available time slot for your mentorship session."
            : "Provide details about what you'd like to discuss in this session."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === 1 ? renderTimeSlotSelection() : renderSessionDetailsForm()}
      </CardContent>
    </Card>
  );
};

export default MentorBookingCalendar;
