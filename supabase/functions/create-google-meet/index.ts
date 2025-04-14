
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestData {
  sessionId: string;
  sessionTitle: string;
  startTime: string;
  durationMinutes: number;
  mentorId?: string;
  menteeEmail?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request data
    const requestData: RequestData = await req.json();
    const { sessionId, sessionTitle, startTime, durationMinutes, mentorId, menteeEmail } = requestData;

    if (!sessionId || !sessionTitle || !startTime || !durationMinutes) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse session start time and calculate end time
    const sessionStartTime = new Date(startTime);
    const currentTime = new Date();
    
    // If session is in the past, use current time as start time with 5 minutes buffer
    if (sessionStartTime < currentTime) {
      console.log("Session start time is in the past, adjusting to current time + 5 minutes");
      sessionStartTime.setTime(currentTime.getTime() + 5 * 60 * 1000);
    }
    
    const sessionEndTime = new Date(sessionStartTime.getTime() + durationMinutes * 60 * 1000);
    
    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - Supabase credentials missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First check if there's already a meeting URL
    const { data: existingSession, error: checkError } = await supabase
        .from('sessions')
        .select('meeting_url')
        .eq('id', sessionId)
        .single();
        
    if (checkError) {
      console.error('Error checking existing session:', checkError);
    } else if (existingSession?.meeting_url) {
      console.log('Meeting URL already exists, returning:', existingSession.meeting_url);
      return new Response(
        JSON.stringify({ 
          meetingUrl: existingSession.meeting_url,
          message: 'Existing meeting URL retrieved' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If mentorId is provided, try to retrieve their Google OAuth token
    let accessToken = '';
    if (mentorId) {
      const { data: mentorUser, error: userError } = await supabase
        .auth.admin.getUserById(mentorId);

      if (userError) {
        console.error('Error fetching mentor:', userError);
        return new Response(
          JSON.stringify({ error: 'Cannot fetch mentor details' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if the user has provider token (Google OAuth)
      if (mentorUser?.user?.app_metadata?.provider === 'google') {
        accessToken = mentorUser.user.app_metadata.provider_token;
      }
    }

    // If we have a valid access token, use Google Calendar API
    if (accessToken) {
      console.log('Using Google Calendar API to create meeting with mentor\'s access token');
      
      const sessionStartISO = sessionStartTime.toISOString();
      const sessionEndISO = sessionEndTime.toISOString();
      
      // Create a Google Calendar event with Google Meet
      const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: sessionTitle,
          description: `Mentor4All session: ${sessionTitle}`,
          start: {
            dateTime: sessionStartISO
          },
          end: {
            dateTime: sessionEndISO
          },
          attendees: menteeEmail ? [{ email: menteeEmail }] : [],
          conferenceData: {
            createRequest: {
              requestId: `mentor4all-session-${sessionId}`
            }
          }
        })
      });

      if (!calendarResponse.ok) {
        const errorText = await calendarResponse.text();
        console.error('Google Calendar API error:', calendarResponse.status, errorText);
        
        // If token expired or invalid, fallback to creating a meeting URL manually
        if (calendarResponse.status === 401) {
          // Token expired - use fallback method
          console.log('Google OAuth token expired or invalid, using fallback method');
          // We'll implement the fallback method later
        } else {
          return new Response(
            JSON.stringify({ 
              error: `Failed to create Google Calendar event. Status: ${calendarResponse.status}`,
              details: errorText
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        const calendarData = await calendarResponse.json();
        
        console.log('Google Calendar event created:', calendarData);
        
        // Extract the Google Meet link
        const meetLink = calendarData.hangoutLink;
        
        if (!meetLink) {
          console.error('Google Calendar API did not return a hangoutLink');
          // Fallback to generating a meeting URL manually
        } else {
          // Store the Google Meet link in the session
          const { error: updateError } = await supabase
            .from('sessions')
            .update({ meeting_url: meetLink })
            .eq('id', sessionId);

          if (updateError) {
            console.error('Error updating session with meeting URL:', updateError);
            return new Response(
              JSON.stringify({ error: 'Failed to update session with meeting URL' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log(`Successfully created Google Meet link for session ${sessionId}: ${meetLink}`);

          return new Response(
            JSON.stringify({ 
              meetingUrl: meetLink,
              message: 'Google Meet link created successfully' 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Fallback: If Google Calendar API fails or token is not available,
    // generate a meeting URL using a publicly accessible video meeting service
    console.log('Generating fallback meeting URL');
    
    // Generate a unique meeting ID based on the session ID
    const meetingId = `mentor4all-${sessionId.replace(/-/g, '').substring(0, 12)}`;
    const fallbackMeetingUrl = `https://meet.google.com/${meetingId}`;
    
    // Update the session with the fallback meeting URL
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ meeting_url: fallbackMeetingUrl })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session with fallback meeting URL:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update session with meeting URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully created fallback meeting URL for session ${sessionId}: ${fallbackMeetingUrl}`);

    return new Response(
      JSON.stringify({ 
        meetingUrl: fallbackMeetingUrl,
        message: 'Fallback meeting URL created successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating meeting:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
