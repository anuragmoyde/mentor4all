
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Export the TimeSlot type
export type TimeSlot = {
  id: string;
  mentor_id: string;
  day: string;
  start_time: string;
  end_time: string;
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
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [visibleSlots, setVisibleSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  
  // Fetch available slots for this mentor
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('mentor_id', mentorId)
          .gte('day', format(new Date(), 'yyyy-MM-dd'));
          
        if (error) throw error;
        
        const slots = data as TimeSlot[];
        setAvailableSlots(slots);
        
        // Extract unique dates for the calendar
        const dates = [...new Set(slots.map(slot => slot.day))].map(dateStr => new Date(dateStr));
        setAvailableDates(dates);
      } catch (error) {
        console.error('Error fetching availability:', error);
        toast({
          title: "Error fetching availability",
          description: "Could not load mentor's available time slots.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvailableSlots();
  }, [mentorId]);

  // Filter slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const filtered = availableSlots.filter(slot => slot.day === dateString);
      setVisibleSlots(filtered);
    } else {
      setVisibleSlots([]);
    }
    
    // Clear selected slot when date changes
    setSelectedSlot(null);
  }, [selectedDate, availableSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const bookSession = async () => {
    if (!selectedSlot || !user || !sessionTitle) {
      toast({
        title: "Incomplete information",
        description: "Please select a time slot and provide a session title.",
        variant: "destructive"
      });
      return;
    }
    
    setIsBooking(true);
    try {
      // Calculate duration in minutes between start and end time
      const startParts = selectedSlot.start_time.split(':').map(Number);
      const endParts = selectedSlot.end_time.split(':').map(Number);
      const startMinutes = startParts[0] * 60 + startParts[1];
      const endMinutes = endParts[0] * 60 + endParts[1];
      const durationMinutes = endMinutes - startMinutes;
      
      // Construct the date_time by combining day and start_time
      const sessionDateTime = `${selectedSlot.day}T${selectedSlot.start_time}:00`;
      
      // Insert the session
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          date_time: sessionDateTime,
          duration: durationMinutes,
          price: hourlyRate * (durationMinutes / 60),
          title: sessionTitle,
          description: sessionNotes,
          status: 'scheduled',
          payment_status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Remove the slot from availability
      const { error: deleteError } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('id', selectedSlot.id);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: "Session booked successfully!",
        description: `Your session with ${mentorName} has been scheduled.`,
      });
      
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
  
  // Custom day rendering to highlight days with availability
  const isDayWithSlots = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return availableSlots.some(slot => slot.day === dateString);
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Book a Session with {mentorName}
        </CardTitle>
        <CardDescription>
          Select from available time slots to schedule your mentorship session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calendar">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="calendar" className="flex-1">Calendar View</TabsTrigger>
            <TabsTrigger value="session" className="flex-1">Session Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full rounded-md" />
                ) : (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">1. Select a date with availability</p>
                    <Calendar 
                      mode="single" 
                      selected={selectedDate} 
                      onSelect={handleDateSelect}
                      className="rounded-md border shadow-sm pointer-events-auto"
                      modifiers={{
                        available: (date) => isDayWithSlots(date),
                      }}
                      modifiersClassNames={{
                        available: "border-2 border-primary bg-primary/10",
                      }}
                      disabled={(date) => {
                        return !isDayWithSlots(date) || date < new Date();
                      }}
                      fromDate={new Date()}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  2. Choose an available time slot
                </p>
                
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : selectedDate ? (
                  visibleSlots.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {visibleSlots.map((slot) => (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex justify-between items-center p-4 rounded-md border-2 cursor-pointer transition-all ${
                            selectedSlot?.id === slot.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-slate-200 hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <div className="flex items-center gap-3">
                            {selectedSlot?.id === slot.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                            <div>
                              <p className="font-medium">{slot.start_time} - {slot.end_time}</p>
                              <p className="text-sm text-slate-600">
                                {(() => {
                                  // Calculate duration
                                  const startParts = slot.start_time.split(':').map(Number);
                                  const endParts = slot.end_time.split(':').map(Number);
                                  const startMinutes = startParts[0] * 60 + startParts[1];
                                  const endMinutes = endParts[0] * 60 + endParts[1];
                                  const durationMinutes = endMinutes - startMinutes;
                                  const hours = Math.floor(durationMinutes / 60);
                                  const minutes = durationMinutes % 60;
                                  
                                  return `${hours > 0 ? `${hours}h` : ''} ${minutes > 0 ? `${minutes}m` : ''}`;
                                })()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              ₹{(() => {
                                // Calculate price based on duration
                                const startParts = slot.start_time.split(':').map(Number);
                                const endParts = slot.end_time.split(':').map(Number);
                                const startMinutes = startParts[0] * 60 + startParts[1];
                                const endMinutes = endParts[0] * 60 + endParts[1];
                                const durationMinutes = endMinutes - startMinutes;
                                const durationHours = durationMinutes / 60;
                                
                                return Math.round(hourlyRate * durationHours);
                              })()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 rounded-md border border-dashed border-slate-200">
                      <p className="text-muted-foreground">No time slots available for this date</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Please select a different date
                      </p>
                    </div>
                  )
                ) : (
                  <div className="text-center p-8 rounded-md border border-dashed border-slate-200">
                    <p className="text-muted-foreground">Select a date to see available time slots</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dates with availability are highlighted on the calendar
                    </p>
                  </div>
                )}
                
                {selectedSlot && (
                  <div className="mt-4">
                    <Button 
                      className="w-full"
                      onClick={() => document.getElementById('session-tab')?.click()}
                    >
                      Continue to Session Details
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="session" id="session-tab">
            <div className="space-y-4">
              {selectedSlot ? (
                <>
                  <div className="p-4 bg-slate-50 rounded-md border">
                    <h3 className="font-medium mb-2">Selected Time Slot</h3>
                    <p className="text-sm">
                      {format(new Date(selectedSlot.day), "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm font-medium">
                      {selectedSlot.start_time} - {selectedSlot.end_time}
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="sessionTitle" className="block text-sm font-medium mb-1">
                      Session Title *
                    </label>
                    <input
                      id="sessionTitle"
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., Career Guidance Session"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="sessionNotes" className="block text-sm font-medium mb-1">
                      Session Notes (optional)
                    </label>
                    <textarea
                      id="sessionNotes"
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      placeholder="Topics you'd like to discuss..."
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-md border">
                    <div className="flex justify-between mb-2">
                      <span>Session Fee</span>
                      <span className="font-semibold">
                        ₹{(() => {
                          // Calculate price based on duration
                          const startParts = selectedSlot.start_time.split(':').map(Number);
                          const endParts = selectedSlot.end_time.split(':').map(Number);
                          const startMinutes = startParts[0] * 60 + startParts[1];
                          const endMinutes = endParts[0] * 60 + endParts[1];
                          const durationMinutes = endMinutes - startMinutes;
                          const durationHours = durationMinutes / 60;
                          
                          return Math.round(hourlyRate * durationHours);
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Payment will be collected after session confirmation.
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => document.getElementById('calendar-tab')?.click()}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={bookSession}
                      disabled={isBooking || !sessionTitle}
                    >
                      {isBooking ? 'Booking...' : 'Book Session'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 rounded-md border border-dashed border-slate-200">
                  <p className="text-muted-foreground">No time slot selected</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => document.getElementById('calendar-tab')?.click()}
                  >
                    Go Back to Calendar
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
