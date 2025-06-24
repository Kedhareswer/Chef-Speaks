/*
  # Comprehensive ChefSpeak Features Migration

  1. Enhanced Tables
    - Add user preferences table for personalized recommendations
    - Add recipe recommendations table for AI suggestions
    - Add cooking timers table for timer management
    - Add recipe sharing stats table
    - Update profiles table with new fields
    - Add recipe nutrition table for detailed nutrition info

  2. New Features
    - Multi-language support
    - Enhanced user profiles
    - Recipe recommendations
    - Cooking timers
    - Recipe sharing tracking
    - Detailed nutrition information

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user data access
*/

-- Add user preferences table for personalized recommendations
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  preferred_cuisines text[] DEFAULT '{}',
  dietary_restrictions text[] DEFAULT '{}',
  cooking_skill_level cooking_skill_level DEFAULT 'beginner',
  max_cook_time integer DEFAULT 60,
  preferred_difficulty difficulty_level[] DEFAULT '{}',
  allergens text[] DEFAULT '{}',
  favorite_ingredients text[] DEFAULT '{}',
  disliked_ingredients text[] DEFAULT '{}',
  preferred_meal_types meal_type[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add recipe recommendations table
CREATE TABLE IF NOT EXISTS recipe_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  recommendation_type text NOT NULL, -- 'ai_generated', 'similar_users', 'trending', 'seasonal'
  score numeric(3,2) DEFAULT 0,
  reason text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Add cooking timers table
CREATE TABLE IF NOT EXISTS cooking_timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  timer_name text NOT NULL,
  duration_seconds integer NOT NULL,
  remaining_seconds integer NOT NULL,
  is_active boolean DEFAULT false,
  is_paused boolean DEFAULT false,
  step_number integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add recipe sharing stats table
CREATE TABLE IF NOT EXISTS recipe_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  platform text NOT NULL, -- 'facebook', 'twitter', 'pinterest', 'whatsapp', 'email', 'copy_link'
  shared_at timestamptz DEFAULT now()
);

-- Add recipe nutrition table for detailed nutrition info
CREATE TABLE IF NOT EXISTS recipe_nutrition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  calories numeric(8,2),
  protein_g numeric(6,2),
  carbs_g numeric(6,2),
  fat_g numeric(6,2),
  fiber_g numeric(6,2),
  sugar_g numeric(6,2),
  sodium_mg numeric(8,2),
  cholesterol_mg numeric(6,2),
  vitamin_a_iu numeric(8,2),
  vitamin_c_mg numeric(6,2),
  calcium_mg numeric(6,2),
  iron_mg numeric(6,2),
  detailed_nutrients jsonb,
  per_serving boolean DEFAULT true,
  data_source text DEFAULT 'spoonacular',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id)
);

-- Add voice settings table for Eleven Labs configuration
CREATE TABLE IF NOT EXISTS user_voice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  preferred_voice_id text DEFAULT 'EXAVITQu4vr4xnSDxMaL', -- Bella voice
  voice_language text DEFAULT 'en',
  voice_speed numeric(3,2) DEFAULT 1.0,
  voice_stability numeric(3,2) DEFAULT 0.5,
  voice_similarity_boost numeric(3,2) DEFAULT 0.75,
  use_eleven_labs boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Update profiles table with new fields
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'UTC';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'measurement_system'
  ) THEN
    ALTER TABLE profiles ADD COLUMN measurement_system text DEFAULT 'metric';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notification_preferences jsonb DEFAULT '{"email": true, "push": false, "cooking_reminders": true}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_active'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_active timestamptz DEFAULT now();
  END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_voice_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for recipe_recommendations
CREATE POLICY "Users can read own recommendations"
  ON recipe_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
  ON recipe_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow system to create recommendations

-- Create policies for cooking_timers
CREATE POLICY "Users can manage own timers"
  ON cooking_timers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for recipe_shares
CREATE POLICY "Anyone can create shares"
  ON recipe_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read all shares"
  ON recipe_shares
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for recipe_nutrition
CREATE POLICY "Anyone can read nutrition data"
  ON recipe_nutrition
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can manage nutrition data"
  ON recipe_nutrition
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for user_voice_settings
CREATE POLICY "Users can manage own voice settings"
  ON user_voice_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_recommendations_user ON recipe_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_recommendations_recipe ON recipe_recommendations(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_recommendations_type ON recipe_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_user ON cooking_timers(user_id);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_recipe ON cooking_timers(recipe_id);
CREATE INDEX IF NOT EXISTS idx_cooking_timers_active ON cooking_timers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recipe_shares_recipe ON recipe_shares(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_platform ON recipe_shares(platform);
CREATE INDEX IF NOT EXISTS idx_recipe_nutrition_recipe ON recipe_nutrition(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_voice_settings_user ON user_voice_settings(user_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cooking_timers_updated_at ON cooking_timers;
CREATE TRIGGER update_cooking_timers_updated_at
    BEFORE UPDATE ON cooking_timers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_nutrition_updated_at ON recipe_nutrition;
CREATE TRIGGER update_recipe_nutrition_updated_at
    BEFORE UPDATE ON recipe_nutrition
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_voice_settings_updated_at ON user_voice_settings;
CREATE TRIGGER update_user_voice_settings_updated_at
    BEFORE UPDATE ON user_voice_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void AS $$
BEGIN
  DELETE FROM recipe_recommendations
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to update user last active
CREATE OR REPLACE FUNCTION update_user_last_active(user_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET last_active = now()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;