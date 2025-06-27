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
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40">
      <div className="flex flex-col gap-4">
        {/* Stop Speaking Button */}
        {isSpeaking && (
          <button
            onClick={handleStopSpeaking}
            className="bg-gradient-to-r from-muted-blue-500 to-light-lavender-500 hover:from-muted-blue-600 hover:to-light-lavender-600 text-white p-4 md:p-4 rounded-full shadow-soft-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border-4 border-white/50 backdrop-blur-sm animate-organic-float min-h-[56px] min-w-[56px] md:min-h-[64px] md:min-w-[64px]"
            aria-label={t('voiceButton.stopSpeaking', { defaultValue: 'Stop speaking' })}
          >
            <Volume2 className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        )}

        {/* Voice Recognition Button */}
        <div className="relative">
          <button
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={`
              relative p-5 md:p-6 rounded-full shadow-soft-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border-4 border-white/50 backdrop-blur-sm min-h-[64px] min-w-[64px] md:min-h-[72px] md:min-w-[72px]
              ${isListening 
                ? 'bg-gradient-to-r from-terracotta-500 to-dusty-pink-500 hover:from-terracotta-600 hover:to-dusty-pink-600 text-white animate-soft-pulse' 
                : 'bg-gradient-to-r from-warm-green-500 via-terracotta-500 to-soft-brown-500 hover:from-warm-green-600 hover:via-terracotta-600 hover:to-soft-brown-600 text-white animate-warm-glow'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={isListening ? t('voiceButton.stopListening', { defaultValue: 'Stop listening' }) : t('voiceButton.startVoiceCommand', { defaultValue: 'Start voice command' })}
          >
            {isListening ? (
              <div className="relative">
                <MicOff className="w-7 h-7 md:w-8 md:h-8" />
                {/* Enhanced listening animation rings */}
                <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-75"></div>
                <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-25" style={{ animationDelay: '1s' }}></div>
              </div>
            ) : (
              <Mic className="w-7 h-7 md:w-8 md:h-8" />
            )}
          </button>

          {/* Enhanced sparkle effects */}
          {!disabled && (
            <>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-creamy-yellow-400 animate-gentle-bounce" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-warm-green-400 animate-gentle-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced voice status indicator */}
      {(isListening || isSpeaking) && (
        <div className="absolute -top-20 md:-top-24 right-0 glass-organic backdrop-blur-organic text-soft-brown-900 px-4 md:px-6 py-3 md:py-4 rounded-3xl md:rounded-4xl shadow-soft-2xl border border-terracotta-200/50 min-w-[200px] md:min-w-[220px]">
          <div className="flex items-center gap-3">
            {isListening && (
              <>
                <div className="flex gap-1">
                  <div className="w-1 h-4 md:h-6 organic-wave"></div>
                  <div className="w-1 h-3 md:h-4 organic-wave"></div>
                  <div className="w-1 h-5 md:h-7 organic-wave"></div>
                  <div className="w-1 h-4 md:h-5 organic-wave"></div>
                  <div className="w-1 h-4 md:h-6 organic-wave"></div>
                </div>
                <div>
                  <div className="font-semibold text-warm-green-600 text-sm md:text-base">{t('voiceButton.aiListening', { defaultValue: 'AI Listening...' })}</div>
                  <div className="text-xs text-soft-brown-500">{t('speakYourRequest')}</div>
                </div>
              </>
            )}
            {isSpeaking && (
              <>
                <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-muted-blue-500 animate-soft-pulse" />
                <div>
                  <div className="font-semibold text-muted-blue-600 text-sm md:text-base">{t('voiceButton.chefSpeakAI', { defaultValue: 'ChefSpeak AI' })}</div>
                  <div className="text-xs text-soft-brown-500">{t('voiceButton.responding', { defaultValue: 'Responding to your request' })}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Voice Commands Hint */}
      {isListening && (
        <div className="absolute -top-32 md:-top-40 right-0 bg-white/95 backdrop-blur-sm text-gray-700 px-3 md:px-4 py-2 md:py-3 rounded-2xl md:rounded-3xl shadow-lg border border-gray-200 min-w-[180px] md:min-w-[200px]">
          <div className="text-xs md:text-sm font-medium mb-1">{t('voiceButton.trySaying', { defaultValue: 'Try saying:' })}</div>
          <div className="text-xs text-gray-500 space-y-0.5">
            <div>"{t('voiceButton.examplePasta', { defaultValue: 'Show me pasta recipes' })}"</div>
            <div>"{t('voiceButton.exampleQuick', { defaultValue: 'Quick dinner ideas' })}"</div>
            <div>"{t('voiceButton.exampleVegetarian', { defaultValue: 'Vegetarian meals' })}"</div>
          </div>
        </div>
      )}
    </div>
  );
};