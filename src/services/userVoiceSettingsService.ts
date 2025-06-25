import { supabase } from '../lib/supabase'

// Define types based on the database schema since they're not in the generated types
type VoiceSettingsRow = {
  id: string
  user_id: string
  preferred_voice_id: string
  voice_language: string
  voice_speed: number
  voice_stability: number
  voice_similarity_boost: number
  use_eleven_labs: boolean
  created_at: string
  updated_at: string
}

type VoiceSettingsInsert = Omit<VoiceSettingsRow, 'id' | 'created_at' | 'updated_at'>

export interface UserVoiceSettings {
  id: string
  userId: string
  preferredVoiceId: string
  voiceLanguage: string
  voiceSpeed: number
  voiceStability: number
  voiceSimilarityBoost: number
  useElevenLabs: boolean
  createdAt: string
  updatedAt: string
}

// Convert database row to UserVoiceSettings type
const convertDbVoiceSettingsToUserVoiceSettings = (dbSettings: VoiceSettingsRow): UserVoiceSettings => ({
  id: dbSettings.id,
  userId: dbSettings.user_id,
  preferredVoiceId: dbSettings.preferred_voice_id,
  voiceLanguage: dbSettings.voice_language,
  voiceSpeed: dbSettings.voice_speed,
  voiceStability: dbSettings.voice_stability,
  voiceSimilarityBoost: dbSettings.voice_similarity_boost,
  useElevenLabs: dbSettings.use_eleven_labs,
  createdAt: dbSettings.created_at,
  updatedAt: dbSettings.updated_at
})

export const userVoiceSettingsService = {
  // Get user voice settings with improved timeout
  async getUserVoiceSettings(userId: string): Promise<UserVoiceSettings | null> {
    try {
      console.log('Fetching voice settings for user:', userId)
      
      // Increased timeout and better abort handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('Voice settings fetch timeout reached for user:', userId)
        controller.abort()
      }, 15000) // Increased from 8000ms to 15000ms
      
      const { data, error } = await supabase
        .from('user_voice_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)

      if (error) {
        // Handle the case where no settings exist (PGRST116 error)
        if (error.code === 'PGRST116') {
          console.log('No voice settings found for user:', userId)
          return null
        }
        throw error
      }
      
      console.log('Voice settings fetched successfully for user:', userId)
      return convertDbVoiceSettingsToUserVoiceSettings(data)
    } catch (error: any) {
      // Handle abort error more gracefully
      if (error.name === 'AbortError') {
        console.warn('Voice settings fetch was aborted for user:', userId, '- this may be due to network issues')
        return null
      }
      
      // Additional check for PGRST116 error in catch block
      if (error?.code === 'PGRST116') {
        console.log('No voice settings found for user:', userId)
        return null
      }
      
      console.error('Error fetching user voice settings:', error)
      return null
    }
  },

  // Create or update user voice settings
  async updateUserVoiceSettings(userId: string, updates: Partial<UserVoiceSettings>): Promise<UserVoiceSettings | null> {
    try {
      // Check if settings exist
      const existingSettings = await this.getUserVoiceSettings(userId)
      
      const settingsUpdate: Partial<Omit<VoiceSettingsRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {}
      
      if (updates.preferredVoiceId !== undefined) settingsUpdate.preferred_voice_id = updates.preferredVoiceId
      if (updates.voiceLanguage !== undefined) settingsUpdate.voice_language = updates.voiceLanguage
      if (updates.voiceSpeed !== undefined) settingsUpdate.voice_speed = updates.voiceSpeed
      if (updates.voiceStability !== undefined) settingsUpdate.voice_stability = updates.voiceStability
      if (updates.voiceSimilarityBoost !== undefined) settingsUpdate.voice_similarity_boost = updates.voiceSimilarityBoost
      if (updates.useElevenLabs !== undefined) settingsUpdate.use_eleven_labs = updates.useElevenLabs

      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('user_voice_settings')
          .update(settingsUpdate)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error
        return convertDbVoiceSettingsToUserVoiceSettings(data)
      } else {
        // Create new settings
        const settingsInsert: VoiceSettingsInsert = {
          user_id: userId,
          preferred_voice_id: updates.preferredVoiceId || 'EXAVITQu4vr4xnSDxMaL', // Default to Bella
          voice_language: updates.voiceLanguage || 'en',
          voice_speed: updates.voiceSpeed || 1.0,
          voice_stability: updates.voiceStability || 0.5,
          voice_similarity_boost: updates.voiceSimilarityBoost || 0.75,
          use_eleven_labs: updates.useElevenLabs !== undefined ? updates.useElevenLabs : true
        }

        const { data, error } = await supabase
          .from('user_voice_settings')
          .insert(settingsInsert)
          .select()
          .single()

        if (error) throw error
        return convertDbVoiceSettingsToUserVoiceSettings(data)
      }
    } catch (error) {
      console.error('Error updating user voice settings:', error)
      return null
    }
  },

  // Ensure user has voice settings with better error handling
  async ensureUserVoiceSettings(userId: string): Promise<UserVoiceSettings | null> {
    try {
      console.log('Ensuring voice settings for user:', userId)
      
      const existingSettings = await this.getUserVoiceSettings(userId)
      
      if (existingSettings) {
        console.log('Voice settings already exist for user:', userId)
        return existingSettings
      }
      
      console.log('Creating default voice settings for user:', userId)
      // Create default settings if none exist
      const newSettings = await this.updateUserVoiceSettings(userId, {
        preferredVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
        voiceLanguage: 'en',
        voiceSpeed: 1.0,
        voiceStability: 0.5,
        voiceSimilarityBoost: 0.75,
        useElevenLabs: true
      })
      
      console.log('Voice settings created successfully for user:', userId)
      return newSettings
    } catch (error) {
      console.error('Error ensuring user voice settings:', error)
      return null
    }
  }
}