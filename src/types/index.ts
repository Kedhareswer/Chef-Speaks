export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  imageUrl: string;
  videoUrl?: string;
  tags: string[];
  author?: string;
  isUserGenerated?: boolean;
  rating?: number;
  totalRatings?: number;
  createdAt?: Date;
}

export interface Location {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface VoiceCommand {
  command: string;
  action: string;
  parameters?: Record<string, any>;
}

export interface Comment {
  id: string;
  recipeId: string;
  author: string;
  content: string;
  rating: number;
  createdAt: Date;
  isVoiceComment?: boolean;
  audioUrl?: string;
}

export interface IngredientSuggestion {
  name: string;
  category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other';
  commonPairings: string[];
}

export interface UserRecipe extends Omit<Recipe, 'id'> {
  tempId?: string;
  status: 'draft' | 'submitted' | 'approved';
}