import React, { useState } from 'react';
import { Users, Plus, Star, Upload } from 'lucide-react';
import { Recipe, UserRecipe } from '../types';
import { getUserRecipes, addUserRecipe, convertUserRecipeToRecipe } from '../data/userRecipes';
import { RecipeCard } from './RecipeCard';
import { AddRecipeForm } from './AddRecipeForm';

interface CommunityRecipesProps {
  onRecipeSelect: (recipe: Recipe) => void;
  onRecipesUpdate: (recipes: Recipe[]) => void;
  allRecipes: Recipe[];
}

export const CommunityRecipes: React.FC<CommunityRecipesProps> = ({
  onRecipeSelect,
  onRecipesUpdate,
  allRecipes
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [communityRecipes, setCommunityRecipes] = useState<Recipe[]>(
    getUserRecipes().map(convertUserRecipeToRecipe)
  );

  const handleAddRecipe = (userRecipe: UserRecipe) => {
    const addedRecipe = addUserRecipe(userRecipe);
    const newRecipe = convertUserRecipeToRecipe(addedRecipe);
    
    const updatedCommunityRecipes = [newRecipe, ...communityRecipes];
    setCommunityRecipes(updatedCommunityRecipes);
    
    // Update the main recipes list
    const updatedAllRecipes = [...allRecipes, newRecipe];
    onRecipesUpdate(updatedAllRecipes);
    
    setShowAddForm(false);
  };

  const averageRating = communityRecipes.reduce((acc, recipe) => acc + (recipe.rating || 0), 0) / communityRecipes.length;
  const totalRecipes = communityRecipes.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-light-lavender-500 to-dusty-pink-500 rounded-5xl p-6 text-white shadow-soft-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-3xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Community Recipes</h1>
              <p className="text-white/90">Discover and share amazing recipes from our cooking community</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white btn-md flex items-center gap-2 touch-target"
          >
            <Plus className="w-5 h-5" />
            Add Recipe
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{totalRecipes}</div>
            <div className="text-white/80 text-sm">Community Recipes</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-6 h-6 fill-current text-creamy-yellow-300" />
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <div className="text-white/80 text-sm">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {Math.round(communityRecipes.reduce((acc, recipe) => acc + recipe.cookTime, 0) / totalRecipes)}m
            </div>
            <div className="text-white/80 text-sm">Avg Cook Time</div>
          </div>
        </div>
      </div>

      {/* Add Recipe Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-organic rounded-4xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-terracotta-200/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-light-lavender-500" />
                  <h2 className="text-2xl font-bold text-soft-brown-900">Share Your Recipe</h2>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-soft-brown-400 hover:text-soft-brown-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <AddRecipeForm
              onSubmit={handleAddRecipe}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Recipes Grid */}
      {communityRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {communityRecipes.map((recipe) => (
            <div key={recipe.id} className="relative">
              <RecipeCard
                recipe={recipe}
                onSelect={onRecipeSelect}
              />
              {/* Community Badge - positioned to not interfere with card */}
              <div className="absolute top-3 left-3 bg-light-lavender-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm" style={{ zIndex: 20 }}>
                <Users className="w-3 h-3" />
                Community
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-soft-brown-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-soft-brown-600 mb-2">No community recipes yet</h3>
          <p className="text-soft-brown-500 mb-6">Be the first to share your favorite recipe with the community!</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary btn-lg"
          >
            Share Your First Recipe
          </button>
        </div>
      )}
    </div>
  );
};