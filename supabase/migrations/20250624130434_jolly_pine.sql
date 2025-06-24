/*
  # Fix Recipe RLS Policies for Anonymous Access

  1. Security Updates
    - Update the SELECT policy on recipes table to explicitly allow 'anon' role
    - Ensure anonymous users can read all recipes without authentication
    - Keep existing policies for authenticated operations intact

  2. Changes Made
    - Drop the existing "Enable read access for all users" policy
    - Create a new policy that explicitly includes both 'anon' and 'authenticated' roles
    - Maintain the same access pattern (all users can read all recipes)
*/

-- Drop the existing SELECT policy that only targets 'public' role
DROP POLICY IF EXISTS "Enable read access for all users" ON recipes;

-- Create a new SELECT policy that explicitly allows both anon and authenticated roles
CREATE POLICY "Enable read access for all users"
  ON recipes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Also ensure the comments table allows anonymous reads since recipes display comments
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;

CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Ensure recipe_nutrition table also allows anonymous reads
DROP POLICY IF EXISTS "Anyone can read nutrition data" ON recipe_nutrition;

CREATE POLICY "Anyone can read nutrition data"
  ON recipe_nutrition
  FOR SELECT
  TO anon, authenticated
  USING (true);