
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
        
        let errorMessage = response.error.message || "Failed to create meeting";
        if (response.error.message?.includes('token')) {
          errorMessage = "Google Calendar access expired. Please log out and log in again with Google.";
        }
        
        toast({
          title: "Error creating meeting",
          description: errorMessage,
          variant: "destructive"
        });
        throw new Error(errorMessage);
      }

      // Verify the response contains a valid meetingUrl
      if (!response.data || !response.data.meetingUrl) {
        console.error('Invalid response from create-google-meet function:', response.data);
        
        // Check if there's a warning about fallback
        const warningMessage = response.data?.warning || "The server response did not contain a valid meeting URL";
        
        toast({
          title: "Meeting link might not be reliable",
          description: warningMessage,
          variant: "warning"
        });
        
        if (!response.data?.meetingUrl) {
          throw new Error('Invalid server response - no meeting URL provided');
        }
      }

      // Check if the URL is in the expected format for Google Meet
      const meetingUrl = response.data.meetingUrl;
      if (!meetingUrl.startsWith('https://meet.google.com/')) {
        console.warn('Meeting URL does not appear to be a valid Google Meet URL:', meetingUrl);
        toast({
          title: "Warning",
          description: "Generated meeting URL might not be a valid Google Meet link",
          variant: "warning"
        });
      }

      console.log('Successfully created Google Meet meeting:', meetingUrl);
      
      // Fetch the updated session to verify the URL was saved
      const { data: updatedSession, error: updateCheckError } = await supabase
        .from('sessions')
        .select('meeting_url')
        .eq('id', sessionId)
        .single();
        
      if (updateCheckError) {
        console.error('Error verifying meeting URL update:', updateCheckError);
      } else {
        console.log('Verified meeting URL in database:', updatedSession?.meeting_url);
      }
      
      return meetingUrl;
    } catch (error) {
      console.error('Error in createMeetingUrl:', error);
      toast({
        title: "Error creating meeting",
        description: error.message || "Could not create meeting URL. Please try again later.",
        variant: "destructive"
      });
      return null;
    }
  };

  return { createMeetingUrl };
};
