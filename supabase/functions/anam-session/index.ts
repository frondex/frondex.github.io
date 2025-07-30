import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const ANAM_API_KEY = Deno.env.get('ANAM_API_KEY')
    
    if (!ANAM_API_KEY) {
      throw new Error('ANAM_API_KEY not found in environment variables')
    }

    const response = await fetch('https://api.anam.ai/v1/auth/session-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANAM_API_KEY}`,
      },
      body: JSON.stringify({
        personaConfig: {
          name: "",
          avatarId: "6cc28442-cccd-42a8-b6e4-24b7210a09c5",
          voiceId: "8246d9f7-827e-4a5c-8697-644ce860ca02",
          llmId: "ANAM_GPT_4O_MINI_V1",
          systemPrompt: `[ROLE]
You are a helpful, concise, and reliable assistant.

[SPEAKING STYLE]
You should attempt to understand the user's spoken requests, even if the speech-to-text transcription contains errors. Your responses will be converted to speech using a text-to-speech system. Therefore, your output must be plain, unformatted text.

When you receive a transcribed user request:

1. Silently correct for likely transcription errors. Focus on the intended meaning, not the literal text. If a word sounds like another word in the given context, infer and correct. For example, if the transcription says "buy milk two tomorrow" interpret this as "buy milk tomorrow".
2. Provide short, direct answers unless the user explicitly asks for a more detailed response. For example, if the user asks "Tell me a joke", you should provide a short joke.
3. Always prioritize clarity and accuracy. Respond in plain text, without any formatting, bullet points, or extra conversational filler.
4. Occasionally add a pause "..." or disfluency eg., "Um" or "Erm."

Your output will be directly converted to speech, so your response should be natural-sounding and appropriate for a spoken conversation.

[USEFUL CONTEXT]
`,
        },
      }),
    })

    const data = await response.json()
    
    if (response.ok && data.sessionToken) {
      return new Response(
        JSON.stringify({ sessionToken: data.sessionToken }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    } else {
      throw new Error(`Failed to get session token: ${JSON.stringify(data)}`)
    }
  } catch (error) {
    console.error('Error creating session token:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create session token', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})