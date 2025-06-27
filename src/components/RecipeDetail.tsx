import React, { useState } from 'react';
import { ArrowLeft, Clock, Users, ChefHat, Check, MessageCircle, Activity, Share2 } from 'lucide-react';
import { Recipe } from '../types';
import { CommentsSection } from './CommentsSection';
import { NutritionInfo } from './NutritionInfo';
import { ShareRecipe } from './ShareRecipe';
import { CookingMode } from './CookingMode';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack }) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedInstructions, setCheckedInstructions] = useState<Set<number>>(new Set());
  const [showComments, setShowComments] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const toggleInstruction = (index: number) => {
    const newChecked = new Set(checkedInstructions);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedInstructions(newChecked);
  };

  // Improved toggle functions to ensure only one section is active at a time
  const toggleNutrition = () => {
    if (showNutrition) {
      setShowNutrition(false);
    } else {
      setShowNutrition(true);
      setShowComments(false); // Hide comments when showing nutrition
    }
  };

  const toggleComments = () => {
    if (showComments) {
      setShowComments(false);
    } else {
      setShowComments(true);
      setShowNutrition(false); // Hide nutrition when showing comments
    }
  };

  if (showCookingMode) {
    return <CookingMode recipe={recipe} onExit={() => setShowCookingMode(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-creamy-yellow-50 via-warm-green-50 to-terracotta-50">
      {/* Header */}
      <div className="relative h-64 bg-gradient-to-r from-warm-green-500 to-terracotta-500">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="absolute inset-0 bg-black/20" />
        
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{recipe.title}</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowShare(true)}
                className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                title="Share Recipe"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {recipe.isUserGenerated && (
                <span className="bg-light-lavender-500 text-white px-3 py-1 rounded-pill text-sm font-medium">
                  Community Recipe
                </span>
              )}
            </div>
          </div>
          <p className="text-lg opacity-90">{recipe.description}</p>
          {recipe.author && (
            <p className="text-sm opacity-75 mt-1">by {recipe.author}</p>
          )}
        </div>
      </div>

      {/* Video Tutorial */}
      {recipe.videoUrl && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="glass-organic rounded-4xl shadow-soft-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-terracotta-200/30">
              <h2 className="text-2xl font-bold text-soft-brown-900 mb-2">Video Tutorial</h2>
              <p className="text-soft-brown-600">Follow along with this step-by-step video guide</p>
            </div>
            <div className="aspect-video">
              <iframe
                src={recipe.videoUrl}
                title={`${recipe.title} - Video Tutorial`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        {/* Recipe Stats */}
        <div className="glass-organic rounded-4xl shadow-soft-lg p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-terracotta-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-soft-brown-900">{recipe.cookTime}m</div>
              <div className="text-sm text-soft-brown-500">Cook Time</div>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-muted-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-soft-brown-900">{recipe.servings}</div>
              <div className="text-sm text-soft-brown-500">Servings</div>
            </div>
            <div className="text-center">
              <ChefHat className="w-8 h-8 text-warm-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-soft-brown-900">{recipe.difficulty}</div>
              <div className="text-sm text-soft-brown-500">Difficulty</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-light-lavender-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">{recipe.cuisine[0]}</span>
              </div>
              <div className="text-2xl font-bold text-soft-brown-900">{recipe.cuisine}</div>
              <div className="text-sm text-soft-brown-500">Cuisine</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowCookingMode(true)}
            className="bg-gradient-to-r from-warm-green-500 to-terracotta-500 hover:from-warm-green-600 hover:to-terracotta-600 text-white font-semibold py-4 px-6 rounded-3xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <ChefHat className="w-5 h-5" />
            Start Cooking Mode
          </button>

          <button
            onClick={toggleNutrition}
            className={`font-semibold py-4 px-6 rounded-3xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
              showNutrition
                ? 'bg-gradient-to-r from-muted-blue-500 to-light-lavender-500 text-white shadow-lg'
                : 'bg-muted-blue-100 hover:bg-muted-blue-200 text-muted-blue-700 border border-muted-blue-200'
            }`}
            aria-expanded={showNutrition}
            aria-controls="nutrition-section"
            title={showNutrition ? 'Hide nutrition information' : 'Show nutrition information'}
          >
            <Activity className="w-5 h-5" />
            {showNutrition ? 'Hide Nutrition' : 'Show Nutrition'}
          </button>

          <button
            onClick={toggleComments}
            className={`font-semibold py-4 px-6 rounded-3xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
              showComments
                ? 'bg-gradient-to-r from-light-lavender-500 to-dusty-pink-500 text-white shadow-lg'
                : 'bg-light-lavender-100 hover:bg-light-lavender-200 text-light-lavender-700 border border-light-lavender-200'
            }`}
            aria-expanded={showComments}
            aria-controls="comments-section"
            title={showComments ? 'Hide comments and reviews' : 'Show comments and reviews'}
          >
            <MessageCircle className="w-5 h-5" />
            {showComments ? 'Hide Comments' : 'Show Comments'}
          </button>
        </div>

        {/* Nutrition Section */}
        {showNutrition && (
          <div 
            className="mb-8 transition-all duration-300 ease-in-out transform" 
            id="nutrition-section" 
            role="region" 
            aria-labelledby="nutrition-title"
          >
            <NutritionInfo
              recipeId={recipe.id}
              ingredients={recipe.ingredients}
              servings={recipe.servings}
            />
          </div>
        )}

        {/* Comments Section */}
        {showComments && (
          <div 
            className="mb-8 transition-all duration-300 ease-in-out transform" 
            id="comments-section" 
            role="region" 
            aria-labelledby="comments-title"
          >
            <CommentsSection recipeId={recipe.id} />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ingredients */}
          <div className="glass-organic rounded-4xl shadow-soft-lg p-6">
            <h2 className="text-2xl font-bold text-soft-brown-900 mb-6">Ingredients</h2>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-3xl hover:bg-warm-green-50 cursor-pointer transition-colors"
                >
                  <button
                    onClick={() => toggleIngredient(index)}
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${checkedIngredients.has(index)
                        ? 'bg-warm-green-500 border-warm-green-500 text-white'
                        : 'border-soft-brown-300 hover:border-warm-green-400'
                      }
                    `}
                  >
                    {checkedIngredients.has(index) && <Check className="w-4 h-4" />}
                  </button>
                  <span className={`
                    flex-1 transition-all
                    ${checkedIngredients.has(index) 
                      ? 'line-through text-soft-brown-500' 
                      : 'text-soft-brown-900'
                    }
                  `}>
                    {ingredient}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="glass-organic rounded-4xl shadow-soft-lg p-6">
            <h2 className="text-2xl font-bold text-soft-brown-900 mb-6">Instructions</h2>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-3xl hover:bg-muted-blue-50 transition-colors"
                >
                  <button
                    onClick={() => toggleInstruction(index)}
                    className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-1
                      ${checkedInstructions.has(index)
                        ? 'bg-muted-blue-500 border-muted-blue-500 text-white'
                        : 'border-soft-brown-300 hover:border-muted-blue-400'
                      }
                    `}
                  >
                    {checkedInstructions.has(index) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </button>
                  <p className={`
                    flex-1 transition-all
                    ${checkedInstructions.has(index) 
                      ? 'line-through text-soft-brown-500' 
                      : 'text-soft-brown-900'
                    }
                  `}>
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="glass-organic rounded-4xl shadow-soft-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-soft-brown-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gradient-to-r from-terracotta-100 to-dusty-pink-100 text-terracotta-700 px-3 py-1 rounded-pill text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareRecipe
        recipe={recipe}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
    </div>
  );
};