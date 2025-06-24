import { Recipe } from '../types';

export const sampleRecipes: Recipe[] = [
  // Italian Cuisine
  {
    id: '1',
    title: 'Classic Spaghetti Carbonara',
    description: 'Authentic Roman pasta dish with eggs, cheese, and guanciale - silky, creamy perfection without cream',
    ingredients: [
      '400g spaghetti or tonnarelli',
      '200g guanciale or pancetta, diced',
      '4 large egg yolks',
      '1 whole egg',
      '100g Pecorino Romano, finely grated',
      '50g Parmigiano-Reggiano, grated',
      'Freshly cracked black pepper',
      'Sea salt for pasta water'
    ],
    instructions: [
      'Bring a large pot of salted water to boil for the pasta',
      'Cut guanciale into small cubes and cook in a large pan until crispy',
      'Whisk eggs with both cheeses and generous black pepper in a bowl',
      'Cook pasta until al dente, reserve 1 cup pasta water before draining',
      'Add hot pasta to the pan with guanciale off the heat',
      'Quickly toss with egg mixture, adding pasta water to create silky sauce',
      'Serve immediately with extra cheese and black pepper'
    ],
    cookTime: 20,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Italian',
    imageUrl: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    videoUrl: 'https://www.youtube.com/embed/3AAdKl1UYZs',
    tags: ['pasta', 'italian', 'quick', 'dinner', 'traditional'],
    rating: 4.8,
    totalRatings: 342
  },
  {
    id: '2',
    title: 'Margherita Pizza Napoletana',
    description: 'Authentic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil',
    ingredients: [
      '500g 00 flour',
      '325ml lukewarm water',
      '10g sea salt',
      '3g active dry yeast',
      '400g San Marzano tomatoes, crushed',
      '300g fresh mozzarella di bufala',
      'Fresh basil leaves',
      'Extra virgin olive oil',
      'Sea salt and black pepper'
    ],
    instructions: [
      'Mix flour and salt, dissolve yeast in water, combine to form dough',
      'Knead for 10 minutes until smooth and elastic',
      'Rise in oiled bowl for 2 hours until doubled',
      'Divide into 4 portions, shape into balls, rest 30 minutes',
      'Stretch each ball into 10-inch circles, avoiding the edges',
      'Top with crushed tomatoes, torn mozzarella, and basil',
      'Bake in preheated oven at highest temperature (500°F+) for 8-12 minutes',
      'Drizzle with olive oil and serve immediately'
    ],
    cookTime: 180,
    servings: 4,
    difficulty: 'Hard',
    cuisine: 'Italian',
    imageUrl: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
    videoUrl: 'https://www.youtube.com/embed/1-SJGQ2HLp8',
    tags: ['pizza', 'italian', 'traditional', 'weekend project'],
    rating: 4.9,
    totalRatings: 567
  },
  {
    id: '3',
    title: 'Creamy Mushroom Risotto',
    description: 'Luxurious Arborio rice with mixed mushrooms, white wine, and Parmesan',
    ingredients: [
      '1.5 cups Arborio rice',
      '1 lb mixed mushrooms (porcini, shiitake, cremini)',
      '6 cups warm vegetable stock',
      '1 cup dry white wine',
      '1 large onion, finely diced',
      '3 garlic cloves, minced',
      '1/2 cup Parmesan cheese, grated',
      '3 tbsp butter',
      '2 tbsp olive oil',
      'Fresh thyme and parsley',
      'Salt and white pepper'
    ],
    instructions: [
      'Sauté mushrooms in olive oil until golden, season and set aside',
      'In same pan, cook onion until translucent',
      'Add garlic and rice, stir until rice is coated',
      'Add wine and stir until absorbed',
      'Add warm stock one ladle at a time, stirring constantly',
      'Continue until rice is creamy but still al dente (20-25 minutes)',
      'Stir in mushrooms, butter, cheese, and herbs',
      'Adjust seasoning and serve immediately'
    ],
    cookTime: 35,
    servings: 6,
    difficulty: 'Medium',
    cuisine: 'Italian',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    videoUrl: 'https://www.youtube.com/embed/UqukOJJhw5s',
    tags: ['risotto', 'vegetarian', 'mushrooms', 'creamy', 'italian'],
    rating: 4.5,
    totalRatings: 289
  },

  // Indian Cuisine
  {
    id: '4',
    title: 'Butter Chicken (Murgh Makhani)',
    description: 'Creamy, aromatic tomato-based curry with tender marinated chicken in rich spiced sauce',
    ingredients: [
      '2 lbs chicken breast, cubed',
      '1 cup plain Greek yogurt',
      '2 tbsp garam masala',
      '1 tbsp each: cumin, coriander, paprika',
      '4 garlic cloves, minced',
      '1 inch ginger, grated',
      '1 large onion, diced',
      '28oz can crushed tomatoes',
      '1 cup heavy cream',
      '4 tbsp butter',
      'Fresh cilantro',
      'Basmati rice for serving'
    ],
    instructions: [
      'Marinate chicken in yogurt and half the spices for 2+ hours',
      'Grill or pan-fry marinated chicken until cooked through',
      'Sauté onion, garlic, and ginger until fragrant',
      'Add remaining spices and cook for 1 minute',
      'Add tomatoes and simmer for 20 minutes until thick',
      'Blend sauce until smooth, return to pan',
      'Stir in cream, butter, and cooked chicken',
      'Simmer 10 minutes, garnish with cilantro, serve over rice'
    ],
    cookTime: 45,
    servings: 6,
    difficulty: 'Medium',
    cuisine: 'Indian',
    imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    videoUrl: 'https://www.youtube.com/embed/a03U45jFxOI',
    tags: ['curry', 'indian', 'creamy', 'dinner', 'popular'],
    rating: 4.8,
    totalRatings: 423
  },
  {
    id: '5',
    title: 'Authentic Chicken Biryani',
    description: 'Fragrant layered rice dish with spiced chicken, saffron, and aromatic herbs',
    ingredients: [
      '2 cups basmati rice',
      '1 lb chicken, cut into pieces',
      '2 large onions, sliced thin',
      '1 cup yogurt',
      '2 tbsp biryani masala',
      'Saffron soaked in warm milk',
      'Fresh mint and cilantro',
      '4 tbsp ghee',
      'Whole spices: cardamom, cinnamon, bay leaves',
      'Salt to taste'
    ],
    instructions: [
      'Marinate chicken in yogurt and spices for 2 hours',
      'Deep fry onions until golden, reserve oil',
      'Cook rice with whole spices until 70% done',
      'Cook marinated chicken until tender',
      'Layer rice and chicken in heavy-bottomed pot',
      'Top with fried onions, saffron milk, herbs',
      'Cover with foil and tight lid, cook on high 3 minutes',
      'Reduce heat to low, cook 45 minutes, rest 10 minutes before serving'
    ],
    cookTime: 120,
    servings: 8,
    difficulty: 'Hard',
    cuisine: 'Indian',
    imageUrl: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    videoUrl: 'https://www.youtube.com/embed/bIS3kqOuKH8',
    tags: ['rice', 'indian', 'festive', 'layered', 'aromatic'],
    rating: 4.9,
    totalRatings: 298
  },
  {
    id: '6',
    title: 'Palak Paneer',
    description: 'Creamy spinach curry with soft paneer cubes in aromatic spiced gravy',
    ingredients: [
      '500g fresh spinach leaves',
      '250g paneer, cubed',
      '2 tomatoes, chopped',
      '1 large onion, sliced',
      '4 garlic cloves',
      '1 inch ginger',
      '2 green chilies',
      '1 tsp cumin seeds',
      '1 tsp garam masala',
      '1/2 cup heavy cream',
      '2 tbsp ghee',
      'Salt to taste'
    ],
    instructions: [
      'Blanch spinach in boiling water for 2 minutes, drain and cool',
      'Blend spinach with green chilies to smooth paste',
      'Lightly fry paneer cubes until golden, set aside',
      'Sauté onions, garlic, ginger until golden',
      'Add tomatoes and cook until soft',
      'Add spinach paste and spices, cook 10 minutes',
      'Add paneer and cream, simmer 5 minutes',
      'Garnish with cream swirl and serve with naan'
    ],
    cookTime: 30,
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Indian',
    imageUrl: 'https://images.pexels.com/photos/5737241/pexels-photo-5737241.jpeg',
    tags: ['vegetarian', 'indian', 'spinach', 'paneer', 'healthy'],
    rating: 4.6,
    totalRatings: 234
  },

  // Japanese Cuisine
  {
    id: '7',
    title: 'Authentic Ramen Bowl',
    description: 'Rich tonkotsu broth with tender chashu, soft eggs, and fresh noodles',
    ingredients: [
      '4 portions fresh ramen noodles',
      '4 cups tonkotsu broth',
      '4 soft-boiled eggs, halved',
      '200g chashu pork, sliced',
      '4 green onions, sliced',
      '2 sheets nori',
      '1 cup bamboo shoots',
      '2 tbsp miso paste',
      'Black garlic oil',
      'Sesame seeds'
    ],
    instructions: [
      'Prepare soft-boiled eggs and marinate in soy sauce mixture',
      'Heat tonkotsu broth and season with miso',
      'Cook ramen noodles according to package instructions',
      'Warm chashu pork slices',
      'Place noodles in bowls, pour hot broth over',
      'Top with chashu, eggs, bamboo shoots, nori',
      'Garnish with green onions and sesame seeds',
      'Drizzle with black garlic oil and serve immediately'
    ],
    cookTime: 25,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Japanese',
    imageUrl: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg',
    videoUrl: 'https://www.youtube.com/embed/9jF5ezNyuI0',
    tags: ['ramen', 'japanese', 'soup', 'comfort food', 'noodles'],
    rating: 4.9,
    totalRatings: 378
  },
  {
    id: '8',
    title: 'Perfect Sushi Rolls',
    description: 'Fresh sushi rolls with seasoned rice, nori, and your choice of fillings',
    ingredients: [
      '2 cups sushi rice',
      '4 nori sheets',
      '200g sashimi-grade salmon',
      '1 cucumber, julienned',
      '1 avocado, sliced',
      '3 tbsp rice vinegar',
      '2 tbsp sugar',
      '1 tsp salt',
      'Wasabi paste',
      'Pickled ginger',
      'Soy sauce'
    ],
    instructions: [
      'Cook sushi rice and season with vinegar mixture',
      'Let rice cool to room temperature',
      'Place nori on bamboo mat, spread rice evenly',
      'Add salmon, cucumber, and avocado in a line',
      'Roll tightly using bamboo mat',
      'Wet knife and slice into 8 pieces',
      'Arrange on plate with wasabi and ginger',
      'Serve with soy sauce for dipping'
    ],
    cookTime: 45,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Japanese',
    imageUrl: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg',
    videoUrl: 'https://www.youtube.com/embed/joweUxpHaqc',
    tags: ['sushi', 'japanese', 'raw fish', 'healthy', 'fresh'],
    rating: 4.7,
    totalRatings: 203
  },

  // Mexican Cuisine
  {
    id: '9',
    title: 'Authentic Tacos al Pastor',
    description: 'Marinated pork with pineapple, onions, and cilantro on fresh corn tortillas',
    ingredients: [
      '3 lbs pork shoulder, sliced thin',
      '3 dried guajillo chiles',
      '2 dried ancho chiles',
      '1 chipotle in adobo',
      '1/4 cup orange juice',
      '2 tbsp white vinegar',
      '4 garlic cloves',
      '1 tsp each: cumin, oregano, salt',
      'Fresh pineapple, diced',
      'White onion, diced',
      'Cilantro, chopped',
      'Corn tortillas',
      'Lime wedges'
    ],
    instructions: [
      'Toast chiles in dry pan until fragrant',
      'Soak chiles in hot water for 20 minutes',
      'Blend chiles with orange juice, vinegar, garlic, and spices',
      'Marinate pork in chile mixture for 4+ hours',
      'Cook pork on hot griddle or grill until charred',
      'Warm tortillas on griddle',
      'Fill tortillas with pork, pineapple, onion, cilantro',
      'Serve with lime wedges and salsa verde'
    ],
    cookTime: 30,
    servings: 8,
    difficulty: 'Medium',
    cuisine: 'Mexican',
    imageUrl: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
    videoUrl: 'https://www.youtube.com/embed/uzIJGkwD0h4',
    tags: ['tacos', 'mexican', 'street food', 'marinated', 'authentic'],
    rating: 4.8,
    totalRatings: 387
  },
  {
    id: '10',
    title: 'Chicken Enchiladas Verdes',
    description: 'Rolled tortillas filled with chicken and cheese, topped with green salsa',
    ingredients: [
      '12 corn tortillas',
      '3 cups cooked chicken, shredded',
      '2 cups Monterey Jack cheese, shredded',
      '1 lb tomatillos, husked',
      '2 jalapeños',
      '1/2 white onion',
      '3 garlic cloves',
      '1/2 cup cilantro',
      '1 cup Mexican crema',
      'Salt and pepper'
    ],
    instructions: [
      'Roast tomatillos, jalapeños, onion, and garlic until charred',
      'Blend roasted vegetables with cilantro and salt',
      'Warm tortillas until pliable',
      'Fill tortillas with chicken and cheese, roll tightly',
      'Place seam-side down in baking dish',
      'Pour green salsa over enchiladas',
      'Top with remaining cheese and bake at 375°F for 20 minutes',
      'Garnish with crema and cilantro before serving'
    ],
    cookTime: 45,
    servings: 6,
    difficulty: 'Medium',
    cuisine: 'Mexican',
    imageUrl: 'https://images.pexels.com/photos/5737241/pexels-photo-5737241.jpeg',
    tags: ['enchiladas', 'mexican', 'chicken', 'cheese', 'comfort food'],
    rating: 4.6,
    totalRatings: 156
  },

  // Thai Cuisine
  {
    id: '11',
    title: 'Pad Thai',
    description: 'Sweet and tangy stir-fried rice noodles with shrimp, tofu, and bean sprouts',
    ingredients: [
      '8oz rice noodles (pad thai width)',
      '1/2 lb shrimp, peeled',
      '4oz firm tofu, cubed',
      '3 eggs, beaten',
      '2 cups bean sprouts',
      '4 green onions, sliced',
      '1/4 cup tamarind paste',
      '3 tbsp fish sauce',
      '3 tbsp palm sugar',
      '2 tbsp vegetable oil',
      'Crushed peanuts',
      'Lime wedges',
      'Thai chili flakes'
    ],
    instructions: [
      'Soak rice noodles in warm water until pliable',
      'Mix tamarind paste, fish sauce, and palm sugar for sauce',
      'Heat oil in wok over high heat',
      'Stir-fry shrimp and tofu until cooked',
      'Push to one side, scramble eggs',
      'Add drained noodles and sauce, toss constantly',
      'Add bean sprouts and green onions, stir-fry 2 minutes',
      'Serve with peanuts, lime, and chili flakes'
    ],
    cookTime: 20,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Thai',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    videoUrl: 'https://www.youtube.com/embed/Upb6LQKDM5E',
    tags: ['thai', 'noodles', 'stir-fry', 'quick', 'street food'],
    rating: 4.7,
    totalRatings: 312
  },
  {
    id: '12',
    title: 'Green Curry Chicken',
    description: 'Aromatic Thai curry with coconut milk, vegetables, and fresh herbs',
    ingredients: [
      '1 lb chicken thighs, sliced',
      '400ml coconut milk',
      '3 tbsp green curry paste',
      '1 Thai eggplant, cubed',
      '1 red bell pepper, sliced',
      '1/4 cup bamboo shoots',
      '2 kaffir lime leaves',
      '1 tbsp fish sauce',
      '1 tbsp palm sugar',
      'Thai basil leaves',
      'Red chilies for garnish',
      'Jasmine rice for serving'
    ],
    instructions: [
      'Heat thick coconut milk in wok until oil separates',
      'Add curry paste and fry until fragrant',
      'Add chicken and cook until no longer pink',
      'Add remaining coconut milk and bring to simmer',
      'Add eggplant, bell pepper, and bamboo shoots',
      'Season with fish sauce and palm sugar',
      'Add lime leaves and simmer until vegetables are tender',
      'Garnish with basil and chilies, serve over rice'
    ],
    cookTime: 25,
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Thai',
    imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    tags: ['curry', 'thai', 'coconut', 'spicy', 'aromatic'],
    rating: 4.8,
    totalRatings: 267
  },

  // French Cuisine
  {
    id: '13',
    title: 'Coq au Vin',
    description: 'Classic French braised chicken in red wine with mushrooms and pearl onions',
    ingredients: [
      '1 whole chicken, cut into pieces',
      '6 strips bacon, chopped',
      '1 bottle red wine (Burgundy)',
      '2 cups chicken stock',
      '1 lb pearl onions',
      '1 lb mushrooms, quartered',
      '3 tbsp flour',
      '3 tbsp butter',
      'Fresh thyme and bay leaves',
      'Salt and pepper'
    ],
    instructions: [
      'Cook bacon until crispy, remove and reserve fat',
      'Brown chicken pieces in bacon fat, remove',
      'Sauté onions and mushrooms, remove',
      'Make roux with flour and butter in same pan',
      'Gradually add wine and stock, whisking constantly',
      'Return chicken, bacon, vegetables to pot',
      'Add herbs, cover and braise 1 hour until tender',
      'Serve with crusty bread or mashed potatoes'
    ],
    cookTime: 90,
    servings: 6,
    difficulty: 'Medium',
    cuisine: 'French',
    imageUrl: 'https://images.pexels.com/photos/6107787/pexels-photo-6107787.jpeg',
    videoUrl: 'https://www.youtube.com/embed/BjFz6sHbJzI',
    tags: ['french', 'braised', 'wine', 'classic', 'comfort'],
    rating: 4.6,
    totalRatings: 234
  },
  {
    id: '14',
    title: 'Beef Bourguignon',
    description: 'Slow-braised beef in red wine with vegetables and herbs',
    ingredients: [
      '3 lbs beef chuck, cubed',
      '6 strips bacon, diced',
      '1 bottle red wine',
      '2 cups beef stock',
      '1 lb carrots, chunked',
      '1 lb pearl onions',
      '1 lb mushrooms',
      '3 tbsp tomato paste',
      '4 garlic cloves',
      'Bouquet garni',
      'Flour for dusting'
    ],
    instructions: [
      'Cook bacon until crispy, remove',
      'Dust beef with flour, brown in bacon fat',
      'Add tomato paste and garlic, cook 1 minute',
      'Add wine and stock, bring to simmer',
      'Add bouquet garni, cover and braise 2 hours',
      'Add vegetables and continue cooking 1 hour',
      'Remove bouquet garni, adjust seasoning',
      'Serve with mashed potatoes or crusty bread'
    ],
    cookTime: 210,
    servings: 8,
    difficulty: 'Hard',
    cuisine: 'French',
    imageUrl: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg',
    tags: ['french', 'beef', 'wine', 'braised', 'classic'],
    rating: 4.9,
    totalRatings: 189
  },

  // Mediterranean Cuisine
  {
    id: '15',
    title: 'Greek Moussaka',
    description: 'Layered casserole with eggplant, spiced meat sauce, and creamy béchamel',
    ingredients: [
      '3 large eggplants, sliced',
      '2 lbs ground lamb',
      '2 onions, diced',
      '4 garlic cloves, minced',
      '28oz can crushed tomatoes',
      '1/2 cup red wine',
      '2 tsp cinnamon',
      '1 tsp allspice',
      'Béchamel sauce ingredients',
      'Olive oil for frying',
      'Fresh oregano and parsley'
    ],
    instructions: [
      'Salt eggplant slices and let drain 30 minutes',
      'Fry eggplant slices until golden, drain',
      'Brown lamb with onions and garlic',
      'Add tomatoes, wine, and spices, simmer 30 minutes',
      'Make béchamel sauce',
      'Layer eggplant, meat sauce, repeat',
      'Top with béchamel and bake at 350°F for 45 minutes',
      'Rest 15 minutes before cutting and serving'
    ],
    cookTime: 120,
    servings: 8,
    difficulty: 'Medium',
    cuisine: 'Greek',
    imageUrl: 'https://images.pexels.com/photos/5737241/pexels-photo-5737241.jpeg',
    tags: ['greek', 'casserole', 'layered', 'comfort food', 'traditional'],
    rating: 4.6,
    totalRatings: 167
  },

  // American Cuisine
  {
    id: '16',
    title: 'BBQ Pulled Pork',
    description: 'Slow-cooked pork shoulder with smoky BBQ sauce, perfect for sandwiches',
    ingredients: [
      '4 lb pork shoulder',
      '2 tbsp brown sugar',
      '2 tbsp paprika',
      '1 tbsp each: chili powder, cumin',
      '1 tbsp garlic powder',
      '1 tbsp salt',
      '1 tsp black pepper',
      '1 cup BBQ sauce',
      'Brioche buns',
      'Coleslaw for serving'
    ],
    instructions: [
      'Mix all dry rub ingredients',
      'Coat pork shoulder with rub, refrigerate overnight',
      'Smoke at 225°F for 12-14 hours until internal temp reaches 203°F',
      'Wrap in foil and rest for 1 hour',
      'Shred meat and mix with BBQ sauce',
      'Serve on brioche buns with coleslaw',
      'Add pickles and extra sauce as desired'
    ],
    cookTime: 840,
    servings: 12,
    difficulty: 'Hard',
    cuisine: 'American',
    imageUrl: 'https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg',
    tags: ['bbq', 'american', 'smoked', 'pork', 'sandwich'],
    rating: 4.8,
    totalRatings: 298
  },

  // Quick & Easy
  {
    id: '17',
    title: 'Garlic Butter Shrimp',
    description: 'Quick and elegant shrimp in garlic butter sauce, ready in 10 minutes',
    ingredients: [
      '1 lb large shrimp, peeled',
      '4 tbsp butter',
      '4 garlic cloves, minced',
      '1/4 cup white wine',
      '2 tbsp lemon juice',
      '1/4 cup parsley, chopped',
      'Red pepper flakes',
      'Salt and pepper',
      'Crusty bread for serving'
    ],
    instructions: [
      'Season shrimp with salt and pepper',
      'Heat butter in large skillet over medium-high heat',
      'Add garlic and cook 30 seconds until fragrant',
      'Add shrimp and cook 2 minutes per side',
      'Add wine and lemon juice, cook 1 minute',
      'Stir in parsley and red pepper flakes',
      'Serve immediately with crusty bread'
    ],
    cookTime: 10,
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Mediterranean',
    imageUrl: 'https://images.pexels.com/photos/725990/pexels-photo-725990.jpeg',
    tags: ['shrimp', 'quick', 'garlic', 'butter', 'seafood'],
    rating: 4.7,
    totalRatings: 445
  },
  {
    id: '18',
    title: 'Avocado Toast Supreme',
    description: 'Elevated avocado toast with poached egg, everything seasoning, and microgreens',
    ingredients: [
      '4 slices sourdough bread',
      '2 ripe avocados',
      '4 eggs',
      '2 tbsp everything bagel seasoning',
      '1 cup microgreens',
      '2 tbsp olive oil',
      '1 lemon, juiced',
      'Flaky sea salt',
      'Red pepper flakes'
    ],
    instructions: [
      'Toast sourdough bread until golden',
      'Mash avocados with lemon juice and salt',
      'Poach eggs in simmering water with vinegar',
      'Spread avocado mixture on toast',
      'Top with poached egg',
      'Sprinkle with everything seasoning',
      'Garnish with microgreens and red pepper flakes',
      'Drizzle with olive oil and serve immediately'
    ],
    cookTime: 15,
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Modern American',
    imageUrl: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg',
    tags: ['breakfast', 'avocado', 'healthy', 'quick', 'trendy'],
    rating: 4.4,
    totalRatings: 234
  },

  // Vegetarian/Vegan
  {
    id: '19',
    title: 'Buddha Bowl',
    description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
    ingredients: [
      '1 cup quinoa',
      '2 cups sweet potato, cubed',
      '1 cup broccoli florets',
      '1 cup chickpeas, drained',
      '2 cups kale, massaged',
      '1/4 cup tahini',
      '2 tbsp lemon juice',
      '1 tbsp maple syrup',
      '1 garlic clove, minced',
      'Pumpkin seeds for garnish'
    ],
    instructions: [
      'Cook quinoa according to package directions',
      'Roast sweet potato and broccoli at 400°F for 25 minutes',
      'Roast chickpeas until crispy',
      'Massage kale with olive oil and salt',
      'Whisk tahini, lemon juice, maple syrup, and garlic',
      'Arrange quinoa, vegetables, and kale in bowls',
      'Drizzle with tahini dressing',
      'Garnish with pumpkin seeds'
    ],
    cookTime: 35,
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Healthy',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    tags: ['vegetarian', 'healthy', 'quinoa', 'bowl', 'nutritious'],
    rating: 4.5,
    totalRatings: 189
  },

  // Desserts
  {
    id: '20',
    title: 'Classic Tiramisu',
    description: 'Layers of coffee-soaked ladyfingers with mascarpone cream and cocoa',
    ingredients: [
      '6 egg yolks',
      '3/4 cup sugar',
      '1 1/4 cups mascarpone cheese',
      '1 3/4 cups heavy cream',
      '2 packages ladyfinger cookies',
      '1 cup strong espresso, cooled',
      '3 tbsp coffee liqueur',
      'Unsweetened cocoa powder',
      'Dark chocolate shavings'
    ],
    instructions: [
      'Whisk egg yolks and sugar until thick and pale',
      'Add mascarpone and whisk until smooth',
      'Whip cream to soft peaks, fold into mascarpone mixture',
      'Combine espresso and liqueur in shallow dish',
      'Quickly dip each ladyfinger in coffee mixture',
      'Arrange dipped cookies in single layer in dish',
      'Spread half the mascarpone mixture over cookies',
      'Repeat layers, refrigerate 4+ hours, dust with cocoa'
    ],
    cookTime: 30,
    servings: 12,
    difficulty: 'Medium',
    cuisine: 'Italian',
    imageUrl: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg',
    videoUrl: 'https://www.youtube.com/embed/TiG7hmJFGl0',
    tags: ['dessert', 'italian', 'coffee', 'no-bake', 'make-ahead'],
    rating: 4.8,
    totalRatings: 356
  },

  // Korean Cuisine
  {
    id: '21',
    title: 'Korean Bulgogi',
    description: 'Marinated beef grilled to perfection with sweet and savory flavors',
    ingredients: [
      '2 lbs ribeye steak, thinly sliced',
      '1/2 cup soy sauce',
      '1/4 cup brown sugar',
      '2 tbsp sesame oil',
      '1 Asian pear, grated',
      '6 garlic cloves, minced',
      '1 inch ginger, grated',
      '4 green onions, sliced',
      '2 tbsp toasted sesame seeds',
      'Steamed rice for serving'
    ],
    instructions: [
      'Combine soy sauce, brown sugar, sesame oil, pear, garlic, and ginger',
      'Marinate sliced beef for at least 2 hours',
      'Heat grill or grill pan to high heat',
      'Grill beef for 2-3 minutes per side',
      'Garnish with green onions and sesame seeds',
      'Serve with steamed rice and kimchi',
      'Wrap in lettuce leaves if desired'
    ],
    cookTime: 15,
    servings: 6,
    difficulty: 'Easy',
    cuisine: 'Korean',
    imageUrl: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    tags: ['korean', 'beef', 'grilled', 'marinated', 'asian'],
    rating: 4.7,
    totalRatings: 278
  },

  // Middle Eastern
  {
    id: '22',
    title: 'Chicken Shawarma',
    description: 'Spiced chicken with tahini sauce, perfect for wraps or bowls',
    ingredients: [
      '2 lbs chicken thighs',
      '2 tbsp olive oil',
      '2 tsp each: cumin, paprika, turmeric',
      '1 tsp each: coriander, cinnamon, cardamom',
      '4 garlic cloves, minced',
      '1 lemon, juiced',
      'Pita bread',
      'Tahini sauce',
      'Cucumber, tomato, red onion',
      'Fresh parsley'
    ],
    instructions: [
      'Mix spices with olive oil, garlic, and lemon juice',
      'Marinate chicken for at least 1 hour',
      'Grill or roast chicken until cooked through',
      'Slice chicken thinly',
      'Warm pita bread',
      'Fill pita with chicken, vegetables, and tahini sauce',
      'Garnish with parsley and serve'
    ],
    cookTime: 25,
    servings: 6,
    difficulty: 'Easy',
    cuisine: 'Middle Eastern',
    imageUrl: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
    tags: ['middle eastern', 'chicken', 'spiced', 'wrap', 'healthy'],
    rating: 4.6,
    totalRatings: 198
  },

  // Chinese Cuisine
  {
    id: '23',
    title: 'Kung Pao Chicken',
    description: 'Spicy Sichuan dish with chicken, peanuts, and dried chilies',
    ingredients: [
      '1 lb chicken breast, cubed',
      '1/2 cup roasted peanuts',
      '8 dried red chilies',
      '3 green onions, sliced',
      '3 tbsp soy sauce',
      '2 tbsp rice wine',
      '1 tbsp sugar',
      '1 tsp cornstarch',
      '2 tbsp vegetable oil',
      'Steamed rice for serving'
    ],
    instructions: [
      'Marinate chicken in soy sauce and cornstarch',
      'Heat oil in wok over high heat',
      'Stir-fry chicken until cooked through',
      'Add dried chilies and stir-fry 30 seconds',
      'Add sauce mixture and peanuts',
      'Stir-fry until sauce thickens',
      'Garnish with green onions',
      'Serve over steamed rice'
    ],
    cookTime: 20,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Chinese',
    imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    tags: ['chinese', 'spicy', 'chicken', 'peanuts', 'stir-fry'],
    rating: 4.5,
    totalRatings: 267
  },

  // Spanish Cuisine
  {
    id: '24',
    title: 'Paella Valenciana',
    description: 'Traditional Spanish rice dish with chicken, rabbit, and saffron',
    ingredients: [
      '2 cups bomba rice',
      '4 cups chicken stock',
      '1 chicken, cut into pieces',
      '1/2 lb green beans',
      '1/2 lb lima beans',
      '2 tomatoes, grated',
      'Pinch of saffron',
      '4 tbsp olive oil',
      'Rosemary sprigs',
      'Lemon wedges'
    ],
    instructions: [
      'Heat olive oil in paella pan',
      'Brown chicken pieces on all sides',
      'Add green beans and lima beans',
      'Add grated tomato and cook until thick',
      'Add rice and stir to coat',
      'Add hot stock with saffron',
      'Simmer without stirring for 20 minutes',
      'Garnish with rosemary and lemon'
    ],
    cookTime: 45,
    servings: 8,
    difficulty: 'Hard',
    cuisine: 'Spanish',
    imageUrl: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    tags: ['spanish', 'rice', 'saffron', 'traditional', 'paella'],
    rating: 4.8,
    totalRatings: 234
  }
];

export const getRecipesByLocation = (location: string): Recipe[] => {
  const locationMap: Record<string, string[]> = {
    'italy': ['italian'],
    'india': ['indian'],
    'france': ['french'],
    'mexico': ['mexican'],
    'japan': ['japanese'],
    'greece': ['greek', 'mediterranean'],
    'spain': ['spanish', 'mediterranean'],
    'thailand': ['thai'],
    'usa': ['american', 'modern american'],
    'uk': ['indian', 'italian'],
    'korea': ['korean'],
    'china': ['chinese'],
    'default': ['italian', 'indian', 'mexican', 'american']
  };

  const cuisines = locationMap[location.toLowerCase()] || locationMap.default;
  return sampleRecipes.filter(recipe => 
    cuisines.some(cuisine => recipe.cuisine.toLowerCase().includes(cuisine))
  );
};