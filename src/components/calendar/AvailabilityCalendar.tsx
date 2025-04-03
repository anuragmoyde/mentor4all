
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "@/components/calendar/TimeSlotPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar as CalendarIcon, Clock, Save } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type TimeSlot = {
  day: Date;
  startTime: string;
  endTime: string;
  id?: string;
};

interface AvailabilityCalendarProps {
  mentorId: string;
  existingSlots?: TimeSlot[];
  onSlotsUpdated?: () => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ 
  mentorId,
  existingSlots = [],
  onSlotsUpdated
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(existingSlots);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dates with slots already added
  const datesWithSlots = timeSlots.map(slot => {
    const date = new Date(slot.day);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleAddTimeSlot = (startTime: string, endTime: string) => {
    if (!selectedDate) return;
    
    // Check if the time slot overlaps with existing slots for the selected date
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingSlotsForDate = timeSlots.filter(slot => 
      format(new Date(slot.day), 'yyyy-MM-dd') === selectedDateStr
    );
    
    for (const slot of existingSlotsForDate) {
      if (
        (startTime >= slot.startTime && startTime < slot.endTime) ||
        (endTime > slot.startTime && endTime <= slot.endTime) ||
        (startTime <= slot.startTime && endTime >= slot.endTime)
      ) {
        toast({
          title: "Time slot overlaps",
          description: "This time slot overlaps with another slot you've already added.",
          variant: "destructive"
        });
        return;
      }
    }
    
    setTimeSlots([...timeSlots, {
      day: new Date(selectedDate),
      startTime,
      endTime
    }]);
    
    toast({
      title: "Time slot added",
      description: `${format(selectedDate, 'EEEE, MMMM d')}: ${startTime} - ${endTime}`
    });
  };

  const handleRemoveTimeSlot = (index: number) => {
    const newSlots = [...timeSlots];
    newSlots.splice(index, 1);
    setTimeSlots(newSlots);
  };

  const saveAvailability = async () => {
    if (!mentorId || timeSlots.length === 0) return;
    
    setIsSaving(true);
    try {
      // First delete existing slots
      await supabase
        .from('mentor_availability')
        .delete()
        .eq('mentor_id', mentorId);
      
      // Then add new slots
      const { error } = await supabase
        .from('mentor_availability')
        .insert(
          timeSlots.map(slot => ({
            mentor_id: mentorId,
            day: format(new Date(slot.day), 'yyyy-MM-dd'),
            start_time: slot.startTime,
            end_time: slot.endTime
          }))
        );
      
      if (error) throw error;
      
      toast({
        title: "Availability saved",
        description: "Your availability has been updated successfully.",
      });
      
      if (onSlotsUpdated) {
        onSlotsUpdated();
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error saving availability",
        description: "There was a problem saving your availability. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render dates with slots differently
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
          Set Your Availability
        </CardTitle>
        <CardDescription>
          Select dates and times when you're available for mentorship sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">1. Select dates on the calendar</p>
              <Calendar 
                mode="single" 
                selected={selectedDate} 
                onSelect={handleDateSelect}
                className="rounded-md border shadow-sm pointer-events-auto"
                modifiers={{
                  booked: (date) => isDayWithSlots(date),
                }}
                modifiersClassNames={{
                  booked: "border-2 border-primary bg-primary/10",
                }}
                fromDate={new Date()}
              />
            </div>
            
            <div className="mt-6">
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                2. Add available time slots
              </p>
              {selectedDate && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <p className="text-sm font-medium mb-1">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <TimeSlotPicker onAddTimeSlot={handleAddTimeSlot} />
                </motion.div>
              )}
            </div>
          </div>
          
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium flex items-center gap-1">
                <ArrowRight className="h-4 w-4" />
                3. Review your availability
              </p>
              <Button 
                onClick={saveAvailability} 
                disabled={timeSlots.length === 0 || isSaving}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save All"}
              </Button>
            </div>
            
            {timeSlots.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {timeSlots.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
                  .map((slot, index) => (
                  <motion.div
                    key={`${slot.day}-${slot.startTime}-${slot.endTime}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex justify-between items-center p-3 rounded-md border border-slate-200 bg-slate-50"
                  >
                    <div>
                      <p className="font-medium">{format(new Date(slot.day), "EEEE, MMMM d")}</p>
                      <p className="text-sm text-slate-600">{slot.startTime} - {slot.endTime}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveTimeSlot(index)}
                    >
                      Remove
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 rounded-md border border-dashed border-slate-200">
                <p className="text-muted-foreground">No time slots added yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select dates and add time slots to make yourself available for mentorship
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
