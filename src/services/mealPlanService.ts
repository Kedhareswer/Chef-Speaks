import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type MealPlanRow = Database['public']['Tables']['meal_plans']['Row']

export interface MealPlan {
  id: string
  userId: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  recipeId: string
  servings: number
  createdAt: string
  recipe?: {
    id: string
    title: string
    imageUrl: string
    cookTime: number
    difficulty: string
  }
}

// Convert database row to MealPlan type
const convertDbMealPlanToMealPlan = (dbMealPlan: MealPlanRow & { recipes?: any }): MealPlan => ({
  id: dbMealPlan.id,
  userId: dbMealPlan.user_id,
  date: dbMealPlan.date,
  mealType: dbMealPlan.meal_type,
  recipeId: dbMealPlan.recipe_id,
  servings: dbMealPlan.servings,
  createdAt: dbMealPlan.created_at,
  recipe: dbMealPlan.recipes ? {
    id: dbMealPlan.recipes.id,
    title: dbMealPlan.recipes.title,
    imageUrl: dbMealPlan.recipes.image_url,
    cookTime: dbMealPlan.recipes.cook_time,
    difficulty: dbMealPlan.recipes.difficulty
  } : undefined
})

export const mealPlanService = {
  // Get user's meal plans for a date range
  async getUserMealPlans(userId: string, startDate: string, endDate: string): Promise<MealPlan[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          recipes (
            id,
            title,
            image_url,
            cook_time,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('meal_type', { ascending: true })

      if (error) throw error
      return data.map(convertDbMealPlanToMealPlan)
    } catch (error) {
      console.error('Error fetching meal plans:', error)
      return []
    }
  },

  // Add meal to plan
  async addMealToPlan(userId: string, date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', recipeId: string, servings: number = 1): Promise<MealPlan | null> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: userId,
          date,
          meal_type: mealType,
          recipe_id: recipeId,
          servings
        })
        .select(`
          *,
          recipes (
            id,
            title,
            image_url,
            cook_time,
            difficulty
          )
        `)
        .single()

      if (error) throw error
      return convertDbMealPlanToMealPlan(data)
    } catch (error) {
      console.error('Error adding meal to plan:', error)
      return null
    }
  },

  // Update meal plan
  async updateMealPlan(mealPlanId: string, updates: { recipeId?: string; servings?: number }): Promise<MealPlan | null> {
    try {
      const updateData: any = {}
      if (updates.recipeId) updateData.recipe_id = updates.recipeId
      if (updates.servings) updateData.servings = updates.servings

      const { data, error } = await supabase
        .from('meal_plans')
        .update(updateData)
        .eq('id', mealPlanId)
        .select(`
          *,
          recipes (
            id,
            title,
            image_url,
            cook_time,
            difficulty
          )
        `)
        .single()

      if (error) throw error
      return convertDbMealPlanToMealPlan(data)
    } catch (error) {
      console.error('Error updating meal plan:', error)
      return null
    }
  },

  // Remove meal from plan
  async removeMealFromPlan(mealPlanId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', mealPlanId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing meal from plan:', error)
      return false
    }
  },

  // Get meal plan for specific date and meal type
  async getMealPlan(userId: string, date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Promise<MealPlan | null> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          recipes (
            id,
            title,
            image_url,
            cook_time,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .eq('date', date)
        .eq('meal_type', mealType)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows found
        throw error
      }
      return convertDbMealPlanToMealPlan(data)
    } catch (error) {
      console.error('Error fetching meal plan:', error)
      return null
    }
  }
}