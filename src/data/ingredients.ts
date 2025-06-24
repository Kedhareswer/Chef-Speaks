import { IngredientSuggestion } from '../types';

export const commonIngredients: IngredientSuggestion[] = [
  // Proteins
  { name: 'chicken breast', category: 'protein', commonPairings: ['garlic', 'herbs', 'lemon'] },
  { name: 'ground beef', category: 'protein', commonPairings: ['onion', 'tomato', 'cheese'] },
  { name: 'salmon', category: 'protein', commonPairings: ['dill', 'lemon', 'asparagus'] },
  { name: 'eggs', category: 'protein', commonPairings: ['cheese', 'herbs', 'vegetables'] },
  { name: 'tofu', category: 'protein', commonPairings: ['soy sauce', 'ginger', 'vegetables'] },
  
  // Vegetables
  { name: 'tomatoes', category: 'vegetable', commonPairings: ['basil', 'mozzarella', 'garlic'] },
  { name: 'onions', category: 'vegetable', commonPairings: ['garlic', 'herbs', 'oil'] },
  { name: 'bell peppers', category: 'vegetable', commonPairings: ['onions', 'garlic', 'herbs'] },
  { name: 'mushrooms', category: 'vegetable', commonPairings: ['garlic', 'herbs', 'cream'] },
  { name: 'spinach', category: 'vegetable', commonPairings: ['garlic', 'cheese', 'cream'] },
  { name: 'broccoli', category: 'vegetable', commonPairings: ['garlic', 'cheese', 'lemon'] },
  { name: 'carrots', category: 'vegetable', commonPairings: ['herbs', 'honey', 'ginger'] },
  
  // Grains & Starches
  { name: 'rice', category: 'grain', commonPairings: ['vegetables', 'protein', 'herbs'] },
  { name: 'pasta', category: 'grain', commonPairings: ['tomato', 'cheese', 'herbs'] },
  { name: 'potatoes', category: 'grain', commonPairings: ['herbs', 'cheese', 'cream'] },
  { name: 'quinoa', category: 'grain', commonPairings: ['vegetables', 'herbs', 'lemon'] },
  
  // Dairy
  { name: 'cheese', category: 'dairy', commonPairings: ['herbs', 'tomato', 'pasta'] },
  { name: 'milk', category: 'dairy', commonPairings: ['flour', 'butter', 'sugar'] },
  { name: 'yogurt', category: 'dairy', commonPairings: ['herbs', 'cucumber', 'garlic'] },
  { name: 'butter', category: 'dairy', commonPairings: ['herbs', 'garlic', 'flour'] },
  
  // Common Spices & Herbs
  { name: 'garlic', category: 'spice', commonPairings: ['herbs', 'oil', 'vegetables'] },
  { name: 'ginger', category: 'spice', commonPairings: ['garlic', 'soy sauce', 'vegetables'] },
  { name: 'basil', category: 'spice', commonPairings: ['tomato', 'mozzarella', 'olive oil'] },
  { name: 'oregano', category: 'spice', commonPairings: ['tomato', 'cheese', 'garlic'] },
  { name: 'cumin', category: 'spice', commonPairings: ['chili', 'garlic', 'onion'] },
  { name: 'paprika', category: 'spice', commonPairings: ['chicken', 'vegetables', 'cream'] }
];

export const getIngredientsByCategory = (category: string) => {
  return commonIngredients.filter(ingredient => ingredient.category === category);
};

export const suggestPairings = (selectedIngredients: string[]) => {
  const suggestions = new Set<string>();
  
  selectedIngredients.forEach(ingredient => {
    const found = commonIngredients.find(ing => 
      ing.name.toLowerCase() === ingredient.toLowerCase()
    );
    if (found) {
      found.commonPairings.forEach(pairing => suggestions.add(pairing));
    }
  });
  
  // Remove already selected ingredients
  selectedIngredients.forEach(ingredient => {
    suggestions.delete(ingredient.toLowerCase());
  });
  
  return Array.from(suggestions);
};