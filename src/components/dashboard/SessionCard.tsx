import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MessageCircle, Video, ExternalLink, ArrowUpRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMeetingUrl } from '../calendar/booking/useMeetingUrl';

interface SessionCardProps {
  id: string;
  title: string;
  personName: string;
  personLastName: string;
  dateTime: string;
  duration: number;
  price: number;
  description?: string;
  status?: string;
  isMentor?: boolean;
  meetingUrl?: string;
  mentorId?: string;
  onReschedule?: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  id,
  title,
  personName,
  personLastName,
  dateTime,
  duration,
  price,
  description,
  status = 'scheduled',
  isMentor = false,
  meetingUrl,
  mentorId,
  onReschedule,
}) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const { toast } = useToast();
  const { createMeetingUrl } = useMeetingUrl();
  
  console.log('SessionCard rendering with dateTime:', dateTime);
  
  // Parse the ISO date string to a Date object directly
  // The date is stored in UTC in the database, and we want to display it in local time
  const sessionDate = parseISO(dateTime);
  
  console.log('Session date parsed:', {
    originalISOString: dateTime,
    parsedLocalString: sessionDate.toString(),
    parsedTimestamp: sessionDate.getTime(),
  });
  
  // Format date for display in the local timezone (browser's timezone)
  const formattedDate = format(sessionDate, 'EEEE, MMMM do');
  const formattedTime = format(sessionDate, 'h:mm a');
  
  const durationInHours = duration / 60;
  const sessionEndTime = new Date(sessionDate.getTime() + duration * 60 * 1000);
  const endTimeFormatted = format(sessionEndTime, 'h:mm a');
  
  console.log('Formatted display values:', {
    date: formattedDate,
    startTime: formattedTime,
    endTime: endTimeFormatted
  });
  
  const isPast = sessionDate < new Date();
  const isToday = format(sessionDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  // Calculate if the meeting is active (15 min before start until end)
  const now = new Date();
  const sessionStart = sessionDate;
  const sessionEnd = sessionEndTime;
  const bufferTime = 15 * 60 * 1000; // 15 minutes in milliseconds
  const isActive = now >= new Date(sessionStart.getTime() - bufferTime) && now <= sessionEnd;
  
  useEffect(() => {
    const checkAndGenerateMeetingLink = async () => {
      if (!isPast && !meetingUrl && id && mentorId) {
        try {
          console.log('Checking if meeting link is needed for session:', id);
          
          // Always generate a meeting link for upcoming sessions that don't have one
          await generateMeetingLink();
        } catch (error) {
          console.error('Error checking meeting link:', error);
        }
      }
    };
    
    checkAndGenerateMeetingLink();
  }, [id, isPast, meetingUrl, mentorId]);
  
  const getStatusColor = () => {
    if (status === 'completed') return 'bg-success-100 text-success-700 border border-success-200';
    if (status === 'cancelled') return 'bg-destructive/10 text-destructive border border-destructive/20';
    if (isPast) return 'bg-gray-100 text-gray-700 border border-gray-200';
    if (isToday) return 'bg-warning-100 text-warning-700 border border-warning-200';
    return 'bg-primary-100 text-primary-700 border border-primary-200';
  };
  
  const getStatusText = () => {
    if (status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    if (isPast) return 'Missed';
    if (isToday) return 'Today';
    return 'Upcoming';
  };

  const handleJoinMeeting = () => {
    if (meetingUrl) {
      window.open(meetingUrl, '_blank', 'noopener,noreferrer');
    } else if (id && mentorId) {
      // If we don't have a meeting URL, try to generate one
      generateMeetingLink();
    }
  };
  
  const generateMeetingLink = async () => {
    if (!id || !mentorId || isGeneratingLink) return;
    
    try {
      setIsGeneratingLink(true);
      console.log('Generating meeting link for session:', id);
      
      // Pass the original date time string to maintain timezone consistency
      const url = await createMeetingUrl({
        sessionId: id,
        sessionTitle: title || `Session with ${personName}`,
        startTime: dateTime,  // Keep the original ISO datetime string
        durationMinutes: duration,
        mentorId: mentorId
      });
      
      if (url) {
        toast({
          title: "Meeting link generated",
          description: "You can now join the meeting by clicking the Join Meeting button.",
        });
        
        // Refresh the page to show the new link
        if (onReschedule) onReschedule();
      } else {
        toast({
          title: "Could not generate meeting link",
          description: "Please try again or contact support.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating meeting link:', error);
      toast({
        title: "Error",
        description: "Failed to generate meeting link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };
  
  const handleReschedule = async () => {
    if (!mentorId) {
      toast({
        title: "Cannot reschedule",
        description: "Mentor information is missing. Please contact support.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to mentor's profile with the session ID for rescheduling
    window.location.href = `/mentors/${mentorId}?reschedule=${id}`;
  };

  return (
    <Card className="hover:shadow-card transition-all duration-300 transform hover:-translate-y-1 border-t-4 rounded-xl overflow-hidden" style={{borderTopColor: isPast ? '#d1d5db' : (isToday ? '#fb923c' : '#3b82f6')}}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-white shadow-sm">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${personName}+${personLastName}&background=random`} />
              <AvatarFallback className="bg-primary-100 text-primary-700">{personName?.[0]}{personLastName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <CardDescription className="text-sm">
                with {personName} {personLastName}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getStatusColor()} font-medium text-xs px-2.5 py-1 rounded-full`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 space-y-3">
        <div className="grid grid-cols-2 gap-1">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span className="text-gray-700">{formattedDate}</span>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm font-semibold text-gray-800">₹{price}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-2 text-primary" />
          <span className="text-gray-700">{formattedTime} - {endTimeFormatted}</span>
          <span className="ml-1 text-xs text-gray-500">({durationInHours} hr)</span>
        </div>
        
        {description && (
          <Collapsible className="mt-3" open={isNotesOpen} onOpenChange={setIsNotesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto flex items-center hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                <MessageCircle className="h-4 w-4 mr-1 text-primary" />
                <span className="text-sm text-primary hover:underline">
                  {isMentor ? "Mentee's notes" : "Session notes"}
                </span>
                <span className={`ml-1 text-xs ${isNotesOpen ? "rotate-180" : ""} transition-transform text-primary`}>▼</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
              {description}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 border-t bg-gray-50">
        <div className="flex gap-2 w-full">
          {!isPast && meetingUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="default" size="sm" className="flex-1 bg-success-600 hover:bg-success-700 text-white" onClick={handleJoinMeeting}>
                    <Video className="h-4 w-4 mr-2" />
                    Join Google Meet
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Join the Google Meet video call now</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {!isPast && !meetingUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1" 
                    onClick={generateMeetingLink}
                    disabled={isGeneratingLink}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {isGeneratingLink ? "Generating..." : "Generate Meeting Link"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a Google Meet link for this session</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isPast && meetingUrl && (
            <Button variant="outline" size="sm" className="flex-1 border-gray-300" onClick={handleJoinMeeting}>
              <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
              View Recording
            </Button>
          )}
          
          {!isPast && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-gray-300 text-gray-700"
              onClick={handleReschedule}
            >
              Reschedule
            </Button>
          )}
          
          {isPast && !meetingUrl && (
            <Button variant="outline" size="sm" className="flex-1 border-gray-300 text-gray-700">
              <ArrowUpRight className="h-4 w-4 mr-2 text-gray-500" />
              View Details
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SessionCard;
