import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type VoiceSettingsRow = Database['public']['Tables']['user_voice_settings']['Row']
type VoiceSettingsInsert = Database['public']['Tables']['user_voice_settings']['Insert']
type VoiceSettingsUpdate = Database['public']['Tables']['user_voice_settings']['Update']

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
  // Get user voice settings
  async getUserVoiceSettings(userId: string): Promise<UserVoiceSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_voice_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // Handle the case where no settings exist (PGRST116 error)
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }
      
      return convertDbVoiceSettingsToUserVoiceSettings(data)
    } catch (error) {
      // Additional check for PGRST116 error in catch block
      if (error?.code === 'PGRST116') {
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
      
      const settingsUpdate: VoiceSettingsUpdate = {
        user_id: userId
      }
      
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

  // Ensure user has voice settings
  async ensureUserVoiceSettings(userId: string): Promise<UserVoiceSettings | null> {
    try {
      const existingSettings = await this.getUserVoiceSettings(userId)
      
      if (existingSettings) {
        return existingSettings
      }
      
      // Create default settings if none exist
      return await this.updateUserVoiceSettings(userId, {
        preferredVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
        voiceLanguage: 'en',
        voiceSpeed: 1.0,
        voiceStability: 0.5,
        voiceSimilarityBoost: 0.75,
        useElevenLabs: true
      })
    } catch (error) {
      console.error('Error ensuring user voice settings:', error)
      return null
    }
  }
}