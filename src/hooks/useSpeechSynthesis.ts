import { useState, useCallback, useEffect } from 'react'
import { useEnhancedSpeechSynthesis } from './useEnhancedSpeechSynthesis'
import { useAuth } from './useAuth'
import { userService } from '../services/userService'
import { userVoiceSettingsService } from '../services/userVoiceSettingsService'

interface UseSpeechSynthesisReturn {
  speak: (text: string) => Promise<void>
  stop: () => void
  isSpeaking: boolean
  isGenerating: boolean
  isSupported: boolean
  currentLanguage: string
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const { user } = useAuth()
  const { 
    speak: enhancedSpeak, 
    stop, 
    isSpeaking, 
    isGenerating,
    isElevenLabsSupported 
  } = useEnhancedSpeechSynthesis()

  const [userLanguage, setUserLanguage] = useState<string>('en')
  const [preferredVoiceId, setPreferredVoiceId] = useState<string | undefined>(undefined)
  const [useElevenLabs, setUseElevenLabs] = useState<boolean>(true)

  // Load user's preferred language and voice settings
  useEffect(() => {
    if (user) {
      loadUserLanguage()
      loadUserVoiceSettings()
    }
  }, [user])

  const loadUserLanguage = async () => {
    if (!user) return
    
    try {
      const profile = await userService.getUserProfile(user.id)
      if (profile?.preferredLanguage) {
        setUserLanguage(profile.preferredLanguage)
      }
    } catch (error) {
      console.error('Error loading user language preference:', error)
    }
  }

  const loadUserVoiceSettings = async () => {
    if (!user) return
    
    try {
      const voiceSettings = await userVoiceSettingsService.getUserVoiceSettings(user.id)
      if (voiceSettings) {
        setPreferredVoiceId(voiceSettings.preferredVoiceId)
        setUseElevenLabs(voiceSettings.useElevenLabs)
        
        // If voice language is set, use it instead of profile language
        if (voiceSettings.voiceLanguage) {
          setUserLanguage(voiceSettings.voiceLanguage)
        }
      }
    } catch (error) {
      console.error('Error loading user voice settings:', error)
    }
  }

  const speak = useCallback(async (text: string) => {
    // Use enhanced speech synthesis with user's preferred language and voice
    await enhancedSpeak(text, userLanguage, useElevenLabs && isElevenLabsSupported, preferredVoiceId)
  }, [enhancedSpeak, userLanguage, useElevenLabs, isElevenLabsSupported, preferredVoiceId])

  return {
    speak,
    stop,
    isSpeaking,
    isGenerating,
    isSupported: isElevenLabsSupported || (typeof window !== 'undefined' && 'speechSynthesis' in window),
    currentLanguage: userLanguage
  }
}