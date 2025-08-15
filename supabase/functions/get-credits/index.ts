import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-CREDITS] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client using the service role key to bypass RLS for initialization
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create regular client for user authentication
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

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user is admin
    const { data: roleData } = await supabaseService
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = roleData?.role === 'admin';
    logStep("Role check", { isAdmin, role: roleData?.role });

    // Get or create user credits
    let { data: creditsData, error: creditsError } = await supabaseService
      .from('user_credits')
      .select('credits, created_at, updated_at')
      .eq('user_id', user.id)
      .single();

    // If no credits record exists, create one
    if (creditsError && creditsError.code === 'PGRST116') {
      logStep("Creating credits record for user");
      
      // Create initial credits based on admin status
      const initialCredits = isAdmin ? 999999 : 10;
      
      const { data: newCreditsData, error: insertError } = await supabaseService
        .from('user_credits')
        .insert({
          user_id: user.id,
          credits: initialCredits
        })
        .select('credits, created_at, updated_at')
        .single();

      if (insertError) {
        console.error('Error creating credits record:', insertError);
        throw new Error('Failed to create credits record');
      }

      creditsData = newCreditsData;
      logStep("Credits record created", { credits: initialCredits });
    } else if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      throw new Error('Failed to fetch credits');
    }

    // Note: Removed automatic credit reset for admins to allow testing credit deductions

    // Get recent transactions
    const { data: transactionsData, error: transactionsError } = await supabaseService
      .from('credit_transactions')
      .select('amount, transaction_type, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

    const response = {
      credits: creditsData?.credits || 0,
      transactions: transactionsData || [],
      created_at: creditsData?.created_at,
      updated_at: creditsData?.updated_at,
      is_admin: isAdmin
    };

    logStep("Success", { credits: response.credits, isAdmin });

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
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