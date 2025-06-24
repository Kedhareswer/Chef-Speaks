import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      discover: 'Discover',
      trending: 'Trending',
      byIngredients: 'By Ingredients',
      community: 'Community',
      mealPlan: 'Meal Plan',
      shopping: 'Shopping',
      profile: 'Profile',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      
      // Search and filters
      searchPlaceholder: 'Search recipes, cuisines, or ingredients...',
      listening: 'Listening...',
      speakYourRequest: 'Speak your recipe request',
      
      // Recipe details
      cookTime: 'Cook Time',
      servings: 'Servings',
      difficulty: 'Difficulty',
      cuisine: 'Cuisine',
      ingredients: 'Ingredients',
      instructions: 'Instructions',
      nutrition: 'Nutrition',
      comments: 'Comments',
      
      // Difficulty levels
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      
      // Meal types
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
      
      // Actions
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      addToShoppingList: 'Add to Shopping List',
      startCooking: 'Start Cooking',
      shareRecipe: 'Share Recipe',
      viewRecipe: 'View Recipe',
      
      // Voice commands
      voiceCommands: {
        nextStep: 'Next step',
        previousStep: 'Previous step',
        repeatStep: 'Repeat that',
        startTimer: 'Start timer',
        stopTimer: 'Stop timer',
        howMuch: 'How much',
        whatsNext: "What's next"
      },
      
      // Cooking mode
      cookingMode: 'Cooking Mode',
      step: 'Step',
      of: 'of',
      nextStep: 'Next Step',
      previousStep: 'Previous Step',
      repeatInstruction: 'Repeat Instruction',
      
      // Timer
      timer: 'Timer',
      startTimer: 'Start Timer',
      pauseTimer: 'Pause Timer',
      resetTimer: 'Reset Timer',
      timerFinished: 'Timer Finished!',
      
      // Nutrition
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbs',
      fat: 'Fat',
      fiber: 'Fiber',
      sugar: 'Sugar',
      sodium: 'Sodium',
      
      // Messages
      noRecipesFound: 'No recipes found',
      tryDifferentSearch: 'Try searching for something else',
      loadingRecipes: 'Loading recipes...',
      errorLoadingRecipes: 'Error loading recipes',
      
      // User preferences
      dietaryRestrictions: 'Dietary Restrictions',
      favoriteCuisines: 'Favorite Cuisines',
      cookingSkillLevel: 'Cooking Skill Level',
      preferredLanguage: 'Preferred Language',
      
      // Skill levels
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',

      // Profile specific
      memberSince: 'Member since',
      loadingProfile: 'Loading profile...',
      favoriteRecipes: 'Favorite Recipes',
      mealPlans: 'Meal Plans',
      shoppingLists: 'Shopping Lists',
      thisWeek: 'This week',
      active: 'Active',
      yourFavoriteRecipes: 'Your Favorite Recipes',
      andMoreFavorites: 'And {{count}} more favorites...',
      basicInformation: 'Basic Information',
      fullName: 'Full Name',
      enterFullName: 'Enter your full name',
      notSet: 'Not set',
      languageDescription: 'ChefSpeak will use this language for voice responses and cooking instructions',
      dietaryPreferences: 'Dietary Preferences',
      noneSpecified: 'None specified',
      yourFavoriteCuisineStats: 'Your Favorite Cuisine Stats',
      recipes: 'recipes',
      voiceAssistantSettings: 'Voice Assistant Settings',
      voiceAssistantDescription: 'Your voice assistant will respond in {{language}} with consideration for {{restrictions}}',
      saving: 'Saving...',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      editProfile: 'Edit Profile',
      signOut: 'Sign Out',
      none: 'none',
      voice: 'Voice',
      preferredVoice: 'Preferred Voice',
      useElevenLabs: 'Use Enhanced Voice',
      enabled: 'Enabled',
      disabled: 'Disabled',
      elevenLabsDescription: 'Enable high-quality AI voices for a more natural speaking experience',

      // Loading states
      loading: 'Loading...',
      pleaseWait: 'Please wait...',
      processing: 'Processing...',
      generating: 'Generating...',

      // Error messages
      errorOccurred: 'An error occurred',
      tryAgain: 'Try again',
      somethingWentWrong: 'Something went wrong',

      // Success messages
      success: 'Success!',
      saved: 'Saved successfully',
      updated: 'Updated successfully',
      created: 'Created successfully',

      // Cuisines
      italian: 'Italian',
      mexican: 'Mexican',
      indian: 'Indian',
      chinese: 'Chinese',
      japanese: 'Japanese',
      french: 'French',
      thai: 'Thai',
      mediterranean: 'Mediterranean',
      korean: 'Korean',
      spanish: 'Spanish',

      // Dietary restrictions
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      'gluten-free': 'Gluten-free',
      'dairy-free': 'Dairy-free',
      'nut-free': 'Nut-free',
      keto: 'Keto',
      paleo: 'Paleo',
      'low-carb': 'Low-carb'
    }
  },
  es: {
    translation: {
      // Navigation
      discover: 'Descubrir',
      trending: 'Tendencias',
      byIngredients: 'Por Ingredientes',
      community: 'Comunidad',
      mealPlan: 'Plan de Comidas',
      shopping: 'Compras',
      profile: 'Perfil',
      signIn: 'Iniciar Sesión',
      signUp: 'Registrarse',
      
      // Search and filters
      searchPlaceholder: 'Buscar recetas, cocinas o ingredientes...',
      listening: 'Escuchando...',
      speakYourRequest: 'Habla tu solicitud de receta',
      
      // Recipe details
      cookTime: 'Tiempo de Cocción',
      servings: 'Porciones',
      difficulty: 'Dificultad',
      cuisine: 'Cocina',
      ingredients: 'Ingredientes',
      instructions: 'Instrucciones',
      nutrition: 'Nutrición',
      comments: 'Comentarios',
      
      // Difficulty levels
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
      
      // Meal types
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      snack: 'Merienda',
      
      // Actions
      addToFavorites: 'Agregar a Favoritos',
      removeFromFavorites: 'Quitar de Favoritos',
      addToShoppingList: 'Agregar a Lista de Compras',
      startCooking: 'Comenzar a Cocinar',
      shareRecipe: 'Compartir Receta',
      viewRecipe: 'Ver Receta',
      
      // Voice commands
      voiceCommands: {
        nextStep: 'Siguiente paso',
        previousStep: 'Paso anterior',
        repeatStep: 'Repetir eso',
        startTimer: 'Iniciar temporizador',
        stopTimer: 'Detener temporizador',
        howMuch: 'Cuánto',
        whatsNext: 'Qué sigue'
      },
      
      // Cooking mode
      cookingMode: 'Modo de Cocina',
      step: 'Paso',
      of: 'de',
      nextStep: 'Siguiente Paso',
      previousStep: 'Paso Anterior',
      repeatInstruction: 'Repetir Instrucción',
      
      // Timer
      timer: 'Temporizador',
      startTimer: 'Iniciar Temporizador',
      pauseTimer: 'Pausar Temporizador',
      resetTimer: 'Reiniciar Temporizador',
      timerFinished: '¡Temporizador Terminado!',
      
      // Nutrition
      calories: 'Calorías',
      protein: 'Proteína',
      carbs: 'Carbohidratos',
      fat: 'Grasa',
      fiber: 'Fibra',
      sugar: 'Azúcar',
      sodium: 'Sodio',
      
      // Messages
      noRecipesFound: 'No se encontraron recetas',
      tryDifferentSearch: 'Intenta buscar algo diferente',
      loadingRecipes: 'Cargando recetas...',
      errorLoadingRecipes: 'Error al cargar recetas',
      
      // User preferences
      dietaryRestrictions: 'Restricciones Dietéticas',
      favoriteCuisines: 'Cocinas Favoritas',
      cookingSkillLevel: 'Nivel de Habilidad Culinaria',
      preferredLanguage: 'Idioma Preferido',
      
      // Skill levels
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',

      // Profile specific
      memberSince: 'Miembro desde',
      loadingProfile: 'Cargando perfil...',
      favoriteRecipes: 'Recetas Favoritas',
      mealPlans: 'Planes de Comida',
      shoppingLists: 'Listas de Compras',
      thisWeek: 'Esta semana',
      active: 'Activo',
      yourFavoriteRecipes: 'Tus Recetas Favoritas',
      andMoreFavorites: 'Y {{count}} favoritos más...',
      basicInformation: 'Información Básica',
      fullName: 'Nombre Completo',
      enterFullName: 'Ingresa tu nombre completo',
      notSet: 'No establecido',
      languageDescription: 'ChefSpeak usará este idioma para respuestas de voz e instrucciones de cocina',
      dietaryPreferences: 'Preferencias Dietéticas',
      noneSpecified: 'Ninguna especificada',
      yourFavoriteCuisineStats: 'Estadísticas de Tus Cocinas Favoritas',
      recipes: 'recetas',
      voiceAssistantSettings: 'Configuración del Asistente de Voz',
      voiceAssistantDescription: 'Tu asistente de voz responderá en {{language}} con consideración para {{restrictions}}',
      saving: 'Guardando...',
      saveChanges: 'Guardar Cambios',
      cancel: 'Cancelar',
      editProfile: 'Editar Perfil',
      signOut: 'Cerrar Sesión',
      none: 'ninguna',
      voice: 'Voz',
      preferredVoice: 'Voz Preferida',
      useElevenLabs: 'Usar Voz Mejorada',
      enabled: 'Habilitado',
      disabled: 'Deshabilitado',
      elevenLabsDescription: 'Habilita voces de IA de alta calidad para una experiencia de habla más natural',

      // Loading states
      loading: 'Cargando...',
      pleaseWait: 'Por favor espera...',
      processing: 'Procesando...',
      generating: 'Generando...',

      // Error messages
      errorOccurred: 'Ocurrió un error',
      tryAgain: 'Intentar de nuevo',
      somethingWentWrong: 'Algo salió mal',

      // Success messages
      success: '¡Éxito!',
      saved: 'Guardado exitosamente',
      updated: 'Actualizado exitosamente',
      created: 'Creado exitosamente',

      // Cuisines
      italian: 'Italiana',
      mexican: 'Mexicana',
      indian: 'India',
      chinese: 'China',
      japanese: 'Japonesa',
      french: 'Francesa',
      thai: 'Tailandesa',
      mediterranean: 'Mediterránea',
      korean: 'Coreana',
      spanish: 'Española',

      // Dietary restrictions
      vegetarian: 'Vegetariano',
      vegan: 'Vegano',
      'gluten-free': 'Sin gluten',
      'dairy-free': 'Sin lácteos',
      'nut-free': 'Sin frutos secos',
      keto: 'Keto',
      paleo: 'Paleo',
      'low-carb': 'Bajo en carbohidratos'
    }
  },
  fr: {
    translation: {
      // Navigation
      discover: 'Découvrir',
      trending: 'Tendances',
      byIngredients: 'Par Ingrédients',
      community: 'Communauté',
      mealPlan: 'Plan de Repas',
      shopping: 'Courses',
      profile: 'Profil',
      signIn: 'Se Connecter',
      signUp: "S'inscrire",
      
      // Search and filters
      searchPlaceholder: 'Rechercher des recettes, cuisines ou ingrédients...',
      listening: 'Écoute...',
      speakYourRequest: 'Parlez votre demande de recette',
      
      // Recipe details
      cookTime: 'Temps de Cuisson',
      servings: 'Portions',
      difficulty: 'Difficulté',
      cuisine: 'Cuisine',
      ingredients: 'Ingrédients',
      instructions: 'Instructions',
      nutrition: 'Nutrition',
      comments: 'Commentaires',
      
      // Difficulty levels
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile',
      
      // Meal types
      breakfast: 'Petit-déjeuner',
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snack: 'Collation',
      
      // Actions
      addToFavorites: 'Ajouter aux Favoris',
      removeFromFavorites: 'Retirer des Favoris',
      addToShoppingList: 'Ajouter à la Liste de Courses',
      startCooking: 'Commencer à Cuisiner',
      shareRecipe: 'Partager la Recette',
      viewRecipe: 'Voir la Recette',
      
      // Voice commands
      voiceCommands: {
        nextStep: 'Étape suivante',
        previousStep: 'Étape précédente',
        repeatStep: 'Répéter ça',
        startTimer: 'Démarrer le minuteur',
        stopTimer: 'Arrêter le minuteur',
        howMuch: 'Combien',
        whatsNext: 'Quoi ensuite'
      },
      
      // Cooking mode
      cookingMode: 'Mode Cuisine',
      step: 'Étape',
      of: 'de',
      nextStep: 'Étape Suivante',
      previousStep: 'Étape Précédente',
      repeatInstruction: 'Répéter Instruction',
      
      // Timer
      timer: 'Minuteur',
      startTimer: 'Démarrer Minuteur',
      pauseTimer: 'Pause Minuteur',
      resetTimer: 'Réinitialiser Minuteur',
      timerFinished: 'Minuteur Terminé!',
      
      // Nutrition
      calories: 'Calories',
      protein: 'Protéine',
      carbs: 'Glucides',
      fat: 'Graisse',
      fiber: 'Fibre',
      sugar: 'Sucre',
      sodium: 'Sodium',
      
      // Messages
      noRecipesFound: 'Aucune recette trouvée',
      tryDifferentSearch: 'Essayez de chercher autre chose',
      loadingRecipes: 'Chargement des recettes...',
      errorLoadingRecipes: 'Erreur lors du chargement des recettes',
      
      // User preferences
      dietaryRestrictions: 'Restrictions Alimentaires',
      favoriteCuisines: 'Cuisines Favorites',
      cookingSkillLevel: 'Niveau de Compétence Culinaire',
      preferredLanguage: 'Langue Préférée',
      
      // Skill levels
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',

      // Profile specific
      memberSince: 'Membre depuis',
      loadingProfile: 'Chargement du profil...',
      favoriteRecipes: 'Recettes Favorites',
      mealPlans: 'Plans de Repas',
      shoppingLists: 'Listes de Courses',
      thisWeek: 'Cette semaine',
      active: 'Actif',
      yourFavoriteRecipes: 'Vos Recettes Favorites',
      andMoreFavorites: 'Et {{count}} favoris de plus...',
      basicInformation: 'Informations de Base',
      fullName: 'Nom Complet',
      enterFullName: 'Entrez votre nom complet',
      notSet: 'Non défini',
      languageDescription: 'ChefSpeak utilisera cette langue pour les réponses vocales et les instructions de cuisine',
      dietaryPreferences: 'Préférences Alimentaires',
      noneSpecified: 'Aucune spécifiée',
      yourFavoriteCuisineStats: 'Statistiques de Vos Cuisines Favorites',
      recipes: 'recettes',
      voiceAssistantSettings: 'Paramètres de l\'Assistant Vocal',
      voiceAssistantDescription: 'Votre assistant vocal répondra en {{language}} avec considération pour {{restrictions}}',
      saving: 'Sauvegarde...',
      saveChanges: 'Sauvegarder les Modifications',
      cancel: 'Annuler',
      editProfile: 'Modifier le Profil',
      signOut: 'Se Déconnecter',
      none: 'aucune',
      voice: 'Voix',
      preferredVoice: 'Voix Préférée',
      useElevenLabs: 'Utiliser la Voix Améliorée',
      enabled: 'Activé',
      disabled: 'Désactivé',
      elevenLabsDescription: 'Activez les voix IA de haute qualité pour une expérience vocale plus naturelle',

      // Loading states
      loading: 'Chargement...',
      pleaseWait: 'Veuillez patienter...',
      processing: 'Traitement...',
      generating: 'Génération...',

      // Error messages
      errorOccurred: 'Une erreur s\'est produite',
      tryAgain: 'Réessayer',
      somethingWentWrong: 'Quelque chose s\'est mal passé',

      // Success messages
      success: 'Succès!',
      saved: 'Sauvegardé avec succès',
      updated: 'Mis à jour avec succès',
      created: 'Créé avec succès',

      // Cuisines
      italian: 'Italienne',
      mexican: 'Mexicaine',
      indian: 'Indienne',
      chinese: 'Chinoise',
      japanese: 'Japonaise',
      french: 'Française',
      thai: 'Thaïlandaise',
      mediterranean: 'Méditerranéenne',
      korean: 'Coréenne',
      spanish: 'Espagnole',

      // Dietary restrictions
      vegetarian: 'Végétarien',
      vegan: 'Végétalien',
      'gluten-free': 'Sans gluten',
      'dairy-free': 'Sans produits laitiers',
      'nut-free': 'Sans noix',
      keto: 'Kéto',
      paleo: 'Paléo',
      'low-carb': 'Faible en glucides'
    }
  },
  hi: {
    translation: {
      // Navigation
      discover: 'खोजें',
      trending: 'ट्रेंडिंग',
      byIngredients: 'सामग्री के अनुसार',
      community: 'समुदाय',
      mealPlan: 'भोजन योजना',
      shopping: 'खरीदारी',
      profile: 'प्रोफाइल',
      signIn: 'साइन इन करें',
      signUp: 'साइन अप करें',
      
      // Search and filters
      searchPlaceholder: 'व्यंजनों, व्यंजनों या सामग्रियों की खोज करें...',
      listening: 'सुन रहा है...',
      speakYourRequest: 'अपना व्यंजन अनुरोध बोलें',
      
      // Recipe details
      cookTime: 'पकाने का समय',
      servings: 'परोसने की मात्रा',
      difficulty: 'कठिनाई',
      cuisine: 'व्यंजन',
      ingredients: 'सामग्री',
      instructions: 'निर्देश',
      nutrition: 'पोषण',
      comments: 'टिप्पणियाँ',
      
      // Difficulty levels
      easy: 'आसान',
      medium: 'मध्यम',
      hard: 'कठिन',
      
      // Meal types
      breakfast: 'नाश्ता',
      lunch: 'दोपहर का भोजन',
      dinner: 'रात का खाना',
      snack: 'नाश्ता',
      
      // Actions
      addToFavorites: 'पसंदीदा में जोड़ें',
      removeFromFavorites: 'पसंदीदा से हटाएं',
      addToShoppingList: 'खरीदारी सूची में जोड़ें',
      startCooking: 'खाना बनाना शुरू करें',
      shareRecipe: 'व्यंजन साझा करें',
      viewRecipe: 'व्यंजन देखें',
      
      // Voice commands
      voiceCommands: {
        nextStep: 'अगला कदम',
        previousStep: 'पिछला कदम',
        repeatStep: 'दोहराएं',
        startTimer: 'टाइमर शुरू करें',
        stopTimer: 'टाइमर बंद करें',
        howMuch: 'कितना',
        whatsNext: 'आगे क्या'
      },
      
      // Cooking mode
      cookingMode: 'कुकिंग मोड',
      step: 'कदम',
      of: 'का',
      nextStep: 'अगला कदम',
      previousStep: 'पिछला कदम',
      repeatInstruction: 'निर्देश दोहराएं',
      
      // Timer
      timer: 'टाइमर',
      startTimer: 'टाइमर शुरू करें',
      pauseTimer: 'टाइमर रोकें',
      resetTimer: 'टाइमर रीसेट करें',
      timerFinished: 'टाइमर समाप्त!',
      
      // Nutrition
      calories: 'कैलोरी',
      protein: 'प्रोटीन',
      carbs: 'कार्बोहाइड्रेट',
      fat: 'वसा',
      fiber: 'फाइबर',
      sugar: 'चीनी',
      sodium: 'सोडियम',
      
      // Messages
      noRecipesFound: 'कोई व्यंजन नहीं मिला',
      tryDifferentSearch: 'कुछ और खोजने का प्रयास करें',
      loadingRecipes: 'व्यंजन लोड हो रहे हैं...',
      errorLoadingRecipes: 'व्यंजन लोड करने में त्रुटि',
      
      // User preferences
      dietaryRestrictions: 'आहार संबंधी प्रतिबंध',
      favoriteCuisines: 'पसंदीदा व्यंजन',
      cookingSkillLevel: 'खाना पकाने का कौशल स्तर',
      preferredLanguage: 'पसंदीदा भाषा',
      
      // Skill levels
      beginner: 'शुरुआती',
      intermediate: 'मध्यवर्ती',
      advanced: 'उन्नत',

      // Profile specific
      memberSince: 'सदस्य बनने की तिथि',
      loadingProfile: 'प्रोफ़ाइल लोड हो रही है...',
      favoriteRecipes: 'पसंदीदा व्यंजन',
      mealPlans: 'भोजन योजनाएँ',
      shoppingLists: 'खरीदारी सूचियाँ',
      thisWeek: 'इस सप्ताह',
      active: 'सक्रिय',
      yourFavoriteRecipes: 'आपके पसंदीदा व्यंजन',
      andMoreFavorites: 'और {{count}} अधिक पसंदीदा...',
      basicInformation: 'बुनियादी जानकारी',
      fullName: 'पूरा नाम',
      enterFullName: 'अपना पूरा नाम दर्ज करें',
      notSet: 'सेट नहीं है',
      languageDescription: 'ChefSpeak आवाज प्रतिक्रियाओं और खाना पकाने के निर्देशों के लिए इस भाषा का उपयोग करेगा',
      dietaryPreferences: 'आहार संबंधी प्राथमिकताएँ',
      noneSpecified: 'कोई निर्दिष्ट नहीं',
      yourFavoriteCuisineStats: 'आपके पसंदीदा व्यंजन के आँकड़े',
      recipes: 'व्यंजन',
      voiceAssistantSettings: 'वॉयस असिस्टेंट सेटिंग्स',
      voiceAssistantDescription: 'आपका वॉयस असिस्टेंट {{language}} में {{restrictions}} के लिए विचार के साथ जवाब देगा',
      saving: 'सहेज रहा है...',
      saveChanges: 'परिवर्तन सहेजें',
      cancel: 'रद्द करें',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      signOut: 'साइन आउट करें',
      none: 'कोई नहीं',
      voice: 'आवाज',
      preferredVoice: 'पसंदीदा आवाज',
      useElevenLabs: 'उन्नत आवाज का उपयोग करें',
      enabled: 'सक्षम',
      disabled: 'अक्षम',
      elevenLabsDescription: 'अधिक प्राकृतिक बोलने के अनुभव के लिए उच्च गुणवत्ता वाली AI आवाज़ें सक्षम करें',

      // Loading states
      loading: 'लोड हो रहा है...',
      pleaseWait: 'कृपया प्रतीक्षा करें...',
      processing: 'प्रोसेसिंग...',
      generating: 'जनरेट हो रहा है...',

      // Error messages
      errorOccurred: 'एक त्रुटि हुई',
      tryAgain: 'पुनः प्रयास करें',
      somethingWentWrong: 'कुछ गलत हो गया',

      // Success messages
      success: 'सफलता!',
      saved: 'सफलतापूर्वक सहेजा गया',
      updated: 'सफलतापूर्वक अपडेट किया गया',
      created: 'सफलतापूर्वक बनाया गया',

      // Cuisines
      italian: 'इतालवी',
      mexican: 'मैक्सिकन',
      indian: 'भारतीय',
      chinese: 'चीनी',
      japanese: 'जापानी',
      french: 'फ्रेंच',
      thai: 'थाई',
      mediterranean: 'भूमध्यसागरीय',
      korean: 'कोरियाई',
      spanish: 'स्पेनिश',

      // Dietary restrictions
      vegetarian: 'शाकाहारी',
      vegan: 'वीगन',
      'gluten-free': 'ग्लूटेन-मुक्त',
      'dairy-free': 'डेयरी-मुक्त',
      'nut-free': 'नट-मुक्त',
      keto: 'कीटो',
      paleo: 'पेलियो',
      'low-carb': 'कम-कार्ब'
    }
  },
  te: {
    translation: {
      // Navigation
      discover: 'కనుగొనండి',
      trending: 'ట్రెండింగ్',
      byIngredients: 'పదార్థాల ద్వారా',
      community: 'సమాజం',
      mealPlan: 'భోజన ప్రణాళిక',
      shopping: 'షాపింగ్',
      profile: 'ప్రొఫైల్',
      signIn: 'సైన్ ఇన్ చేయండి',
      signUp: 'సైన్ అప్ చేయండి',
      
      // Search and filters
      searchPlaceholder: 'వంటకాలు, వంటకాలు లేదా పదార్థాలను శోధించండి...',
      listening: 'వింటున్నాను...',
      speakYourRequest: 'మీ వంటకం అభ్యర్థనను మాట్లాడండి',
      
      // Recipe details
      cookTime: 'వండే సమయం',
      servings: 'సర్వింగ్స్',
      difficulty: 'కష్టం',
      cuisine: 'వంటకం',
      ingredients: 'పదార్థాలు',
      instructions: 'సూచనలు',
      nutrition: 'పోషకాలు',
      comments: 'వ్యాఖ్యలు',
      
      // Difficulty levels
      easy: 'సులభం',
      medium: 'మధ్యస్థం',
      hard: 'కఠినం',
      
      // Meal types
      breakfast: 'అల్పాహారం',
      lunch: 'మధ్యాహ్న భోజనం',
      dinner: 'రాత్రి భోజనం',
      snack: 'స్నాక్',
      
      // Actions
      addToFavorites: 'ఇష్టమైనవాటికి జోడించండి',
      removeFromFavorites: 'ఇష్టమైనవాటి నుండి తీసివేయండి',
      addToShoppingList: 'షాపింగ్ జాబితాకు జోడించండి',
      startCooking: 'వంట ప్రారంభించండి',
      shareRecipe: 'వంటకాన్ని షేర్ చేయండి',
      viewRecipe: 'వంటకాన్ని చూడండి',
      
      // Voice commands
      voiceCommands: {
        nextStep: 'తదుపరి దశ',
        previousStep: 'మునుపటి దశ',
        repeatStep: 'పునరావృతం చేయండి',
        startTimer: 'టైమర్ ప్రారంభించండి',
        stopTimer: 'టైమర్ ఆపండి',
        howMuch: 'ఎంత',
        whatsNext: 'తరువాత ఏమిటి'
      },
      
      // Cooking mode
      cookingMode: 'వంట మోడ్',
      step: 'దశ',
      of: 'యొక్క',
      nextStep: 'తదుపరి దశ',
      previousStep: 'మునుపటి దశ',
      repeatInstruction: 'సూచనను పునరావృతం చేయండి',
      
      // Timer
      timer: 'టైమర్',
      startTimer: 'టైమర్ ప్రారంభించండి',
      pauseTimer: 'టైమర్ పాజ్ చేయండి',
      resetTimer: 'టైమర్ రీసెట్ చేయండి',
      timerFinished: 'టైమర్ ముగిసింది!',
      
      // Nutrition
      calories: 'కేలరీలు',
      protein: 'ప్రొటీన్',
      carbs: 'కార్బోహైడ్రేట్స్',
      fat: 'కొవ్వు',
      fiber: 'ఫైబర్',
      sugar: 'చక్కెర',
      sodium: 'సోడియం',
      
      // Messages
      noRecipesFound: 'వంటకాలు కనుగొనబడలేదు',
      tryDifferentSearch: 'వేరే దానిని శోధించడానికి ప్రయత్నించండి',
      loadingRecipes: 'వంటకాలు లోడ్ అవుతున్నాయి...',
      errorLoadingRecipes: 'వంటకాలను లోడ్ చేయడంలో లోపం',
      
      // User preferences
      dietaryRestrictions: 'ఆహార పరిమితులు',
      favoriteCuisines: 'ఇష్టమైన వంటకాలు',
      cookingSkillLevel: 'వంట నైపుణ్య స్థాయి',
      preferredLanguage: 'ఇష్టమైన భాష',
      
      // Skill levels
      beginner: 'ప్రారంభకుడు',
      intermediate: 'మధ్యస్థం',
      advanced: 'అధునాతన',

      // Profile specific
      memberSince: 'సభ్యత్వం నుండి',
      loadingProfile: 'ప్రొఫైల్ లోడ్ అవుతోంది...',
      favoriteRecipes: 'ఇష్టమైన వంటకాలు',
      mealPlans: 'భోజన ప్రణాళికలు',
      shoppingLists: 'షాపింగ్ జాబితాలు',
      thisWeek: 'ఈ వారం',
      active: 'యాక్టివ్',
      yourFavoriteRecipes: 'మీ ఇష్టమైన వంటకాలు',
      andMoreFavorites: 'మరియు {{count}} మరిన్ని ఇష్టమైనవి...',
      basicInformation: 'ప్రాథమిక సమాచారం',
      fullName: 'పూర్తి పేరు',
      enterFullName: 'మీ పూర్తి పేరు నమోదు చేయండి',
      notSet: 'సెట్ చేయబడలేదు',
      languageDescription: 'ChefSpeak వాయిస్ ప్రతిస్పందనలు మరియు వంట సూచనల కోసం ఈ భాషను ఉపయోగిస్తుంది',
      dietaryPreferences: 'ఆహార ప్రాధాన్యతలు',
      noneSpecified: 'ఏదీ పేర్కొనబడలేదు',
      yourFavoriteCuisineStats: 'మీ ఇష్టమైన వంటకాల గణాంకాలు',
      recipes: 'వంటకాలు',
      voiceAssistantSettings: 'వాయిస్ అసిస్టెంట్ సెట్టింగ్‌లు',
      voiceAssistantDescription: 'మీ వాయిస్ అసిస్టెంట్ {{language}}లో {{restrictions}} కోసం పరిగణనతో స్పందిస్తుంది',
      saving: 'సేవ్ చేస్తోంది...',
      saveChanges: 'మార్పులను సేవ్ చేయండి',
      cancel: 'రద్దు చేయండి',
      editProfile: 'ప్రొఫైల్‌ని సవరించండి',
      signOut: 'సైన్ అవుట్ చేయండి',
      none: 'ఏదీ లేదు',
      voice: 'స్వరం',
      preferredVoice: 'ఇష్టమైన స్వరం',
      useElevenLabs: 'మెరుగైన స్వరాన్ని ఉపయోగించండి',
      enabled: 'ప్రారంభించబడింది',
      disabled: 'నిలిపివేయబడింది',
      elevenLabsDescription: 'మరింత సహజమైన మాట్లాడే అనుభవం కోసం అధిక నాణ్యత AI స్వరాలను ప్రారంభించండి',

      // Loading states
      loading: 'లోడ్ అవుతోంది...',
      pleaseWait: 'దయచేసి వేచి ఉండండి...',
      processing: 'ప్రాసెస్ చేస్తోంది...',
      generating: 'ఉత్పత్తి చేస్తోంది...',

      // Error messages
      errorOccurred: 'లోపం సంభవించింది',
      tryAgain: 'మళ్ళీ ప్రయత్నించండి',
      somethingWentWrong: 'ఏదో తప్పు జరిగింది',

      // Success messages
      success: 'విజయం!',
      saved: 'విజయవంతంగా సేవ్ చేయబడింది',
      updated: 'విజయవంతంగా నవీకరించబడింది',
      created: 'విజయవంతంగా సృష్టించబడింది',

      // Cuisines
      italian: 'ఇటాలియన్',
      mexican: 'మెక్సికన్',
      indian: 'భారతీయ',
      chinese: 'చైనీస్',
      japanese: 'జపనీస్',
      french: 'ఫ్రెంచ్',
      thai: 'థాయ్',
      mediterranean: 'మెడిటరేనియన్',
      korean: 'కొరియన్',
      spanish: 'స్పానిష్',

      // Dietary restrictions
      vegetarian: 'శాకాహారి',
      vegan: 'వీగన్',
      'gluten-free': 'గ్లూటెన్-ఫ్రీ',
      'dairy-free': 'డెయిరీ-ఫ్రీ',
      'nut-free': 'నట్-ఫ్రీ',
      keto: 'కీటో',
      paleo: 'పేలియో',
      'low-carb': 'తక్కువ-కార్బ్'
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  })

export default i18n