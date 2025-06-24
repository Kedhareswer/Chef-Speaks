export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          dietary_restrictions: string[] | null
          favorite_cuisines: string[] | null
          cooking_skill_level: 'beginner' | 'intermediate' | 'advanced' | null
          preferred_language: string | null
          timezone: string | null
          measurement_system: string | null
          notification_preferences: Json | null
          last_active: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          cooking_skill_level?: 'beginner' | 'intermediate' | 'advanced' | null
          preferred_language?: string | null
          timezone?: string | null
          measurement_system?: string | null
          notification_preferences?: Json | null
          last_active?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          cooking_skill_level?: 'beginner' | 'intermediate' | 'advanced' | null
          preferred_language?: string | null
          timezone?: string | null
          measurement_system?: string | null
          notification_preferences?: Json | null
          last_active?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string
          ingredients: Json
          instructions: Json
          cook_time: number
          servings: number
          difficulty: 'Easy' | 'Medium' | 'Hard'
          cuisine: string
          image_url: string
          video_url: string | null
          tags: string[]
          author_id: string | null
          is_user_generated: boolean
          rating: number | null
          total_ratings: number
          nutritional_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          ingredients: Json
          instructions: Json
          cook_time: number
          servings: number
          difficulty: 'Easy' | 'Medium' | 'Hard'
          cuisine: string
          image_url: string
          video_url?: string | null
          tags: string[]
          author_id?: string | null
          is_user_generated?: boolean
          rating?: number | null
          total_ratings?: number
          nutritional_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          ingredients?: Json
          instructions?: Json
          cook_time?: number
          servings?: number
          difficulty?: 'Easy' | 'Medium' | 'Hard'
          cuisine?: string
          image_url?: string
          video_url?: string | null
          tags?: string[]
          author_id?: string | null
          is_user_generated?: boolean
          rating?: number | null
          total_ratings?: number
          nutritional_info?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          recipe_id: string
          author_id: string
          author_name: string
          content: string
          rating: number
          is_voice_comment: boolean
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          author_id: string
          author_name: string
          content: string
          rating: number
          is_voice_comment?: boolean
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          author_id?: string
          author_name?: string
          content?: string
          rating?: number
          is_voice_comment?: boolean
          audio_url?: string | null
          created_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          items: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          items: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          items?: Json
          created_at?: string
          updated_at?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          recipe_id: string
          servings: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          recipe_id: string
          servings: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          recipe_id?: string
          servings?: number
          created_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preferred_cuisines: string[]
          dietary_restrictions: string[]
          cooking_skill_level: 'beginner' | 'intermediate' | 'advanced'
          max_cook_time: number
          preferred_difficulty: ('Easy' | 'Medium' | 'Hard')[]
          allergens: string[]
          favorite_ingredients: string[]
          disliked_ingredients: string[]
          preferred_meal_types: ('breakfast' | 'lunch' | 'dinner' | 'snack')[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_cuisines?: string[]
          dietary_restrictions?: string[]
          cooking_skill_level?: 'beginner' | 'intermediate' | 'advanced'
          max_cook_time?: number
          preferred_difficulty?: ('Easy' | 'Medium' | 'Hard')[]
          allergens?: string[]
          favorite_ingredients?: string[]
          disliked_ingredients?: string[]
          preferred_meal_types?: ('breakfast' | 'lunch' | 'dinner' | 'snack')[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_cuisines?: string[]
          dietary_restrictions?: string[]
          cooking_skill_level?: 'beginner' | 'intermediate' | 'advanced'
          max_cook_time?: number
          preferred_difficulty?: ('Easy' | 'Medium' | 'Hard')[]
          allergens?: string[]
          favorite_ingredients?: string[]
          disliked_ingredients?: string[]
          preferred_meal_types?: ('breakfast' | 'lunch' | 'dinner' | 'snack')[]
          created_at?: string
          updated_at?: string
        }
      }
      recipe_recommendations: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          recommendation_type: string
          score: number
          reason: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          recommendation_type: string
          score?: number
          reason?: string | null
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          recommendation_type?: string
          score?: number
          reason?: string | null
          created_at?: string
          expires_at?: string
        }
      }
      cooking_timers: {
        Row: {
          id: string
          user_id: string
          recipe_id: string | null
          timer_name: string
          duration_seconds: number
          remaining_seconds: number
          is_active: boolean
          is_paused: boolean
          step_number: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id?: string | null
          timer_name: string
          duration_seconds: number
          remaining_seconds: number
          is_active?: boolean
          is_paused?: boolean
          step_number?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string | null
          timer_name?: string
          duration_seconds?: number
          remaining_seconds?: number
          is_active?: boolean
          is_paused?: boolean
          step_number?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      recipe_shares: {
        Row: {
          id: string
          recipe_id: string
          user_id: string | null
          platform: string
          shared_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id?: string | null
          platform: string
          shared_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string | null
          platform?: string
          shared_at?: string
        }
      }
      recipe_nutrition: {
        Row: {
          id: string
          recipe_id: string
          calories: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          fiber_g: number | null
          sugar_g: number | null
          sodium_mg: number | null
          cholesterol_mg: number | null
          vitamin_a_iu: number | null
          vitamin_c_mg: number | null
          calcium_mg: number | null
          iron_mg: number | null
          detailed_nutrients: Json | null
          per_serving: boolean
          data_source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          calories?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          cholesterol_mg?: number | null
          vitamin_a_iu?: number | null
          vitamin_c_mg?: number | null
          calcium_mg?: number | null
          iron_mg?: number | null
          detailed_nutrients?: Json | null
          per_serving?: boolean
          data_source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          calories?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          cholesterol_mg?: number | null
          vitamin_a_iu?: number | null
          vitamin_c_mg?: number | null
          calcium_mg?: number | null
          iron_mg?: number | null
          detailed_nutrients?: Json | null
          per_serving?: boolean
          data_source?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_voice_settings: {
        Row: {
          id: string
          user_id: string
          preferred_voice_id: string
          voice_language: string
          voice_speed: number
          voice_stability: number
          voice_similarity_boost: number
          use_eleven_labs: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_voice_id?: string
          voice_language?: string
          voice_speed?: number
          voice_stability?: number
          voice_similarity_boost?: number
          use_eleven_labs?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_voice_id?: string
          voice_language?: string
          voice_speed?: number
          voice_stability?: number
          voice_similarity_boost?: number
          use_eleven_labs?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_recommendations: {
        Args: {}
        Returns: void
      }
      update_user_last_active: {
        Args: {
          user_uuid: string
        }
        Returns: void
      }
    }
    Enums: {
      cooking_skill_level: 'beginner' | 'intermediate' | 'advanced'
      difficulty_level: 'Easy' | 'Medium' | 'Hard'
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}