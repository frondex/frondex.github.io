import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get user from auth header
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const { amount, description, chat_session_id } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Invalid credit amount");
    }

    // Create service role client to bypass RLS
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Use the deduct_credits function
    const { data: result, error } = await supabaseService.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: amount,
      p_description: description || 'Chat usage',
      p_chat_session_id: chat_session_id || null
    });

    if (error) {
      console.error('Error deducting credits:', error);
      throw new Error('Failed to deduct credits');
    }

    if (!result) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get updated credit balance
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (creditsError) {
      console.error('Error fetching updated credits:', creditsError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        remaining_credits: creditsData?.credits || 0 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in use-credits function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});