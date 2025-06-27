import { Recipe } from '../types';
import { commonIngredients } from '../data/ingredients';

export interface VoiceCommandResult {
  action: 'search' | 'filter' | 'navigate' | 'help' | 'ingredients' | 'conversation' | 'shopping_list' | 'recipe_narration' | 'unknown';
  query?: string;
  cuisine?: string;
  difficulty?: string;
  cookTime?: number;
  ingredients?: string[];
  dietaryRestrictions?: string[];
  mealType?: string;
  servings?: number;
  quantities?: { [ingredient: string]: string };
  followUpQuestion?: string;
  conversationContext?: string;
  shoppingListAction?: 'add_missing' | 'create_from_recipe' | 'add_ingredients';
  recipeId?: string;
  narrationAction?: 'read_recipe' | 'read_ingredients' | 'read_instructions' | 'read_nutrition';
  message?: string;
}

export const parseVoiceCommand = (transcript: string): VoiceCommandResult => {
  const lowercaseTranscript = transcript.toLowerCase().trim();
  
  // Advanced ingredient-based search with quantities and preferences
  if (lowercaseTranscript.includes('with') || 
      lowercaseTranscript.includes('using') || 
      lowercaseTranscript.includes('ingredients') ||
      lowercaseTranscript.includes('i have') ||
      lowercaseTranscript.includes('got') ||
      lowercaseTranscript.includes('available')) {
    
    const ingredients = extractIngredients(lowercaseTranscript);
    const quantities = extractQuantities(lowercaseTranscript);
    const preferences = extractPreferences(lowercaseTranscript);
    
    if (ingredients.length > 0) {
      let message = `Finding recipes with ${ingredients.join(', ')}`;
      
      // Add preference context
      if (preferences.dietary.length > 0) {
        message += ` (${preferences.dietary.join(', ')})`;
      }
      if (preferences.cookTime) {
        message += ` in under ${preferences.cookTime} minutes`;
      }
      if (preferences.difficulty) {
        message += ` - ${preferences.difficulty} recipes`;
      }
      
      return { 
        action: 'ingredients', 
        ingredients, 
        quantities,
        dietaryRestrictions: preferences.dietary,
        cookTime: preferences.cookTime,
        difficulty: preferences.difficulty,
        mealType: preferences.mealType,
        followUpQuestion: generateFollowUpQuestion(ingredients, preferences),
        message 
      };
    }
  }
  
  // Smart meal planning queries
  if (lowercaseTranscript.includes('what can i make') ||
      lowercaseTranscript.includes('what should i cook') ||
      lowercaseTranscript.includes('meal ideas') ||
      lowercaseTranscript.includes('dinner ideas') ||
      lowercaseTranscript.includes('breakfast ideas') ||
      lowercaseTranscript.includes('lunch ideas')) {
    
    const mealType = extractMealType(lowercaseTranscript);
    const preferences = extractPreferences(lowercaseTranscript);
    const availableIngredients = extractIngredients(lowercaseTranscript);
    
    return {
      action: 'conversation',
      mealType,
      ingredients: availableIngredients,
      dietaryRestrictions: preferences.dietary,
      cookTime: preferences.cookTime,
      difficulty: preferences.difficulty,
      conversationContext: 'meal_planning',
      followUpQuestion: "What ingredients do you have available in your kitchen?",
      message: `Looking for ${mealType || 'meal'} ideas. Tell me what ingredients you have!`
    };
  }
  
  // Dietary restriction and allergy handling
  if (lowercaseTranscript.includes('allergic') ||
      lowercaseTranscript.includes('allergy') ||
      lowercaseTranscript.includes('vegan') ||
      lowercaseTranscript.includes('vegetarian') ||
      lowercaseTranscript.includes('gluten free') ||
      lowercaseTranscript.includes('dairy free') ||
      lowercaseTranscript.includes('keto') ||
      lowercaseTranscript.includes('paleo')) {
    
    const restrictions = extractDietaryRestrictions(lowercaseTranscript);
    const ingredients = extractIngredients(lowercaseTranscript);
    
    return {
      action: 'filter',
      dietaryRestrictions: restrictions,
      ingredients,
      conversationContext: 'dietary_filtering',
      followUpQuestion: ingredients.length === 0 ? "What ingredients would you like to use?" : undefined,
      message: `Finding ${restrictions.join(' and ')} recipes${ingredients.length > 0 ? ` with ${ingredients.join(', ')}` : ''}`
    };
  }
  
  // Time-based cooking queries
  if (lowercaseTranscript.includes('quick') ||
      lowercaseTranscript.includes('fast') ||
      lowercaseTranscript.includes('minutes') ||
      lowercaseTranscript.includes('hours') ||
      lowercaseTranscript.includes('in a hurry') ||
      lowercaseTranscript.includes('short on time')) {
    
    const cookTime = extractCookTime(lowercaseTranscript);
    const ingredients = extractIngredients(lowercaseTranscript);
    
    return {
      action: 'filter',
      cookTime,
      ingredients,
      conversationContext: 'time_based',
      followUpQuestion: ingredients.length === 0 ? "What ingredients do you have?" : undefined,
      message: `Finding recipes that take ${cookTime || 30} minutes or less${ingredients.length > 0 ? ` using ${ingredients.join(', ')}` : ''}`
    };
  }
  
  // Cuisine and flavor preference queries
  if (lowercaseTranscript.includes('spicy') ||
      lowercaseTranscript.includes('mild') ||
      lowercaseTranscript.includes('sweet') ||
      lowercaseTranscript.includes('savory') ||
      lowercaseTranscript.includes('healthy') ||
      lowercaseTranscript.includes('comfort food')) {
    
    const flavorProfile = extractFlavorProfile(lowercaseTranscript);
    const cuisine = extractCuisine(lowercaseTranscript);
    const ingredients = extractIngredients(lowercaseTranscript);
    
    return {
      action: 'filter',
      query: flavorProfile,
      cuisine,
      ingredients,
      conversationContext: 'flavor_based',
      followUpQuestion: "Any specific ingredients you'd like me to focus on?",
      message: `Finding ${flavorProfile}${cuisine ? ` ${cuisine}` : ''} recipes${ingredients.length > 0 ? ` with ${ingredients.join(', ')}` : ''}`
    };
  }
  
  // Search commands
  if (lowercaseTranscript.includes('recipe for') || lowercaseTranscript.includes('how to make')) {
    const query = extractRecipeQuery(lowercaseTranscript);
    return { action: 'search', query, message: `Searching for ${query} recipes` };
  }

  // Cuisine filters
  const cuisine = extractCuisine(lowercaseTranscript);
  if (cuisine) {
    return { action: 'filter', cuisine, message: `Showing ${cuisine} recipes` };
  }

  // Difficulty filters
  if (lowercaseTranscript.includes('easy') || lowercaseTranscript.includes('simple')) {
    return { action: 'filter', difficulty: 'Easy', message: 'Showing easy recipes' };
  }

  // General search
  if (lowercaseTranscript.includes('find') || lowercaseTranscript.includes('search') || lowercaseTranscript.includes('show me')) {
    const query = extractGeneralQuery(lowercaseTranscript);
    return { action: 'search', query, message: `Searching for ${query}` };
  }

  // Shopping list commands
  if (lowercaseTranscript.includes('shopping list') ||
      lowercaseTranscript.includes('grocery list') ||
      lowercaseTranscript.includes('add to list') ||
      lowercaseTranscript.includes('missing ingredients') ||
      lowercaseTranscript.includes('need to buy')) {
    
    if (lowercaseTranscript.includes('missing') || lowercaseTranscript.includes('need')) {
      return {
        action: 'shopping_list',
        shoppingListAction: 'add_missing',
        message: 'Adding missing ingredients to your shopping list',
        followUpQuestion: 'Which recipe would you like to add missing ingredients for?'
      };
    }
    
    if (lowercaseTranscript.includes('create') || lowercaseTranscript.includes('make') || lowercaseTranscript.includes('from recipe')) {
      return {
        action: 'shopping_list',
        shoppingListAction: 'create_from_recipe',
        message: 'Creating shopping list from recipe',
        followUpQuestion: 'Which recipes would you like to include in your shopping list?'
      };
    }
    
    const ingredients = extractIngredients(lowercaseTranscript);
    if (ingredients.length > 0) {
      return {
        action: 'shopping_list',
        shoppingListAction: 'add_ingredients',
        ingredients,
        message: `Adding ${ingredients.join(', ')} to your shopping list`
      };
    }
    
    return {
      action: 'shopping_list',
      shoppingListAction: 'add_ingredients',
      message: 'What ingredients would you like to add to your shopping list?',
      followUpQuestion: 'Tell me the ingredients you need to buy'
    };
  }
  
  // Recipe narration commands
  if (lowercaseTranscript.includes('read') ||
      lowercaseTranscript.includes('tell me') ||
      lowercaseTranscript.includes('explain') ||
      lowercaseTranscript.includes('describe')) {
    
    if (lowercaseTranscript.includes('recipe') || lowercaseTranscript.includes('how to make')) {
      return {
        action: 'recipe_narration',
        narrationAction: 'read_recipe',
        message: 'Reading the complete recipe for you',
        followUpQuestion: 'Which recipe would you like me to read?'
      };
    }
    
    if (lowercaseTranscript.includes('ingredients') || lowercaseTranscript.includes('what do i need')) {
      return {
        action: 'recipe_narration',
        narrationAction: 'read_ingredients',
        message: 'Reading the ingredients list',
        followUpQuestion: 'Which recipe ingredients would you like me to read?'
      };
    }
    
    if (lowercaseTranscript.includes('instructions') || lowercaseTranscript.includes('steps') || lowercaseTranscript.includes('how to cook')) {
      return {
        action: 'recipe_narration',
        narrationAction: 'read_instructions',
        message: 'Reading the cooking instructions',
        followUpQuestion: 'Which recipe instructions would you like me to read?'
      };
    }
    
    if (lowercaseTranscript.includes('nutrition') || lowercaseTranscript.includes('calories') || lowercaseTranscript.includes('healthy')) {
      return {
        action: 'recipe_narration',
        narrationAction: 'read_nutrition',
        message: 'Reading the nutritional information',
        followUpQuestion: 'Which recipe nutrition would you like me to read?'
      };
    }
  }

  // Help commands
  if (lowercaseTranscript.includes('help') || lowercaseTranscript.includes('what can you do')) {
    return { 
      action: 'help', 
      message: 'I can help you find recipes, create shopping lists, and read recipes aloud! Try: "I have chicken and rice", "Add missing ingredients to shopping list", "Read me the recipe", or "What can I make for dinner?"' 
    };
  }

  // Default search with full transcript
  return { action: 'search', query: lowercaseTranscript, message: `Searching for ${lowercaseTranscript}` };
};

const extractIngredients = (transcript: string): string[] => {
  const foundIngredients: string[] = [];
  
  // Create a comprehensive list of ingredient names and synonyms
  const ingredientMap = new Map<string, string>();
  
  commonIngredients.forEach(ingredient => {
    const name = ingredient.name.toLowerCase();
    ingredientMap.set(name, ingredient.name);
    
    // Add common variations and synonyms
    if (name.includes('chicken breast')) {
      ingredientMap.set('chicken', ingredient.name);
    }
    if (name.includes('ground beef')) {
      ingredientMap.set('beef', ingredient.name);
      ingredientMap.set('meat', ingredient.name);
    }
    if (name.includes('bell peppers')) {
      ingredientMap.set('peppers', ingredient.name);
      ingredientMap.set('pepper', ingredient.name);
    }
  });
  
  // Additional common ingredient synonyms
  const extraSynonyms = {
    'tomato': 'tomatoes',
    'onion': 'onions',
    'mushroom': 'mushrooms',
    'carrot': 'carrots',
    'potato': 'potatoes',
    'cheese': 'cheese',
    'egg': 'eggs',
    'flour': 'flour',
    'sugar': 'sugar',
    'salt': 'salt',
    'oil': 'oil',
    'butter': 'butter',
    'milk': 'milk',
    'bread': 'bread',
    'noodles': 'pasta',
    'shrimp': 'shrimp',
    'fish': 'salmon',
    'beans': 'beans',
    'corn': 'corn',
    'lettuce': 'lettuce',
    'avocado': 'avocado'
  };
  
  Object.entries(extraSynonyms).forEach(([key, value]) => {
    ingredientMap.set(key, value);
  });
  
  // Check for ingredients in the transcript
  for (const [synonym, actualName] of ingredientMap) {
    if (transcript.includes(synonym) && !foundIngredients.includes(actualName)) {
      foundIngredients.push(actualName);
    }
  }
  
  return foundIngredients;
};

const extractQuantities = (transcript: string): { [ingredient: string]: string } => {
  const quantities: { [ingredient: string]: string } = {};
  
  // Pattern matching for quantities
  const quantityPatterns = [
    /(\d+(?:\.\d+)?)\s*(cups?|cup|tablespoons?|tbsp|teaspoons?|tsp|pounds?|lbs?|ounces?|oz|grams?|g|kilograms?|kg)\s+(?:of\s+)?(\w+)/gi,
    /(\d+)\s+(\w+)/gi, // Simple number + ingredient
    /(a\s+(?:few|couple|handful|bunch))\s+(?:of\s+)?(\w+)/gi,
    /(some|little|bit)\s+(?:of\s+)?(\w+)/gi
  ];
  
  quantityPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(transcript)) !== null) {
      const quantity = match[1];
      const unit = match[2] || '';
      const ingredient = match[3] || match[2];
      
      if (ingredient) {
        quantities[ingredient.toLowerCase()] = `${quantity}${unit ? ' ' + unit : ''}`;
      }
    }
  });
  
  return quantities;
};

const extractPreferences = (transcript: string) => {
  const preferences = {
    dietary: [] as string[],
    cookTime: undefined as number | undefined,
    difficulty: undefined as string | undefined,
    mealType: undefined as string | undefined,
    flavor: undefined as string | undefined
  };
  
  // Dietary restrictions
  if (transcript.includes('vegan')) preferences.dietary.push('vegan');
  if (transcript.includes('vegetarian')) preferences.dietary.push('vegetarian');
  if (transcript.includes('gluten free') || transcript.includes('gluten-free')) preferences.dietary.push('gluten-free');
  if (transcript.includes('dairy free') || transcript.includes('dairy-free')) preferences.dietary.push('dairy-free');
  if (transcript.includes('keto')) preferences.dietary.push('keto');
  if (transcript.includes('paleo')) preferences.dietary.push('paleo');
  if (transcript.includes('low carb') || transcript.includes('low-carb')) preferences.dietary.push('low-carb');
  
  // Cook time
  const timeMatch = transcript.match(/(\d+)\s*minutes?/);
  if (timeMatch) {
    preferences.cookTime = parseInt(timeMatch[1]);
  } else if (transcript.includes('quick') || transcript.includes('fast')) {
    preferences.cookTime = 30;
  }
  
  // Difficulty
  if (transcript.includes('easy') || transcript.includes('simple')) preferences.difficulty = 'Easy';
  if (transcript.includes('medium') || transcript.includes('moderate')) preferences.difficulty = 'Medium';
  if (transcript.includes('hard') || transcript.includes('difficult') || transcript.includes('advanced')) preferences.difficulty = 'Hard';
  
  // Meal type
  if (transcript.includes('breakfast')) preferences.mealType = 'breakfast';
  if (transcript.includes('lunch')) preferences.mealType = 'lunch';
  if (transcript.includes('dinner') || transcript.includes('supper')) preferences.mealType = 'dinner';
  if (transcript.includes('snack') || transcript.includes('appetizer')) preferences.mealType = 'snack';
  
  // Flavor profile
  if (transcript.includes('spicy')) preferences.flavor = 'spicy';
  if (transcript.includes('mild')) preferences.flavor = 'mild';
  if (transcript.includes('sweet')) preferences.flavor = 'sweet';
  if (transcript.includes('healthy')) preferences.flavor = 'healthy';
  
  return preferences;
};

const extractMealType = (transcript: string): string | undefined => {
  if (transcript.includes('breakfast')) return 'breakfast';
  if (transcript.includes('lunch')) return 'lunch';
  if (transcript.includes('dinner') || transcript.includes('supper')) return 'dinner';
  if (transcript.includes('snack')) return 'snack';
  return undefined;
};

const extractDietaryRestrictions = (transcript: string): string[] => {
  const restrictions: string[] = [];
  
  if (transcript.includes('vegan')) restrictions.push('vegan');
  if (transcript.includes('vegetarian') && !restrictions.includes('vegan')) restrictions.push('vegetarian');
  if (transcript.includes('gluten free') || transcript.includes('gluten-free')) restrictions.push('gluten-free');
  if (transcript.includes('dairy free') || transcript.includes('dairy-free')) restrictions.push('dairy-free');
  if (transcript.includes('nut free') || transcript.includes('nut-free')) restrictions.push('nut-free');
  if (transcript.includes('keto')) restrictions.push('keto');
  if (transcript.includes('paleo')) restrictions.push('paleo');
  if (transcript.includes('low carb') || transcript.includes('low-carb')) restrictions.push('low-carb');
  
  // Handle allergies
  if (transcript.includes('allergic to nuts') || transcript.includes('nut allergy')) restrictions.push('nut-free');
  if (transcript.includes('allergic to dairy') || transcript.includes('lactose')) restrictions.push('dairy-free');
  if (transcript.includes('allergic to gluten') || transcript.includes('celiac')) restrictions.push('gluten-free');
  
  return restrictions;
};

const extractCookTime = (transcript: string): number | undefined => {
  const timeMatch = transcript.match(/(\d+)\s*minutes?/);
  if (timeMatch) return parseInt(timeMatch[1]);
  
  if (transcript.includes('quick') || transcript.includes('fast')) return 30;
  if (transcript.includes('in a hurry') || transcript.includes('short on time')) return 15;
  
  return undefined;
};

const extractFlavorProfile = (transcript: string): string => {
  if (transcript.includes('spicy')) return 'spicy';
  if (transcript.includes('mild')) return 'mild';
  if (transcript.includes('sweet')) return 'sweet';
  if (transcript.includes('savory')) return 'savory';
  if (transcript.includes('healthy')) return 'healthy';
  if (transcript.includes('comfort food')) return 'comfort';
  return '';
};

const extractCuisine = (transcript: string): string | undefined => {
  const cuisines = ['italian', 'indian', 'mexican', 'french', 'japanese', 'mediterranean', 'chinese', 'thai', 'korean', 'spanish'];
  return cuisines.find(cuisine => transcript.includes(cuisine)) || undefined;
};

const generateFollowUpQuestion = (ingredients: string[], preferences: any): string => {
  const questions = [
    "What else do you have in your kitchen?",
    "Any other ingredients you'd like to include?",
    "Do you have any dietary restrictions I should know about?",
    "How much time do you have for cooking?",
    "What's your cooking skill level - beginner, intermediate, or advanced?"
  ];
  
  // Context-aware questions
  if (ingredients.length === 1) {
    return "What other ingredients do you have to go with that?";
  }
  if (ingredients.length >= 3 && !preferences.cookTime) {
    return "How much time do you have for cooking?";
  }
  if (!preferences.dietary.length) {
    return "Any dietary restrictions or preferences?";
  }
  
  return questions[Math.floor(Math.random() * questions.length)];
};

const extractRecipeQuery = (transcript: string): string => {
  // Extract recipe name from "recipe for X" or "how to make X"
  const query = transcript.replace(/recipe for|how to make|show me|find/gi, '').trim();
  return query || 'recipes';
};

const extractGeneralQuery = (transcript: string): string => {
  // Extract search terms from general commands
  const query = transcript.replace(/find|search|show me|give me|i want/gi, '').trim();
  return query || 'recipes';
};

export const filterRecipesByVoiceCommand = (recipes: Recipe[], command: VoiceCommandResult): Recipe[] => {
  let filtered = [...recipes];

  if (command.query) {
    const query = command.query.toLowerCase();
    filtered = filtered.filter(recipe => 
      recipe.title.toLowerCase().includes(query) ||
      recipe.description.toLowerCase().includes(query) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(query)) ||
      recipe.cuisine.toLowerCase().includes(query) ||
      recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query))
    );
  }

  if (command.cuisine) {
    filtered = filtered.filter(recipe => 
      recipe.cuisine.toLowerCase().includes(command.cuisine!.toLowerCase())
    );
  }

  if (command.difficulty) {
    filtered = filtered.filter(recipe => recipe.difficulty === command.difficulty);
  }

  if (command.cookTime) {
    filtered = filtered.filter(recipe => recipe.cookTime <= command.cookTime!);
  }

  return filtered;
};