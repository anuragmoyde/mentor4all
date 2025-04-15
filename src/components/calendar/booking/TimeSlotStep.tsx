
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Check, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AvailabilitySlot } from "../types";
import { useToast } from '@/hooks/use-toast';

interface TimeSlotStepProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  availableSlots: AvailabilitySlot[];
  selectedSlot: AvailabilitySlot | null;
  handleSlotSelect: (slot: AvailabilitySlot) => void;
  onContinue: () => void;
  isLoading: boolean;
  hourlyRate?: number;
}

const TimeSlotStep: React.FC<TimeSlotStepProps> = ({
  selectedDate,
  setSelectedDate,
  availableSlots,
  selectedSlot,
  handleSlotSelect,
  onContinue,
  isLoading,
  hourlyRate = 0
}) => {
  const { toast } = useToast();
  
  const getSlotsForDate = (date: Date | undefined) => {
    if (!date) return [];
    // Format the date consistently
    const formattedDate = format(date, 'yyyy-MM-dd');
    console.log('Getting slots for date:', formattedDate);
    
    // Filter slots for the selected date
    const slotsForDate = availableSlots.filter(slot => slot.day === formattedDate);
    console.log('Found slots for date:', slotsForDate);
    
    return slotsForDate;
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
    onContinue();
  };

  const isDayWithSlots = (date: Date) => {
    return availableSlots.some(slot => 
      slot.day === format(date, 'yyyy-MM-dd')
    );
  };

  const slotsForSelectedDate = selectedDate 
    ? getSlotsForDate(selectedDate)
    : [];

  return (
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
            className="rounded-md border shadow-sm pointer-events-auto"
            modifiers={{
              available: (date) => isDayWithSlots(date),
            }}
            modifiersStyles={{
              available: { 
                backgroundColor: "rgba(52, 211, 153, 0.1)",
                border: "2px solid rgba(52, 211, 153, 0.5)" 
              }
            }}
            disabled={(date) => 
              date < new Date() || 
              !isDayWithSlots(date)
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
                        {hourlyRate > 0 && (
                          <span className="text-xs text-slate-500">
                            {(() => {
                              // Calculate duration using the time strings directly
                              const startTimeParts = slot.startTime.split(':').map(Number);
                              const endTimeParts = slot.endTime.split(':').map(Number);
                              
                              // Create date objects with the same date but different times
                              const baseDate = new Date(2000, 0, 1);
                              const startDate = new Date(baseDate);
                              startDate.setHours(startTimeParts[0], startTimeParts[1], 0);
                              
                              const endDate = new Date(baseDate);
                              endDate.setHours(endTimeParts[0], endTimeParts[1], 0);
                              
                              // Calculate duration in minutes
                              const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
                              const price = (hourlyRate / 60) * durationMinutes;
                              
                              return `₹${price.toFixed(2)} · ${durationMinutes} minutes`;
                            })()}
                          </span>
                        )}
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
};

export default TimeSlotStep;
