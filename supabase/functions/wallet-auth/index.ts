import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Initialize Supabase clients
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { address, signature, message, chain } = await req.json()

    if (!address || !signature || !message || !chain) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Wallet auth request:', { address, chain, message: message.substring(0, 100) + '...' })

    // Verify nonce exists and is valid
    const { data: nonceData, error: nonceError } = await supabase
      .from('wallet_nonces')
      .select('*')
      .eq('address', address)
      .eq('chain', chain)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutes
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (nonceError || !nonceData) {
      console.error('Nonce verification failed:', nonceError)
      return new Response(JSON.stringify({ error: 'Invalid or expired nonce' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Basic message validation (should contain the nonce)
    if (!message.includes(nonceData.nonce)) {
      return new Response(JSON.stringify({ error: 'Invalid message format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user already exists for this wallet
    const { data: existingWallet } = await supabaseAdmin
      .from('user_wallets')
      .select('user_id')
      .eq('address', address)
      .eq('chain', chain)
      .single()

    let userId: string

    if (existingWallet) {
      // User exists, use existing user ID
      userId = existingWallet.user_id
      console.log('Existing wallet user found:', userId)
    } else {
      // Create new user with wallet address as email
      const walletEmail = `${address.toLowerCase()}@wallet.local`
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: walletEmail,
        email_confirm: true,
        user_metadata: {
          wallet_address: address,
          wallet_chain: chain,
          is_wallet_user: true
        }
      })

      if (authError || !authData.user) {
        console.error('Error creating wallet user:', authError)
        return new Response(JSON.stringify({ error: 'Failed to create user account' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      userId = authData.user.id
      console.log('New wallet user created:', userId)

      // Link the wallet to the new user
      const { error: linkError } = await supabaseAdmin
        .from('user_wallets')
        .upsert({
          user_id: userId,
          address: address,
          chain: chain,
          type: 'evm'
        })

      if (linkError) {
        console.error('Error linking wallet:', linkError)
        return new Response(JSON.stringify({ error: 'Failed to link wallet' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${address.toLowerCase()}@wallet.local`,
      options: {
        redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/`
      }
    })

    if (sessionError || !sessionData) {
      console.error('Error generating session:', sessionError)
      return new Response(JSON.stringify({ error: 'Failed to generate session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Clean up the nonce
    await supabaseAdmin
      .from('wallet_nonces')
      .delete()
      .eq('id', nonceData.id)

    console.log('Wallet authentication successful for user:', userId)

    return new Response(JSON.stringify({ 
      success: true, 
      user_id: userId,
      magic_link: sessionData.properties?.action_link
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})