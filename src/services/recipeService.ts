import { supabase } from '../lib/supabase'
import { Recipe } from '../types'
import { Database } from '../types/database'

type RecipeRow = Database['public']['Tables']['recipes']['Row']
type RecipeInsert = Database['public']['Tables']['recipes']['Insert']

// Convert database row to Recipe type
const convertDbRecipeToRecipe = (dbRecipe: RecipeRow): Recipe => ({
  id: dbRecipe.id,
  title: dbRecipe.title,
  description: dbRecipe.description,
  ingredients: Array.isArray(dbRecipe.ingredients) ? dbRecipe.ingredients as string[] : [],
  instructions: Array.isArray(dbRecipe.instructions) ? dbRecipe.instructions as string[] : [],
  cookTime: dbRecipe.cook_time,
  servings: dbRecipe.servings,
  difficulty: dbRecipe.difficulty,
  cuisine: dbRecipe.cuisine,
  imageUrl: dbRecipe.image_url,
  videoUrl: dbRecipe.video_url || undefined,
  tags: dbRecipe.tags || [],
  author: dbRecipe.author_id || undefined,
  isUserGenerated: dbRecipe.is_user_generated,
  rating: dbRecipe.rating || undefined,
  totalRatings: dbRecipe.total_ratings || 0,
  createdAt: new Date(dbRecipe.created_at)
})

// Convert Recipe to database insert format
const convertRecipeToDbInsert = (recipe: Omit<Recipe, 'id' | 'createdAt'>, authorId?: string): RecipeInsert => ({
  title: recipe.title,
  description: recipe.description,
  ingredients: recipe.ingredients,
  instructions: recipe.instructions,
  cook_time: recipe.cookTime,
  servings: recipe.servings,
  difficulty: recipe.difficulty,
  cuisine: recipe.cuisine,
  image_url: recipe.imageUrl,
  video_url: recipe.videoUrl || null,
  tags: recipe.tags,
  author_id: authorId || null,
  is_user_generated: recipe.isUserGenerated || false,
  rating: recipe.rating || 0,
  total_ratings: recipe.totalRatings || 0,
  nutritional_info: null
})

export const recipeService = {
  // Get all recipes
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(convertDbRecipeToRecipe)
    } catch (error) {
      console.error('Error fetching recipes:', error)
      return []
    }
  },

  // Get recipes by location/cuisine
  async getRecipesByCuisine(cuisine: string): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .ilike('cuisine', `%${cuisine}%`)
        .order('rating', { ascending: false })

      if (error) throw error
      return data.map(convertDbRecipeToRecipe)
    } catch (error) {
      console.error('Error fetching recipes by cuisine:', error)
      return []
    }
  },

  // Search recipes
  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,cuisine.ilike.%${query}%,tags.cs.{${query}}`)
        .order('rating', { ascending: false })

      if (error) throw error
      return data.map(convertDbRecipeToRecipe)
    } catch (error) {
      console.error('Error searching recipes:', error)
      return []
    }
  },

  // Get trending recipes
  async getTrendingRecipes(): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .gte('rating', 4.5)
        .order('total_ratings', { ascending: false })
        .limit(12)

      if (error) throw error
      return data.map(convertDbRecipeToRecipe)
    } catch (error) {
      console.error('Error fetching trending recipes:', error)
      return []
    }
  },

  // Get user's recipes
  async getUserRecipes(userId: string): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(convertDbRecipeToRecipe)
    } catch (error) {
      console.error('Error fetching user recipes:', error)
      return []
    }
  },

  // Create new recipe
  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>, authorId: string): Promise<Recipe | null> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert(convertRecipeToDbInsert(recipe, authorId))
        .select()
        .single()

      if (error) throw error
      return convertDbRecipeToRecipe(data)
    } catch (error) {
      console.error('Error creating recipe:', error)
      return null
    }
  },

  // Update recipe
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update({
          title: updates.title,
          description: updates.description,
          ingredients: updates.ingredients,
          instructions: updates.instructions,
          cook_time: updates.cookTime,
          servings: updates.servings,
          difficulty: updates.difficulty,
          cuisine: updates.cuisine,
          image_url: updates.imageUrl,
          video_url: updates.videoUrl,
          tags: updates.tags,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return convertDbRecipeToRecipe(data)
    } catch (error) {
      console.error('Error updating recipe:', error)
      return null
    }
  },

  // Delete recipe
  async deleteRecipe(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting recipe:', error)
      return false
    }
  },

  // Filter recipes by ingredients
  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    try {
      // This is a simplified approach - in production, you'd want more sophisticated matching
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('rating', { ascending: false })

      if (error) throw error
      
      // Filter on the client side for now (could be optimized with database functions)
      const recipes = data.map(convertDbRecipeToRecipe)
      return recipes.filter(recipe => {
        const recipeIngredients = recipe.ingredients.join(' ').toLowerCase()
        const matchCount = ingredients.filter(ingredient =>
          recipeIngredients.includes(ingredient.toLowerCase())
        ).length
        return matchCount >= Math.max(1, Math.floor(ingredients.length * 0.4))
      })
    } catch (error) {
      console.error('Error fetching recipes by ingredients:', error)
      return []
    }
  }
}