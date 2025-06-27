import { useState, useEffect, useCallback } from 'react';
import { ChefHat, MapPin, Sparkles, Users, TrendingUp, Clock, Star, Flame, Globe, Menu, X, User, LogIn, Calendar, ShoppingCart } from 'lucide-react';
import { Recipe } from './types';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useLocation } from './hooks/useLocation';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useAuth } from './hooks/useAuth';
import { VoiceButton } from './components/VoiceButton';
import { SearchBar } from './components/SearchBar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { IngredientSelector } from './components/IngredientSelector';
import { CommunityRecipes } from './components/CommunityRecipes';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { MealPlanCalendar } from './components/MealPlanCalendar';
import { ShoppingListView } from './components/ShoppingListView';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { AppLoadingSkeleton, SearchResultsSkeleton } from './components/SkeletonLoaders';
import { parseVoiceCommand, filterRecipesByVoiceCommand } from './utils/voiceCommands';
import { recipeService } from './services/recipeService';
import { checkAndSeedDatabase } from './data/seedData';

type ViewMode = 'discover' | 'ingredients' | 'community' | 'trending';

function App() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('discover');
  const [showLocalSuggestions] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState<string>('');

  const { location, loading: locationLoading } = useLocation();
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceRecognition();
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();
  const { user, loading: authLoading } = useAuth();

  // Enhanced voice command handling with debouncing and transcript clearing
  const handleSearchInternal = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    try {
      const searchResults = await recipeService.searchRecipes(query);
      setFilteredRecipes(searchResults);
      
      if (searchResults.length > 0) {
        const message = searchResults.length === 1 
          ? `Found 1 recipe for ${query}` 
          : `Found ${searchResults.length} recipes for ${query}`;
        speak(message);
      } else {
        speak(`No recipes found for ${query}. Try searching for something else.`);
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      speak('Sorry, there was an error searching for recipes.');
    }
  }, [speak]);

  // Voice command handling with proper dependencies
  const handleVoiceCommandWithSearch = useCallback(async (transcript: string) => {
    if (!transcript || transcript === lastProcessedTranscript) {
      return; // Prevent processing same transcript multiple times
    }

    try {
      console.log('Processing voice command:', transcript);
      setLastProcessedTranscript(transcript);

      const command = parseVoiceCommand(transcript);
      
      // Handle different command types
      switch (command.action) {
        case 'search': {
          if (command.query) {
            await handleSearchInternal(command.query);
          }
          break;
        }
          
        case 'filter': {
          const filtered = filterRecipesByVoiceCommand(allRecipes, command);
          setFilteredRecipes(filtered);
          
          if (command.message) {
            speak(command.message);
          }
          break;
        }
          
        case 'help': {
          if (command.message) {
            speak(command.message);
          }
          break;
        }
          
        default: {
          // Default search behavior
          if (command.query) {
            await handleSearchInternal(command.query);
          } else if (command.message) {
            speak(command.message);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      speak('Sorry, I had trouble processing that command. Please try again.');
    }
  }, [allRecipes, lastProcessedTranscript, speak, handleSearchInternal]);

  // Handle voice commands with improved debouncing
  useEffect(() => {
    if (transcript && transcript.trim()) {
      // Debounce voice command processing
      const timeoutId = setTimeout(() => {
        handleVoiceCommandWithSearch(transcript.trim());
      }, 1000); // Wait 1 second after user stops speaking

      return () => clearTimeout(timeoutId);
    }
  }, [transcript, handleVoiceCommandWithSearch]);

  // Clear processed transcript when starting new listening session
  useEffect(() => {
    if (isListening) {
      setLastProcessedTranscript('');
    }
  }, [isListening]);

  const initializeAppWithDeps = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Initializing ChefSpeak app...');
      
      // Check and seed database if needed (this may fail due to RLS, but that's okay)
      try {
        await checkAndSeedDatabase();
      } catch (seedError) {
        console.warn('Database seeding failed, but continuing:', seedError);
      }
      
      // Load recipes (this should work even if seeding failed)
      await loadRecipes();
      
      console.log('App initialization completed');
    } catch (error) {
      console.error('Error initializing app:', error);
      setError('Failed to load the application. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load recipes on component mount
  useEffect(() => {
    initializeAppWithDeps();
  }, [initializeAppWithDeps]);

  const loadLocationRecipesWithDeps = useCallback(async () => {
    if (!location) return;
    
    try {
      const locationRecipes = await recipeService.getRecipesByCuisine(location.country);
      if (locationRecipes.length > 0) {
        setFilteredRecipes(locationRecipes);
        speak(`Found ${locationRecipes.length} local recipes for you in ${location.city}`);
      }
    } catch (error) {
      console.error('Error loading location recipes:', error);
    }
  }, [location, speak]);

  // Load location-based recipes
  useEffect(() => {
    if (location && !searchQuery && viewMode === 'discover' && showLocalSuggestions) {
      loadLocationRecipesWithDeps();
    }
  }, [location, searchQuery, viewMode, showLocalSuggestions, loadLocationRecipesWithDeps]);

  const handleSearch = handleSearchInternal;

  const loadRecipes = async () => {
    try {
      console.log('Loading recipes...');
      const recipes = await recipeService.getAllRecipes();
      console.log(`Loaded ${recipes.length} recipes`);
      
      setAllRecipes(recipes);
      setFilteredRecipes(recipes);
      
      if (recipes.length === 0) {
        console.warn('No recipes found in database');
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      // Set empty arrays so app doesn't crash
      setAllRecipes([]);
      setFilteredRecipes([]);
    }
  };

  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      // Clear any previous state before starting
      setLastProcessedTranscript('');
      startListening();
      speak("I'm listening. What would you like to cook?");
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    speak(`Here's the recipe for ${recipe.title}. It takes ${recipe.cookTime} minutes to cook and serves ${recipe.servings} people.`);
  };

  const handleBackToList = () => {
    setSelectedRecipe(null);
    stopSpeaking();
    // Clear voice state when going back
    setLastProcessedTranscript('');
  };

  const handleRecipesUpdate = (recipes: Recipe[]) => {
    setAllRecipes(recipes);
    if (viewMode === 'discover') {
      setFilteredRecipes(recipes);
    }
  };

  const handleViewModeChange = async (mode: ViewMode) => {
    setViewMode(mode);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
    
    try {
      if (mode === 'discover') {
        setFilteredRecipes(allRecipes);
      } else if (mode === 'trending') {
        const trending = await recipeService.getTrendingRecipes();
        setFilteredRecipes(trending);
      }
    } catch (error) {
      console.error('Error changing view mode:', error);
    }
  };

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const getTrendingRecipes = () => {
    return allRecipes
      .filter(recipe => recipe.rating && recipe.rating >= 4.5)
      .sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))
      .slice(0, 6);
  };

  const getQuickRecipes = () => {
    return allRecipes
      .filter(recipe => recipe.cookTime <= 30)
      .sort((a, b) => a.cookTime - b.cookTime)
      .slice(0, 4);
  };

  const getCuisineStats = () => {
    const cuisines = allRecipes.reduce((acc, recipe) => {
      acc[recipe.cuisine] = (acc[recipe.cuisine] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(cuisines)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  if (selectedRecipe) {
    return (
      <>
        <RecipeDetail
          recipe={selectedRecipe}
          onBack={handleBackToList}
        />
        <VoiceButton
          isListening={isListening}
          isSpeaking={isSpeaking}
          onToggleListening={handleVoiceSearch}
          onStopSpeaking={stopSpeaking}
          disabled={!isSupported}
        />
      </>
    );
  }

  // Show loading screen while auth or app is loading
  if (loading || authLoading) {
    return <AppLoadingSkeleton />;
  }

  // Show error screen if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-creamy-yellow-50 via-warm-green-50 to-terracotta-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-warm-green-500 to-terracotta-500 hover:from-warm-green-600 hover:to-terracotta-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-creamy-yellow-50 via-warm-green-50 to-terracotta-50 pb-20 md:pb-0">
      {/* Enhanced Header with Authentication */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-r from-warm-green-500 to-terracotta-500 p-2.5 rounded-2xl shadow-lg">
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-creamy-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-warm-green-600 to-terracotta-600 bg-clip-text text-transparent">
                  ChefSpeak
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">AI-Powered Cooking Assistant</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              <button
                onClick={() => handleViewModeChange('discover')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-warm-green-500 focus:ring-offset-2 min-h-[44px] ${
                  viewMode === 'discover'
                    ? 'bg-warm-green-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={viewMode === 'discover' ? 'page' : undefined}
              >
                <Sparkles className="w-4 h-4" />
                Discover
              </button>
              <button
                onClick={() => handleViewModeChange('trending')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-2 min-h-[44px] ${
                  viewMode === 'trending'
                    ? 'bg-terracotta-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={viewMode === 'trending' ? 'page' : undefined}
              >
                <TrendingUp className="w-4 h-4" />
                Trending
              </button>
              <button
                onClick={() => handleViewModeChange('ingredients')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-muted-blue-500 focus:ring-offset-2 min-h-[44px] ${
                  viewMode === 'ingredients'
                    ? 'bg-muted-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={viewMode === 'ingredients' ? 'page' : undefined}
              >
                <ChefHat className="w-4 h-4" />
                By Ingredients
              </button>
              <button
                onClick={() => handleViewModeChange('community')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-light-lavender-500 focus:ring-offset-2 min-h-[44px] ${
                  viewMode === 'community'
                    ? 'bg-light-lavender-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={viewMode === 'community' ? 'page' : undefined}
              >
                <Users className="w-4 h-4" />
                Community
              </button>
            </nav>

            {/* Right Side - Auth and Tools */}
            <div className="flex items-center gap-4">
              {/* User Tools */}
              {user && (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setShowMealPlan(true)}
                    className="flex items-center gap-2 text-gray-700 hover:text-muted-blue-600 px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px]"
                    title="Meal Planning"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden lg:inline">Meal Plan</span>
                  </button>
                  <button
                    onClick={() => setShowShoppingList(true)}
                    className="flex items-center gap-2 text-gray-700 hover:text-light-lavender-600 px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px]"
                    title="Shopping Lists"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden lg:inline">Shopping</span>
                  </button>
                </div>
              )}

              {/* Authentication */}
              {user ? (
                <button
                  onClick={() => setShowUserProfile(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-warm-green-500 to-terracotta-500 text-white px-6 py-3 rounded-xl font-medium hover:from-warm-green-600 hover:to-terracotta-600 transition-all min-h-[44px]"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="flex items-center gap-2 text-gray-700 hover:text-warm-green-600 px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-gradient-to-r from-warm-green-500 to-terracotta-500 text-white px-6 py-3 rounded-xl font-medium hover:from-warm-green-600 hover:to-terracotta-600 transition-all min-h-[44px]"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Location */}
              {location && (
                <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-terracotta-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {location.city}
                  </span>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-warm-green-500 min-h-[44px] min-w-[44px]"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div id="mobile-menu" className="lg:hidden py-6 border-t border-gray-200">
              <nav className="flex flex-col gap-3" role="navigation" aria-label="Mobile navigation">
                <button
                  onClick={() => handleViewModeChange('discover')}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all text-left focus:outline-none focus:ring-2 focus:ring-warm-green-500 min-h-[52px] ${
                    viewMode === 'discover'
                      ? 'bg-warm-green-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={viewMode === 'discover' ? 'page' : undefined}
                >
                  <Sparkles className="w-6 h-6" />
                  <span className="text-lg">Discover Recipes</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('trending')}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all text-left focus:outline-none focus:ring-2 focus:ring-terracotta-500 min-h-[52px] ${
                    viewMode === 'trending'
                      ? 'bg-terracotta-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={viewMode === 'trending' ? 'page' : undefined}
                >
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-lg">Trending Recipes</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('ingredients')}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all text-left focus:outline-none focus:ring-2 focus:ring-muted-blue-500 min-h-[52px] ${
                    viewMode === 'ingredients'
                      ? 'bg-muted-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={viewMode === 'ingredients' ? 'page' : undefined}
                >
                  <ChefHat className="w-6 h-6" />
                  <span className="text-lg">Find by Ingredients</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('community')}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all text-left focus:outline-none focus:ring-2 focus:ring-light-lavender-500 min-h-[52px] ${
                    viewMode === 'community'
                      ? 'bg-light-lavender-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={viewMode === 'community' ? 'page' : undefined}
                >
                  <Users className="w-6 h-6" />
                  <span className="text-lg">Community Recipes</span>
                </button>

                {/* Mobile User Tools */}
                {user && (
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <button
                      onClick={() => {
                        setShowMealPlan(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-all text-left min-h-[52px]"
                    >
                      <Calendar className="w-6 h-6" />
                      <span className="text-lg">Meal Planning</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowShoppingList(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-all text-left min-h-[52px]"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      <span className="text-lg">Shopping Lists</span>
                    </button>
                  </div>
                )}

                {/* Mobile Auth */}
                {!user && (
                  <div className="pt-4 border-t border-gray-200 mt-4 space-y-3">
                    <button
                      onClick={() => {
                        handleAuthClick('signin');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-all text-left min-h-[52px]"
                    >
                      <LogIn className="w-6 h-6" />
                      <span className="text-lg">Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick('signup');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-warm-green-500 to-terracotta-500 text-white px-6 py-4 rounded-xl font-medium hover:from-warm-green-600 hover:to-terracotta-600 transition-all min-h-[52px]"
                    >
                      <span className="text-lg">Sign Up</span>
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {viewMode !== 'community' && (
          <div className="py-6">
            <SearchBar
              onSearch={handleSearch}
              onVoiceSearch={handleVoiceSearch}
              location={location ? `${location.city}, ${location.country}` : undefined}
              isListening={isListening}
            />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => handleViewModeChange('discover')}
            className={`flex flex-col items-center justify-center py-3 px-2 transition-all min-h-[60px] ${
              viewMode === 'discover'
                ? 'text-warm-green-600 bg-warm-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-current={viewMode === 'discover' ? 'page' : undefined}
          >
            <Sparkles className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Discover</span>
          </button>
          <button
            onClick={() => handleViewModeChange('trending')}
            className={`flex flex-col items-center justify-center py-3 px-2 transition-all min-h-[60px] ${
              viewMode === 'trending'
                ? 'text-terracotta-600 bg-terracotta-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-current={viewMode === 'trending' ? 'page' : undefined}
          >
            <TrendingUp className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Trending</span>
          </button>
          <button
            onClick={() => handleViewModeChange('ingredients')}
            className={`flex flex-col items-center justify-center py-3 px-2 transition-all min-h-[60px] ${
              viewMode === 'ingredients'
                ? 'text-muted-blue-600 bg-muted-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-current={viewMode === 'ingredients' ? 'page' : undefined}
          >
            <ChefHat className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Ingredients</span>
          </button>
          <button
            onClick={() => handleViewModeChange('community')}
            className={`flex flex-col items-center justify-center py-3 px-2 transition-all min-h-[60px] ${
              viewMode === 'community'
                ? 'text-light-lavender-600 bg-light-lavender-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-current={viewMode === 'community' ? 'page' : undefined}
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Community</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voice Status */}
        {transcript && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-warm-green-500 to-terracotta-500 p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Voice Command Recognized:</p>
                <p className="text-lg font-semibold text-gray-900">"{transcript}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Hero Section for Discover Mode */}
        {viewMode === 'discover' && !searchQuery && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-warm-green-500 via-terracotta-500 to-soft-brown-500 rounded-3xl p-8 lg:p-12 text-white mb-8 relative overflow-hidden shadow-xl">
              <div className="relative z-10 max-w-4xl">
                <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                  Discover Culinary Magic
                </h2>
                <p className="text-xl text-white/95 mb-8 leading-relaxed max-w-3xl">
                  Explore {allRecipes.length}+ organic recipes from around the world with AI-powered voice assistance, 
                  personalized recommendations, and step-by-step guidance.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <span className="font-semibold">{allRecipes.length}+ Recipes</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <span className="font-semibold">AI Voice Assistant</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <span className="font-semibold">{getCuisineStats().length} Cuisines</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <span className="font-semibold">Video Tutorials</span>
                  </div>
                  {user && (
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                      <span className="font-semibold">Personal Profile</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
            </div>

            {/* Enhanced Quick Access Cards */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-warm-green-500 to-muted-blue-500 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Quick & Easy</h3>
                </div>
                <p className="text-gray-600 mb-4">Ready in 30 minutes or less</p>
                <div className="grid grid-cols-2 gap-3">
                  {getQuickRecipes().map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleRecipeSelect(recipe)}
                      className="text-left p-3 bg-warm-green-50 rounded-xl hover:bg-warm-green-100 transition-colors border border-warm-green-200 focus:outline-none focus:ring-2 focus:ring-warm-green-500"
                    >
                      <div className="font-medium text-sm text-gray-900 truncate">{recipe.title}</div>
                      <div className="text-xs text-warm-green-600 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {recipe.cookTime}m
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-terracotta-500 to-dusty-pink-500 p-3 rounded-xl">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Top Rated</h3>
                </div>
                <p className="text-gray-600 mb-4">Highest rated by our community</p>
                <div className="grid grid-cols-2 gap-3">
                  {getTrendingRecipes().slice(0, 4).map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleRecipeSelect(recipe)}
                      className="text-left p-3 bg-terracotta-50 rounded-xl hover:bg-terracotta-100 transition-colors border border-terracotta-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    >
                      <div className="font-medium text-sm text-gray-900 truncate">{recipe.title}</div>
                      <div className="flex items-center gap-1 text-xs text-terracotta-600">
                        <Star className="w-3 h-3 fill-current text-creamy-yellow-400" />
                        {recipe.rating}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-muted-blue-500 to-light-lavender-500 p-3 rounded-xl">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Global Cuisines</h3>
                </div>
                <p className="text-gray-600 mb-4">Explore flavors from around the world</p>
                <div className="space-y-2">
                  {getCuisineStats().slice(0, 4).map(([cuisine, count]) => (
                    <button
                      key={cuisine}
                      onClick={() => handleSearch(cuisine)}
                      className="w-full text-left p-2 bg-muted-blue-50 rounded-xl hover:bg-muted-blue-100 transition-colors border border-muted-blue-200 focus:outline-none focus:ring-2 focus:ring-muted-blue-500"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-900">{cuisine}</span>
                        <span className="text-xs text-muted-blue-600 bg-muted-blue-200 px-2 py-1 rounded-full">{count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Loading */}
        {locationLoading && viewMode === 'discover' && (
          <SearchResultsSkeleton />
        )}

        {/* Recipe Results */}
        {viewMode === 'community' ? (
          <CommunityRecipes
            onRecipeSelect={handleRecipeSelect}
            onRecipesUpdate={handleRecipesUpdate}
            allRecipes={allRecipes}
          />
        ) : (
          <>
            {/* Ingredient Selector */}
            {viewMode === 'ingredients' && (
              <IngredientSelector
                onRecipesFound={setFilteredRecipes}
                allRecipes={allRecipes}
                showLocalSuggestions={showLocalSuggestions}
                location={location ? `${location.city}, ${location.country}` : undefined}
              />
            )}

            {/* Results Header */}
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {viewMode === 'trending' 
                  ? 'Trending Recipes'
                  : viewMode === 'ingredients' 
                    ? 'Recipe Suggestions'
                    : searchQuery 
                      ? `Search Results for "${searchQuery}"` 
                      : location && showLocalSuggestions
                        ? `Popular in ${location.city}` 
                        : 'Discover Amazing Recipes'
                }
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="text-lg font-medium">
                  {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                </span>
                {viewMode === 'trending' && (
                  <span className="bg-gradient-to-r from-terracotta-100 to-dusty-pink-100 text-terracotta-700 px-3 py-1 rounded-full text-sm font-medium border border-terracotta-200">
                    Highly Rated
                  </span>
                )}
              </div>
            </div>

            {/* Recipe Grid */}
            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={handleRecipeSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white rounded-3xl p-12 shadow-lg max-w-md mx-auto border border-gray-200">
                  <ChefHat className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-4">No recipes found</h3>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    {viewMode === 'ingredients' 
                      ? 'Try selecting different ingredients or add more to find matching recipes'
                      : 'Try searching for something else or use voice commands'
                    }
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilteredRecipes(allRecipes);
                    }}
                    className="bg-gradient-to-r from-warm-green-500 to-terracotta-500 hover:from-warm-green-600 hover:to-terracotta-600 text-white font-semibold py-3 px-6 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-warm-green-500 focus:ring-offset-2"
                  >
                    Show All Recipes
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt 
        onInstall={() => console.log('App installed successfully!')}
        onDismiss={() => console.log('Install prompt dismissed')}
      />

      {/* Enhanced Voice Assistant Button */}
      <VoiceButton
        isListening={isListening}
        isSpeaking={isSpeaking}
        onToggleListening={handleVoiceSearch}
        onStopSpeaking={stopSpeaking}
        disabled={!isSupported}
      />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />

      <MealPlanCalendar
        isOpen={showMealPlan}
        onClose={() => setShowMealPlan(false)}
      />

      <ShoppingListView
        isOpen={showShoppingList}
        onClose={() => setShowShoppingList(false)}
      />
    </div>
  );
}

export default App;