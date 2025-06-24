import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NutritionRequest {
  recipeId?: number
  ingredients?: string[]
  servings?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { recipeId, ingredients, servings = 1 }: NutritionRequest = await req.json()
    
    const apiKey = Deno.env.get('VITE_SPOONACULAR_API_KEY')
    if (!apiKey) {
      throw new Error('Spoonacular API key not configured')
    }

    let url: string
    let method = 'GET'
    let body: string | undefined

    if (recipeId) {
      // Get nutrition for specific recipe
      url = `https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json?apiKey=${apiKey}`
      console.log(`Getting nutrition for recipe ${recipeId}`)
    } else if (ingredients && ingredients.length > 0) {
      // Calculate nutrition from ingredients
      url = `https://api.spoonacular.com/recipes/parseIngredients?apiKey=${apiKey}`
      method = 'POST'
      
      const formData = new URLSearchParams()
      formData.append('ingredientList', ingredients.join('\n'))
      formData.append('servings', servings.toString())
      formData.append('includeNutrition', 'true')
      
      body = formData.toString()
      console.log(`Calculating nutrition from ${ingredients.length} ingredients`)
    } else {
      throw new Error('Either recipeId or ingredients must be provided')
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': method === 'POST' ? 'application/x-www-form-urlencoded' : 'application/json',
        'User-Agent': 'ChefSpeak/1.0'
      },
      body,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Spoonacular nutrition API error: ${response.status}`, errorText)
      throw new Error(`Spoonacular API error: ${response.status}`)
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Nutrition data error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to get nutrition data'
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