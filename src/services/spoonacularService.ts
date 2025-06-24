import { supabase } from '../lib/supabase'

export interface SpoonacularRecipe {
  id: number
  title: string
  image: string
  imageType: string
  readyInMinutes: number
  servings: number
  sourceUrl: string
  summary: string
  cuisines: string[]
  dishTypes: string[]
  diets: string[]
  occasions: string[]
  instructions: string
  extendedIngredients: Array<{
    id: number
    aisle: string
    image: string
    name: string
    amount: number
    unit: string
    original: string
  }>
  nutrition?: {
    nutrients: Array<{
      name: string
      amount: number
      unit: string
      percentOfDailyNeeds?: number
    }>
  }
}

export interface RecipeSearchParams {
  query?: string
  ingredients?: string[]
  cuisine?: string
  diet?: string
  intolerances?: string
  maxReadyTime?: number
  number?: number
  offset?: number
}

export interface NutritionInfo {
  calories: number
  carbs: string
  fat: string
  protein: string
  nutrients: Array<{
    name: string
    amount: number
    unit: string
    percentOfDailyNeeds?: number
  }>
}

class SpoonacularService {
  private apiKey: string | null = null

  constructor() {
    // Get API key from environment
    this.apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY
  }

  private async makeApiCall(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.apiKey) {
      console.warn('Spoonacular API key not found, using edge function fallback')
      return this.callEdgeFunction('spoonacular-proxy', { endpoint, params })
    }

    try {
      const url = new URL(`https://api.spoonacular.com${endpoint}`)
      url.searchParams.set('apiKey', this.apiKey)
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })

      console.log(`Making direct Spoonacular API call to: ${endpoint}`)

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`Spoonacular API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Direct API call failed, falling back to edge function:', error)
      return this.callEdgeFunction('spoonacular-proxy', { endpoint, params })
    }
  }

  private async callEdgeFunction(functionName: string, payload: any) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      })

      if (error) {
        console.error(`Error calling ${functionName}:`, error)
        throw new Error(`Failed to call ${functionName}: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error(`Edge function ${functionName} failed:`, error)
      throw error
    }
  }

  // Search recipes with various filters
  async searchRecipes(params: RecipeSearchParams): Promise<SpoonacularRecipe[]> {
    try {
      const searchParams: Record<string, any> = {
        addRecipeInformation: true,
        fillIngredients: true,
        number: params.number || 12,
        offset: params.offset || 0,
      }

      if (params.query) searchParams.query = params.query
      if (params.cuisine) searchParams.cuisine = params.cuisine
      if (params.diet) searchParams.diet = params.diet
      if (params.intolerances) searchParams.intolerances = params.intolerances
      if (params.maxReadyTime) searchParams.maxReadyTime = params.maxReadyTime

      const data = await this.makeApiCall('/recipes/complexSearch', searchParams)
      return data.results || []
    } catch (error) {
      console.error('Error searching recipes:', error)
      return []
    }
  }

  // Find recipes by ingredients
  async findRecipesByIngredients(ingredients: string[], number: number = 12): Promise<SpoonacularRecipe[]> {
    try {
      const data = await this.makeApiCall('/recipes/findByIngredients', {
        ingredients: ingredients.join(','),
        number,
        ranking: 1,
        ignorePantry: true
      })

      // Get detailed information for each recipe
      const detailedRecipes = await Promise.all(
        data.slice(0, 8).map(async (recipe: any) => {
          try {
            const details = await this.getRecipeDetails(recipe.id)
            return details || recipe
          } catch (error) {
            console.error(`Error getting details for recipe ${recipe.id}:`, error)
            return recipe
          }
        })
      )

      return detailedRecipes.filter(Boolean)
    } catch (error) {
      console.error('Error finding recipes by ingredients:', error)
      return []
    }
  }

  // Get detailed recipe information
  async getRecipeDetails(recipeId: number): Promise<SpoonacularRecipe | null> {
    try {
      const data = await this.makeApiCall(`/recipes/${recipeId}/information`, {
        includeNutrition: true
      })
      return data
    } catch (error) {
      console.error('Error getting recipe details:', error)
      return null
    }
  }

  // Get nutrition information for a recipe
  async getRecipeNutrition(recipeId: number): Promise<NutritionInfo | null> {
    try {
      const data = await this.makeApiCall(`/recipes/${recipeId}/nutritionWidget.json`)
      
      if (data && data.nutrients) {
        const nutrients = data.nutrients
        const calories = nutrients.find((n: any) => n.name === 'Calories')?.amount || 0
        const carbs = nutrients.find((n: any) => n.name === 'Carbohydrates')?.amount || 0
        const fat = nutrients.find((n: any) => n.name === 'Fat')?.amount || 0
        const protein = nutrients.find((n: any) => n.name === 'Protein')?.amount || 0

        return {
          calories,
          carbs: `${Math.round(carbs)}g`,
          fat: `${Math.round(fat)}g`,
          protein: `${Math.round(protein)}g`,
          nutrients: data.nutrients
        }
      }
      return null
    } catch (error) {
      console.error('Error getting nutrition info:', error)
      return null
    }
  }

  // Get nutrition from ingredients list
  async getNutritionFromIngredients(ingredients: string[], servings: number = 1): Promise<NutritionInfo | null> {
    try {
      const data = await this.makeApiCall('/recipes/parseIngredients', {
        ingredientList: ingredients.join('\n'),
        servings,
        includeNutrition: true
      })
      
      if (data && Array.isArray(data)) {
        let totalCalories = 0
        let totalCarbs = 0
        let totalFat = 0
        let totalProtein = 0
        const allNutrients: any[] = []

        data.forEach((ingredient: any) => {
          if (ingredient.nutrition && ingredient.nutrition.nutrients) {
            ingredient.nutrition.nutrients.forEach((nutrient: any) => {
              switch (nutrient.name) {
                case 'Calories':
                  totalCalories += nutrient.amount
                  break
                case 'Carbohydrates':
                  totalCarbs += nutrient.amount
                  break
                case 'Fat':
                  totalFat += nutrient.amount
                  break
                case 'Protein':
                  totalProtein += nutrient.amount
                  break
              }
              allNutrients.push(nutrient)
            })
          }
        })

        return {
          calories: Math.round(totalCalories),
          carbs: `${Math.round(totalCarbs)}g`,
          fat: `${Math.round(totalFat)}g`,
          protein: `${Math.round(totalProtein)}g`,
          nutrients: allNutrients
        }
      }
      return null
    } catch (error) {
      console.error('Error getting nutrition from ingredients:', error)
      return null
    }
  }

  // Get random recipes
  async getRandomRecipes(number: number = 12, tags?: string): Promise<SpoonacularRecipe[]> {
    try {
      const params: Record<string, any> = { number }
      if (tags) params.tags = tags

      const data = await this.makeApiCall('/recipes/random', params)
      return data.recipes || []
    } catch (error) {
      console.error('Error getting random recipes:', error)
      return []
    }
  }

  // Get recipe suggestions based on user preferences
  async getPersonalizedRecipes(preferences: {
    diet?: string
    intolerances?: string[]
    cuisine?: string
    maxReadyTime?: number
  }): Promise<SpoonacularRecipe[]> {
    try {
      const params: RecipeSearchParams = {
        number: 12,
        diet: preferences.diet,
        cuisine: preferences.cuisine,
        maxReadyTime: preferences.maxReadyTime
      }

      if (preferences.intolerances && preferences.intolerances.length > 0) {
        params.intolerances = preferences.intolerances.join(',')
      }

      return await this.searchRecipes(params)
    } catch (error) {
      console.error('Error getting personalized recipes:', error)
      return []
    }
  }

  // Check if API is available
  async checkApiAvailability(): Promise<boolean> {
    try {
      await this.makeApiCall('/recipes/random', { number: 1 })
      return true
    } catch (error) {
      console.error('Spoonacular API not available:', error)
      return false
    }
  }
}

export const spoonacularService = new SpoonacularService()