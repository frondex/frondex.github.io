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

    // Get user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('credits, created_at, updated_at')
      .eq('user_id', user.id)
      .single();

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      throw new Error('Failed to fetch credits');
    }

    // Get recent transactions
    const { data: transactionsData, error: transactionsError } = await supabaseClient
      .from('credit_transactions')
      .select('amount, transaction_type, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

    return new Response(
      JSON.stringify({ 
        credits: creditsData?.credits || 0,
        transactions: transactionsData || [],
        created_at: creditsData?.created_at,
        updated_at: creditsData?.updated_at
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in get-credits function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});