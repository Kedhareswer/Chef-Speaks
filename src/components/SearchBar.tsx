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
    <div className="search-container">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-soft-brown-400 w-6 h-6 group-focus-within:text-warm-green-500 transition-colors pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || t('searchPlaceholder')}
            className="search-input font-medium"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary btn-sm touch-target"
                aria-label={t('searchBar.clearSearch', { defaultValue: 'Clear search' })}
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {/* Voice search button */}
            <button
              type="button"
              onClick={handleVoiceClick}
              className={`search-button touch-target ${isListening ? 'animate-pulse' : ''}`}
              aria-label={t('searchBar.voiceSearch', { defaultValue: 'Voice search' })}
            >
              {isListening ? (
                <div className="relative">
                  <Mic className="w-6 h-6" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-white animate-ping opacity-75"></div>
                </div>
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Enhanced location and suggestions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 gap-4">
        {location && (
          <div className="flex items-center gap-3 text-sm text-soft-brown-600 bg-creamy-yellow-50/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-creamy-yellow-200/50 shadow-sm">
            <MapPin className="w-5 h-5 text-terracotta-500 flex-shrink-0" />
            <span className="truncate font-medium">{t('searchBar.recipesNear', { location, defaultValue: `Recipes near ${location}` })}</span>
          </div>
        )}
        
        <div className="flex items-center gap-3 text-sm text-soft-brown-500">
          <Zap className="w-5 h-5 text-warm-green-500 flex-shrink-0" />
          <span className="truncate font-medium">{t('searchBar.tryExamples', { defaultValue: 'Try: "Italian pasta", "Quick dinner", or "Vegetarian"' })}</span>
        </div>
      </div>

      {/* Enhanced voice status indicator */}
      {isListening && (
        <div className="mt-6 flex items-center justify-center">
          <div className="bg-gradient-to-r from-terracotta-500 via-dusty-pink-500 to-warm-green-500 text-white px-8 py-5 rounded-[2rem] shadow-2xl border border-white/20 max-w-full backdrop-blur-sm">
            <div className="flex items-center gap-5">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-6 organic-wave"></div>
                <div className="w-1.5 h-4 organic-wave"></div>
                <div className="w-1.5 h-8 organic-wave"></div>
                <div className="w-1.5 h-5 organic-wave"></div>
                <div className="w-1.5 h-7 organic-wave"></div>
              </div>
              <div>
                <div className="font-bold text-xl">{t('listening')}</div>
                <div className="text-sm text-white/90 font-medium">{t('speakYourRequest')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search Suggestions (Mobile) */}
      {isFocused && !query && (
        <div className="mt-6 md:hidden">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-700">{t('searchBar.popularSearches', { defaultValue: 'Popular Searches' })}</h3>
            </div>
            <div className="p-4">
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
                  className="w-full text-left px-4 py-4 text-base text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors flex items-center gap-4 min-h-[56px] font-medium"
                >
                  <Search className="w-5 h-5 text-gray-400" />
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