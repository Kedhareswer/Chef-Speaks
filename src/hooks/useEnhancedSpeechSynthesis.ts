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
  const retryCountRef = useRef<number>(0)
  const maxRetries = 2
  
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
    setIsGenerating(false)
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
    retryCountRef.current = 0

    if (!text.trim()) {
      console.warn('Empty text provided to speech synthesis')
      return
    }

    // Sanitize text for better speech synthesis
    const cleanText = text
      .replace(/[^\w\s.,!?;:-]/g, '') // Remove special characters except basic punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    if (!cleanText) {
      console.warn('No valid text after sanitization')
      return
    }

    const attemptSpeech = async (isRetry: boolean = false): Promise<void> => {
      try {
        if (useElevenLabs && isElevenLabsSupported && !isRetry) {
          // Use Eleven Labs for high-quality TTS
          setIsGenerating(true)
          console.log(`Attempting ElevenLabs TTS for: "${cleanText.substring(0, 50)}..."`)
          
          // If voiceId is provided, use it directly, otherwise let the service choose based on language
          const gender = 'female' // Default gender
          const audioUrl = await elevenLabsService.generateSpeech(cleanText, language, gender, voiceId)
          
          if (audioUrl) {
            const audio = new Audio()
            audioRef.current = audio
            setCurrentAudio(audio)
            
            // Set up event handlers before setting src
            audio.onloadstart = () => {
              console.log('ElevenLabs audio loading started')
              setIsGenerating(false)
            }
            
            audio.oncanplay = () => {
              console.log('ElevenLabs audio can start playing')
            }
            
            audio.onplay = () => {
              console.log('ElevenLabs audio playback started')
              setIsSpeaking(true)
              retryCountRef.current = 0 // Reset retry count on success
            }
            
            audio.onended = () => {
              console.log('ElevenLabs audio playback ended')
              setIsSpeaking(false)
              setCurrentAudio(null)
              audioRef.current = null
              // Clean up blob URL
              URL.revokeObjectURL(audioUrl)
            }
            
            audio.onerror = () => {
              const errorMsg = `ElevenLabs audio playback failed: ${audio.error?.message || 'Unknown error'}`
              console.warn('ElevenLabs audio error, falling back to web speech:', errorMsg)
              setIsSpeaking(false)
              setIsGenerating(false)
              setCurrentAudio(null)
              audioRef.current = null
              // Clean up blob URL
              URL.revokeObjectURL(audioUrl)
              
              // Retry with web speech if within retry limit
              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++
                console.log(`Retrying with web speech (attempt ${retryCountRef.current})`)
                attemptSpeech(true)
              } else {
                setLastError(errorMsg)
              }
            }
            
            // Set the audio source and attempt to play
            audio.src = audioUrl
            
            try {
              await audio.play()
            } catch (playError) {
              const errorMsg = playError instanceof Error ? playError.message : 'Unknown error occurred during audio playback'
              console.warn('Error playing ElevenLabs audio, falling back to web speech:', errorMsg)
              setIsGenerating(false)
              setIsSpeaking(false)
              // Clean up
              URL.revokeObjectURL(audioUrl)
              
              // Retry with web speech if within retry limit
              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++
                console.log(`Retrying with web speech (attempt ${retryCountRef.current})`)
                attemptSpeech(true)
              } else {
                setLastError(errorMsg)
              }
            }
          } else {
            setIsGenerating(false)
            console.log('ElevenLabs TTS service not available, using web speech fallback')
            // Fallback to web speech if ElevenLabs fails
            await fallbackToWebSpeech(cleanText, language)
          }
        } else {
          // Use browser's built-in speech synthesis
          await fallbackToWebSpeech(cleanText, language)
        }
      } catch (error) {
        const errorMsg = error instanceof Error 
          ? `Speech synthesis error: ${error.message}`
          : 'An unknown error occurred during speech synthesis'
        console.warn('Error in speech synthesis:', errorMsg)
        setLastError(errorMsg)
        setIsGenerating(false)
        setIsSpeaking(false)
        
        // Try web speech fallback if within retry limit
        if (retryCountRef.current < maxRetries && !isRetry) {
          retryCountRef.current++
          console.log(`Retrying with web speech (attempt ${retryCountRef.current})`)
          await attemptSpeech(true)
        }
      }
    }

    await attemptSpeech()
  }, [stopCurrentAudio, isElevenLabsSupported])

  const fallbackToWebSpeech = useCallback(async (text: string, language: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isWebSpeechSupported) {
        const errorMsg = 'Speech synthesis not supported in this browser'
        setLastError(errorMsg)
        reject(new Error(errorMsg))
        return
      }

      console.log('Using web speech synthesis for:', text.substring(0, 50) + '...')
      
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
            resolve()
          }
          
          utterance.onerror = (event) => {
            const errorMsg = `Web speech error: ${event.error}`
            console.warn('Web speech error:', event)
            
            // Only set error for critical failures, not interruptions
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
              setLastError(errorMsg)
              reject(new Error(errorMsg))
            } else {
              resolve() // Treat interruptions as successful completion
            }
            setIsSpeaking(false)
          }

          // Try to get a suitable voice for the language
          const voices = window.speechSynthesis.getVoices()
          const preferredVoice = voices.find(voice => 
            voice.lang.startsWith(languageMap[language] || language) && 
            voice.localService
          ) || voices.find(voice => 
            voice.lang.startsWith(languageMap[language] || language)
          )
          
          if (preferredVoice) {
            utterance.voice = preferredVoice
            console.log(`Using voice: ${preferredVoice.name} (${preferredVoice.lang})`)
          }

          window.speechSynthesis.speak(utterance)
        }, 100)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error 
          ? `Web speech fallback failed: ${error.message}`
          : 'An unknown error occurred during web speech fallback'
        console.error('Web speech fallback error:', error)
        setLastError(errorMessage)
        reject(new Error(errorMessage))
      }
    })
  }, [isWebSpeechSupported])

  const stop = useCallback(() => {
    console.log('Stopping speech synthesis')
    stopCurrentAudio()
    retryCountRef.current = 0
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