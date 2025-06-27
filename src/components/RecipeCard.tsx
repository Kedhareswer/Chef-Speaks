import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, Star, Play, Flame, Globe, Heart, Share2 } from 'lucide-react';
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

    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.description}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share canceled');
      }
    } else {
      // Fallback for browsers without native sharing
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(`${recipe.title}: ${window.location.href}`);
          // Could show a toast notification here
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
        }
      }
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
    <div className="group card-recipe">
      {/* Recipe Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2.5">
            <span className={`px-3 py-1.5 rounded-2xl text-sm font-bold border backdrop-blur-sm ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
            {recipe.rating && recipe.rating >= 4.5 && (
              <div className="bg-gradient-to-r from-creamy-yellow-400 to-terracotta-400 text-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm shadow-lg">
                <Star className="w-3.5 h-3.5 fill-current" />
                Top Rated
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2.5 items-end">
            {/* Action Buttons */}
            <div className="flex gap-2.5">
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="btn-secondary btn-sm touch-target backdrop-blur-sm bg-white/20 text-white hover:bg-white/30"
                title="Share recipe"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* Favorite Button */}
              {user && (
                <button
                  onClick={handleToggleFavorite}
                  disabled={isUpdatingFavorite}
                  className={`btn-sm touch-target backdrop-blur-sm ${
                    isFavorite 
                      ? 'bg-terracotta-500 text-white shadow-terracotta-500/30' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  } ${isUpdatingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
            
            {/* Recipe Type Badges */}
            <div className="flex flex-col gap-2 items-end">
              {recipe.videoUrl && (
                <div className="bg-gradient-to-r from-terracotta-500 to-dusty-pink-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm shadow-lg">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Video
                </div>
              )}
              {recipe.cookTime <= 30 && (
                <div className="bg-gradient-to-r from-warm-green-500 to-muted-blue-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm shadow-lg">
                  <Flame className="w-3.5 h-3.5" />
                  Quick
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cuisine badge */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-creamy-yellow-50/95 backdrop-blur-sm text-soft-brown-800 px-3 py-1.5 rounded-2xl text-sm font-bold border border-creamy-yellow-200/70 flex items-center gap-1.5 shadow-lg">
            <Globe className="w-4 h-4" />
            {recipe.cuisine}
          </span>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="card-padding flex flex-col" style={{ position: 'relative', zIndex: 1 }}>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-soft-brown-900 leading-tight mb-3 group-hover:text-warm-green-600 transition-colors line-clamp-2">
            {recipe.title}
          </h3>
          <p className="text-soft-brown-600 text-sm leading-relaxed line-clamp-2">{recipe.description}</p>
        </div>

        {/* Rating */}
        {recipe.rating && (
          <div className="flex items-center gap-3 mb-5">
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
            <span className="text-sm font-bold text-soft-brown-700">{recipe.rating}</span>
            <span className="text-xs text-soft-brown-500">({recipe.totalRatings} reviews)</span>
          </div>
        )}

        {/* Recipe Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className={`text-center p-3 rounded-2xl border ${getCookTimeColor(recipe.cookTime)}`}>
            <Clock className="w-5 h-5 mx-auto mb-1.5" />
            <div className="text-xs font-bold">{recipe.cookTime}m</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-muted-blue-50 text-muted-blue-600 border border-muted-blue-200">
            <Users className="w-5 h-5 mx-auto mb-1.5" />
            <div className="text-xs font-bold">{recipe.servings}</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-light-lavender-50 text-light-lavender-600 border border-light-lavender-200">
            <ChefHat className="w-5 h-5 mx-auto mb-1.5" />
            <div className="text-xs font-bold">{recipe.ingredients.length}</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-soft-brown-100 text-soft-brown-600 px-2.5 py-1 rounded-xl font-semibold border border-soft-brown-200"
            >
              #{tag}
            </span>
          ))}
          {recipe.tags.length > 3 && (
            <span className="text-xs text-soft-brown-400 px-2.5 py-1 font-medium">
              +{recipe.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => onSelect(recipe)}
            className="w-full btn-primary btn-lg"
            style={{ zIndex: 1 }}
          >
            {recipe.videoUrl ? 'View Recipe & Watch Video' : 'View Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
};