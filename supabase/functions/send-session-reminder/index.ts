
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch upcoming sessions within the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select(`
        *,
        mentees:mentee_id(email:id(email), profiles:id(first_name, last_name)),
        mentors:mentor_id(email:id(email), profiles:id(first_name, last_name))
      `)
      .gte("date_time", now.toISOString())
      .lt("date_time", tomorrow.toISOString())
      .eq("status", "scheduled");

    if (error) throw error;

    // For simplicity, we'll just log the sessions that would get emails
    // In a real implementation, you would send actual emails for each session
    console.log(`Found ${sessions?.length || 0} upcoming sessions for reminder emails`);
    
    for (const session of sessions || []) {
      console.log(`Would send reminder email for session: ${session.title}`);
      console.log(`  To mentee: ${session.mentees.profiles.first_name} ${session.mentees.profiles.last_name}`);
      console.log(`  Email: ${session.mentees.email.email}`);
      console.log(`  Session with: ${session.mentors.profiles.first_name} ${session.mentors.profiles.last_name}`);
      console.log(`  Time: ${new Date(session.date_time).toLocaleString()}`);
      
      // Add email sending logic here when you have an email service integrated
    }

    return new Response(
      JSON.stringify({ success: true, message: `Processed ${sessions?.length || 0} upcoming sessions` }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-session-reminder function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
