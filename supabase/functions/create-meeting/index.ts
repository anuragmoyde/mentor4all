
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
    const sessionStartTime = new Date(startTime);
    const sessionEndTime = new Date(sessionStartTime.getTime() + durationMinutes * 60 * 1000);
    
    // Add buffer time to expiry (1 hour after session ends)
    const expiryTime = new Date(sessionEndTime.getTime() + 60 * 60 * 1000);
    
    // Create a Daily.co room
    const dailyApiKey = Deno.env.get('DAILY_API_KEY');
    if (!dailyApiKey) {
      console.error('DAILY_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a unique room name based on the session ID
    const roomName = `session-${sessionId.replace(/-/g, '')}`;
    
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
      const errorData = await dailyResponse.json();
      console.error('Daily.co API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create meeting room' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dailyData = await dailyResponse.json();
    const meetingUrl = dailyData.url;

    // Update the session with the meeting URL in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ meeting_url: meetingUrl })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update session with meeting URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
