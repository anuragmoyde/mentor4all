
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
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
}

const TimeSlotStep: React.FC<TimeSlotStepProps> = ({
  selectedDate,
  setSelectedDate,
  availableSlots,
  selectedSlot,
  handleSlotSelect,
  onContinue,
  isLoading
}) => {
  const { toast } = useToast();
  
  const getSlotsForDate = (date: Date | undefined) => {
    if (!date) return [];
    const formattedDate = format(date, 'yyyy-MM-dd');
    return availableSlots.filter(slot => slot.day === formattedDate);
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

  return (
    <div>
      <div className="space-y-4">
        <p>Select a date:</p>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{
            available: (date) => {
              const formattedDate = format(date, 'yyyy-MM-dd');
              return availableSlots.some(slot => slot.day === formattedDate);
            },
          }}
          modifiersStyles={{
            available: { 
              backgroundColor: "rgba(52, 211, 153, 0.1)",
              border: "2px solid rgba(52, 211, 153, 0.5)" 
            }
          }}
          disabled={(date) => 
            date < new Date() || // Past dates
            !availableSlots.some(slot => slot.day === format(date, 'yyyy-MM-dd')) // Dates without slots
          }
          fromDate={new Date()}
        />
      </div>
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
};

export default TimeSlotStep;
