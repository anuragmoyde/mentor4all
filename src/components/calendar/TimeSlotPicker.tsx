
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from '@/hooks/use-toast';

interface TimeSlotPickerProps {
  onAddTimeSlot: (startTime: string, endTime: string) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ onAddTimeSlot }) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const timeOptions = [
    '09:00', '09:30',
    '10:00', '10:30',
    '11:00', '11:30',
    '12:00', '12:30',
    '13:00', '13:30',
    '14:00', '14:30',
    '15:00', '15:30',
    '16:00', '16:30',
    '17:00', '17:30',
    '18:00', '18:30',
    '19:00', '19:30',
    '20:00', '20:30',
    '21:00'
  ];

  const handleAddSlot = () => {
    // Validate that end time is after start time
    if (startTime >= endTime) {
      toast({
        title: "Invalid time slot",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }

    onAddTimeSlot(startTime, endTime);
    
    // Auto-clear or suggest next slot
    const startIndex = timeOptions.indexOf(endTime);
    if (startIndex >= 0 && startIndex < timeOptions.length - 2) {
      setStartTime(endTime);
      setEndTime(timeOptions[startIndex + 2]);
    }
  };

  return (
    <div className="flex flex-col space-y-4 border rounded-md p-4 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
            Start Time
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 ml-1 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Choose when your session starts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <Select
            value={startTime}
            onValueChange={(value) => {
              setStartTime(value);
              // Auto-select an end time that's 1 hour later
              const startIndex = timeOptions.indexOf(value);
              if (startIndex >= 0 && startIndex < timeOptions.length - 2) {
                setEndTime(timeOptions[startIndex + 2]);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.slice(0, -1).map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="endTime" className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
            End Time
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 ml-1 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Choose when your session ends</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <Select
            value={endTime}
            onValueChange={setEndTime}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select end time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.filter(time => time > startTime).map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleAddSlot} 
        className="w-full group hover:bg-green-600 transition-colors"
      >
        <PlusCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
        Add Time Slot
      </Button>
    </div>
  );
};
