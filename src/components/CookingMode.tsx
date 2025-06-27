import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw, Mic, MicOff, Clock, Volume2, ChefHat, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Recipe } from '../types'
import { useVoiceRecognition } from '../hooks/useVoiceRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { CookingTimer } from './CookingTimer'

interface CookingModeProps {
  recipe: Recipe
  onExit: () => void
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onExit }) => {
  const { t } = useTranslation()
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis()
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceRecognition()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [showTimer, setShowTimer] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(10)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  const stepRef = useRef<HTMLDivElement>(null)

  const totalSteps = recipe.instructions.length

  // Swipe gesture detection
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe && currentStep < totalSteps - 1) {
      nextStep()
    }
    if (isRightSwipe && currentStep > 0) {
      previousStep()
    }
  }

  // Handle voice commands
  useEffect(() => {
    if (transcript && isVoiceMode) {
      handleVoiceCommand(transcript.toLowerCase())
    }
  }, [transcript, isVoiceMode])

  // Auto-read current step when it changes
  useEffect(() => {
    if (isVoiceMode) {
      const instruction = recipe.instructions[currentStep]
      speak(`${t('step')} ${currentStep + 1} ${t('of')} ${totalSteps}: ${instruction}`)
    }
  }, [currentStep, isVoiceMode, speak, t, totalSteps, recipe.instructions])

  // Keep screen on during cooking mode
  useEffect(() => {
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch(err => {
        console.log('Wake lock failed:', err)
      })
    }
    
    return () => {
      // Release wake lock when component unmounts
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then(wakeLock => wakeLock.release())
      }
    }
  }, [])

  const handleVoiceCommand = (command: string) => {
    if (command.includes('next') || command.includes('siguiente') || command.includes('suivant')) {
      nextStep()
    } else if (command.includes('previous') || command.includes('anterior') || command.includes('précédent')) {
      previousStep()
    } else if (command.includes('repeat') || command.includes('repetir') || command.includes('répéter')) {
      repeatCurrentStep()
    } else if (command.includes('timer') || command.includes('temporizador') || command.includes('minuteur')) {
      if (command.includes('start') || command.includes('iniciar') || command.includes('démarrer')) {
        setShowTimer(true)
      }
    } else if (command.includes('complete') || command.includes('done') || command.includes('terminado') || command.includes('fini')) {
      markStepComplete()
    } else if (command.includes('exit') || command.includes('salir') || command.includes('sortir')) {
      onExit()
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
  }

  const repeatCurrentStep = () => {
    const instruction = recipe.instructions[currentStep]
    speak(`${t('step')} ${currentStep + 1}: ${instruction}`)
  }

  const markStepComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50])
    }
    if (currentStep < totalSteps - 1) {
      nextStep()
    }
  }

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      setIsVoiceMode(false)
      stopListening()
      stopSpeaking()
    } else {
      setIsVoiceMode(true)
      startListening()
      speak(t('cookingMode') + ' activated. Say next, previous, repeat, or timer commands.')
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const extractTimerFromStep = (instruction: string): number => {
    // Extract time mentions from instruction (e.g., "cook for 10 minutes")
    const timeMatch = instruction.match(/(\d+)\s*(minute|min|hour|hr)/i)
    if (timeMatch) {
      const value = parseInt(timeMatch[1])
      const unit = timeMatch[2].toLowerCase()
      return unit.includes('hour') || unit.includes('hr') ? value * 60 : value
    }
    return 10 // Default
  }

  const currentInstruction = recipe.instructions[currentStep]
  const suggestedTimerMinutes = extractTimerFromStep(currentInstruction)

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-warm-green-50 via-terracotta-50 to-soft-brown-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 md:p-0 min-h-[44px]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden md:inline">Exit Cooking Mode</span>
            </button>
            
            <div className="flex items-center gap-2 md:gap-3">
              <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-warm-green-500" />
              <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate max-w-[200px] md:max-w-none">{recipe.title}</h1>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              {/* Fullscreen toggle for mobile */}
              <button
                onClick={toggleFullscreen}
                className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors min-h-[40px] min-w-[40px]"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              {isSupported && (
                <button
                  onClick={toggleVoiceMode}
                  className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-xl md:rounded-2xl font-medium transition-all min-h-[40px] md:min-h-[44px] ${
                    isVoiceMode
                      ? 'bg-terracotta-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="hidden md:inline">Voice Mode</span>
                </button>
              )}
              
              <button
                onClick={() => setShowTimer(true)}
                className="flex items-center gap-1 md:gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 rounded-xl md:rounded-2xl font-medium transition-colors min-h-[40px] md:min-h-[44px]"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden md:inline">Timer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
        {/* Progress Bar */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              {t('step')} {currentStep + 1} {t('of')} {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
            <div
              className="bg-gradient-to-r from-warm-green-500 to-terracotta-500 h-2 md:h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div 
          ref={stepRef}
          className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-gray-200 mb-6 md:mb-8"
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg ${
              completedSteps.has(currentStep)
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-warm-green-500 to-terracotta-500'
            }`}>
              {completedSteps.has(currentStep) ? '✓' : currentStep + 1}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                {t('step')} {currentStep + 1}
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                {currentInstruction}
              </p>
              
              {/* Step Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={markStepComplete}
                  className={`px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-medium transition-all min-h-[48px] ${
                    completedSteps.has(currentStep)
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transform hover:scale-105 active:scale-95'
                  }`}
                  disabled={completedSteps.has(currentStep)}
                >
                  {completedSteps.has(currentStep) ? 'Completed' : 'Mark Complete'}
                </button>
                
                <button
                  onClick={repeatCurrentStep}
                  className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-medium transition-colors min-h-[48px]"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden md:inline">{t('repeatInstruction')}</span>
                  <span className="md:hidden">Repeat</span>
                </button>
                
                <button
                  onClick={() => {
                    setTimerMinutes(suggestedTimerMinutes)
                    setShowTimer(true)
                  }}
                  className="flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-medium transition-colors min-h-[48px]"
                >
                  <Clock className="w-4 h-4" />
                  <span>Timer ({suggestedTimerMinutes}m)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Step Navigation */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[48px] md:min-w-auto"
          >
            <ChevronLeft className="w-5 h-5 md:hidden" />
            <ArrowLeft className="w-4 h-4 hidden md:block" />
            <span className="hidden md:inline">{t('previousStep')}</span>
          </button>

          <div className="flex items-center gap-2 text-center">
            <RotateCcw className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {completedSteps.size}/{totalSteps}
            </span>
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === totalSteps - 1}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-warm-green-500 to-terracotta-500 hover:from-warm-green-600 hover:to-terracotta-600 text-white px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-medium transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[48px] min-w-[48px] md:min-w-auto"
          >
            <span className="hidden md:inline">{t('nextStep')}</span>
            <ChevronRight className="w-5 h-5 md:hidden" />
            <ArrowRight className="w-4 h-4 hidden md:block" />
          </button>
        </div>

        {/* Swipe Hint for Mobile */}
        <div className="md:hidden text-center mb-6">
          <p className="text-sm text-gray-500">
            💡 Swipe left/right to navigate steps
          </p>
        </div>

        {/* All Steps Overview - Collapsible on Mobile */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">All Steps</h3>
          <div className="space-y-3 md:space-y-4 max-h-60 md:max-h-none overflow-y-auto">
            {recipe.instructions.map((instruction, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all cursor-pointer min-h-[56px] ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-warm-green-50 to-terracotta-50 border-2 border-warm-green-200'
                    : completedSteps.has(index)
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                  completedSteps.has(index)
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                      ? 'bg-gradient-to-r from-warm-green-500 to-terracotta-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  {completedSteps.has(index) ? '✓' : index + 1}
                </div>
                <p className={`text-sm ${
                  index === currentStep ? 'text-gray-900 font-medium' : 'text-gray-700'
                } line-clamp-2`}>
                  {instruction}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timer Modal */}
      {showTimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <CookingTimer
            initialMinutes={timerMinutes}
            timerName={`Step ${currentStep + 1} Timer`}
            onClose={() => setShowTimer(false)}
            onTimerComplete={() => {
              speak(`Step ${currentStep + 1} timer completed!`)
              setShowTimer(false)
              // Add stronger haptic feedback for timer completion
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200, 100, 200])
              }
            }}
            autoStart={true}
          />
        </div>
      )}

      {/* Voice Status */}
      {isVoiceMode && (isListening || isSpeaking) && (
        <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg border border-gray-200 max-w-[280px]">
          <div className="flex items-center gap-3">
            {isListening && (
              <>
                <div className="flex gap-1">
                  <div className="w-1 h-3 md:h-4 bg-terracotta-500 rounded animate-pulse"></div>
                  <div className="w-1 h-2 md:h-3 bg-terracotta-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-4 md:h-5 bg-terracotta-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">Listening...</span>
              </>
            )}
            {isSpeaking && (
              <>
                <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-blue-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700">Speaking...</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}