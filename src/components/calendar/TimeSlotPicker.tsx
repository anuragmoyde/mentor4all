
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';

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
      // You could show a toast message here
      return;
    }

    onAddTimeSlot(startTime, endTime);
  };

  return (
    <div className="flex flex-col space-y-4 border rounded-md p-4 bg-slate-50/50">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-xs font-medium text-gray-700 mb-1">
            Start Time
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
          <label htmlFor="endTime" className="block text-xs font-medium text-gray-700 mb-1">
            End Time
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
        className="w-full"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Time Slot
      </Button>
    </div>
  );
};
