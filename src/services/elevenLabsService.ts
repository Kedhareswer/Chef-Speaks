import { supabase } from '../lib/supabase'

export interface VoiceSettings {
  stability: number
  similarity_boost: number
  style?: number
  use_speaker_boost?: boolean
}

export interface TTSRequest {
  text: string
  voice_id?: string
  model_id?: string
  voice_settings?: VoiceSettings
}

// Available voices with language support
export const AVAILABLE_VOICES = {
  // English voices
  'bella': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', language: 'en', gender: 'female' },
  'adam': { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', language: 'en', gender: 'male' },
  'antoni': { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', language: 'en', gender: 'male' },
  'arnold': { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', language: 'en', gender: 'male' },
  'domi': { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', language: 'en', gender: 'female' },
  'elli': { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', language: 'en', gender: 'female' },
  'josh': { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', language: 'en', gender: 'male' },
  'rachel': { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', language: 'en', gender: 'female' },
  'sam': { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', language: 'en', gender: 'male' },
  
  // Spanish voices
  'diego': { id: 'DuNnqwVuAtxzKcXGUN2v', name: 'Diego', language: 'es', gender: 'male' },
  'valentina': { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Valentina', language: 'es', gender: 'female' },
  
  // French voices
  'charlotte': { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', language: 'fr', gender: 'female' },
  'henri': { id: 'qcqe3VekNbpZKS19HrXZ', name: 'Henri', language: 'fr', gender: 'male' },
  
  // Hindi voices
  'ananya': { id: 'pMsHU5UYdz0JjirY6kYj', name: 'Ananya', language: 'hi', gender: 'female' },
  'arjun': { id: 'oJj8qvV5HvRDUZunLCaB', name: 'Arjun', language: 'hi', gender: 'male' },
  
  // Telugu voices
  'priya': { id: 'kVKpDJQHmCrQWQdLgEYj', name: 'Priya', language: 'te', gender: 'female' },
  'vikram': { id: 'nYPnDWjBvqKzLRvVDuLk', name: 'Vikram', language: 'te', gender: 'male' }
}

class ElevenLabsService {
  private audioCache = new Map<string, string>()
  private isConfigured: boolean | null = null

  // Check if the service is properly configured
  async checkConfiguration(): Promise<boolean> {
    if (this.isConfigured !== null) {
      return this.isConfigured
    }

    try {
      const { error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text: 'test',
          voice_id: 'EXAVITQu4vr4xnSDxMaL'
        }
      })

      if (error) {
        console.warn('Eleven Labs TTS service not configured:', error.message)
        this.isConfigured = false
        return false
      }

      this.isConfigured = true
      return true
    } catch (error) {
      console.warn('Error checking Eleven Labs configuration:', error)
      this.isConfigured = false
      return false
    }
  }

  // Generate speech from text
  async generateSpeech(
    text: string, 
    language: string = 'en', 
    gender: 'male' | 'female' = 'female',
    voiceId?: string,
    customSettings?: VoiceSettings
  ): Promise<string | null> {
    try {
      // Check if service is configured
      const isConfigured = await this.checkConfiguration()
      if (!isConfigured) {
        console.warn('Eleven Labs TTS service not configured, skipping')
        return null
      }

      // Create cache key
      const cacheKey = `${text}-${voiceId || language + '-' + gender}`
      if (this.audioCache.has(cacheKey)) {
        return this.audioCache.get(cacheKey)!
      }

      // If voiceId is provided, use it directly, otherwise find appropriate voice for language and gender
      const voice = voiceId ? 
        this.getVoiceById(voiceId) : 
        this.getVoiceForLanguage(language, gender)
      
      const voiceSettings: VoiceSettings = customSettings || {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }

      console.log(`Generating speech with voice: ${voice.name} (${voice.language})`)

      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text,
          voice_id: voice.id,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings
        }
      })

      if (error) {
        console.error('Supabase function error:', error)
        
        // Check if it's a configuration error
        if (error.message?.includes('not configured') || error.message?.includes('API key')) {
          this.isConfigured = false
          console.warn('Eleven Labs API key not configured in Supabase Edge Functions')
          return null
        }
        
        throw new Error(`TTS service error: ${error.message}`)
      }

      // Check if we received valid audio data
      if (!data) {
        console.error('No audio data received')
        return null
      }

      // The Supabase Edge Function returns raw audio data as ArrayBuffer
      console.log('Received audio data from TTS service')
      
      // Create blob directly from the ArrayBuffer data
      const audioBlob = new Blob([data], { type: 'audio/mpeg' })

      // Validate blob size
      if (audioBlob.size === 0) {
        console.error('Received empty audio data')
        return null
      }

      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Cache the result
      this.audioCache.set(cacheKey, audioUrl)
      
      console.log(`Successfully generated audio: ${audioBlob.size} bytes`)
      return audioUrl
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in generateSpeech:', errorMessage);
      
      // Mark as not configured if it's a service error
      if (errorMessage.includes('not configured') || errorMessage.includes('API key')) {
        this.isConfigured = false;
      }
      
      return null;
    }
  }

  // Get voice by ID
  getVoiceById(voiceId: string) {
    const voice = Object.values(AVAILABLE_VOICES).find(voice => voice.id === voiceId)
    
    if (voice) {
      return voice
    }
    
    // Fallback to Bella if voice ID not found
    console.warn(`Voice ID ${voiceId} not found, falling back to default voice`)
    return AVAILABLE_VOICES.bella
  }

  // Get appropriate voice for language and gender preference
  getVoiceForLanguage(language: string, gender: 'male' | 'female') {
    const voices = Object.values(AVAILABLE_VOICES).filter(
      voice => voice.language === language && voice.gender === gender
    )
    
    if (voices.length > 0) {
      return voices[0] // Return first matching voice
    }
    
    // Fallback to English if language not supported
    const englishVoices = Object.values(AVAILABLE_VOICES).filter(
      voice => voice.language === 'en' && voice.gender === gender
    )
    
    return englishVoices[0] || AVAILABLE_VOICES.bella
  }

  // Get available voices for a language
  getVoicesForLanguage(language: string) {
    return Object.values(AVAILABLE_VOICES).filter(voice => voice.language === language)
  }

  // Get all supported languages
  getSupportedLanguages() {
    const languages = new Set(Object.values(AVAILABLE_VOICES).map(voice => voice.language))
    return Array.from(languages)
  }

  // Clear audio cache to free memory
  clearCache() {
    this.audioCache.forEach(url => URL.revokeObjectURL(url))
    this.audioCache.clear()
  }

  // Generate speech for recipe instructions with cooking context
  async generateCookingInstructions(
    instructions: string[], 
    language: string = 'en',
    voiceId?: string,
    stepDelay: number = 2000
  ): Promise<string[]> {
    const audioUrls: string[] = []
    
    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i]
      const stepText = `Step ${i + 1}: ${instruction}`
      
      const audioUrl = await this.generateSpeech(stepText, language, 'female', voiceId)
      if (audioUrl) {
        audioUrls.push(audioUrl)
        // Add delay between steps if there are more steps to process
        if (i < instructions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, stepDelay));
        }
      }
      
      // Small delay to avoid rate limiting
      if (i < instructions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    return audioUrls
  }
}

export const elevenLabsService = new ElevenLabsService()