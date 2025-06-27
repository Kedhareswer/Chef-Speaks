import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Mic, Zap, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onVoiceSearch: () => void;
  placeholder?: string;
  location?: string;
  isListening?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onVoiceSearch,
  placeholder,
  location,
  isListening = false
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      // On mobile, blur the input to hide keyboard after search
      if (inputRef.current && window.innerWidth < 768) {
        inputRef.current.blur();
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleVoiceClick = () => {
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onVoiceSearch();
  };

  // Auto-focus on desktop, but not on mobile to prevent keyboard popup
  useEffect(() => {
    if (window.innerWidth >= 768 && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <Search className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 text-soft-brown-400 w-5 h-5 md:w-6 md:h-6 group-focus-within:text-warm-green-500 transition-colors pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || t('searchPlaceholder')}
            className="w-full pl-12 md:pl-16 pr-20 md:pr-32 py-4 md:py-5 text-base md:text-lg glass-organic backdrop-blur-organic rounded-3xl md:rounded-4xl shadow-soft-xl border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-warm-green-500/20 focus:border-warm-green-500 transition-all placeholder-soft-brown-400 min-h-[56px]"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
          
          <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 md:gap-2">
            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 md:p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 min-h-[40px] min-w-[40px]"
                aria-label={t('searchBar.clearSearch', { defaultValue: 'Clear search' })}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Voice search button */}
            <button
              type="button"
              onClick={handleVoiceClick}
              className={`
                p-2.5 md:p-3 rounded-2xl md:rounded-3xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-soft-lg min-h-[44px] min-w-[44px] md:min-h-[48px] md:min-w-[48px]
                ${isListening 
                  ? 'bg-gradient-to-r from-terracotta-500 to-dusty-pink-500 text-white animate-soft-pulse shadow-warm' 
                  : 'bg-gradient-to-r from-warm-green-500 via-terracotta-500 to-soft-brown-500 hover:from-warm-green-600 hover:via-terracotta-600 hover:to-soft-brown-600 text-white shadow-green'
                }
              `}
              aria-label={t('searchBar.voiceSearch', { defaultValue: 'Voice search' })}
            >
              {isListening ? (
                <div className="relative">
                  <Mic className="w-5 h-5 md:w-6 md:h-6" />
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl border-2 border-white animate-ping opacity-75"></div>
                </div>
              ) : (
                <Mic className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Enhanced location and suggestions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-3 md:gap-4">
        {location && (
          <div className="flex items-center gap-2 text-sm text-soft-brown-600 bg-creamy-yellow-50/80 backdrop-blur-sm px-3 md:px-4 py-2 rounded-2xl md:rounded-3xl border border-creamy-yellow-200/50 shadow-soft">
            <MapPin className="w-4 h-4 text-terracotta-500 flex-shrink-0" />
            <span className="truncate">{t('searchBar.recipesNear', { location, defaultValue: `Recipes near ${location}` })}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs md:text-sm text-soft-brown-500">
          <Zap className="w-4 h-4 text-warm-green-500 flex-shrink-0" />
          <span className="truncate">{t('searchBar.tryExamples', { defaultValue: 'Try: "Italian pasta", "Quick dinner", or "Vegetarian"' })}</span>
        </div>
      </div>

      {/* Enhanced voice status indicator */}
      {isListening && (
        <div className="mt-4 flex items-center justify-center">
          <div className="bg-gradient-to-r from-terracotta-500 via-dusty-pink-500 to-warm-green-500 text-white px-6 md:px-8 py-4 rounded-3xl md:rounded-4xl shadow-soft-2xl border border-white/20 max-w-full">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex gap-1">
                <div className="w-1 h-4 md:h-6 organic-wave"></div>
                <div className="w-1 h-3 md:h-4 organic-wave"></div>
                <div className="w-1 h-5 md:h-7 organic-wave"></div>
                <div className="w-1 h-4 md:h-5 organic-wave"></div>
                <div className="w-1 h-4 md:h-6 organic-wave"></div>
              </div>
              <div>
                <div className="font-semibold text-base md:text-lg">{t('listening')}</div>
                <div className="text-sm text-white/80">{t('speakYourRequest')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search Suggestions (Mobile) */}
      {isFocused && !query && (
        <div className="mt-4 md:hidden">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">{t('searchBar.popularSearches', { defaultValue: 'Popular Searches' })}</h3>
            </div>
            <div className="p-2">
              {[
                t('searchBar.suggestion1', { defaultValue: 'Italian pasta' }),
                t('searchBar.suggestion2', { defaultValue: 'Quick breakfast' }),
                t('searchBar.suggestion3', { defaultValue: 'Healthy salads' }),
                t('searchBar.suggestion4', { defaultValue: 'Vegetarian dinner' }),
                t('searchBar.suggestion5', { defaultValue: 'Dessert recipes' })
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion);
                    onSearch(suggestion);
                  }}
                  className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 min-h-[44px]"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};