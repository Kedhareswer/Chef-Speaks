import React, { useState, useEffect } from 'react';
import { Plus, X, ChefHat, Sparkles, MapPin, Search, Filter, Zap, Loader, AlertCircle, Mic } from 'lucide-react';
import { commonIngredients, suggestPairings } from '../data/ingredients';
import { Recipe } from '../types';
import { spoonacularService } from '../services/spoonacularService';
import { recipeService } from '../services/recipeService';
import { shoppingListService } from '../services/shoppingListService';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useEnhancedSpeechSynthesis } from '../hooks/useEnhancedSpeechSynthesis';
import { parseVoiceCommand } from '../utils/voiceCommands';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

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
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { speak } = useEnhancedSpeechSynthesis();
  
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedPairings, setSuggestedPairings] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [useSpoonacular, setUseSpoonacular] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Voice recognition and state
  const voiceRecognition = useVoiceRecognition(i18n.language);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [conversationContext, setConversationContext] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [voicePreferences, setVoicePreferences] = useState<{
    dietary: string[];
    cookTime?: number;
    difficulty?: string;
    mealType?: string;
  }>({ dietary: [] });
  
  // Shopping list state
  const [isCreatingShoppingList, setIsCreatingShoppingList] = useState(false);
  


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

  // Handle voice commands
  useEffect(() => {
    if (voiceRecognition.transcript) {
      const command = parseVoiceCommand(voiceRecognition.transcript);
      setVoiceStatus(command.message || '');
      
      // Handle ingredients action
      if (command.action === 'ingredients' && command.ingredients) {
        // Add detected ingredients to selection
        const newIngredients = command.ingredients.filter(
          ingredient => !selectedIngredients.includes(ingredient)
        );
        
        if (newIngredients.length > 0) {
          setSelectedIngredients(prev => [...prev, ...newIngredients]);
          
          // Store voice preferences
          setVoicePreferences({
            dietary: command.dietaryRestrictions || [],
            cookTime: command.cookTime,
            difficulty: command.difficulty,
            mealType: command.mealType
          });
          
          setVoiceStatus(t('voice.ingredientsAdded', { 
            ingredients: newIngredients.join(', '),
            defaultValue: `Added ${newIngredients.join(', ')} to your ingredients`
          }));
        } else {
          setVoiceStatus(t('voice.ingredientsAlreadySelected', {
            defaultValue: 'Those ingredients are already selected'
          }));
        }
        
        // Set follow-up question and conversation context
        if (command.followUpQuestion) {
          setFollowUpQuestion(command.followUpQuestion);
          setConversationContext(command.conversationContext || 'ingredient_search');
        }
      }
      
      // Handle conversation action (meal planning)
      else if (command.action === 'conversation') {
        setConversationContext(command.conversationContext || 'meal_planning');
        setFollowUpQuestion(command.followUpQuestion || null);
        
        // Store preferences from conversation
        setVoicePreferences({
          dietary: command.dietaryRestrictions || [],
          cookTime: command.cookTime,
          difficulty: command.difficulty,
          mealType: command.mealType
        });
        
        // Add any mentioned ingredients
        if (command.ingredients && command.ingredients.length > 0) {
          const newIngredients = command.ingredients.filter(
            ingredient => !selectedIngredients.includes(ingredient)
          );
          if (newIngredients.length > 0) {
            setSelectedIngredients(prev => [...prev, ...newIngredients]);
          }
        }
      }
      
      // Handle filter action (dietary restrictions, time-based, flavor-based)
      else if (command.action === 'filter') {
        setVoicePreferences(prev => ({
          ...prev,
          dietary: [...prev.dietary, ...(command.dietaryRestrictions || [])],
          cookTime: command.cookTime || prev.cookTime,
          difficulty: command.difficulty || prev.difficulty,
          mealType: command.mealType || prev.mealType
        }));
        
        setConversationContext(command.conversationContext || null);
        setFollowUpQuestion(command.followUpQuestion || null);
        
        // Add any mentioned ingredients
        if (command.ingredients && command.ingredients.length > 0) {
          const newIngredients = command.ingredients.filter(
            ingredient => !selectedIngredients.includes(ingredient)
          );
          if (newIngredients.length > 0) {
            setSelectedIngredients(prev => [...prev, ...newIngredients]);
          }
        }
        
        // Apply filters to search
        applyVoiceFilters(command);
      }
      
      // Handle shopping list actions
      else if (command.action === 'shopping_list') {
        handleShoppingListCommand(command);
      }
      
      // Handle recipe narration actions
      else if (command.action === 'recipe_narration') {
        handleRecipeNarrationCommand(command);
      }
      
      // Clear status and follow-up after 5 seconds
      setTimeout(() => {
        setVoiceStatus('');
        setFollowUpQuestion(null);
        setConversationContext(null);
      }, 5000);
    }
  }, [voiceRecognition.transcript, selectedIngredients, t]);

  // Apply voice-based filters to recipe search
  const applyVoiceFilters = (command: any) => {
    // This function will be used to apply additional filters based on voice commands
    // For now, the filtering is handled by the existing ingredient selection logic
    console.log('Applying voice filters:', command);
  };

  // Handle shopping list voice commands
  const handleShoppingListCommand = async (command: any) => {
    if (!user) {
      setVoiceStatus('Please sign in to use shopping list features');
      speak('Please sign in to use shopping list features');
      return;
    }

    setIsCreatingShoppingList(true);
    
    try {
      if (command.shoppingListAction === 'add_missing') {
        // Find missing ingredients from current recipe results
        const currentRecipes = allRecipes.slice(0, 5); // Top 5 recipes
        if (currentRecipes.length > 0) {
          const missingIngredients = await findMissingIngredients(currentRecipes);
          if (missingIngredients.length > 0) {
            await addIngredientsToShoppingList(missingIngredients, 'Missing Ingredients');
            setVoiceStatus(`Added ${missingIngredients.length} missing ingredients to your shopping list`);
            speak(`Added ${missingIngredients.length} missing ingredients to your shopping list`);
          } else {
            setVoiceStatus('You have all the ingredients needed!');
            speak('You have all the ingredients needed!');
          }
        }
      }
      
      else if (command.shoppingListAction === 'create_from_recipe') {
        // Create shopping list from selected ingredients/recipes
        const currentRecipes = allRecipes.slice(0, 3); // Top 3 recipes
        if (currentRecipes.length > 0) {
          const listName = `Shopping List - ${new Date().toLocaleDateString()}`;
          const result = await shoppingListService.generateShoppingListFromRecipes(
            user.id, 
            currentRecipes.map(r => r.id), 
            listName
          );
          
          if (result) {
            setVoiceStatus(`Created shopping list with ${result.items.length} items`);
            speak(`Created shopping list with ${result.items.length} items from your selected recipes`);
          }
        }
      }
      
      else if (command.shoppingListAction === 'add_ingredients' && command.ingredients) {
        await addIngredientsToShoppingList(command.ingredients, 'Voice Added Items');
        setVoiceStatus(`Added ${command.ingredients.length} ingredients to your shopping list`);
        speak(`Added ${command.ingredients.join(', ')} to your shopping list`);
      }
      
    } catch (error) {
      console.error('Shopping list error:', error);
      setVoiceStatus('Sorry, there was an error with your shopping list');
      speak('Sorry, there was an error with your shopping list');
    } finally {
      setIsCreatingShoppingList(false);
    }
  };

  // Handle recipe narration voice commands
  const handleRecipeNarrationCommand = async (command: any) => {
    const currentRecipes = allRecipes.slice(0, 1); // Focus on top recipe
    
    if (currentRecipes.length === 0) {
      setVoiceStatus('No recipe selected for narration');
      speak('Please select a recipe first, then I can read it to you');
      return;
    }
    
    const recipe = currentRecipes[0];
    
    try {
      if (command.narrationAction === 'read_recipe') {
        await readCompleteRecipe(recipe);
      }
      else if (command.narrationAction === 'read_ingredients') {
        await readRecipeIngredients(recipe);
      }
      else if (command.narrationAction === 'read_instructions') {
        await readRecipeInstructions(recipe);
      }
      else if (command.narrationAction === 'read_nutrition') {
        await readRecipeNutrition(recipe);
      }
    } catch (error) {
      console.error('Recipe narration error:', error);
      setVoiceStatus('Sorry, there was an error reading the recipe');
      speak('Sorry, there was an error reading the recipe');
    }
  };

  // Helper functions for shopping list
  const findMissingIngredients = async (recipes: Recipe[]): Promise<string[]> => {
    const allRecipeIngredients = new Set<string>();
    
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        allRecipeIngredients.add(ingredient.toLowerCase().trim());
      });
    });
    
    const missing = Array.from(allRecipeIngredients).filter(ingredient => 
      !selectedIngredients.some(selected => 
        selected.toLowerCase().includes(ingredient) || 
        ingredient.includes(selected.toLowerCase())
      )
    );
    
    return missing.slice(0, 10); // Limit to 10 missing ingredients
  };

  const addIngredientsToShoppingList = async (ingredients: string[], listName: string) => {
    if (!user) return;
    
    const shoppingListItems = ingredients.map((ingredient, index) => ({
      id: `voice-${Date.now()}-${index}`,
      ingredient: ingredient,
      quantity: 1,
      unit: 'item',
      checked: false
    }));

    await shoppingListService.createShoppingList(user.id, listName, shoppingListItems);
  };

  // Helper functions for recipe narration
  const readCompleteRecipe = async (recipe: Recipe) => {
    const text = `
      Recipe: ${recipe.title}. 
      Description: ${recipe.description}. 
      Cook time: ${recipe.cookTime} minutes. 
      Serves ${recipe.servings} people. 
      Difficulty: ${recipe.difficulty}. 
      Cuisine: ${recipe.cuisine}.
      
      Ingredients: ${recipe.ingredients.join(', ')}.
      
      Instructions: ${recipe.instructions.join('. ')}
    `;
    
    setVoiceStatus('Reading complete recipe...');
    await speak(text, i18n.language);
  };

  const readRecipeIngredients = async (recipe: Recipe) => {
    const text = `
      Ingredients for ${recipe.title}: 
      ${recipe.ingredients.join(', ')}. 
      This recipe serves ${recipe.servings} people.
    `;
    
    setVoiceStatus('Reading ingredients...');
    await speak(text, i18n.language);
  };

  const readRecipeInstructions = async (recipe: Recipe) => {
    const text = `
      Cooking instructions for ${recipe.title}: 
      ${recipe.instructions.map((step, index) => `Step ${index + 1}: ${step}`).join('. ')}
    `;
    
    setVoiceStatus('Reading cooking instructions...');
    await speak(text, i18n.language);
  };

  const readRecipeNutrition = async (recipe: Recipe) => {
    const text = `
      Nutritional information for ${recipe.title}: 
      This ${recipe.difficulty} ${recipe.cuisine} recipe takes ${recipe.cookTime} minutes to cook.
      It's rated ${recipe.rating || 'not rated'} out of 5 stars.
    `;
    
    setVoiceStatus('Reading nutritional information...');
    await speak(text, i18n.language);
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

  // Voice Preferences Tags Component
  const VoicePreferencesTags: React.FC<{
    preferences: {
      dietary: string[];
      cookTime?: number;
      difficulty?: string;
      mealType?: string;
    };
  }> = ({ preferences }) => {
    if (!preferences.dietary.length && !preferences.cookTime && !preferences.difficulty && !preferences.mealType) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {preferences.dietary.map(diet => (
          <span key={diet} className="px-3 py-1.5 bg-light-lavender-100 text-light-lavender-700 rounded-full text-sm font-medium">
            {diet}
          </span>
        ))}
        {preferences.cookTime && (
          <span className="px-3 py-1.5 bg-dusty-pink-100 text-dusty-pink-700 rounded-full text-sm font-medium">
            Under {preferences.cookTime} min
          </span>
        )}
        {preferences.difficulty && (
          <span className="px-3 py-1.5 bg-warm-green-100 text-warm-green-700 rounded-full text-sm font-medium">
            {preferences.difficulty}
          </span>
        )}
        {preferences.mealType && (
          <span className="px-3 py-1.5 bg-muted-blue-100 text-muted-blue-700 rounded-full text-sm font-medium">
            {preferences.mealType}
          </span>
        )}
      </div>
    );
  };

  // Voice Suggestions Component
  const VoiceSuggestions: React.FC<{
    context: string | null;
    isListening: boolean;
  }> = ({ context, isListening }) => {
    if (!isListening || !context) return null;

    return (
      <div className="mt-2 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-warm-green-100">
        <p className="text-sm text-gray-600">
          {context === 'ingredients' ? (
            'Try saying: "Add tomatoes" or "Remove onions"'
          ) : context === 'shopping_list' ? (
            'Try saying: "Create shopping list" or "Add all to cart"'
          ) : context === 'recipe_narration' ? (
            'Try saying: "Read recipe" or "Read ingredients"'
          ) : (
            'Try saying: "Search recipes" or "Start over"'
          )}
        </p>
      </div>
    );
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

      {isExpanded && (
        <>
          {/* Search Input */}
          <div className="mb-8">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-soft-brown-400 w-6 h-6 group-focus-within:text-warm-green-500 transition-colors pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('ingredientSelector.searchPlaceholder', { defaultValue: 'Search for ingredients...' })}
                className="w-full pl-16 pr-24 py-5 text-lg glass-organic backdrop-blur-organic rounded-[2rem] shadow-soft-xl border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-warm-green-500/20 focus:border-warm-green-500 transition-all placeholder-soft-brown-400 min-h-[64px] font-medium"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
              
              {/* Voice Search Button */}
              {voiceRecognition.isSupported && (
                <button
                  onClick={voiceRecognition.isListening ? voiceRecognition.stopListening : voiceRecognition.startListening}
                  className={`
                    absolute right-3 top-1/2 transform -translate-y-1/2 p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg min-h-[48px] min-w-[48px]
                    ${voiceRecognition.isListening 
                      ? 'bg-gradient-to-r from-terracotta-500 to-dusty-pink-500 text-white animate-soft-pulse shadow-terracotta-500/30' 
                      : 'bg-gradient-to-r from-warm-green-500 via-terracotta-500 to-soft-brown-500 hover:from-warm-green-600 hover:via-terracotta-600 hover:to-soft-brown-600 text-white shadow-warm-green-500/30'
                    }
                  `}
                  title={voiceRecognition.isListening ? 
                    t('voice.stopListening', { defaultValue: 'Stop listening' }) : 
                    t('voice.startListening', { defaultValue: 'Start voice search' })
                  }
                >
                  <Mic className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Voice Status, Preferences, and Suggestions */}
            {voiceStatus && (
              <div className="mt-4 p-4 bg-gradient-to-r from-warm-green-50 to-muted-blue-50 rounded-3xl border border-warm-green-200">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-r from-warm-green-500 to-muted-blue-500 p-3 rounded-2xl">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-warm-green-800 font-medium">{voiceStatus}</p>
                    <VoicePreferencesTags preferences={voicePreferences} />
                  </div>
                </div>
              </div>
            )}
            <VoiceSuggestions 
              context={conversationContext}
              isListening={voiceRecognition.isListening}
            />
            {followUpQuestion && (
              <div className="mt-2 p-3 bg-warm-green-50/80 backdrop-blur-sm rounded-lg shadow-sm">
                <p className="text-sm text-warm-green-700">{followUpQuestion}</p>
              </div>
            )}
          </div>

          {/* Category Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all transform hover:scale-105
                    ${activeCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-soft-xl`
                      : 'bg-soft-brown-50/80 text-soft-brown-700 hover:bg-soft-brown-100/80 shadow-soft border border-soft-brown-200/50'
                    }
                  `}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Ingredients */}
          {selectedIngredients.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-warm-green-50/50 to-muted-blue-50/50 rounded-3xl border border-warm-green-200/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-soft-brown-800 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-warm-green-500" />
                Selected Ingredients ({selectedIngredients.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {selectedIngredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="bg-gradient-to-r from-warm-green-100 to-muted-blue-100 text-warm-green-800 px-4 py-2 rounded-xl font-medium flex items-center gap-2 border border-warm-green-200/50 shadow-soft group hover:shadow-soft-lg transition-all"
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="opacity-50 group-hover:opacity-100 hover:bg-warm-green-200/50 rounded-full p-1 transition-all"
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
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-light-lavender-500" />
                <h3 className="text-lg font-semibold text-soft-brown-800">AI Suggested Pairings</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {suggestedPairings.map((pairing) => (
                  <button
                    key={pairing}
                    onClick={() => addIngredient(pairing)}
                    className="bg-gradient-to-r from-light-lavender-50 to-dusty-pink-50 text-light-lavender-700 px-4 py-2.5 rounded-xl font-medium hover:from-light-lavender-100 hover:to-dusty-pink-100 transition-all flex items-center gap-2 border border-light-lavender-200/50 shadow-soft hover:shadow-soft-lg transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    {pairing}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ingredient Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredIngredients.slice(0, 20).map((ingredient) => (
              <button
                key={ingredient.name}
                onClick={() => addIngredient(ingredient.name)}
                className="glass-organic hover:bg-creamy-yellow-50/80 text-soft-brown-700 p-4 rounded-2xl transition-all flex items-center gap-3 text-sm font-medium border border-soft-brown-200/50 hover:border-soft-brown-300/50 hover:shadow-soft-lg transform hover:scale-105 group"
              >
                <div className="bg-warm-green-100 text-warm-green-600 p-2 rounded-xl group-hover:bg-warm-green-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="truncate">{ingredient.name}</span>
              </button>
            ))}
          </div>

          {filteredIngredients.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-soft-brown-50 rounded-2xl text-soft-brown-600">
                <Search className="w-5 h-5 text-soft-brown-400" />
                <p className="font-medium">No ingredients found matching "{searchTerm}"</p>
              </div>
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
                {isSearching || isCreatingShoppingList ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {isCreatingShoppingList ? 'Creating shopping list...' : 'Searching for recipes...'}
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