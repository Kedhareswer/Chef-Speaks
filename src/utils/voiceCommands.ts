import { Recipe } from '../types';

export interface VoiceCommandResult {
  action: 'search' | 'filter' | 'navigate' | 'help' | 'unknown';
  query?: string;
  cuisine?: string;
  difficulty?: string;
  cookTime?: number;
  message?: string;
}

export const parseVoiceCommand = (transcript: string): VoiceCommandResult => {
  const lowercaseTranscript = transcript.toLowerCase().trim();
  
  // Search commands
  if (lowercaseTranscript.includes('recipe for') || lowercaseTranscript.includes('how to make')) {
    const query = extractRecipeQuery(lowercaseTranscript);
    return { action: 'search', query, message: `Searching for ${query} recipes` };
  }

  // Cuisine filters
  const cuisineKeywords = ['italian', 'indian', 'mexican', 'french', 'japanese', 'mediterranean'];
  const foundCuisine = cuisineKeywords.find(cuisine => lowercaseTranscript.includes(cuisine));
  if (foundCuisine) {
    return { action: 'filter', cuisine: foundCuisine, message: `Showing ${foundCuisine} recipes` };
  }

  // Difficulty filters
  if (lowercaseTranscript.includes('easy') || lowercaseTranscript.includes('simple')) {
    return { action: 'filter', difficulty: 'Easy', message: 'Showing easy recipes' };
  }
  if (lowercaseTranscript.includes('quick') || lowercaseTranscript.includes('fast')) {
    return { action: 'filter', cookTime: 30, message: 'Showing quick recipes (under 30 minutes)' };
  }

  // General search
  if (lowercaseTranscript.includes('find') || lowercaseTranscript.includes('search') || lowercaseTranscript.includes('show me')) {
    const query = extractGeneralQuery(lowercaseTranscript);
    return { action: 'search', query, message: `Searching for ${query}` };
  }

  // Help commands
  if (lowercaseTranscript.includes('help') || lowercaseTranscript.includes('what can you do')) {
    return { 
      action: 'help', 
      message: 'You can say things like: "Recipe for pasta", "Show me Italian food", "Find easy recipes", or "Quick dinner ideas"' 
    };
  }

  // Default search with full transcript
  return { action: 'search', query: lowercaseTranscript, message: `Searching for ${lowercaseTranscript}` };
};

const extractRecipeQuery = (transcript: string): string => {
  // Extract recipe name from "recipe for X" or "how to make X"
  let query = transcript.replace(/recipe for|how to make|show me|find/gi, '').trim();
  return query || 'recipes';
};

const extractGeneralQuery = (transcript: string): string => {
  // Extract search terms from general commands
  let query = transcript.replace(/find|search|show me|give me|i want/gi, '').trim();
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