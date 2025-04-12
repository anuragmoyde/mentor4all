
import { supabase } from '@/integrations/supabase/client';

interface CreateMeetingParams {
  sessionId: string;
  sessionTitle: string;
  startTime: string;
  durationMinutes: number;
}

export const useMeetingUrl = () => {
  const createMeetingUrl = async ({
    sessionId,
    sessionTitle,
    startTime,
    durationMinutes
  }: CreateMeetingParams) => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session) throw new Error("No auth session");

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

      return response.data.meetingUrl;
    } catch (error) {
      console.error('Error in createMeetingUrl:', error);
      return null;
    }
  };

  return { createMeetingUrl };
};
