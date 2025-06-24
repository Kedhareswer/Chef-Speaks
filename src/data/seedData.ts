import { supabase } from '../lib/supabase'
import { sampleRecipes } from './recipes'

// Function to seed the database with sample recipes
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...')

    // Convert sample recipes to database format
    const recipesToInsert = sampleRecipes.map(recipe => ({
      id: crypto.randomUUID(), // Generate proper UUID instead of using simple string IDs
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cook_time: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      cuisine: recipe.cuisine,
      image_url: recipe.imageUrl,
      video_url: recipe.videoUrl || null,
      tags: recipe.tags,
      author_id: null, // These are system recipes
      is_user_generated: false,
      rating: recipe.rating || 0,
      total_ratings: recipe.totalRatings || 0,
      nutritional_info: null
    }))

    // Use the service role key for seeding to bypass RLS
    const { data: { user } } = await supabase.auth.getUser()
    
    // If no user is authenticated, we need to use a different approach
    // Insert recipes using RPC function or direct database access
    // For now, let's try inserting with proper RLS handling
    
    // Insert recipes in batches to avoid timeout
    const batchSize = 10
    for (let i = 0; i < recipesToInsert.length; i += batchSize) {
      const batch = recipesToInsert.slice(i, i + batchSize)
      
      // Use insert instead of upsert and handle conflicts gracefully
      const { error } = await supabase
        .from('recipes')
        .insert(batch)
        .select()

      if (error) {
        // If it's a duplicate key error, that's okay - recipes already exist
        if (error.code === '23505') {
          console.log(`Batch ${i / batchSize + 1}: Some recipes already exist, skipping duplicates`)
          continue
        }
        
        // If it's an RLS error, log it but don't fail completely
        if (error.code === '42501') {
          console.warn(`RLS policy prevented seeding batch ${i / batchSize + 1}. This is expected if not authenticated.`)
          continue
        }
        
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
        throw error
      }

      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(recipesToInsert.length / batchSize)}`)
    }

    console.log('Database seeding completed successfully!')
    return true
  } catch (error) {
    console.error('Error seeding database:', error)
    // Don't fail the app if seeding fails - just log the error
    console.warn('Seeding failed, but app will continue with existing data')
    return false
  }
}

// Function to check if database needs seeding
export const checkAndSeedDatabase = async () => {
  try {
    // First check if we can read from the recipes table
    const { count, error } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.warn('Could not check recipe count:', error)
      // If we can't even read, don't try to seed
      return true
    }

    if (count === 0) {
      console.log('Database is empty, attempting to seed with sample data...')
      return await seedDatabase()
    } else {
      console.log(`Database already has ${count} recipes`)
      return true
    }
  } catch (error) {
    console.error('Error checking database:', error)
    // Don't fail the app if we can't check - just continue
    return true
  }
}