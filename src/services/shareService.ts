import { supabase } from '../lib/supabase'

export const shareService = {
  // Track when a recipe is shared
  async trackShare(recipeId: string, userId: string | null, platform: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recipe_shares')
        .insert({
          recipe_id: recipeId,
          user_id: userId,
          platform
        })

      if (error) throw error
    } catch (error) {
      console.error('Error tracking share:', error)
    }
  },

  // Get share statistics for a recipe
  async getRecipeShareStats(recipeId: string): Promise<{
    total: number
    byPlatform: Record<string, number>
  }> {
    try {
      const { data, error } = await supabase
        .from('recipe_shares')
        .select('platform')
        .eq('recipe_id', recipeId)

      if (error) throw error

      const byPlatform: Record<string, number> = {}
      data?.forEach(share => {
        byPlatform[share.platform] = (byPlatform[share.platform] || 0) + 1
      })

      return {
        total: data?.length || 0,
        byPlatform
      }
    } catch (error) {
      console.error('Error getting share stats:', error)
      return { total: 0, byPlatform: {} }
    }
  },

  // Get most shared recipes
  async getMostSharedRecipes(limit: number = 10): Promise<Array<{
    recipeId: string
    shareCount: number
  }>> {
    try {
      const { data, error } = await supabase
        .from('recipe_shares')
        .select('recipe_id')

      if (error) throw error

      // Count shares per recipe
      const shareCounts: Record<string, number> = {}
      data?.forEach(share => {
        shareCounts[share.recipe_id] = (shareCounts[share.recipe_id] || 0) + 1
      })

      // Sort and return top recipes
      return Object.entries(shareCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([recipeId, shareCount]) => ({ recipeId, shareCount }))
    } catch (error) {
      console.error('Error getting most shared recipes:', error)
      return []
    }
  }
}