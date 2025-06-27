import React, { useState, useEffect } from 'react'
import { Activity, Zap, Heart, Beef, Wheat, Droplets, AlertCircle } from 'lucide-react'
import { spoonacularService, NutritionInfo as NutritionData } from '../services/spoonacularService'
import { NutritionSkeleton } from './SkeletonLoaders'

interface NutritionInfoProps {
  recipeId?: string
  ingredients?: string[]
  servings?: number
  className?: string
}

export const NutritionInfo: React.FC<NutritionInfoProps> = ({
  recipeId,
  ingredients,
  servings = 1,
  className = ''
}) => {
  const [nutrition, setNutrition] = useState<NutritionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (recipeId || (ingredients && ingredients.length > 0)) {
      loadNutritionData()
    }
  }, [recipeId, ingredients, servings])

  const loadNutritionData = async () => {
    setLoading(true)
    setError(null)

    try {
      let nutritionData: NutritionData | null = null

      if (recipeId) {
        // Check if it's a Spoonacular recipe ID
        const spoonacularId = recipeId.startsWith('spoonacular-') 
          ? parseInt(recipeId.replace('spoonacular-', ''))
          : parseInt(recipeId)
        
        if (!isNaN(spoonacularId)) {
          console.log(`Getting nutrition for Spoonacular recipe ${spoonacularId}`)
          nutritionData = await spoonacularService.getRecipeNutrition(spoonacularId)
        }
      } else if (ingredients && ingredients.length > 0) {
        console.log(`Calculating nutrition from ${ingredients.length} ingredients`)
        // Calculate nutrition from ingredients
        nutritionData = await spoonacularService.getNutritionFromIngredients(ingredients, servings)
      }

      setNutrition(nutritionData)
      
      if (!nutritionData) {
        setError('Nutrition information not available for this recipe')
      }
    } catch (err) {
      console.error('Error loading nutrition data:', err)
      setError('Failed to load nutrition information. This may be due to API limitations.')
    } finally {
      setLoading(false)
    }
  }

  const retryLoad = () => {
    loadNutritionData()
  }

  if (loading) {
    return <NutritionSkeleton />;
  }

  if (error) {
    return (
      <div className={`glass-organic rounded-3xl p-6 border border-orange-200/50 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-soft-brown-900">Nutrition Facts</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-orange-600 mb-4">{error}</p>
          <button
            onClick={retryLoad}
            className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-2xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!nutrition) {
    return (
      <div className={`glass-organic rounded-3xl p-6 border border-soft-brown-200/50 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-soft-brown-400" />
          <h3 className="text-lg font-semibold text-soft-brown-600">Nutrition Facts</h3>
        </div>
        <p className="text-soft-brown-500 text-sm text-center py-4">
          Nutrition information not available for this recipe
        </p>
      </div>
    )
  }

  const macroNutrients = [
    { name: 'Calories', value: nutrition.calories, unit: '', icon: Zap, color: 'text-creamy-yellow-600' },
    { name: 'Protein', value: nutrition.protein, unit: '', icon: Beef, color: 'text-terracotta-600' },
    { name: 'Carbs', value: nutrition.carbs, unit: '', icon: Wheat, color: 'text-warm-green-600' },
    { name: 'Fat', value: nutrition.fat, unit: '', icon: Droplets, color: 'text-muted-blue-600' }
  ]

  return (
    <div className={`glass-organic rounded-3xl p-6 border border-warm-green-200/50 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-warm-green-500" />
        <h3 id="nutrition-title" className="text-lg font-semibold text-soft-brown-900">Nutrition Facts</h3>
        {servings > 1 && (
          <span className="text-sm text-soft-brown-500 bg-soft-brown-100 px-2 py-1 rounded-pill">
            Per serving ({servings} servings)
          </span>
        )}
      </div>

      {/* Macro nutrients */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {macroNutrients.map((macro) => (
          <div key={macro.name} className="text-center p-3 bg-white/50 rounded-2xl border border-soft-brown-200/50">
            <macro.icon className={`w-6 h-6 mx-auto mb-2 ${macro.color}`} />
            <div className="text-lg font-bold text-soft-brown-900">
              {typeof macro.value === 'number' ? macro.value : macro.value}
              {macro.unit}
            </div>
            <div className="text-xs text-soft-brown-600">{macro.name}</div>
          </div>
        ))}
      </div>

      {/* Detailed nutrients */}
      {nutrition.nutrients && nutrition.nutrients.length > 0 && (
        <div>
          <h4 className="font-semibold text-soft-brown-900 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-terracotta-500" />
            Detailed Breakdown
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {nutrition.nutrients
              .filter(nutrient => !['Calories', 'Protein', 'Carbohydrates', 'Fat'].includes(nutrient.name))
              .slice(0, 10)
              .map((nutrient, index) => (
                <div key={index} className="flex justify-between items-center py-1 border-b border-soft-brown-200/30 last:border-b-0">
                  <span className="text-sm text-soft-brown-700">{nutrient.name}</span>
                  <span className="text-sm font-medium text-soft-brown-900">
                    {Math.round(nutrient.amount * 100) / 100}{nutrient.unit}
                    {nutrient.percentOfDailyNeeds && (
                      <span className="text-xs text-soft-brown-500 ml-1">
                        ({Math.round(nutrient.percentOfDailyNeeds)}% DV)
                      </span>
                    )}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-soft-brown-500 text-center">
        * Nutritional values are estimates and may vary based on specific ingredients and preparation methods
      </div>
    </div>
  )
}