import { UserRecipe, Recipe } from '../types';

export const userRecipes: UserRecipe[] = [
  {
    title: 'Grandma\'s Secret Chocolate Chip Cookies',
    description: 'A family recipe passed down through generations with a secret ingredient that makes them extra chewy',
    ingredients: [
      '2 cups all-purpose flour',
      '1 tsp baking soda',
      '1 tsp salt',
      '1 cup butter, softened',
      '3/4 cup brown sugar',
      '1/4 cup white sugar',
      '2 large eggs',
      '2 tsp vanilla extract',
      '2 cups chocolate chips',
      '1 tbsp cornstarch (secret ingredient!)'
    ],
    instructions: [
      'Preheat oven to 375°F',
      'Mix flour, baking soda, salt, and cornstarch in a bowl',
      'Cream butter and sugars until fluffy',
      'Beat in eggs and vanilla',
      'Gradually mix in flour mixture',
      'Fold in chocolate chips',
      'Drop rounded tablespoons on baking sheet',
      'Bake 9-11 minutes until golden brown'
    ],
    cookTime: 25,
    servings: 24,
    difficulty: 'Easy',
    cuisine: 'American',
    imageUrl: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg',
    tags: ['cookies', 'dessert', 'family recipe', 'baking'],
    author: 'Sarah Johnson',
    isUserGenerated: true,
    status: 'approved',
    rating: 4.8,
    totalRatings: 127
  },
  {
    title: 'Spicy Korean Kimchi Fried Rice',
    description: 'A fusion dish combining traditional kimchi with fried rice, perfect for using leftover rice',
    ingredients: [
      '3 cups cooked rice (preferably day-old)',
      '1 cup kimchi, chopped',
      '2 tbsp kimchi juice',
      '2 eggs',
      '2 green onions, sliced',
      '2 cloves garlic, minced',
      '1 tbsp sesame oil',
      '1 tbsp vegetable oil',
      '1 tsp gochujang',
      'Sesame seeds for garnish'
    ],
    instructions: [
      'Heat vegetable oil in a large pan or wok',
      'Add garlic and cook until fragrant',
      'Add kimchi and cook for 2-3 minutes',
      'Add rice and kimchi juice, stir-fry for 5 minutes',
      'Push rice to one side, scramble eggs on the other',
      'Mix everything together with gochujang',
      'Drizzle with sesame oil',
      'Garnish with green onions and sesame seeds'
    ],
    cookTime: 15,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Korean-Fusion',
    imageUrl: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    tags: ['korean', 'fried rice', 'spicy', 'quick', 'fusion'],
    author: 'Mike Chen',
    isUserGenerated: true,
    status: 'approved',
    rating: 4.6,
    totalRatings: 89
  }
];

export const addUserRecipe = (recipe: UserRecipe): UserRecipe => {
  const newRecipe = {
    ...recipe,
    tempId: Date.now().toString(),
    status: 'submitted' as const
  };
  userRecipes.push(newRecipe);
  return newRecipe;
};

export const getUserRecipes = (): UserRecipe[] => {
  return userRecipes.filter(recipe => recipe.status === 'approved');
};

export const convertUserRecipeToRecipe = (userRecipe: UserRecipe): Recipe => {
  return {
    ...userRecipe,
    id: userRecipe.tempId || Date.now().toString(),
    isUserGenerated: true,
    createdAt: new Date()
  };
};