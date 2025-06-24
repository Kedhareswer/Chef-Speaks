/*
  # Fix RLS policies for recipes table

  1. Security Updates
    - Drop existing restrictive policies
    - Add policy for anyone to read recipes (SELECT)
    - Add policy for authenticated users to insert recipes
    - Add policy for users to update their own recipes
    - Add policy for users to delete their own recipes

  2. Changes
    - Enable public read access to recipes table
    - Allow authenticated users to create recipes
    - Maintain user ownership for updates/deletes
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Anyone can read recipes" ON recipes;
DROP POLICY IF EXISTS "Authenticated users can create recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- Create new policies with proper permissions

-- Allow anyone (including anonymous users) to read recipes
CREATE POLICY "Enable read access for all users" ON recipes
  FOR SELECT USING (true);

-- Allow authenticated users to insert recipes
CREATE POLICY "Enable insert for authenticated users" ON recipes
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    (auth.uid() = author_id OR author_id IS NULL)
  );

-- Allow users to update their own recipes
CREATE POLICY "Enable update for recipe owners" ON recipes
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Allow users to delete their own recipes
CREATE POLICY "Enable delete for recipe owners" ON recipes
  FOR DELETE USING (auth.uid() = author_id);

-- Ensure RLS is enabled
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;