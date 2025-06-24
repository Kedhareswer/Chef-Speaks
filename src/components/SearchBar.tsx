import React, { useState } from 'react';
import { Search, MapPin, Mic, Zap } from 'lucide-react';

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
  placeholder = "Search recipes, cuisines, or ingredients...",
  location,
  isListening = false
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-soft-brown-400 w-6 h-6 group-focus-within:text-warm-green-500 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-16 pr-32 py-5 text-lg glass-organic backdrop-blur-organic rounded-4xl shadow-soft-xl border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-warm-green-500/20 focus:border-warm-green-500 transition-all placeholder-soft-brown-400"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={onVoiceSearch}
              className={`
                p-3 rounded-3xl transition-all duration-300 hover:scale-110 shadow-soft-lg
                ${isListening 
                  ? 'bg-gradient-to-r from-terracotta-500 to-dusty-pink-500 text-white animate-soft-pulse shadow-warm' 
                  : 'bg-gradient-to-r from-warm-green-500 via-terracotta-500 to-soft-brown-500 hover:from-warm-green-600 hover:via-terracotta-600 hover:to-soft-brown-600 text-white shadow-green'
                }
              `}
              aria-label="Voice search"
            >
              {isListening ? (
                <div className="relative">
                  <Mic className="w-6 h-6" />
                  <div className="absolute inset-0 rounded-3xl border-2 border-white animate-ping opacity-75"></div>
                </div>
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Enhanced location and suggestions */}
      <div className="flex items-center justify-between mt-4">
        {location && (
          <div className="flex items-center gap-2 text-sm text-soft-brown-600 bg-creamy-yellow-50/80 backdrop-blur-sm px-4 py-2 rounded-3xl border border-creamy-yellow-200/50 shadow-soft">
            <MapPin className="w-4 h-4 text-terracotta-500" />
            <span>Recipes near {location}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-soft-brown-500">
          <Zap className="w-4 h-4 text-warm-green-500" />
          <span>Try: "Italian pasta", "Quick dinner", or "Vegetarian"</span>
        </div>
      </div>

      {/* Enhanced voice status indicator */}
      {isListening && (
        <div className="mt-4 flex items-center justify-center">
          <div className="bg-gradient-to-r from-terracotta-500 via-dusty-pink-500 to-warm-green-500 text-white px-8 py-4 rounded-4xl shadow-soft-2xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <div className="w-1 h-6 organic-wave"></div>
                <div className="w-1 h-4 organic-wave"></div>
                <div className="w-1 h-7 organic-wave"></div>
                <div className="w-1 h-5 organic-wave"></div>
                <div className="w-1 h-6 organic-wave"></div>
              </div>
              <div>
                <div className="font-semibold text-lg">Listening...</div>
                <div className="text-sm text-white/80">Speak your recipe request</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};