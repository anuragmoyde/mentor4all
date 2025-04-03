
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin, Briefcase, Building, ChevronLeft, BadgeIndianRupee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import MentorBookingCalendar from '@/components/calendar/MentorBookingCalendar';

interface MentorDetailViewProps {
  mentorId: string;
  onBack?: () => void;
}

const MentorDetailView: React.FC<MentorDetailViewProps> = ({ mentorId, onBack }) => {
  const [mentor, setMentor] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const { data: mentorData, error: mentorError } = await supabase
          .from('mentors')
          .select('*')
          .eq('id', mentorId)
          .single();

        if (mentorError) throw mentorError;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', mentorId)
          .single();

        if (profileError) throw profileError;

        setMentor(mentorData);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching mentor details:', error);
        toast({
          title: "Error loading mentor",
          description: "Could not load mentor details.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (mentorId) {
      fetchMentor();
    }
  }, [mentorId, toast]);

  const handleBookingComplete = () => {
    toast({
      title: "Booking successful",
      description: "Your session has been booked. You can view it in your dashboard."
    });
    
    // Navigate to dashboard after short delay
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!mentor || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Mentor not found</p>
        <Button onClick={() => navigate('/mentors')} className="mt-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to All Mentors
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0 hover:pl-2 transition-all" 
        onClick={onBack || (() => navigate('/mentors'))}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Mentors
      </Button>
      
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url} alt={`${profile.first_name} ${profile.last_name}`} />
                <AvatarFallback className="text-2xl">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-grow space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {mentor.job_title && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Briefcase className="h-3.5 w-3.5 mr-1" />
                      {mentor.job_title}
                    </div>
                  )}
                  
                  {mentor.company && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Building className="h-3.5 w-3.5 mr-1" />
                      {mentor.company}
                    </div>
                  )}
                  
                  {mentor.industry && (
                    <Badge variant="outline" className="ml-1">
                      {mentor.industry}
                    </Badge>
                  )}
                </div>
              </div>
              
              {mentor.expertise?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center">
                  <BadgeIndianRupee className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="font-semibold">₹{mentor.hourly_rate}/hour</span>
                </div>
                
                {mentor.years_experience && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{mentor.years_experience} years experience</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {profile.bio && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">About</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <MentorBookingCalendar 
        mentorId={mentorId} 
        mentorName={`${profile.first_name} ${profile.last_name}`}
        hourlyRate={mentor.hourly_rate}
        onSessionBooked={handleBookingComplete}
      />
    </div>
  );
};

export default MentorDetailView;
