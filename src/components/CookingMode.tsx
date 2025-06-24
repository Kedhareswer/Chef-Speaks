import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw, Mic, MicOff, Clock, Volume2, ChefHat } from 'lucide-react'
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

  const totalSteps = recipe.instructions.length

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
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const repeatCurrentStep = () => {
    const instruction = recipe.instructions[currentStep]
    speak(`${t('step')} ${currentStep + 1}: ${instruction}`)
  }

  const markStepComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
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
    <div className="min-h-screen bg-gradient-to-br from-warm-green-50 via-terracotta-50 to-soft-brown-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Exit Cooking Mode
            </button>
            
            <div className="flex items-center gap-3">
              <ChefHat className="w-6 h-6 text-warm-green-500" />
              <h1 className="text-xl font-bold text-gray-900">{recipe.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              {isSupported && (
                <button
                  onClick={toggleVoiceMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition-all ${
                    isVoiceMode
                      ? 'bg-terracotta-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  Voice Mode
                </button>
              )}
              
              <button
                onClick={() => setShowTimer(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-2xl font-medium transition-colors"
              >
                <Clock className="w-4 h-4" />
                Timer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('step')} {currentStep + 1} {t('of')} {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-warm-green-500 to-terracotta-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              completedSteps.has(currentStep)
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-warm-green-500 to-terracotta-500'
            }`}>
              {completedSteps.has(currentStep) ? '✓' : currentStep + 1}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('step')} {currentStep + 1}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {currentInstruction}
              </p>
              
              {/* Step Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={markStepComplete}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                    completedSteps.has(currentStep)
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transform hover:scale-105'
                  }`}
                  disabled={completedSteps.has(currentStep)}
                >
                  {completedSteps.has(currentStep) ? 'Completed' : 'Mark Complete'}
                </button>
                
                <button
                  onClick={repeatCurrentStep}
                  className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-2xl font-medium transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  {t('repeatInstruction')}
                </button>
                
                <button
                  onClick={() => {
                    setTimerMinutes(suggestedTimerMinutes)
                    setShowTimer(true)
                  }}
                  className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-6 py-3 rounded-2xl font-medium transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  Set Timer ({suggestedTimerMinutes}m)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('previousStep')}
          </button>

          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {completedSteps.size} of {totalSteps} steps completed
            </span>
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === totalSteps - 1}
            className="flex items-center gap-2 bg-gradient-to-r from-warm-green-500 to-terracotta-500 hover:from-warm-green-600 hover:to-terracotta-600 text-white px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {t('nextStep')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* All Steps Overview */}
        <div className="mt-12 bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">All Steps</h3>
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-warm-green-50 to-terracotta-50 border-2 border-warm-green-200'
                    : completedSteps.has(index)
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
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
                }`}>
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
            }}
            autoStart={true}
          />
        </div>
      )}

      {/* Voice Status */}
      {isVoiceMode && (isListening || isSpeaking) && (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3">
            {isListening && (
              <>
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-terracotta-500 rounded animate-pulse"></div>
                  <div className="w-1 h-3 bg-terracotta-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-5 bg-terracotta-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">Listening for commands...</span>
              </>
            )}
            {isSpeaking && (
              <>
                <Volume2 className="w-5 h-5 text-blue-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700">Speaking instructions...</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}