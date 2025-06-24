import { useState, useCallback, useRef } from 'react'
import { elevenLabsService } from '../services/elevenLabsService'

interface UseEnhancedSpeechSynthesisReturn {
  speak: (text: string, language?: string, useElevenLabs?: boolean, voiceId?: string) => Promise<void>
  stop: () => void
  isSpeaking: boolean
  isGenerating: boolean
  currentAudio: HTMLAudioElement | null
  isElevenLabsSupported: boolean
  lastError: string | null
}

export const useEnhancedSpeechSynthesis = (): UseEnhancedSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const isWebSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const isElevenLabsSupported = true // Always available through our edge function

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
      setCurrentAudio(null)
    }
    
    if (isWebSpeechSupported) {
      window.speechSynthesis.cancel()
    }
    
    setIsSpeaking(false)
  }, [isWebSpeechSupported])

  const speak = useCallback(async (
    text: string, 
    language: string = 'en', 
    useElevenLabs: boolean = true,
    voiceId?: string
  ) => {
    // Stop any current speech
    stopCurrentAudio()
    setLastError(null)

    if (!text.trim()) return

    try {
      if (useElevenLabs && isElevenLabsSupported) {
        // Use Eleven Labs for high-quality TTS
        setIsGenerating(true)
        
        // If voiceId is provided, use it directly, otherwise let the service choose based on language
        const gender = 'female' // Default gender
        const audioUrl = await elevenLabsService.generateSpeech(text, language, gender, voiceId)
        
        if (audioUrl) {
          const audio = new Audio()
          audioRef.current = audio
          setCurrentAudio(audio)
          
          // Set up event handlers before setting src
          audio.onloadstart = () => {
            console.log('Audio loading started')
            setIsGenerating(false)
          }
          
          audio.oncanplay = () => {
            console.log('Audio can start playing')
          }
          
          audio.onplay = () => {
            console.log('Audio playback started')
            setIsSpeaking(true)
          }
          
          audio.onended = () => {
            console.log('Audio playback ended')
            setIsSpeaking(false)
            setCurrentAudio(null)
            audioRef.current = null
            // Clean up blob URL
            URL.revokeObjectURL(audioUrl)
          }
          
          audio.onerror = () => {
            const errorMsg = `Audio playback failed: ${audio.error?.message || 'Unknown error'}`
            console.warn('Audio error, falling back to web speech:', errorMsg)
            setIsSpeaking(false)
            setIsGenerating(false)
            setCurrentAudio(null)
            audioRef.current = null
            // Clean up blob URL
            URL.revokeObjectURL(audioUrl)
            // Fallback to web speech
            fallbackToWebSpeech(text, language)
          }
          
          // Set the audio source and attempt to play
          audio.src = audioUrl
          
          try {
            await audio.play()
          } catch (playError) {
            const errorMsg = playError instanceof Error ? playError.message : 'Unknown error occurred during audio playback'
            console.warn('Error playing audio, falling back to web speech:', errorMsg)
            setIsGenerating(false)
            setIsSpeaking(false)
            // Clean up
            URL.revokeObjectURL(audioUrl)
            // Fallback to web speech
            fallbackToWebSpeech(text, language)
          }
        } else {
          setIsGenerating(false)
          console.log('TTS service not available, using web speech fallback')
          // Fallback to web speech if Eleven Labs fails
          fallbackToWebSpeech(text, language)
        }
      } else {
        // Use browser's built-in speech synthesis
        fallbackToWebSpeech(text, language)
      }
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? `Speech synthesis error: ${error.message}`
        : 'An unknown error occurred during speech synthesis'
      console.warn('Error in speech synthesis, falling back to web speech:', errorMsg)
      setLastError(errorMsg)
      setIsGenerating(false)
      setIsSpeaking(false)
      // Try fallback
      fallbackToWebSpeech(text, language)
    }
  }, [stopCurrentAudio, isElevenLabsSupported])

  const fallbackToWebSpeech = useCallback((text: string, language: string) => {
    if (!isWebSpeechSupported) {
      setLastError('Speech synthesis not supported in this browser')
      return
    }

    console.log('Using web speech synthesis')
    
    try {
      // Cancel any existing speech
      window.speechSynthesis.cancel()
      
      // Wait a bit for the cancel to take effect
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 0.8
        
        // Map language codes to SpeechSynthesis language codes
        const languageMap: Record<string, string> = {
          'en': 'en-US',
          'es': 'es-ES',
          'fr': 'fr-FR',
          'hi': 'hi-IN',
          'te': 'te-IN'
        }
        
        utterance.lang = languageMap[language] || language

        utterance.onstart = () => {
          console.log('Web speech started')
          setIsSpeaking(true)
          setLastError(null)
        }
        
        utterance.onend = () => {
          console.log('Web speech ended')
          setIsSpeaking(false)
        }
        
        utterance.onerror = (event) => {
          const errorMsg = `Web speech error: ${event.error}`
          console.warn('Web speech error:', event)
          
          // Only set error for critical failures, not interruptions
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
            setLastError(errorMsg)
          }
          setIsSpeaking(false)
        }

        window.speechSynthesis.speak(utterance)
      }, 100)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? `Web speech fallback failed: ${error.message}`
        : 'An unknown error occurred during web speech fallback';
      console.error('Web speech fallback error:', error);
      setLastError(errorMessage);
    }
  }, [isWebSpeechSupported])

  const stop = useCallback(() => {
    stopCurrentAudio()
  }, [stopCurrentAudio])

  return {
    speak,
    stop,
    isSpeaking,
    isGenerating,
    currentAudio,
    isElevenLabsSupported,
    lastError
  }
}