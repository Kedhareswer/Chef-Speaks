import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, Star, Play, Flame, Globe, Heart } from 'lucide-react';
import { Recipe } from '../types';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfFavorite();
    }
  }, [user, recipe.id]);

  const checkIfFavorite = async () => {
    if (!user) return;
    
    try {
      const favorites = await userService.getUserFavorites(user.id);
      setIsFavorite(favorites.includes(recipe.id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isUpdatingFavorite) return;

    setIsUpdatingFavorite(true);
    try {
      if (isFavorite) {
        await userService.removeFromFavorites(user.id, recipe.id);
        setIsFavorite(false);
      } else {
        await userService.addToFavorites(user.id, recipe.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-warm-green-600 bg-warm-green-50 border-warm-green-200';
      case 'Medium': return 'text-creamy-yellow-600 bg-creamy-yellow-50 border-creamy-yellow-200';
      case 'Hard': return 'text-terracotta-600 bg-terracotta-50 border-terracotta-200';
      default: return 'text-soft-brown-600 bg-soft-brown-50 border-soft-brown-200';
    }
  };

  const getCookTimeColor = (time: number) => {
    if (time <= 30) return 'text-warm-green-600 bg-warm-green-50 border-warm-green-200';
    if (time <= 60) return 'text-creamy-yellow-600 bg-creamy-yellow-50 border-creamy-yellow-200';
    return 'text-terracotta-600 bg-terracotta-50 border-terracotta-200';
  };

  return (
    <div className="group glass-organic backdrop-blur-organic rounded-5xl shadow-soft-xl overflow-hidden hover:shadow-soft-2xl transition-all duration-500 transform hover:-translate-y-2 border border-terracotta-200/30 card-organic-hover">
      {/* Recipe Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span className={`px-3 py-1 rounded-pill text-sm font-semibold border backdrop-blur-sm ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
            {recipe.rating && recipe.rating >= 4.5 && (
              <div className="bg-gradient-to-r from-creamy-yellow-400 to-terracotta-400 text-white px-2 py-1 rounded-pill text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                <Star className="w-3 h-3 fill-current" />
                Top Rated
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            {/* Favorite Button */}
            {user && (
              <button
                onClick={handleToggleFavorite}
                disabled={isUpdatingFavorite}
                className={`p-2 rounded-full backdrop-blur-sm transition-all transform hover:scale-110 ${
                  isFavorite 
                    ? 'bg-terracotta-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${isUpdatingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            
            {recipe.videoUrl && (
              <div className="bg-gradient-to-r from-terracotta-500 to-dusty-pink-500 text-white px-3 py-1 rounded-pill text-xs font-semibold flex items-center gap-1 backdrop-blur-sm">
                <Play className="w-3 h-3 fill-current" />
                Video
              </div>
            )}
            {recipe.cookTime <= 30 && (
              <div className="bg-gradient-to-r from-warm-green-500 to-muted-blue-500 text-white px-2 py-1 rounded-pill text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                <Flame className="w-3 h-3" />
                Quick
              </div>
            )}
          </div>
        </div>

        {/* Cuisine badge */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-creamy-yellow-50/90 backdrop-blur-sm text-soft-brown-800 px-3 py-1 rounded-pill text-sm font-semibold border border-creamy-yellow-200/50 flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {recipe.cuisine}
          </span>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-soft-brown-900 leading-tight mb-2 group-hover:text-warm-green-600 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-soft-brown-600 text-sm leading-relaxed line-clamp-2">{recipe.description}</p>
        </div>

        {/* Rating */}
        {recipe.rating && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= recipe.rating! ? 'text-creamy-yellow-400 fill-current' : 'text-soft-brown-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-soft-brown-700">{recipe.rating}</span>
            <span className="text-xs text-soft-brown-500">({recipe.totalRatings} reviews)</span>
          </div>
        )}

        {/* Recipe Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className={`text-center p-3 rounded-3xl border ${getCookTimeColor(recipe.cookTime)}`}>
            <Clock className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-semibold">{recipe.cookTime}m</div>
          </div>
          <div className="text-center p-3 rounded-3xl bg-muted-blue-50 text-muted-blue-600 border border-muted-blue-200">
            <Users className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-semibold">{recipe.servings}</div>
          </div>
          <div className="text-center p-3 rounded-3xl bg-light-lavender-50 text-light-lavender-600 border border-light-lavender-200">
            <ChefHat className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-semibold">{recipe.ingredients.length}</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-soft-brown-100 text-soft-brown-600 px-2 py-1 rounded-pill font-medium border border-soft-brown-200"
            >
              #{tag}
            </span>
          ))}
          {recipe.tags.length > 3 && (
            <span className="text-xs text-soft-brown-400 px-2 py-1">
              +{recipe.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(recipe)}
          className="w-full bg-gradient-to-r from-warm-green-500 via-terracotta-500 to-soft-brown-500 hover:from-warm-green-600 hover:via-terracotta-600 hover:to-soft-brown-600 text-white font-semibold py-4 px-6 rounded-4xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-warm-green-500/30 shadow-soft-lg hover:shadow-soft-xl"
        >
          {recipe.videoUrl ? 'View Recipe & Watch Video' : 'View Recipe'}
        </button>
      </div>
    </div>
  );
};