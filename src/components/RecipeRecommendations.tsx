import React, { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Users, Calendar, RefreshCw } from 'lucide-react'

import { Recipe } from '../types'
import { RecipeCard } from './RecipeCard'
import { useAuth } from '../hooks/useAuth'
import { recommendationService } from '../services/recommendationService'
import { RecipeGridSkeleton, SkeletonBox } from './SkeletonLoaders'

interface RecipeRecommendationsProps {
  onRecipeSelect: (recipe: Recipe) => void
  className?: string
}

export const RecipeRecommendations: React.FC<RecipeRecommendationsProps> = ({
  onRecipeSelect,
  className = ''
}) => {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<{
    ai_generated: Recipe[]
    trending: Recipe[]
    similar_users: Recipe[]
    seasonal: Recipe[]
  }>({
    ai_generated: [],
    trending: [],
    similar_users: [],
    seasonal: []
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'ai_generated' | 'trending' | 'similar_users' | 'seasonal'>('ai_generated')

  useEffect(() => {
    if (user) {
      loadRecommendations()
    }
  }, [user])

  const loadRecommendations = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [aiRecs, trendingRecs, similarRecs, seasonalRecs] = await Promise.all([
        recommendationService.getAIRecommendations(user.id),
        recommendationService.getTrendingRecommendations(user.id),
        recommendationService.getSimilarUserRecommendations(user.id),
        recommendationService.getSeasonalRecommendations(user.id)
      ])

      setRecommendations({
        ai_generated: aiRecs,
        trending: trendingRecs,
        similar_users: similarRecs,
        seasonal: seasonalRecs
      })
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshRecommendations = async () => {
    if (!user) return

    setLoading(true)
    try {
      await recommendationService.generateRecommendations(user.id)
      await loadRecommendations()
    } catch (error) {
      console.error('Error refreshing recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    {
      id: 'ai_generated' as const,
      name: 'AI Picks',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      description: 'Personalized recommendations based on your preferences'
    },
    {
      id: 'trending' as const,
      name: 'Trending',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      description: 'Popular recipes trending in the community'
    },
    {
      id: 'similar_users' as const,
      name: 'Similar Tastes',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      description: 'Recipes loved by users with similar preferences'
    },
    {
      id: 'seasonal' as const,
      name: 'Seasonal',
      icon: Calendar,
      color: 'from-green-500 to-teal-500',
      description: 'Perfect recipes for the current season'
    }
  ]

  const currentRecommendations = recommendations[activeTab]

  if (!user) {
    return (
      <div className={`bg-white rounded-3xl p-8 shadow-lg border border-gray-200 text-center ${className}`}>
        <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Personalized Recommendations</h3>
        <p className="text-gray-500">Sign in to get AI-powered recipe recommendations tailored just for you!</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe Recommendations</h2>
            <p className="text-gray-600">Discover your next favorite dish</p>
          </div>
          <button
            onClick={refreshRecommendations}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-2xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const count = recommendations[tab.id].length

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
                {count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="animate-pulse">
            {/* Tab Description Skeleton */}
            <SkeletonBox className="h-4 w-3/4 rounded mb-6" />
            
            {/* Recipe Grid Skeleton */}
            <RecipeGridSkeleton count={3} />
          </div>
        ) : currentRecommendations.length > 0 ? (
          <>
            {/* Tab Description */}
            <div className="mb-6">
              <p className="text-gray-600">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentRecommendations.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={onRecipeSelect}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${tabs.find(tab => tab.id === activeTab)?.color} flex items-center justify-center mx-auto mb-4`}>
              {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon || Sparkles, {
                className: "w-8 h-8 text-white"
              })}
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No recommendations yet</h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'ai_generated' && 'Complete your profile and rate some recipes to get personalized recommendations'}
              {activeTab === 'trending' && 'Check back later for trending recipes'}
              {activeTab === 'similar_users' && 'Rate more recipes to find users with similar tastes'}
              {activeTab === 'seasonal' && 'Seasonal recommendations will appear based on your location and time of year'}
            </p>
            <button
              onClick={refreshRecommendations}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105"
            >
              Generate Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  )
}