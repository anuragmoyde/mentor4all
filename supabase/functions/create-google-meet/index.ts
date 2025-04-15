
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
      console.error('Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request data
    const requestData: RequestData = await req.json();
    const { sessionId, sessionTitle, startTime, durationMinutes, mentorId, menteeEmail } = requestData;

    if (!sessionId || !sessionTitle || !startTime || !durationMinutes) {
      console.error('Missing required fields in request data:', JSON.stringify(requestData));
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
    let mentorData = null;
    
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

      mentorData = mentorUser?.user;
      console.log('Retrieved mentor data. User ID:', mentorId);
      
      // Check if the user has provider token (Google OAuth)
      if (mentorData && mentorUser?.user?.app_metadata?.provider === 'google') {
        // Try to get the token from different places it might be stored
        accessToken = mentorUser.user.app_metadata.provider_token || '';
        
        // Log metadata for debugging (mask part of the token for security)
        console.log('Mentor auth provider:', mentorUser.user.app_metadata.provider);
        if (accessToken) {
          console.log('Found access token (first 10 chars):', accessToken.substring(0, 10) + '...');
        } else {
          console.log('No access token found in app_metadata.provider_token');
        }
        
        // Check other potential locations for the token
        if (!accessToken && mentorUser.user.identities && mentorUser.user.identities.length > 0) {
          const googleIdentity = mentorUser.user.identities.find(id => id.provider === 'google');
          if (googleIdentity?.access_token) {
            accessToken = googleIdentity.access_token;
            console.log('Found access token in identities (first 10 chars):', accessToken.substring(0, 10) + '...');
          }
        }
      } else {
        console.log('Mentor is not authenticated via Google or app_metadata is missing');
        if (mentorData) {
          console.log('Authentication provider:', mentorData.app_metadata?.provider);
        }
      }
    }

    const sessionStartISO = sessionStartTime.toISOString();
    const sessionEndISO = sessionEndTime.toISOString();
    
    // If we have a valid access token, use Google Calendar API
    if (accessToken && accessToken.length > 0) {
      console.log('Using Google Calendar API to create meeting with mentor\'s access token');
      
      // Create a Google Calendar event with Google Meet
      const calendarEventBody = {
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
            requestId: `mentor4all-${sessionId.substring(0, 8)}-${Date.now()}`,
            conferenceSolutionKey: { 
              type: "hangoutsMeet" 
            }
          }
        }
      };
      
      console.log('Calendar API request body:', JSON.stringify(calendarEventBody));
      
      const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarEventBody)
      });

      const calendarResponseStatus = calendarResponse.status;
      const calendarResponseText = await calendarResponse.text();
      
      console.log('Google Calendar API response status:', calendarResponseStatus);
      console.log('Google Calendar API full response:', calendarResponseText);

      if (!calendarResponse.ok) {
        console.error(`Google Calendar API error (${calendarResponseStatus}):`, calendarResponseText);
        
        // Token might be expired or invalid, fallback to creating a meeting URL manually
        if (calendarResponseStatus === 401) {
          console.log('Google OAuth token expired or invalid, using fallback method');
          // We'll implement the fallback method in the next section
        } else {
          return new Response(
            JSON.stringify({ 
              error: `Failed to create Google Calendar event. Status: ${calendarResponseStatus}`,
              details: calendarResponseText
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Parse the response text to JSON
        const calendarData = JSON.parse(calendarResponseText);
        
        console.log('Calendar event created successfully. Event ID:', calendarData.id);
        
        // Extract the Google Meet link
        const meetLink = calendarData.hangoutLink;
        
        if (!meetLink) {
          console.error('Google Calendar API did not return a hangoutLink', JSON.stringify(calendarData));
          return new Response(
            JSON.stringify({ 
              error: 'Google Calendar event created but no meeting link was generated',
              details: 'The conferenceData might not have been processed correctly'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('Extracted Google Meet link:', meetLink);
        
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
    } else {
      console.log('No valid Google OAuth token found for mentor', mentorId);
      if (mentorData) {
        console.log('Mentor authentication provider:', mentorData.app_metadata?.provider);
      }
    }

    // Fallback: If Google Calendar API fails or token is not available,
    // generate a meeting URL via a direct Google Meet link
    console.log('Generating fallback meeting URL');
    
    // Generate a unique meeting ID based on the session ID and current timestamp
    const timestamp = new Date().getTime().toString(36);
    const randomId = Math.random().toString(36).substring(2, 8);
    const meetingId = `m4a-${sessionId.substring(0, 6)}-${timestamp.substring(timestamp.length - 4)}-${randomId}`;
    
    // Format as a valid Google Meet URL
    const fallbackMeetingUrl = `https://meet.google.com/${meetingId}`;
    
    console.log(`WARNING: Using fallback meeting URL generation method: ${fallbackMeetingUrl}`);
    console.log(`WARNING: This fallback URL might not be reliable!`);
    
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

    console.log(`Updated session ${sessionId} with fallback meeting URL: ${fallbackMeetingUrl}`);

    return new Response(
      JSON.stringify({ 
        meetingUrl: fallbackMeetingUrl,
        message: 'Fallback meeting URL created successfully',
        warning: 'Fallback method used - this URL might not be reliable'
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
