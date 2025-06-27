import React from 'react';
import { Mic, MicOff, Volume2, Sparkles, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VoiceButtonProps {
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListening: () => void;
  onStopSpeaking: () => void;
  disabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isSpeaking,
  onToggleListening,
  onStopSpeaking,
  disabled = false
}) => {
  const { t } = useTranslation();
  
  const handleVibration = () => {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleVoiceToggle = () => {
    handleVibration();
    onToggleListening();
  };

  const handleStopSpeaking = () => {
    handleVibration();
    onStopSpeaking();
  };

  return (
    <div className="voice-button-container">
      <div className="flex flex-col gap-5">
        {/* Stop Speaking Button */}
        {isSpeaking && (
          <button
            onClick={handleStopSpeaking}
            className="bg-gradient-to-r from-muted-blue-500 to-light-lavender-500 hover:from-muted-blue-600 hover:to-light-lavender-600 text-white p-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border-4 border-white/50 backdrop-blur-sm animate-organic-float touch-target-large"
            style={{ minHeight: '4rem', minWidth: '4rem' }}
            aria-label={t('voiceButton.stopSpeaking', { defaultValue: 'Stop speaking' })}
          >
            <Volume2 className="w-8 h-8" />
          </button>
        )}

        {/* Voice Recognition Button */}
        <div className="relative">
          <button
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={`
              relative p-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border-4 border-white/50 backdrop-blur-sm touch-target-large
              ${isListening 
                ? 'bg-gradient-to-r from-terracotta-500 to-dusty-pink-500 hover:from-terracotta-600 hover:to-dusty-pink-600 text-white animate-soft-pulse' 
                : 'bg-gradient-to-r from-warm-green-500 via-terracotta-500 to-soft-brown-500 hover:from-warm-green-600 hover:via-terracotta-600 hover:to-soft-brown-600 text-white animate-warm-glow'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{ minHeight: '5rem', minWidth: '5rem' }}
            aria-label={isListening ? t('voiceButton.stopListening', { defaultValue: 'Stop listening' }) : t('voiceButton.startVoiceCommand', { defaultValue: 'Start voice command' })}
          >
            {isListening ? (
              <div className="relative">
                <MicOff className="w-9 h-9" />
                {/* Enhanced listening animation rings */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white animate-ping opacity-75"></div>
                <div className="absolute inset-0 rounded-2xl border-2 border-white animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 rounded-2xl border-2 border-white animate-ping opacity-25" style={{ animationDelay: '1s' }}></div>
              </div>
            ) : (
              <Mic className="w-9 h-9" />
            )}
          </button>

          {/* Enhanced sparkle effects */}
          {!disabled && (
            <>
              <div className="absolute -top-3 -right-3">
                <Sparkles className="w-7 h-7 text-creamy-yellow-400 animate-gentle-bounce" />
              </div>
              <div className="absolute -bottom-3 -left-3">
                <Zap className="w-6 h-6 text-warm-green-400 animate-gentle-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced voice status indicator */}
      {(isListening || isSpeaking) && (
        <div className="absolute -top-32 md:-top-36 right-0 glass-organic backdrop-blur-organic text-soft-brown-900 px-6 py-5 rounded-3xl shadow-2xl border border-terracotta-200/50 min-w-[280px]">
          <div className="flex items-center gap-4">
            {isListening && (
              <>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-6 organic-wave"></div>
                  <div className="w-1.5 h-4 organic-wave"></div>
                  <div className="w-1.5 h-8 organic-wave"></div>
                  <div className="w-1.5 h-5 organic-wave"></div>
                  <div className="w-1.5 h-7 organic-wave"></div>
                </div>
                <div>
                  <div className="font-bold text-warm-green-600 text-lg">{t('voiceButton.aiListening', { defaultValue: 'AI Listening...' })}</div>
                  <div className="text-sm text-soft-brown-500 font-medium">{t('speakYourRequest')}</div>
                </div>
              </>
            )}
            {isSpeaking && (
              <>
                <Volume2 className="w-7 h-7 text-muted-blue-500 animate-soft-pulse" />
                <div>
                  <div className="font-bold text-muted-blue-600 text-lg">{t('voiceButton.chefSpeakAI', { defaultValue: 'ChefSpeak AI' })}</div>
                  <div className="text-sm text-soft-brown-500 font-medium">{t('voiceButton.responding', { defaultValue: 'Responding to your request' })}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Voice Commands Hint */}
      {isListening && (
        <div className="absolute -top-48 md:-top-56 right-0 bg-white/95 backdrop-blur-sm text-gray-700 px-5 py-4 rounded-3xl shadow-xl border border-gray-200 min-w-[260px]">
          <div className="text-sm font-bold mb-3">{t('voiceButton.trySaying', { defaultValue: 'Try saying:' })}</div>
          <div className="text-sm text-gray-500 space-y-1.5">
            <div>"{t('voiceButton.examplePasta', { defaultValue: 'Show me pasta recipes' })}"</div>
            <div>"{t('voiceButton.exampleQuick', { defaultValue: 'Quick dinner ideas' })}"</div>
            <div>"{t('voiceButton.exampleVegetarian', { defaultValue: 'Vegetarian meals' })}"</div>
          </div>
        </div>
      )}
    </div>
  );
};