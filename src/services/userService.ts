import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  dietaryRestrictions: string[]
  favoriteCuisines: string[]
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced'
  preferredLanguage: string
  createdAt: string
  updatedAt: string
}

// Convert database row to UserProfile type
const convertDbProfileToUserProfile = (dbProfile: ProfileRow): UserProfile => ({
  id: dbProfile.id,
  email: dbProfile.email,
  fullName: dbProfile.full_name,
  avatarUrl: dbProfile.avatar_url,
  dietaryRestrictions: dbProfile.dietary_restrictions || [],
  favoriteCuisines: dbProfile.favorite_cuisines || [],
  cookingSkillLevel: dbProfile.cooking_skill_level || 'beginner',
  preferredLanguage: dbProfile.preferred_language || 'en',
  createdAt: dbProfile.created_at,
  updatedAt: dbProfile.updated_at
})

export const userService = {
  // Get user profile with improved timeout and error handling
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('Fetching profile for user:', userId)
      
      // Increased timeout and better abort handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('Profile fetch timeout reached for user:', userId)
        controller.abort()
      }, 10000) // Increased to 10 seconds
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)

      if (error) {
        // Handle the case where no profile exists (PGRST116 error)
        if (error.code === 'PGRST116') {
          console.log('No profile found for user:', userId)
          return null
        }
        console.error('Error fetching user profile:', error)
        throw error
      }
      
      console.log('Profile fetched successfully for user:', userId)
      return convertDbProfileToUserProfile(data)
    } catch (error: any) {
      // Handle abort error more gracefully
      if (error.name === 'AbortError') {
        console.warn('Profile fetch was aborted for user:', userId, '- this may be due to network issues')
        return null
      }
      
      // Additional check for PGRST116 error in catch block
      if (error?.code === 'PGRST116') {
        console.log('No profile found for user:', userId)
        return null
      }
      
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const profileUpdate: ProfileUpdate = {}
      
      if (updates.fullName !== undefined) profileUpdate.full_name = updates.fullName
      if (updates.avatarUrl !== undefined) profileUpdate.avatar_url = updates.avatarUrl
      if (updates.dietaryRestrictions !== undefined) profileUpdate.dietary_restrictions = updates.dietaryRestrictions
      if (updates.favoriteCuisines !== undefined) profileUpdate.favorite_cuisines = updates.favoriteCuisines
      if (updates.cookingSkillLevel !== undefined) profileUpdate.cooking_skill_level = updates.cookingSkillLevel
      if (updates.preferredLanguage !== undefined) profileUpdate.preferred_language = updates.preferredLanguage

      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return convertDbProfileToUserProfile(data)
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  },

  // Get user favorites
  async getUserFavorites(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('recipe_id')
        .eq('user_id', userId)

      if (error) throw error
      return data.map(fav => fav.recipe_id)
    } catch (error) {
      console.error('Error fetching user favorites:', error)
      return []
    }
  },

  // Add recipe to favorites
  async addToFavorites(userId: string, recipeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          recipe_id: recipeId
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error adding to favorites:', error)
      return false
    }
  },

  // Remove recipe from favorites
  async removeFromFavorites(userId: string, recipeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing from favorites:', error)
      return false
    }
  }
}