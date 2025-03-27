
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, BadgeIndianRupee } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: 'calendar' | 'clock' | 'users' | 'money';
}

interface StatCardsProps {
  stats: StatCardProps[];
}

const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'calendar':
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
      case 'clock':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'users':
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case 'money':
        return <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {getIcon(stat.icon)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatCards;
