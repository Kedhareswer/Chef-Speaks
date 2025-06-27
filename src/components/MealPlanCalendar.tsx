import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Clock, Users, ChefHat, ArrowLeft, ArrowRight, Trash2, Grid3X3, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { mealPlanService, MealPlan } from '../services/mealPlanService';
import { recipeService } from '../services/recipeService';
import { Recipe } from '../types';
import { SkeletonBox } from './SkeletonLoaders';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const mealTypes = [
    { id: 'breakfast' as const, name: 'Breakfast', icon: '🌅', color: 'from-creamy-yellow-400 to-warm-green-400', bgColor: 'bg-creamy-yellow-50', textColor: 'text-creamy-yellow-700' },
    { id: 'lunch' as const, name: 'Lunch', icon: '☀️', color: 'from-warm-green-400 to-muted-blue-400', bgColor: 'bg-warm-green-50', textColor: 'text-warm-green-700' },
    { id: 'dinner' as const, name: 'Dinner', icon: '🌙', color: 'from-muted-blue-400 to-light-lavender-400', bgColor: 'bg-muted-blue-50', textColor: 'text-muted-blue-700' },
    { id: 'snack' as const, name: 'Snack', icon: '🍎', color: 'from-dusty-pink-400 to-terracotta-400', bgColor: 'bg-dusty-pink-50', textColor: 'text-dusty-pink-700' }
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

  const navigateDay = (direction: 'prev' | 'next') => {
    if (!selectedDay) return;
    const newDate = new Date(selectedDay);
    newDate.setDate(selectedDay.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDay(newDate);
  };

  const getDayMeals = (date: Date) => {
    const dateStr = formatDate(date);
    return mealTypes.map(mealType => ({
      mealType,
      mealPlan: getMealPlan(dateStr, mealType.id)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Mobile-First Header */}
        <div className="bg-white border-b border-gray-200 safe-area-top">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-warm-green-500 to-muted-blue-500 p-2.5 rounded-2xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Meal Planning</h2>
                  <p className="text-sm text-gray-600 hidden sm:block">Plan your weekly meals</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* View Mode Toggle & Navigation */}
            <div className="flex items-center justify-between mt-4 gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Week</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Day</span>
                </button>
              </div>

              {/* Navigation */}
              {viewMode === 'grid' ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {getWeekStart(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {getWeekEnd(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <button
                    onClick={() => navigateWeek('next')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateDay('prev')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-center min-w-[120px]">
                    <div className="text-sm font-semibold text-gray-900">
                      {(selectedDay || new Date()).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => navigateDay('next')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {loading ? (
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-4 shadow-sm">
                    <SkeletonBox className="h-6 w-32 rounded mb-3" />
                    <div className="space-y-2">
                      <SkeletonBox className="h-16 w-full rounded-2xl" />
                      <SkeletonBox className="h-16 w-full rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Grid View (Week) */}
              {viewMode === 'grid' && (
                <div className="p-4 sm:p-6">
                  {/* Mobile: Horizontal scroll for days */}
                  <div className="lg:hidden">
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                      {getWeekDays().map((day) => {
                        const dateStr = formatDate(day);
                        const isToday = dateStr === formatDate(new Date());
                        const dayMeals = getDayMeals(day);
                        
                        return (
                          <div
                            key={dateStr}
                            className={`flex-shrink-0 w-72 snap-center bg-white rounded-3xl shadow-sm border-2 transition-all ${
                              isToday 
                                ? 'border-warm-green-400 bg-warm-green-50/50' 
                                : 'border-gray-200'
                            }`}
                          >
                            {/* Day Header */}
                            <div className="p-4 border-b border-gray-100">
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className={`text-2xl font-bold ${isToday ? 'text-warm-green-600' : 'text-gray-900'}`}>
                                  {day.getDate()}
                                </div>
                                {isToday && (
                                  <div className="text-xs text-warm-green-600 font-medium mt-1">Today</div>
                                )}
                              </div>
                            </div>

                            {/* Meals */}
                            <div className="p-4 space-y-3">
                              {dayMeals.map(({ mealType, mealPlan }) => (
                                <div key={mealType.id}>
                                  {mealPlan ? (
                                    <div className={`relative group bg-gradient-to-r ${mealType.color} p-4 rounded-2xl text-white`}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{mealType.icon}</span>
                                        <span className="font-semibold text-sm">{mealType.name}</span>
                                      </div>
                                      <div className="font-bold text-sm mb-2 line-clamp-2" title={mealPlan.recipe?.title}>
                                        {mealPlan.recipe?.title}
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-white/90">
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{mealPlan.recipe?.cookTime}m</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          <span>{mealPlan.servings}</span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveMeal(mealPlan.id)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 rounded-full p-1.5"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleAddMeal(dateStr, mealType.id)}
                                      className={`w-full p-4 border-2 border-dashed border-gray-300 hover:border-warm-green-400 rounded-2xl transition-all ${mealType.bgColor} hover:bg-warm-green-50`}
                                    >
                                      <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-warm-green-600">
                                        <span className="text-lg">{mealType.icon}</span>
                                        <div className="text-left">
                                          <div className="text-sm font-medium">{mealType.name}</div>
                                          <div className="text-xs text-gray-500">Add meal</div>
                                        </div>
                                        <Plus className="w-4 h-4 ml-auto" />
                                      </div>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop: Grid layout */}
                  <div className="hidden lg:block">
                    <div className="grid grid-cols-7 gap-6">
                      {/* Day Headers */}
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                        <div key={day} className="text-center font-semibold text-gray-700 py-3 text-sm">
                          {day}
                        </div>
                      ))}

                      {/* Day Cells */}
                      {getWeekDays().map((day) => {
                        const dateStr = formatDate(day);
                        const isToday = dateStr === formatDate(new Date());
                        const dayMeals = getDayMeals(day);
                        
                        return (
                          <div
                            key={dateStr}
                            className={`bg-white rounded-2xl shadow-sm border-2 transition-all min-h-[400px] ${
                              isToday 
                                ? 'border-warm-green-400 bg-warm-green-50/30' 
                                : 'border-gray-200'
                            }`}
                          >
                            {/* Day Header */}
                            <div className="p-3 border-b border-gray-100">
                              <div className="text-center">
                                <div className={`text-lg font-bold ${isToday ? 'text-warm-green-600' : 'text-gray-900'}`}>
                                  {day.getDate()}
                                </div>
                                {isToday && (
                                  <div className="text-xs text-warm-green-600 font-medium">Today</div>
                                )}
                              </div>
                            </div>

                            {/* Meals */}
                            <div className="p-3 space-y-2">
                              {dayMeals.map(({ mealType, mealPlan }) => (
                                <div key={mealType.id}>
                                  {mealPlan ? (
                                    <div className={`relative group bg-gradient-to-r ${mealType.color} p-3 rounded-xl text-white`}>
                                      <div className="flex items-center gap-1 mb-1">
                                        <span className="text-sm">{mealType.icon}</span>
                                        <span className="font-medium text-xs">{mealType.name}</span>
                                      </div>
                                      <div className="font-semibold text-xs mb-1 line-clamp-2" title={mealPlan.recipe?.title}>
                                        {mealPlan.recipe?.title}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-white/80">
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
                                      className="w-full p-2 border-2 border-dashed border-gray-300 hover:border-warm-green-400 rounded-xl text-gray-500 hover:text-warm-green-600 transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>{mealType.icon}</span>
                                      <span>{mealType.name}</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* List View (Day) */}
              {viewMode === 'list' && (
                <div className="p-4 sm:p-6">
                  <div className="max-w-2xl mx-auto space-y-4">
                    {getDayMeals(selectedDay || new Date()).map(({ mealType, mealPlan }) => (
                      <div key={mealType.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className={`${mealType.bgColor} px-6 py-4 border-b border-gray-100`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{mealType.icon}</span>
                            <div>
                              <h3 className={`text-lg font-bold ${mealType.textColor}`}>{mealType.name}</h3>
                              <p className="text-sm text-gray-600">
                                {(selectedDay || new Date()).toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          {mealPlan ? (
                            <div className="flex items-start gap-4">
                              <img
                                src={mealPlan.recipe?.imageUrl || ''}
                                alt={mealPlan.recipe?.title}
                                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-gray-900 mb-2">{mealPlan.recipe?.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{mealPlan.recipe?.cookTime} minutes</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{mealPlan.servings} servings</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ChefHat className="w-4 h-4" />
                                    <span>{mealPlan.recipe?.difficulty}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveMeal(mealPlan.id)}
                                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove from plan
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddMeal(formatDate(selectedDay || new Date()), mealType.id)}
                              className="w-full p-6 border-2 border-dashed border-gray-300 hover:border-warm-green-400 rounded-2xl transition-all hover:bg-warm-green-50 group"
                            >
                              <div className="flex flex-col items-center gap-3 text-gray-600 group-hover:text-warm-green-600">
                                <Plus className="w-8 h-8" />
                                <div className="text-center">
                                  <div className="font-semibold">Add {mealType.name}</div>
                                  <div className="text-sm text-gray-500">Choose a recipe for this meal</div>
                                </div>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Meal Modal */}
        {showAddMeal && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm">
            <div className="h-full flex flex-col">
              <div className="bg-white border-b border-gray-200 safe-area-top">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Add {selectedMealType}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddMeal(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="text-left bg-white rounded-3xl shadow-sm border border-gray-200 hover:border-warm-green-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    >
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{recipe.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{recipe.cookTime}m</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{recipe.servings}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ChefHat className="w-4 h-4" />
                            <span>{recipe.difficulty}</span>
                          </div>
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