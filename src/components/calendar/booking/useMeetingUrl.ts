
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateMeetingParams {
  sessionId: string;
  sessionTitle: string;
  startTime: string;
  durationMinutes: number;
  mentorId?: string;
  menteeEmail?: string;
}

export const useMeetingUrl = () => {
  const { toast } = useToast();

  const createMeetingUrl = async ({
    sessionId,
    sessionTitle,
    startTime,
    durationMinutes,
    mentorId,
    menteeEmail
  }: CreateMeetingParams) => {
    try {
      console.log('Creating Google Meet URL for session:', sessionId);
      const token = await supabase.auth.getSession();
      if (!token.data.session) {
        console.error('No auth session found');
        throw new Error("No auth session");
      }

      // First check if there's already a meeting URL for this session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('meeting_url')
        .eq('id', sessionId)
        .single();
        
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
      } else if (sessionData?.meeting_url) {
        console.log('Meeting URL already exists:', sessionData.meeting_url);
        return sessionData.meeting_url;
      }

      // If no meeting URL exists, create one using Google Calendar API
      console.log('Invoking create-google-meet function with params:', {
        sessionId,
        sessionTitle,
        startTime,
        durationMinutes,
        mentorId,
        menteeEmail
      });
      
      const response = await supabase.functions.invoke('create-google-meet', {
        body: {
          sessionId,
          sessionTitle,
          startTime,
          durationMinutes,
          mentorId,
          menteeEmail
        }
      });

      console.log('Edge function response:', response);

      if (response.error) {
        console.error('Error creating Google Meet meeting:', response.error);
        toast({
          title: "Error creating meeting",
          description: response.error.message || "Failed to create meeting",
          variant: "destructive"
        });
        throw new Error(response.error.message || 'Failed to create meeting');
      }

      // Verify the response contains a valid meetingUrl
      if (!response.data || !response.data.meetingUrl) {
        console.error('Invalid response from create-google-meet function:', response.data);
        toast({
          title: "Error creating meeting",
          description: "The server response did not contain a valid meeting URL",
          variant: "destructive"
        });
        throw new Error('Invalid server response');
      }

      console.log('Successfully created Google Meet meeting:', response.data.meetingUrl);
      return response.data.meetingUrl;
    } catch (error) {
      console.error('Error in createMeetingUrl:', error);
      toast({
        title: "Error creating meeting",
        description: "Could not create meeting URL. Please try again later.",
        variant: "destructive"
      });
      return null;
    }
  };

  return { createMeetingUrl };
};
