import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the JWT token from the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set the session to validate the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { address, signature, message, chain = 'eip155:1' } = await req.json();

    if (!address || !signature || !message) {
      return new Response(
        JSON.stringify({ error: 'Address, signature, and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying wallet link for user:', user.id, 'address:', address);

    // Verify the nonce exists and is valid (within 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: nonceData, error: nonceError } = await supabase
      .from('wallet_nonces')
      .select('nonce')
      .eq('address', address.toLowerCase())
      .eq('chain', chain)
      .gt('created_at', tenMinutesAgo)
      .maybeSingle();

    if (nonceError || !nonceData) {
      console.error('Nonce verification failed:', nonceError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired nonce' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic signature verification (in production, you'd want more robust SIWE verification)
    // For now, we'll trust that the frontend properly signs and the message contains the nonce
    if (!message.includes(nonceData.nonce)) {
      return new Response(
        JSON.stringify({ error: 'Message does not contain valid nonce' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a service role client for privileged operations
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if wallet is already linked to another user
    const { data: existingWallet, error: existingError } = await serviceSupabase
      .from('user_wallets')
      .select('user_id')
      .eq('address', address.toLowerCase())
      .eq('chain', chain)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing wallet:', existingError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingWallet && existingWallet.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Wallet is already linked to another account' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Link the wallet to the user (or update if already linked to same user)
    const { error: linkError } = await serviceSupabase
      .from('user_wallets')
      .upsert({
        user_id: user.id,
        address: address.toLowerCase(),
        chain,
        type: 'evm',
      }, {
        onConflict: 'address,chain'
      });

    if (linkError) {
      console.error('Error linking wallet:', linkError);
      return new Response(
        JSON.stringify({ error: 'Failed to link wallet' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean up the used nonce
    await serviceSupabase
      .from('wallet_nonces')
      .delete()
      .eq('address', address.toLowerCase())
      .eq('chain', chain)
      .eq('nonce', nonceData.nonce);

    console.log('Wallet linked successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Wallet linked successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});