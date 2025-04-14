
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestData {
  sessionId: string;
  sessionTitle: string;
  startTime: string;
  durationMinutes: number;
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
    const { sessionId, sessionTitle, startTime, durationMinutes } = requestData;

    if (!sessionId || !sessionTitle || !startTime || !durationMinutes) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse session start time and calculate expiry
    // Adjust time to IST for consistency across the platform
    const sessionStartTime = new Date(startTime);
    const currentTime = new Date();
    
    // If session is in the past, use current time as start time with 5 minutes buffer
    if (sessionStartTime < currentTime) {
      console.log("Session start time is in the past, adjusting to current time + 5 minutes");
      sessionStartTime.setTime(currentTime.getTime() + 5 * 60 * 1000);
    }
    
    const sessionEndTime = new Date(sessionStartTime.getTime() + durationMinutes * 60 * 1000);
    
    // Add buffer time to expiry (1 hour after session ends)
    const expiryTime = new Date(sessionEndTime.getTime() + 60 * 60 * 1000);
    
    // Create a Daily.co room
    const dailyApiKey = Deno.env.get('DAILY_API_KEY');
    if (!dailyApiKey) {
      console.error('DAILY_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - Daily API Key missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the session already has a meeting URL
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

    // Create a unique room name based on the session ID
    const roomName = `session-${sessionId.replace(/-/g, '')}`;
    
    // Log all the parameters for debugging
    console.log('Creating Daily.co room with parameters:', {
      roomName,
      expiry: Math.floor(expiryTime.getTime() / 1000),
      sessionStartTime: sessionStartTime.toISOString(),
      sessionEndTime: sessionEndTime.toISOString(),
      expiryTime: expiryTime.toISOString()
    });
    
    // Call Daily.co API to create a room
    const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          exp: Math.floor(expiryTime.getTime() / 1000), // Unix timestamp in seconds
          enable_screenshare: true,
          enable_chat: true,
          start_audio_off: false,
          start_video_off: false,
          enable_knocking: true,
        }
      })
    });

    if (!dailyResponse.ok) {
      const errorText = await dailyResponse.text();
      console.error('Daily.co API error status:', dailyResponse.status);
      console.error('Daily.co API error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('Daily.co API error parsed:', errorData);
      } catch (e) {
        console.error('Could not parse Daily.co error response as JSON');
      }
      
      return new Response(
        JSON.stringify({ error: `Failed to create meeting room. Status: ${dailyResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dailyData = await dailyResponse.json();
    console.log('Daily.co API response:', dailyData);
    
    const meetingUrl = dailyData.url;
    if (!meetingUrl) {
      console.error('Daily.co API did not return a URL');
      return new Response(
        JSON.stringify({ error: 'Failed to create meeting room - no URL returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the session with the meeting URL in Supabase
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ meeting_url: meetingUrl })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session with meeting URL:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update session with meeting URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully created meeting URL for session ${sessionId}: ${meetingUrl}`);

    return new Response(
      JSON.stringify({ 
        meetingUrl,
        message: 'Meeting room created successfully' 
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
