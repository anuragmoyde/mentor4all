
import React from 'react';
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AvailabilitySlot } from "../types";

interface SessionDetailsStepProps {
  selectedSlot: AvailabilitySlot | null;
  sessionTitle: string;
  setSessionTitle: (title: string) => void;
  sessionDescription: string;
  setSessionDescription: (description: string) => void;
  onBack: () => void;
  onBook: () => void;
  isBooking: boolean;
}

const SessionDetailsStep: React.FC<SessionDetailsStepProps> = ({
  selectedSlot,
  sessionTitle,
  setSessionTitle,
  sessionDescription,
  setSessionDescription,
  onBack,
  onBook,
  isBooking
}) => {
  return (
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
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Time Selection
        </Button>
        <Button 
          onClick={onBook} 
          disabled={isBooking || !sessionTitle.trim()}
        >
          {isBooking ? "Booking..." : "Book Session"}
        </Button>
      </div>
    </div>
  );
};

export default SessionDetailsStep;
