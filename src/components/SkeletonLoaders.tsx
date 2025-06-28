import React from 'react';

// Base skeleton animation component
const SkeletonBase: React.FC<{ className?: string; children?: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
);

// Individual skeleton elements
export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded ${className}`} />
);

export const SkeletonText: React.FC<{ className?: string; lines?: number }> = ({ 
  className = '', 
  lines = 1 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 rounded ${
          i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return <div className={`bg-gray-200 rounded-full ${sizeClasses[size]}`} />;
};

// App Loading Skeleton (main app initialization)
export const AppLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-creamy-yellow-50 via-warm-green-50 to-terracotta-50">
    <SkeletonBase>
      {/* Header Skeleton */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <SkeletonBox className="w-12 h-12 rounded-2xl" />
              <div>
                <SkeletonBox className="h-6 w-32 rounded mb-1" />
                <SkeletonBox className="h-3 w-40 rounded" />
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <SkeletonBox className="h-10 w-24 rounded-xl" />
              <SkeletonBox className="h-10 w-24 rounded-xl" />
              <SkeletonBox className="h-10 w-32 rounded-xl" />
              <SkeletonBox className="h-10 w-28 rounded-xl" />
            </div>
            <SkeletonBox className="h-10 w-20 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Search Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SkeletonBox className="h-14 w-full rounded-2xl" />
      </div>

      {/* Hero Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SkeletonBox className="h-48 w-full rounded-3xl mb-8" />
        
        {/* Quick Access Cards Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <SkeletonBox className="w-12 h-12 rounded-xl" />
                <SkeletonBox className="h-6 w-32 rounded" />
              </div>
              <SkeletonBox className="h-4 w-40 rounded mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(j => (
                  <SkeletonBox key={j} className="h-16 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonBase>
  </div>
);

// Recipe Card Skeleton
export const RecipeCardSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image */}
      <SkeletonBox className="h-48 w-full" />
      
      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <SkeletonBox className="h-6 w-3/4 rounded mb-2" />
        
        {/* Description */}
        <SkeletonText lines={2} className="mb-3" />
        
        {/* Tags */}
        <div className="flex gap-2 mb-3">
          <SkeletonBox className="h-6 w-16 rounded-full" />
          <SkeletonBox className="h-6 w-20 rounded-full" />
          <SkeletonBox className="h-6 w-14 rounded-full" />
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <SkeletonBox className="w-4 h-4 rounded" />
              <SkeletonBox className="h-4 w-8 rounded" />
            </div>
            <div className="flex items-center gap-1">
              <SkeletonBox className="w-4 h-4 rounded" />
              <SkeletonBox className="h-4 w-12 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <SkeletonBox className="w-4 h-4 rounded" />
            <SkeletonBox className="h-4 w-6 rounded" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// Recipe Grid Skeleton
export const RecipeGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <RecipeCardSkeleton key={i} />
    ))}
  </div>
);

// Recipe Detail Skeleton
export const RecipeDetailSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="min-h-screen bg-gradient-to-br from-creamy-yellow-50 via-warm-green-50 to-terracotta-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <SkeletonBox className="w-10 h-10 rounded-lg" />
            <SkeletonBox className="h-8 w-48 rounded" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <SkeletonBox className="h-64 md:h-80 w-full rounded-3xl mb-8" />
        
        {/* Title and Info */}
        <div className="mb-8">
          <SkeletonBox className="h-8 w-3/4 rounded mb-4" />
          <SkeletonText lines={3} className="mb-6" />
          
          {/* Recipe Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center p-4 bg-white rounded-2xl border border-gray-200">
                <SkeletonBox className="w-8 h-8 rounded mx-auto mb-2" />
                <SkeletonBox className="h-6 w-12 rounded mx-auto mb-1" />
                <SkeletonBox className="h-4 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients and Instructions */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ingredients */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <SkeletonBox className="h-7 w-32 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBox className="w-4 h-4 rounded" />
                  <SkeletonBox className="h-4 flex-1 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <SkeletonBox className="h-7 w-32 rounded mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4">
                  <SkeletonBox className="w-8 h-8 rounded-full flex-shrink-0" />
                  <SkeletonText lines={2} className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// Recommendations Skeleton
export const RecommendationsSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <SkeletonBox className="h-7 w-56 rounded mb-2" />
            <SkeletonBox className="h-4 w-40 rounded" />
          </div>
          <SkeletonBox className="h-10 w-24 rounded-2xl" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[1, 2, 3, 4].map(i => (
            <SkeletonBox key={i} className="h-14 w-32 m-1 rounded" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <SkeletonBox className="h-4 w-3/4 rounded mb-6" />
        <RecipeGridSkeleton count={3} />
      </div>
    </div>
  </SkeletonBase>
);

// Nutrition Info Skeleton
export const NutritionSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="glass-organic rounded-3xl p-6 border border-warm-green-200/50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <SkeletonBox className="w-6 h-6 rounded" />
        <SkeletonBox className="h-6 w-32 rounded" />
      </div>

      {/* Macro nutrients */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="text-center p-3 bg-white/50 rounded-2xl border border-soft-brown-200/50">
            <SkeletonBox className="w-6 h-6 mx-auto mb-2 rounded" />
            <SkeletonBox className="h-6 w-12 mx-auto mb-1 rounded" />
            <SkeletonBox className="h-3 w-16 mx-auto rounded" />
          </div>
        ))}
      </div>

      {/* Detailed nutrients */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <SkeletonBox className="w-4 h-4 rounded" />
          <SkeletonBox className="h-5 w-32 rounded" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex justify-between items-center py-1">
              <SkeletonBox className="h-4 w-24 rounded" />
              <SkeletonBox className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// User Profile Skeleton
export const UserProfileSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-6">
          <SkeletonAvatar size="lg" />
          <div className="flex-1">
            <SkeletonBox className="h-8 w-48 rounded mb-2" />
            <SkeletonBox className="h-4 w-32 rounded mb-4" />
            <div className="flex gap-4">
              <SkeletonBox className="h-6 w-20 rounded" />
              <SkeletonBox className="h-6 w-24 rounded" />
              <SkeletonBox className="h-6 w-16 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 text-center">
            <SkeletonBox className="w-8 h-8 mx-auto mb-2 rounded" />
            <SkeletonBox className="h-6 w-12 mx-auto mb-1 rounded" />
            <SkeletonBox className="h-4 w-16 mx-auto rounded" />
          </div>
        ))}
      </div>

      {/* Settings Sections */}
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
          <SkeletonBox className="h-6 w-40 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map(j => (
              <div key={j} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="w-5 h-5 rounded" />
                  <SkeletonBox className="h-5 w-32 rounded" />
                </div>
                <SkeletonBox className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </SkeletonBase>
);

// Community Recipes Skeleton
export const CommunityRecipesSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <SkeletonBox className="h-8 w-48 rounded" />
        <SkeletonBox className="h-10 w-32 rounded-xl" />
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 overflow-x-auto">
        {[1, 2, 3, 4, 5].map(i => (
          <SkeletonBox key={i} className="h-10 w-24 rounded-xl flex-shrink-0" />
        ))}
      </div>

      {/* Recipe Grid */}
      <RecipeGridSkeleton count={6} />
    </div>
  </SkeletonBase>
);

// Shopping List Skeleton
export const ShoppingListSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <SkeletonBox className="h-8 w-40 rounded" />
        <SkeletonBox className="h-10 w-28 rounded-xl" />
      </div>

      {/* Lists */}
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <SkeletonBox className="h-6 w-32 rounded" />
            <SkeletonBox className="h-6 w-16 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="flex items-center gap-3">
                <SkeletonBox className="w-5 h-5 rounded" />
                <SkeletonBox className="h-4 flex-1 rounded" />
                <SkeletonBox className="h-4 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </SkeletonBase>
);

// Auth Modal Skeleton
export const AuthModalSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="bg-white rounded-3xl p-8 max-w-md mx-auto">
      <SkeletonBox className="h-8 w-32 rounded mb-6 mx-auto" />
      
      <div className="space-y-4">
        <div>
          <SkeletonBox className="h-4 w-16 rounded mb-2" />
          <SkeletonBox className="h-12 w-full rounded-xl" />
        </div>
        <div>
          <SkeletonBox className="h-4 w-20 rounded mb-2" />
          <SkeletonBox className="h-12 w-full rounded-xl" />
        </div>
        <SkeletonBox className="h-12 w-full rounded-xl" />
      </div>
      
      <div className="mt-6 text-center">
        <SkeletonBox className="h-4 w-48 rounded mx-auto" />
      </div>
    </div>
  </SkeletonBase>
);

// Meal Plan Skeleton
export const MealPlanSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <SkeletonBox className="h-8 w-40 rounded" />
        <div className="flex gap-2">
          <SkeletonBox className="h-10 w-10 rounded-lg" />
          <SkeletonBox className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <SkeletonBox key={day} className="h-8 rounded text-center" />
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-lg border border-gray-200 p-2">
            <SkeletonBox className="h-4 w-6 rounded mb-2" />
            <SkeletonBox className="h-3 w-full rounded mb-1" />
            <SkeletonBox className="h-3 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  </SkeletonBase>
);

// Search Results Skeleton
export const SearchResultsSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex justify-between items-center">
        <SkeletonBox className="h-6 w-48 rounded" />
        <SkeletonBox className="h-6 w-24 rounded" />
      </div>

      {/* Results */}
      <RecipeGridSkeleton count={9} />
    </div>
  </SkeletonBase>
);

export default {
  AppLoadingSkeleton,
  RecipeCardSkeleton,
  RecipeGridSkeleton,
  RecipeDetailSkeleton,
  RecommendationsSkeleton,
  NutritionSkeleton,
  UserProfileSkeleton,
  CommunityRecipesSkeleton,
  ShoppingListSkeleton,
  AuthModalSkeleton,
  MealPlanSkeleton,
  SearchResultsSkeleton,
  SkeletonBase,
  SkeletonBox,
  SkeletonText,
  SkeletonAvatar
};