import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Clock, Users, ChefHat, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { mealPlanService, MealPlan } from '../services/mealPlanService';
import { recipeService } from '../services/recipeService';
import { Recipe } from '../types';

interface MealPlanCalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  const mealTypes = [
    { id: 'breakfast' as const, name: 'Breakfast', icon: '🌅', color: 'from-creamy-yellow-500 to-warm-green-500' },
    { id: 'lunch' as const, name: 'Lunch', icon: '☀️', color: 'from-warm-green-500 to-muted-blue-500' },
    { id: 'dinner' as const, name: 'Dinner', icon: '🌙', color: 'from-muted-blue-500 to-light-lavender-500' },
    { id: 'snack' as const, name: 'Snack', icon: '🍎', color: 'from-dusty-pink-500 to-terracotta-500' }
  ];

  useEffect(() => {
    if (isOpen && user) {
      loadMealPlans();
      loadRecipes();
    }
  }, [isOpen, user, currentDate]);

  const loadMealPlans = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const startDate = getWeekStart(currentDate).toISOString().split('T')[0];
      const endDate = getWeekEnd(currentDate).toISOString().split('T')[0];
      
      const plans = await mealPlanService.getUserMealPlans(user.id, startDate, endDate);
      setMealPlans(plans);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      const allRecipes = await recipeService.getAllRecipes();
      setRecipes(allRecipes.slice(0, 20)); // Limit for performance
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    return new Date(start.setDate(diff));
  };

  const getWeekEnd = (date: Date) => {
    const end = getWeekStart(date);
    return new Date(end.setDate(end.getDate() + 6));
  };

  const getWeekDays = () => {
    const start = getWeekStart(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getMealPlan = (date: string, mealType: string) => {
    return mealPlans.find(plan => plan.date === date && plan.mealType === mealType);
  };

  const handleAddMeal = (date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setShowAddMeal(true);
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    if (!user || !selectedDate) return;

    try {
      await mealPlanService.addMealToPlan(user.id, selectedDate, selectedMealType, recipe.id);
      setShowAddMeal(false);
      loadMealPlans();
    } catch (error) {
      console.error('Error adding meal to plan:', error);
    }
  };

  const handleRemoveMeal = async (mealPlanId: string) => {
    try {
      await mealPlanService.removeMealFromPlan(mealPlanId);
      loadMealPlans();
    } catch (error) {
      console.error('Error removing meal from plan:', error);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-organic rounded-4xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-terracotta-200/30 shadow-soft-2xl">
        {/* Header */}
        <div className="p-6 border-b border-terracotta-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-warm-green-500 to-muted-blue-500 p-3 rounded-3xl">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-soft-brown-900">Meal Planning Calendar</h2>
                <p className="text-soft-brown-600">Plan your weekly meals and stay organized</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-soft-brown-400 hover:text-soft-brown-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => navigateWeek('prev')}
              className="flex items-center gap-2 px-4 py-2 bg-soft-brown-100 hover:bg-soft-brown-200 text-soft-brown-700 rounded-3xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Week
            </button>
            
            <h3 className="text-lg font-semibold text-soft-brown-900">
              {getWeekStart(currentDate).toLocaleDateString()} - {getWeekEnd(currentDate).toLocaleDateString()}
            </h3>
            
            <button
              onClick={() => navigateWeek('next')}
              className="flex items-center gap-2 px-4 py-2 bg-soft-brown-100 hover:bg-soft-brown-200 text-soft-brown-700 rounded-3xl transition-colors"
            >
              Next Week
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-green-500 mx-auto mb-4"></div>
              <p className="text-soft-brown-600">Loading meal plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-soft-brown-700 py-2">
                  {day}
                </div>
              ))}

              {/* Day Cells */}
              {getWeekDays().map((day) => {
                const dateStr = formatDate(day);
                const isToday = dateStr === formatDate(new Date());
                
                return (
                  <div
                    key={dateStr}
                    className={`min-h-[300px] p-3 rounded-3xl border-2 transition-all ${
                      isToday 
                        ? 'border-warm-green-500 bg-warm-green-50' 
                        : 'border-soft-brown-200 bg-white/50'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <div className={`text-lg font-bold ${isToday ? 'text-warm-green-600' : 'text-soft-brown-900'}`}>
                        {day.getDate()}
                      </div>
                      {isToday && (
                        <div className="text-xs text-warm-green-600 font-medium">Today</div>
                      )}
                    </div>

                    {/* Meals for this day */}
                    <div className="space-y-2">
                      {mealTypes.map((mealType) => {
                        const mealPlan = getMealPlan(dateStr, mealType.id);
                        
                        return (
                          <div key={mealType.id} className="relative">
                            {mealPlan ? (
                              <div className={`bg-gradient-to-r ${mealType.color} p-2 rounded-2xl text-white text-xs relative group`}>
                                <div className="flex items-center gap-1 mb-1">
                                  <span>{mealType.icon}</span>
                                  <span className="font-medium">{mealType.name}</span>
                                </div>
                                <div className="font-semibold truncate" title={mealPlan.recipe?.title}>
                                  {mealPlan.recipe?.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-white/80">
                                  <Clock className="w-3 h-3" />
                                  <span>{mealPlan.recipe?.cookTime}m</span>
                                  <Users className="w-3 h-3" />
                                  <span>{mealPlan.servings}</span>
                                </div>
                                <button
                                  onClick={() => handleRemoveMeal(mealPlan.id)}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 rounded-full p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddMeal(dateStr, mealType.id)}
                                className="w-full p-2 border-2 border-dashed border-soft-brown-300 hover:border-warm-green-400 rounded-2xl text-soft-brown-500 hover:text-warm-green-600 transition-colors text-xs flex items-center justify-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>{mealType.icon}</span>
                                <span>{mealType.name}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Meal Modal */}
        {showAddMeal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-organic rounded-4xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-terracotta-200/30 shadow-soft-2xl">
              <div className="p-6 border-b border-terracotta-200/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-soft-brown-900">
                    Add {selectedMealType} for {new Date(selectedDate).toLocaleDateString()}
                  </h3>
                  <button
                    onClick={() => setShowAddMeal(false)}
                    className="text-soft-brown-400 hover:text-soft-brown-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="text-left p-4 bg-white/50 hover:bg-white/80 rounded-3xl border border-soft-brown-200 hover:border-warm-green-300 transition-all transform hover:scale-105"
                    >
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-32 object-cover rounded-2xl mb-3"
                      />
                      <h4 className="font-semibold text-soft-brown-900 mb-2 truncate">{recipe.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-soft-brown-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.cookTime}m
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.servings}
                        </div>
                        <div className="flex items-center gap-1">
                          <ChefHat className="w-4 h-4" />
                          {recipe.difficulty}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};