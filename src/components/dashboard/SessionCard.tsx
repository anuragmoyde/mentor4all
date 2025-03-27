
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, BadgeIndianRupee } from 'lucide-react';

interface SessionCardProps {
  id: string;
  title: string;
  personName: string;
  personLastName: string;
  dateTime: string;
  duration: number;
  price: number;
}

const SessionCard: React.FC<SessionCardProps> = ({
  id,
  title,
  personName,
  personLastName,
  dateTime,
  duration,
  price,
}) => {
  return (
    <Card key={id}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          with {personName} {personLastName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              {new Date(dateTime).toLocaleDateString()} at {new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{duration} minutes</span>
          </div>
          <div className="flex items-center">
            <BadgeIndianRupee className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">₹{price}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
