
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Check, Clock, ArrowRight, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AvailabilitySlot } from "../types";
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

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
    
    // Filter slots for the selected date that are not booked
    const slotsForDate = availableSlots.filter(slot => 
      slot.day === formattedDate && !slot.isBooked
    );
    
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
    // Check if the date has any available slots that are not booked
    return availableSlots.some(slot => 
      slot.day === format(date, 'yyyy-MM-dd') && !slot.isBooked
    );
  };

  const slotsForSelectedDate = selectedDate 
    ? getSlotsForDate(selectedDate)
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <p className="text-sm font-medium mb-2 flex items-center gap-1.5 text-gray-800">
          <CalendarIcon className="h-4 w-4 text-primary" />
          Select a date
        </p>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Calendar 
              mode="single" 
              selected={selectedDate} 
              onSelect={setSelectedDate}
              className="rounded-md p-0"
              modifiers={{
                available: (date) => isDayWithSlots(date),
              }}
              modifiersClassNames={{
                available: "bg-primary/10 font-semibold text-primary",
              }}
              components={{
                IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
              }}
              disabled={(date) => 
                date < new Date() || 
                !isDayWithSlots(date)
              }
              fromDate={new Date()}
              classNames={{
                day_selected: "bg-primary text-white font-semibold",
                day_today: "border border-primary bg-transparent text-primary font-semibold"
              }}
            />
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium mb-2 flex items-center gap-1.5 text-gray-800">
          <Clock className="h-4 w-4 text-primary" />
          Choose an available time slot
        </p>
        
        {selectedDate && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-800 mb-3">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
            {slotsForSelectedDate.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3 mt-3 max-h-[300px] overflow-y-auto pr-2">
                {slotsForSelectedDate
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((slot, index) => {
                  
                  // Calculate duration and price
                  const startTimeParts = slot.startTime.split(':').map(Number);
                  const endTimeParts = slot.endTime.split(':').map(Number);
                  
                  const baseDate = new Date(2000, 0, 1);
                  const startDate = new Date(baseDate);
                  startDate.setHours(startTimeParts[0], startTimeParts[1], 0);
                  
                  const endDate = new Date(baseDate);
                  endDate.setHours(endTimeParts[0], endTimeParts[1], 0);
                  
                  const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
                  const price = (hourlyRate / 60) * durationMinutes;
                  
                  const isSelected = selectedSlot?.id === slot.id;
                  
                  return (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <button
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-lg border",
                          isSelected 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-primary/30',
                          "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                        )}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={slot.isBooked}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                              ₹{price.toFixed(2)} · {durationMinutes} minutes
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border border-dashed rounded-lg bg-gray-50">
                <p className="text-sm text-muted-foreground">No time slots available for this date</p>
              </div>
            )}
          </div>
        )}
        
        {!selectedDate && (
          <div className="flex items-center justify-center p-8 border border-dashed rounded-lg bg-gray-50">
            <p className="text-sm text-muted-foreground">Select a date to see available time slots</p>
          </div>
        )}
      </div>
      
      {selectedSlot && (
        <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
          <Button 
            onClick={moveToSessionDetails}
            className="bg-primary hover:bg-primary/90 text-white font-medium"
          >
            Continue to Session Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimeSlotStep;
