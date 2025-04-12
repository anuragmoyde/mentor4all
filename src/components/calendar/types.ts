
export interface AvailabilitySlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface BookingCalendarProps {
  mentorId: string;
  mentorName: string;
  hourlyRate: number;
  onBookingComplete?: () => void;
}
