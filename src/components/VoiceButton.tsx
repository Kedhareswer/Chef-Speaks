import React from 'react';
import { Mic, MicOff, Volume2, Sparkles, Zap } from 'lucide-react';

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
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="flex flex-col gap-4">
        {/* Stop Speaking Button */}
        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="bg-gradient-to-r from-muted-blue-500 to-light-lavender-500 hover:from-muted-blue-600 hover:to-light-lavender-600 text-white p-4 rounded-full shadow-soft-2xl transition-all duration-300 transform hover:scale-110 border-4 border-white/50 backdrop-blur-sm animate-organic-float"
            aria-label="Stop speaking"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        )}

        {/* Voice Recognition Button */}
        <div className="relative">
          <button
            onClick={onToggleListening}
            disabled={disabled}
            className={`
              relative p-6 rounded-full shadow-soft-2xl transition-all duration-300 transform hover:scale-110 border-4 border-white/50 backdrop-blur-sm
              ${isListening 
                ? 'bg-gradient-to-r from-terracotta-500 to-dusty-pink-500 hover:from-terracotta-600 hover:to-dusty-pink-600 text-white animate-soft-pulse' 
                : 'bg-gradient-to-r from-warm-green-500 via-terracotta-500 to-soft-brown-500 hover:from-warm-green-600 hover:via-terracotta-600 hover:to-soft-brown-600 text-white animate-warm-glow'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={isListening ? 'Stop listening' : 'Start voice command'}
          >
            {isListening ? (
              <div className="relative">
                <MicOff className="w-8 h-8" />
                {/* Enhanced listening animation rings */}
                <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-75"></div>
                <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-25" style={{ animationDelay: '1s' }}></div>
              </div>
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>

          {/* Enhanced sparkle effects */}
          {!disabled && (
            <>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-creamy-yellow-400 animate-gentle-bounce" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Zap className="w-5 h-5 text-warm-green-400 animate-gentle-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced voice status indicator */}
      {(isListening || isSpeaking) && (
        <div className="absolute -top-24 right-0 glass-organic backdrop-blur-organic text-soft-brown-900 px-6 py-4 rounded-4xl shadow-soft-2xl border border-terracotta-200/50 min-w-[220px]">
          <div className="flex items-center gap-3">
            {isListening && (
              <>
                <div className="flex gap-1">
                  <div className="w-1 h-6 organic-wave"></div>
                  <div className="w-1 h-4 organic-wave"></div>
                  <div className="w-1 h-7 organic-wave"></div>
                  <div className="w-1 h-5 organic-wave"></div>
                  <div className="w-1 h-6 organic-wave"></div>
                </div>
                <div>
                  <div className="font-semibold text-warm-green-600">AI Listening...</div>
                  <div className="text-xs text-soft-brown-500">Speak your recipe request</div>
                </div>
              </>
            )}
            {isSpeaking && (
              <>
                <Volume2 className="w-6 h-6 text-muted-blue-500 animate-soft-pulse" />
                <div>
                  <div className="font-semibold text-muted-blue-600">ChefSpeak AI</div>
                  <div className="text-xs text-soft-brown-500">Responding to your request</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};