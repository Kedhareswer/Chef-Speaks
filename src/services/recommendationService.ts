import { supabase } from '../lib/supabase'
import { Recipe } from '../types'
import { spoonacularService } from './spoonacularService'
import { recipeService } from './recipeService'
import { userService } from './userService'

export interface Recommendation {
  id: string
  userId: string
  recipeId: string
  recommendationType: 'ai_generated' | 'similar_users' | 'trending' | 'seasonal'
  score: number
  reason?: string
  createdAt: string
  expiresAt: string
  recipe?: Recipe
}

export const recommendationService = {
  // Generate AI-powered recommendations based on user preferences
  async generateRecommendations(userId: string): Promise<void> {
    try {
      // Get user profile and preferences
      const profile = await userService.getUserProfile(userId)
      if (!profile) return

      // Get user's favorite recipes for analysis
      const favoriteIds = await userService.getUserFavorites(userId)
      const allRecipes = await recipeService.getAllRecipes()
      const favoriteRecipes = allRecipes.filter(recipe => favoriteIds.includes(recipe.id))

      // Generate different types of recommendations
      await Promise.all([
        this.generateAIRecommendations(userId, profile, favoriteRecipes),
        this.generateTrendingRecommendations(userId),
        this.generateSimilarUserRecommendations(userId, favoriteIds),
        this.generateSeasonalRecommendations(userId, profile)
      ])
    } catch (error) {
      console.error('Error generating recommendations:', error)
    }
  },

  // Generate AI recommendations using Spoonacular
  async generateAIRecommendations(userId: string, profile: any, favoriteRecipes: Recipe[]): Promise<void> {
    try {
      // Build search parameters based on user preferences
      const searchParams = {
        number: 12,
        diet: profile.dietaryRestrictions?.join(','),
        cuisine: profile.favoriteCuisines?.join(','),
        maxReadyTime: 60, // Default max time
        intolerances: profile.dietaryRestrictions?.filter((restriction: string) => 
          ['gluten', 'dairy', 'egg', 'peanut', 'tree nut', 'soy', 'shellfish'].includes(restriction.toLowerCase())
        ).join(',')
      }

      // Get recommendations from Spoonacular
      const spoonacularRecipes = await spoonacularService.searchRecipes(searchParams)
      
      // Convert to our Recipe format and save recommendations
      for (const spRecipe of spoonacularRecipes.slice(0, 8)) {
        const recipe: Recipe = {
          id: `spoonacular-${spRecipe.id}`,
          title: spRecipe.title,
          description: spRecipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'AI-recommended recipe',
          ingredients: spRecipe.extendedIngredients?.map(ing => ing.original) || [],
          instructions: spRecipe.instructions ? [spRecipe.instructions] : ['Instructions available on source'],
          cookTime: spRecipe.readyInMinutes || 30,
          servings: spRecipe.servings || 4,
          difficulty: spRecipe.readyInMinutes <= 30 ? 'Easy' : spRecipe.readyInMinutes <= 60 ? 'Medium' : 'Hard',
          cuisine: spRecipe.cuisines?.[0] || 'International',
          imageUrl: spRecipe.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
          tags: [...(spRecipe.dishTypes || []), ...(spRecipe.diets || [])],
          rating: 4.5,
          totalRatings: 50,
          isUserGenerated: false
        }

        // Save recipe if it doesn't exist
        await this.saveRecommendedRecipe(recipe)

        // Create recommendation
        await this.createRecommendation(userId, recipe.id, 'ai_generated', 0.9, 'Based on your preferences and dietary restrictions')
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error)
    }
  },

  // Generate trending recommendations
  async generateTrendingRecommendations(userId: string): Promise<void> {
    try {
      const trendingRecipes = await recipeService.getTrendingRecipes()
      
      for (const recipe of trendingRecipes.slice(0, 6)) {
        await this.createRecommendation(userId, recipe.id, 'trending', 0.8, 'Trending in the community')
      }
    } catch (error) {
      console.error('Error generating trending recommendations:', error)
    }
  },

  // Generate recommendations based on similar users
  async generateSimilarUserRecommendations(userId: string, userFavorites: string[]): Promise<void> {
    try {
      if (userFavorites.length === 0) return

      // Find users with similar favorites (simplified approach)
      const { data: similarUsers } = await supabase
        .from('user_favorites')
        .select('user_id, recipe_id')
        .in('recipe_id', userFavorites)
        .neq('user_id', userId)

      if (!similarUsers || similarUsers.length === 0) return

      // Count overlapping favorites
      const userSimilarity = new Map<string, number>()
      similarUsers.forEach(fav => {
        const count = userSimilarity.get(fav.user_id) || 0
        userSimilarity.set(fav.user_id, count + 1)
      })

      // Get top similar users
      const topSimilarUsers = Array.from(userSimilarity.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId]) => userId)

      // Get their favorites that current user doesn't have
      const { data: recommendations } = await supabase
        .from('user_favorites')
        .select('recipe_id')
        .in('user_id', topSimilarUsers)
        .not('recipe_id', 'in', `(${userFavorites.join(',')})`)

      if (recommendations) {
        const uniqueRecipeIds = [...new Set(recommendations.map(r => r.recipe_id))].slice(0, 6)
        
        for (const recipeId of uniqueRecipeIds) {
          await this.createRecommendation(userId, recipeId, 'similar_users', 0.7, 'Loved by users with similar tastes')
        }
      }
    } catch (error) {
      console.error('Error generating similar user recommendations:', error)
    }
  },

  // Generate seasonal recommendations
  async generateSeasonalRecommendations(userId: string, profile: any): Promise<void> {
    try {
      const currentMonth = new Date().getMonth() + 1
      let seasonalTags: string[] = []

      // Determine seasonal ingredients/dishes
      if (currentMonth >= 3 && currentMonth <= 5) {
        seasonalTags = ['spring', 'fresh', 'light', 'asparagus', 'peas']
      } else if (currentMonth >= 6 && currentMonth <= 8) {
        seasonalTags = ['summer', 'grilled', 'salad', 'tomato', 'berries']
      } else if (currentMonth >= 9 && currentMonth <= 11) {
        seasonalTags = ['autumn', 'pumpkin', 'apple', 'comfort', 'warm']
      } else {
        seasonalTags = ['winter', 'soup', 'stew', 'comfort', 'hearty']
      }

      // Search for seasonal recipes
      const searchParams = {
        query: seasonalTags.join(' OR '),
        number: 8,
        diet: profile.dietaryRestrictions?.join(',')
      }

      const seasonalRecipes = await spoonacularService.searchRecipes(searchParams)
      
      for (const spRecipe of seasonalRecipes.slice(0, 6)) {
        const recipe: Recipe = {
          id: `seasonal-${spRecipe.id}`,
          title: spRecipe.title,
          description: spRecipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'Perfect for this season',
          ingredients: spRecipe.extendedIngredients?.map(ing => ing.original) || [],
          instructions: spRecipe.instructions ? [spRecipe.instructions] : ['Instructions available on source'],
          cookTime: spRecipe.readyInMinutes || 30,
          servings: spRecipe.servings || 4,
          difficulty: spRecipe.readyInMinutes <= 30 ? 'Easy' : spRecipe.readyInMinutes <= 60 ? 'Medium' : 'Hard',
          cuisine: spRecipe.cuisines?.[0] || 'Seasonal',
          imageUrl: spRecipe.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
          tags: [...(spRecipe.dishTypes || []), ...seasonalTags],
          rating: 4.3,
          totalRatings: 30,
          isUserGenerated: false
        }

        await this.saveRecommendedRecipe(recipe)
        await this.createRecommendation(userId, recipe.id, 'seasonal', 0.6, `Perfect for ${seasonalTags[0]} season`)
      }
    } catch (error) {
      console.error('Error generating seasonal recommendations:', error)
    }
  },

  // Save a recommended recipe to the database
  async saveRecommendedRecipe(recipe: Recipe): Promise<void> {
    try {
      const { error } = await supabase
        .from('recipes')
        .upsert({
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          cook_time: recipe.cookTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          cuisine: recipe.cuisine,
          image_url: recipe.imageUrl,
          video_url: recipe.videoUrl,
          tags: recipe.tags,
          author_id: null,
          is_user_generated: false,
          rating: recipe.rating,
          total_ratings: recipe.totalRatings
        }, { onConflict: 'id' })

      if (error) throw error
    } catch (error) {
      console.error('Error saving recommended recipe:', error)
    }
  },

  // Create a recommendation entry
  async createRecommendation(userId: string, recipeId: string, type: string, score: number, reason?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recipe_recommendations')
        .upsert({
          user_id: userId,
          recipe_id: recipeId,
          recommendation_type: type,
          score,
          reason,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }, { onConflict: 'user_id,recipe_id,recommendation_type' })

      if (error) throw error
    } catch (error) {
      console.error('Error creating recommendation:', error)
    }
  },

  // Get AI recommendations for user
  async getAIRecommendations(userId: string): Promise<Recipe[]> {
    return this.getRecommendationsByType(userId, 'ai_generated')
  },

  // Get trending recommendations for user
  async getTrendingRecommendations(userId: string): Promise<Recipe[]> {
    return this.getRecommendationsByType(userId, 'trending')
  },

  // Get similar user recommendations
  async getSimilarUserRecommendations(userId: string): Promise<Recipe[]> {
    return this.getRecommendationsByType(userId, 'similar_users')
  },

  // Get seasonal recommendations
  async getSeasonalRecommendations(userId: string): Promise<Recipe[]> {
    return this.getRecommendationsByType(userId, 'seasonal')
  },

  // Get recommendations by type
  async getRecommendationsByType(userId: string, type: string): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_recommendations')
        .select(`
          *,
          recipes (*)
        `)
        .eq('user_id', userId)
        .eq('recommendation_type', type)
        .gt('expires_at', new Date().toISOString())
        .order('score', { ascending: false })
        .limit(12)

      if (error) throw error

      return data?.map(rec => ({
        id: rec.recipes.id,
        title: rec.recipes.title,
        description: rec.recipes.description,
        ingredients: rec.recipes.ingredients as string[],
        instructions: rec.recipes.instructions as string[],
        cookTime: rec.recipes.cook_time,
        servings: rec.recipes.servings,
        difficulty: rec.recipes.difficulty,
        cuisine: rec.recipes.cuisine,
        imageUrl: rec.recipes.image_url,
        videoUrl: rec.recipes.video_url,
        tags: rec.recipes.tags || [],
        rating: rec.recipes.rating,
        totalRatings: rec.recipes.total_ratings,
        isUserGenerated: rec.recipes.is_user_generated,
        createdAt: new Date(rec.recipes.created_at)
      })) || []
    } catch (error) {
      console.error('Error getting recommendations by type:', error)
      return []
    }
  },

  // Clean up expired recommendations
  async cleanupExpiredRecommendations(): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_expired_recommendations')
      if (error) throw error
    } catch (error) {
      console.error('Error cleaning up expired recommendations:', error)
    }
  }
}