import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { verifyMessage } from 'https://esm.sh/viem@2.37.4';

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

    const normalizedAddress = address.toLowerCase()
    console.log('Verifying wallet link for user:', user.id, 'address:', normalizedAddress);

    // Verify the nonce exists and is valid (within 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: nonceData, error: nonceError } = await supabase
      .from('wallet_nonces')
      .select('id, nonce')
      .eq('address', normalizedAddress)
      .eq('chain', chain)
      .gt('created_at', tenMinutesAgo)
      .maybeSingle();

    if (nonceError || !nonceData) {
      console.error('Nonce verification failed:', nonceError);
      return new Response(
        JSON.stringify({ error: 'INVALID_NONCE', message: 'Invalid or expired nonce' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Nonce found for link verification:', { nonceId: nonceData.id })

    // Verify the signature
    try {
      const isValidSignature = await verifyMessage({
        address: normalizedAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      })

      if (!isValidSignature) {
        console.error('Invalid signature for wallet link:', normalizedAddress)
        return new Response(
          JSON.stringify({ error: 'INVALID_SIGNATURE', message: 'Invalid signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (signatureError) {
      console.error('Signature verification error:', signatureError)
      return new Response(
        JSON.stringify({ error: 'SIGNATURE_VERIFICATION_FAILED', message: 'Failed to verify signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate message contains the nonce
    if (!message.includes(nonceData.nonce)) {
      console.error('Message does not contain expected nonce')
      return new Response(
        JSON.stringify({ error: 'INVALID_MESSAGE', message: 'Message does not contain valid nonce' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Signature verification successful for wallet link:', normalizedAddress)

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
      .eq('address', normalizedAddress)
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
        JSON.stringify({ error: 'WALLET_ALREADY_LINKED', message: 'Wallet is already linked to another account' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Link the wallet to the user (or update if already linked to same user)
    const { error: linkError } = await serviceSupabase
      .from('user_wallets')
      .upsert({
        user_id: user.id,
        address: normalizedAddress,
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

    // Clean up the used nonce (critical security step)
    const { error: deleteError } = await serviceSupabase
      .from('wallet_nonces')
      .delete()
      .eq('id', nonceData.id)

    if (deleteError) {
      console.error('Failed to delete nonce:', deleteError)
    } else {
      console.log('Nonce successfully deleted for wallet link:', nonceData.id)
    }

    console.log('Wallet linked successfully to user:', user.id);

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