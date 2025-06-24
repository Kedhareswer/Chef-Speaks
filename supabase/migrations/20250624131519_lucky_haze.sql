/*
  # Add User Account Deletion Function

  1. New Function
    - `delete_user_account()` - Allows users to delete their own account and all associated data
    
  2. Security
    - Function is marked as SECURITY DEFINER to allow deletion of auth.users
    - Only allows users to delete their own account (auth.uid() check)
    - Cascading deletes will handle all related data automatically
*/

-- Create function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  -- Check if user is authenticated
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete all user data (foreign key constraints will handle cascading)
  -- This includes: profiles, recipes, comments, shopping_lists, meal_plans, 
  -- user_favorites, user_preferences, recipe_recommendations, cooking_timers, 
  -- recipe_shares, user_voice_settings
  
  -- Delete from auth.users (this should cascade to profiles and then to all other tables)
  DELETE FROM auth.users WHERE id = user_id;
  
  -- If we reach here, deletion was successful
  RETURN;
END;
$$;