import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Clock, Plus, Minus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

interface CookingTimerProps {
  initialMinutes?: number
  initialSeconds?: number
  timerName?: string
  onTimerComplete?: () => void
  onClose?: () => void
  autoStart?: boolean
  showControls?: boolean
}

export const CookingTimer: React.FC<CookingTimerProps> = ({
  initialMinutes = 10,
  initialSeconds = 0,
  timerName = 'Cooking Timer',
  onTimerComplete,
  onClose,
  autoStart = false,
  showControls = true
}) => {
  const { t } = useTranslation()
  const { speak } = useSpeechSynthesis()
  
  const [minutes, setMinutes] = useState(initialMinutes)
  const [seconds, setSeconds] = useState(initialSeconds)
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60 + initialSeconds)
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60 + initialSeconds)
  const [isActive, setIsActive] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Update total seconds when minutes/seconds change
  useEffect(() => {
    const total = minutes * 60 + seconds
    setTotalSeconds(total)
    if (!isActive && !isPaused) {
      setRemainingSeconds(total)
    }
  }, [minutes, seconds, isActive, isPaused])

  // Timer countdown logic
  useEffect(() => {
    if (isActive && !isPaused && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsActive(false)
            setIsCompleted(true)
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, remainingSeconds])

  const handleTimerComplete = () => {
    // Play notification sound
    try {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
      audioRef.current.play().catch(() => {
        // Fallback if audio fails
        console.log('Timer completed - audio notification failed')
      })
    } catch (error) {
      console.log('Timer completed - audio not available')
    }

    // Voice notification
    speak(`${timerName} ${t('timerFinished')}`)
    
    // Callback
    onTimerComplete?.()
  }

  const startTimer = () => {
    if (remainingSeconds > 0) {
      setIsActive(true)
      setIsPaused(false)
      setIsCompleted(false)
    }
  }

  const pauseTimer = () => {
    setIsPaused(true)
  }

  const resumeTimer = () => {
    setIsPaused(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsPaused(false)
    setIsCompleted(false)
    setRemainingSeconds(totalSeconds)
  }

  const adjustMinutes = (delta: number) => {
    if (!isActive && !isPaused) {
      setMinutes(prev => Math.max(0, Math.min(99, prev + delta)))
    }
  }

  const adjustSeconds = (delta: number) => {
    if (!isActive && !isPaused) {
      setSeconds(prev => {
        const newSeconds = prev + delta
        if (newSeconds >= 60) {
          setMinutes(m => Math.min(99, m + 1))
          return newSeconds - 60
        } else if (newSeconds < 0) {
          if (minutes > 0) {
            setMinutes(m => m - 1)
            return 59
          }
          return 0
        }
        return newSeconds
      })
    }
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (totalSeconds === 0) return 0
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100
  }

  const getTimerColor = () => {
    if (isCompleted) return 'from-green-500 to-emerald-500'
    if (remainingSeconds <= 60) return 'from-red-500 to-orange-500'
    if (remainingSeconds <= 300) return 'from-yellow-500 to-orange-500'
    return 'from-blue-500 to-purple-500'
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">{timerName}</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Timer Display */}
      <div className="relative mb-6">
        {/* Progress Ring */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
              className="transition-all duration-1000 ease-linear"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`stop-color-${getTimerColor().split('-')[1]}-500`} />
                <stop offset="100%" className={`stop-color-${getTimerColor().split('-')[3]}-500`} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-4xl font-bold bg-gradient-to-r ${getTimerColor()} bg-clip-text text-transparent`}>
                {formatTime(remainingSeconds)}
              </div>
              {isCompleted && (
                <div className="text-green-600 font-medium text-sm mt-1">
                  {t('timerFinished')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Time Adjustment Controls */}
      {showControls && !isActive && !isPaused && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minutes
            </label>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => adjustMinutes(-1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold">{minutes}</span>
              <button
                onClick={() => adjustMinutes(1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seconds
            </label>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => adjustSeconds(-15)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold">{seconds}</span>
              <button
                onClick={() => adjustSeconds(15)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center gap-3">
        {!isActive && !isPaused ? (
          <button
            onClick={startTimer}
            disabled={remainingSeconds === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Play className="w-4 h-4" />
            {t('startTimer')}
          </button>
        ) : isPaused ? (
          <button
            onClick={resumeTimer}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105"
          >
            <Play className="w-4 h-4" />
            Resume
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105"
          >
            <Pause className="w-4 h-4" />
            {t('pauseTimer')}
          </button>
        )}
        
        <button
          onClick={resetTimer}
          className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105"
        >
          <RotateCcw className="w-4 h-4" />
          {t('resetTimer')}
        </button>
      </div>
    </div>
  )
}