import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface SpoonacularRequest {
  endpoint: string
  params?: Record<string, any>
  method?: 'GET' | 'POST'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { endpoint, params = {}, method = 'GET' }: SpoonacularRequest = await req.json()
    
    // Get Spoonacular API key from environment
    const apiKey = Deno.env.get('VITE_SPOONACULAR_API_KEY')
    if (!apiKey) {
      throw new Error('Spoonacular API key not configured')
    }

    // Build URL with parameters
    const baseUrl = 'https://api.spoonacular.com'
    const url = new URL(`${baseUrl}${endpoint}`)
    
    // Add API key and other parameters
    url.searchParams.set('apiKey', apiKey)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })

    console.log(`Making Spoonacular API request to: ${url.pathname}`)

    // Make request to Spoonacular
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ChefSpeak/1.0'
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Spoonacular API error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Spoonacular proxy error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to process Spoonacular API request'
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