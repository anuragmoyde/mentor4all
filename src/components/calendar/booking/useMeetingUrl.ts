
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateMeetingParams {
  sessionId: string;
  sessionTitle: string;
  startTime: string;
  durationMinutes: number;
}

export const useMeetingUrl = () => {
  const { toast } = useToast();

  const createMeetingUrl = async ({
    sessionId,
    sessionTitle,
    startTime,
    durationMinutes
  }: CreateMeetingParams) => {
    try {
      console.log('Creating meeting URL for session:', sessionId);
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

      // If no meeting URL exists, create one
      console.log('Invoking create-meeting function with params:', {
        sessionId,
        sessionTitle,
        startTime,
        durationMinutes,
      });
      
      const response = await supabase.functions.invoke('create-meeting', {
        body: {
          sessionId,
          sessionTitle,
          startTime,
          durationMinutes,
        }
      });

      if (response.error) {
        console.error('Error creating meeting:', response.error);
        throw new Error(response.error.message || 'Failed to create meeting');
      }

      console.log('Successfully created meeting:', response.data);
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
