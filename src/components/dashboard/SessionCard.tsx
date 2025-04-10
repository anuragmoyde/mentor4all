
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MessageCircle, Video } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

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
}) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const formattedDate = format(parseISO(dateTime), 'EEEE, MMMM do');
  const formattedTime = format(parseISO(dateTime), 'h:mm a');
  const durationInHours = duration / 60;
  const sessionEndTime = new Date(parseISO(dateTime).getTime() + duration * 60 * 1000);
  const endTimeFormatted = format(sessionEndTime, 'h:mm a');
  
  const isPast = new Date(dateTime) < new Date();
  const isToday = format(parseISO(dateTime), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  const getStatusColor = () => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    if (isPast) return 'bg-gray-100 text-gray-800';
    if (isToday) return 'bg-amber-100 text-amber-800';
    return 'bg-blue-100 text-blue-800';
  };
  
  const getStatusText = () => {
    if (status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    if (isPast) return 'Missed';
    if (isToday) return 'Today';
    return 'Upcoming';
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={`https://ui-avatars.com/api/?name=${personName}+${personLastName}&background=random`} />
              <AvatarFallback>{personName?.[0]}{personLastName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-sm">
                with {personName} {personLastName}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
          <span className="text-sm font-medium">₹{price}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{formattedTime} - {endTimeFormatted} ({durationInHours} hr)</span>
        </div>
        
        {description && (
          <Collapsible className="mt-3" open={isNotesOpen} onOpenChange={setIsNotesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto flex items-center hover:bg-transparent">
                <MessageCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm underline">
                  {isMentor ? "Mentee's notes" : "Session notes"}
                </span>
                <span className={`ml-1 text-xs ${isNotesOpen ? "rotate-180" : ""} transition-transform`}>▼</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
              {description}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          {!isPast && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Video className="h-4 w-4 mr-2" />
                    Join Meeting
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Join the video meeting when it's time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <Button variant="outline" size="sm" className="flex-1">
            {isPast ? 'View Details' : 'Reschedule'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SessionCard;
