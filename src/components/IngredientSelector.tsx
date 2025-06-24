import React, { useState, useEffect } from 'react';
import { Plus, X, ChefHat, Sparkles, MapPin, Search, Filter, Zap, Loader, AlertCircle } from 'lucide-react';
import { commonIngredients, suggestPairings } from '../data/ingredients';
import { Recipe } from '../types';
import { spoonacularService } from '../services/spoonacularService';
import { recipeService } from '../services/recipeService';

interface IngredientSelectorProps {
  onRecipesFound: (recipes: Recipe[]) => void;
  allRecipes: Recipe[];
  showLocalSuggestions: boolean;
  location?: string;
}

export const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  onRecipesFound,
  allRecipes,
  showLocalSuggestions,
  location
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedPairings, setSuggestedPairings] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [useSpoonacular, setUseSpoonacular] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️', color: 'from-soft-brown-500 to-soft-brown-600' },
    { id: 'protein', name: 'Protein', icon: '🥩', color: 'from-terracotta-500 to-terracotta-600' },
    { id: 'vegetable', name: 'Vegetables', icon: '🥕', color: 'from-warm-green-500 to-warm-green-600' },
    { id: 'grain', name: 'Grains', icon: '🌾', color: 'from-creamy-yellow-500 to-creamy-yellow-600' },
    { id: 'dairy', name: 'Dairy', icon: '🧀', color: 'from-muted-blue-500 to-muted-blue-600' },
    { id: 'spice', name: 'Spices', icon: '🌶️', color: 'from-dusty-pink-500 to-dusty-pink-600' },
    { id: 'other', name: 'Other', icon: '🥄', color: 'from-light-lavender-500 to-light-lavender-600' }
  ];

  // Check API availability on mount
  useEffect(() => {
    checkApiAvailability();
  }, []);

  const checkApiAvailability = async () => {
    try {
      const available = await spoonacularService.checkApiAvailability();
      setApiAvailable(available);
      if (!available) {
        setUseSpoonacular(false);
      }
    } catch (error) {
      console.error('Error checking API availability:', error);
      setApiAvailable(false);
      setUseSpoonacular(false);
    }
  };

  useEffect(() => {
    if (selectedIngredients.length > 0) {
      const pairings = suggestPairings(selectedIngredients);
      setSuggestedPairings(pairings.slice(0, 8));
      findMatchingRecipes();
    } else {
      setSuggestedPairings([]);
      onRecipesFound(allRecipes);
      setSearchError(null);
    }
  }, [selectedIngredients, allRecipes, onRecipesFound, useSpoonacular]);

  const findMatchingRecipes = async () => {
    if (selectedIngredients.length === 0) {
      onRecipesFound(allRecipes);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      let matchingRecipes: Recipe[] = [];

      if (useSpoonacular && apiAvailable) {
        console.log('Using Spoonacular API for ingredient search...');
        
        // Use Spoonacular API for ingredient-based search
        const spoonacularRecipes = await spoonacularService.findRecipesByIngredients(
          selectedIngredients,
          12
        );

        if (spoonacularRecipes.length > 0) {
          // Convert Spoonacular recipes to our Recipe format
          matchingRecipes = spoonacularRecipes.map(spRecipe => ({
            id: `spoonacular-${spRecipe.id}`,
            title: spRecipe.title,
            description: spRecipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'Delicious recipe found with your ingredients',
            ingredients: spRecipe.extendedIngredients?.map(ing => ing.original) || [],
            instructions: spRecipe.instructions ? 
              spRecipe.instructions.split(/\d+\./).filter(step => step.trim()).map(step => step.trim()) : 
              ['Instructions available on source website'],
            cookTime: spRecipe.readyInMinutes || 30,
            servings: spRecipe.servings || 4,
            difficulty: spRecipe.readyInMinutes <= 30 ? 'Easy' : spRecipe.readyInMinutes <= 60 ? 'Medium' : 'Hard',
            cuisine: spRecipe.cuisines?.[0] || 'International',
            imageUrl: spRecipe.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
            videoUrl: undefined,
            tags: [...(spRecipe.dishTypes || []), ...(spRecipe.diets || [])],
            rating: 4.5, // Default rating for Spoonacular recipes
            totalRatings: 50,
            isUserGenerated: false
          }));

          console.log(`Found ${matchingRecipes.length} recipes from Spoonacular`);
        }

        // Also search local recipes as fallback
        const localRecipes = await recipeService.getRecipesByIngredients(selectedIngredients);
        
        // Combine and deduplicate
        const combinedRecipes = [...matchingRecipes, ...localRecipes];
        const uniqueRecipes = combinedRecipes.filter((recipe, index, self) => 
          index === self.findIndex(r => r.title.toLowerCase() === recipe.title.toLowerCase())
        );

        matchingRecipes = uniqueRecipes;
      } else {
        console.log('Using local database for ingredient search...');
        // Use local database only
        matchingRecipes = await recipeService.getRecipesByIngredients(selectedIngredients);
      }

      // Sort by relevance (number of matching ingredients)
      matchingRecipes.sort((a, b) => {
        const aMatches = selectedIngredients.filter(ingredient =>
          a.ingredients.join(' ').toLowerCase().includes(ingredient.toLowerCase())
        ).length;
        const bMatches = selectedIngredients.filter(ingredient =>
          b.ingredients.join(' ').toLowerCase().includes(ingredient.toLowerCase())
        ).length;
        
        if (aMatches !== bMatches) return bMatches - aMatches;
        return (b.rating || 0) - (a.rating || 0);
      });

      onRecipesFound(matchingRecipes);
      
      if (matchingRecipes.length === 0) {
        setSearchError('No recipes found with these ingredients. Try different combinations or add more ingredients.');
      }
    } catch (error) {
      console.error('Error finding recipes by ingredients:', error);
      setSearchError('Error searching for recipes. Please try again.');
      
      // Fallback to local search
      try {
        const localRecipes = await recipeService.getRecipesByIngredients(selectedIngredients);
        onRecipesFound(localRecipes);
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        onRecipesFound([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const addIngredient = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setSearchTerm('');
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
  };

  const filteredIngredients = commonIngredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || ingredient.category === activeCategory;
    const notSelected = !selectedIngredients.includes(ingredient.name);
    return matchesSearch && matchesCategory && notSelected;
  });

  const clearAll = () => {
    setSelectedIngredients([]);
    setSearchTerm('');
    setActiveCategory('all');
    setSearchError(null);
  };

  return (
    <div className="glass-organic backdrop-blur-organic rounded-5xl shadow-soft-xl p-8 mb-8 border border-terracotta-200/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-warm-green-500 to-muted-blue-500 p-3 rounded-4xl shadow-green animate-organic-float">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-soft-brown-900">Smart Ingredient Finder</h2>
            <p className="text-soft-brown-600">Select ingredients to discover perfect recipe matches</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* API Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            apiAvailable ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${apiAvailable ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            {apiAvailable ? 'Enhanced Search Active' : 'Local Search Only'}
          </div>
          
          {/* Spoonacular Toggle */}
          {apiAvailable && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-soft-brown-700">Enhanced Search</label>
              <button
                onClick={() => setUseSpoonacular(!useSpoonacular)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useSpoonacular ? 'bg-warm-green-500' : 'bg-soft-brown-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useSpoonacular ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
          
          {selectedIngredients.length > 0 && (
            <button
              onClick={clearAll}
              className="text-terracotta-600 hover:text-terracotta-700 font-medium text-sm bg-terracotta-50 px-3 py-2 rounded-3xl border border-terracotta-200 hover:bg-terracotta-100 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-soft-brown-100 hover:bg-soft-brown-200 text-soft-brown-700 px-4 py-2 rounded-3xl font-medium transition-colors border border-soft-brown-200"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Location indicator */}
      {showLocalSuggestions && location && (
        <div className="flex items-center gap-2 mb-6 p-4 bg-gradient-to-r from-creamy-yellow-50 to-warm-green-50 rounded-4xl border border-creamy-yellow-200">
          <MapPin className="w-5 h-5 text-terracotta-500" />
          <span className="text-sm font-medium text-soft-brown-700">
            {useSpoonacular && apiAvailable ? 'Enhanced search with global recipes' : `Showing recipes popular in ${location}`}
          </span>
        </div>
      )}

      {/* Error Message */}
      {searchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-3xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{searchError}</p>
        </div>
      )}

      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-soft-brown-800 mb-3 flex items-center gap-2">
            <Filter className="w-5 h-5 text-warm-green-500" />
            Selected Ingredients ({selectedIngredients.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {selectedIngredients.map((ingredient) => (
              <span
                key={ingredient}
                className="bg-gradient-to-r from-warm-green-100 to-muted-blue-100 text-warm-green-800 px-4 py-2 rounded-pill font-medium flex items-center gap-2 border border-warm-green-200 shadow-soft"
              >
                {ingredient}
                <button
                  onClick={() => removeIngredient(ingredient)}
                  className="hover:bg-warm-green-200 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Pairings */}
      {suggestedPairings.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-light-lavender-500" />
            <h3 className="text-lg font-semibold text-soft-brown-800">AI Suggested Pairings</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {suggestedPairings.map((pairing) => (
              <button
                key={pairing}
                onClick={() => addIngredient(pairing)}
                className="bg-gradient-to-r from-light-lavender-50 to-dusty-pink-50 text-light-lavender-700 px-4 py-2 rounded-pill font-medium hover:from-light-lavender-100 hover:to-dusty-pink-100 transition-all flex items-center gap-2 border border-light-lavender-200 shadow-soft hover:shadow-soft-lg transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                {pairing}
              </button>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <>
          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-soft-brown-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for ingredients..."
                className="w-full pl-12 pr-4 py-3 border-2 border-soft-brown-200 rounded-4xl focus:outline-none focus:ring-4 focus:ring-warm-green-500/20 focus:border-warm-green-500 transition-all glass-organic backdrop-blur-organic"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-3xl font-medium transition-all transform hover:scale-105 ${
                    activeCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-soft-lg`
                      : 'bg-creamy-yellow-50/80 text-soft-brown-700 hover:bg-creamy-yellow-100/80 shadow-soft border border-soft-brown-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredient Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredIngredients.slice(0, 20).map((ingredient) => (
              <button
                key={ingredient.name}
                onClick={() => addIngredient(ingredient.name)}
                className="glass-organic hover:bg-creamy-yellow-50 text-soft-brown-700 px-4 py-3 rounded-3xl transition-all flex items-center gap-2 text-sm font-medium border border-soft-brown-200 hover:border-soft-brown-300 hover:shadow-soft-lg transform hover:scale-105"
              >
                <Plus className="w-4 h-4 text-warm-green-500" />
                {ingredient.name}
              </button>
            ))}
          </div>

          {filteredIngredients.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-soft-brown-500">No ingredients found matching "{searchTerm}"</p>
            </div>
          )}
        </>
      )}

      {/* Results Summary */}
      {selectedIngredients.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-warm-green-50 to-muted-blue-50 rounded-4xl border border-warm-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warm-green-800 font-semibold flex items-center gap-2">
                {isSearching ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Searching for recipes...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Found recipes using {selectedIngredients.length} ingredient{selectedIngredients.length !== 1 ? 's' : ''}
                  </>
                )}
              </p>
              <p className="text-warm-green-600 text-sm mt-1">
                {useSpoonacular && apiAvailable
                  ? 'Using enhanced search with global recipe database'
                  : `Showing recipes with at least ${Math.max(1, Math.floor(selectedIngredients.length * 0.4))} matching ingredients`
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-warm-green-600">
                {Math.round((selectedIngredients.length / commonIngredients.length) * 100)}%
              </div>
              <div className="text-xs text-warm-green-600">Match Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};