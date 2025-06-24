const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TTSRequest {
  text: string
  voice_id?: string
  model_id?: string
  voice_settings?: {
    stability: number
    similarity_boost: number
    style?: number
    use_speaker_boost?: boolean
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const { 
      text, 
      voice_id = 'EXAVITQu4vr4xnSDxMaL', // Default voice (Bella)
      model_id = 'eleven_multilingual_v2',
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }: TTSRequest = await req.json()

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Eleven Labs API key from environment
    const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
    if (!apiKey) {
      console.error('ELEVEN_LABS_API_KEY environment variable not set')
      return new Response(
        JSON.stringify({ 
          error: 'TTS service not configured',
          details: 'API key missing. Please configure ELEVEN_LABS_API_KEY in Supabase Edge Functions settings.',
          configuration_required: true
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle test requests for configuration checking
    if (text === 'test') {
      return new Response(
        JSON.stringify({ 
          status: 'configured',
          message: 'TTS service is properly configured'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Generating TTS for text: "${text.substring(0, 50)}..." with voice: ${voice_id}`)

    // Make request to Eleven Labs TTS API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Eleven Labs API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      
      let errorMessage = `Eleven Labs API error: ${response.status}`
      if (response.status === 401) {
        errorMessage = 'Invalid API key'
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded'
      } else if (response.status === 422) {
        errorMessage = 'Invalid request parameters'
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorText,
          status: response.status
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    
    if (audioBuffer.byteLength === 0) {
      console.error('Received empty audio buffer from Eleven Labs')
      return new Response(
        JSON.stringify({ 
          error: 'Empty audio data received',
          details: 'The TTS service returned no audio data'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Successfully generated audio: ${audioBuffer.byteLength} bytes`)

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('TTS generation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message || 'Failed to generate text-to-speech',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})