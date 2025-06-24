import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RecipeSearchRequest {
  query?: string
  ingredients?: string[]
  cuisine?: string
  diet?: string
  intolerances?: string
  maxReadyTime?: number
  number?: number
  offset?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const searchParams: RecipeSearchRequest = await req.json()
    
    const apiKey = Deno.env.get('VITE_SPOONACULAR_API_KEY')
    if (!apiKey) {
      throw new Error('Spoonacular API key not configured')
    }

    let endpoint = '/recipes/complexSearch'
    const params: Record<string, any> = {
      apiKey,
      addRecipeInformation: true,
      fillIngredients: true,
      number: searchParams.number || 12,
      offset: searchParams.offset || 0,
    }

    // Handle different search types
    if (searchParams.ingredients && searchParams.ingredients.length > 0) {
      endpoint = '/recipes/findByIngredients'
      params.ingredients = searchParams.ingredients.join(',')
      params.number = searchParams.number || 12
      params.ranking = 1 // Maximize used ingredients
      params.ignorePantry = true
      
      // Remove complex search specific params for ingredient search
      delete params.addRecipeInformation
      delete params.fillIngredients
    } else if (searchParams.query) {
      params.query = searchParams.query
    }

    // Add filters
    if (searchParams.cuisine) params.cuisine = searchParams.cuisine
    if (searchParams.diet) params.diet = searchParams.diet
    if (searchParams.intolerances) params.intolerances = searchParams.intolerances
    if (searchParams.maxReadyTime) params.maxReadyTime = searchParams.maxReadyTime

    const url = new URL(`https://api.spoonacular.com${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })

    console.log(`Searching recipes: ${endpoint} with params:`, Object.keys(params))

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'ChefSpeak/1.0'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Spoonacular API error: ${response.status}`, errorText)
      throw new Error(`Spoonacular API error: ${response.status}`)
    }

    const data = await response.json()

    // If we used findByIngredients, we need to get detailed info for each recipe
    if (endpoint === '/recipes/findByIngredients' && data.length > 0) {
      console.log(`Getting detailed info for ${data.length} recipes`)
      
      const detailedRecipes = await Promise.all(
        data.slice(0, 8).map(async (recipe: any) => {
          try {
            const detailUrl = new URL(`https://api.spoonacular.com/recipes/${recipe.id}/information`)
            detailUrl.searchParams.set('apiKey', apiKey)
            detailUrl.searchParams.set('includeNutrition', 'false') // Skip nutrition for performance
            
            const detailResponse = await fetch(detailUrl.toString())
            if (detailResponse.ok) {
              const detailData = await detailResponse.json()
              return { ...recipe, ...detailData }
            }
            return recipe
          } catch (error) {
            console.error(`Error getting details for recipe ${recipe.id}:`, error)
            return recipe
          }
        })
      )
      
      return new Response(JSON.stringify(detailedRecipes), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Recipe search error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to search recipes'
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