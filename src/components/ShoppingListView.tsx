import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Check, Trash2, Edit3, Save, Calendar, ChefHat, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { shoppingListService, ShoppingList, ShoppingListItem } from '../services/shoppingListService';
import { mealPlanService } from '../services/mealPlanService';

interface ShoppingListViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadShoppingLists();
    }
  }, [isOpen, user]);

  const loadShoppingLists = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const lists = await shoppingListService.getUserShoppingLists(user.id);
      setShoppingLists(lists);
      if (lists.length > 0 && !selectedList) {
        setSelectedList(lists[0]);
      }
    } catch (error) {
      console.error('Error loading shopping lists:', error);
      setError('Failed to load shopping lists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newListName.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const newList = await shoppingListService.createShoppingList(user.id, newListName.trim());
      if (newList) {
        setShoppingLists([newList, ...shoppingLists]);
        setSelectedList(newList);
        setNewListName('');
        setShowCreateForm(false);
      } else {
        setError('Failed to create shopping list. Please try again.');
      }
    } catch (error) {
      console.error('Error creating shopping list:', error);
      setError('Failed to create shopping list. Please check your connection and try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this shopping list?')) return;

    try {
      const success = await shoppingListService.deleteShoppingList(listId);
      if (success) {
        const updatedLists = shoppingLists.filter(list => list.id !== listId);
        setShoppingLists(updatedLists);
        if (selectedList?.id === listId) {
          setSelectedList(updatedLists[0] || null);
        }
      } else {
        setError('Failed to delete shopping list. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      setError('Failed to delete shopping list. Please try again.');
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!selectedList) return;

    const updatedItems = selectedList.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    try {
      const updatedList = await shoppingListService.updateShoppingList(selectedList.id, {
        items: updatedItems
      });
      if (updatedList) {
        setSelectedList(updatedList);
        setShoppingLists(lists => 
          lists.map(list => list.id === updatedList.id ? updatedList : list)
        );
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Failed to update item. Please try again.');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedList || !newItemText.trim()) return;

    const newItem: ShoppingListItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ingredient: newItemText.trim(),
      quantity: 1,
      unit: 'item',
      checked: false
    };

    const updatedItems = [...selectedList.items, newItem];

    try {
      const updatedList = await shoppingListService.updateShoppingList(selectedList.id, {
        items: updatedItems
      });
      if (updatedList) {
        setSelectedList(updatedList);
        setShoppingLists(lists => 
          lists.map(list => list.id === updatedList.id ? updatedList : list)
        );
        setNewItemText('');
      } else {
        setError('Failed to add item. Please try again.');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item. Please try again.');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!selectedList) return;

    const updatedItems = selectedList.items.filter(item => item.id !== itemId);

    try {
      const updatedList = await shoppingListService.updateShoppingList(selectedList.id, {
        items: updatedItems
      });
      if (updatedList) {
        setSelectedList(updatedList);
        setShoppingLists(lists => 
          lists.map(list => list.id === updatedList.id ? updatedList : list)
        );
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item. Please try again.');
    }
  };

  const handleGenerateFromMealPlan = async () => {
    if (!user) return;

    setError(null);
    try {
      // Get current week's meal plans
      const today = new Date();
      const startDate = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
      const endDate = new Date(today.setDate(today.getDate() + 6)).toISOString().split('T')[0];
      
      const mealPlans = await mealPlanService.getUserMealPlans(user.id, startDate, endDate);
      
      if (mealPlans.length === 0) {
        setError('No meal plans found for this week. Please add some meals to your calendar first.');
        return;
      }

      const recipeIds = mealPlans.map(plan => plan.recipeId);
      const listName = `Shopping List - Week of ${new Date(startDate).toLocaleDateString()}`;
      
      const generatedList = await shoppingListService.generateShoppingListFromRecipes(
        user.id,
        recipeIds,
        listName
      );

      if (generatedList) {
        setShoppingLists([generatedList, ...shoppingLists]);
        setSelectedList(generatedList);
      } else {
        setError('Failed to generate shopping list from meal plan. Please try again.');
      }
    } catch (error) {
      console.error('Error generating shopping list from meal plan:', error);
      setError('Failed to generate shopping list from meal plan. Please try again.');
    }
  };

  const getCompletionPercentage = (list: ShoppingList) => {
    if (list.items.length === 0) return 0;
    const checkedItems = list.items.filter(item => item.checked).length;
    return Math.round((checkedItems / list.items.length) * 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-organic rounded-4xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-terracotta-200/30 shadow-soft-2xl">
        {/* Header */}
        <div className="p-6 border-b border-terracotta-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-muted-blue-500 to-light-lavender-500 p-3 rounded-3xl">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-soft-brown-900">Shopping Lists</h2>
                <p className="text-soft-brown-600">Organize your grocery shopping</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-soft-brown-400 hover:text-soft-brown-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-3xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Lists */}
          <div className="w-1/3 border-r border-terracotta-200/30 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-soft-brown-900">My Lists</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-warm-green-500 hover:bg-warm-green-600 text-white p-2 rounded-2xl transition-colors"
                title="Create new shopping list"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Generate from Meal Plan Button */}
            <button
              onClick={handleGenerateFromMealPlan}
              className="w-full mb-4 p-3 bg-gradient-to-r from-terracotta-100 to-dusty-pink-100 hover:from-terracotta-200 hover:to-dusty-pink-200 text-terracotta-700 rounded-3xl transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Calendar className="w-4 h-4" />
              Generate from Meal Plan
            </button>

            {/* Create Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateList} className="mb-4 p-4 bg-warm-green-50 rounded-3xl border border-warm-green-200">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name"
                  className="w-full px-3 py-2 border border-soft-brown-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-warm-green-500 mb-3"
                  autoFocus
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating || !newListName.trim()}
                    className="flex-1 bg-warm-green-500 hover:bg-warm-green-600 text-white py-2 px-3 rounded-2xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create List'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewListName('');
                    }}
                    disabled={creating}
                    className="px-3 py-2 bg-soft-brown-200 hover:bg-soft-brown-300 text-soft-brown-700 rounded-2xl text-sm transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Lists */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warm-green-500 mx-auto mb-2"></div>
                <p className="text-soft-brown-600 text-sm">Loading lists...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {shoppingLists.map((list) => (
                  <div
                    key={list.id}
                    className={`p-3 rounded-2xl cursor-pointer transition-all ${
                      selectedList?.id === list.id
                        ? 'bg-muted-blue-100 border-2 border-muted-blue-300'
                        : 'bg-white/50 hover:bg-white/80 border border-soft-brown-200'
                    }`}
                    onClick={() => setSelectedList(list)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-soft-brown-900 truncate">{list.name}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id);
                        }}
                        className="text-terracotta-500 hover:text-terracotta-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-soft-brown-600">
                        {list.items.length} items
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-soft-brown-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-warm-green-500 to-muted-blue-500 transition-all"
                            style={{ width: `${getCompletionPercentage(list)}%` }}
                          />
                        </div>
                        <span className="text-xs text-soft-brown-500">
                          {getCompletionPercentage(list)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {shoppingLists.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-soft-brown-400 mx-auto mb-3" />
                    <p className="text-soft-brown-500 text-sm">No shopping lists yet</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="mt-2 text-warm-green-600 hover:text-warm-green-700 font-medium text-sm"
                    >
                      Create your first list
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Content - Selected List */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedList ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-soft-brown-900">{selectedList.name}</h3>
                    <p className="text-soft-brown-600">
                      {selectedList.items.filter(item => item.checked).length} of {selectedList.items.length} items completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-muted-blue-600">
                      {getCompletionPercentage(selectedList)}%
                    </div>
                    <div className="text-sm text-soft-brown-500">Complete</div>
                  </div>
                </div>

                {/* Add Item Form */}
                <form onSubmit={handleAddItem} className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Add new item..."
                      className="flex-1 px-4 py-3 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-muted-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newItemText.trim()}
                      className="bg-muted-blue-500 hover:bg-muted-blue-600 text-white px-6 py-3 rounded-3xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </form>

                {/* Items List */}
                <div className="space-y-2">
                  {selectedList.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        item.checked
                          ? 'bg-warm-green-50 border-warm-green-200'
                          : 'bg-white/50 border-soft-brown-200'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          item.checked
                            ? 'bg-warm-green-500 border-warm-green-500 text-white'
                            : 'border-soft-brown-300 hover:border-warm-green-400'
                        }`}
                      >
                        {item.checked && <Check className="w-4 h-4" />}
                      </button>

                      <div className="flex-1">
                        <div className={`font-medium ${item.checked ? 'line-through text-soft-brown-500' : 'text-soft-brown-900'}`}>
                          {item.ingredient}
                        </div>
                        <div className="text-sm text-soft-brown-600">
                          {item.quantity} {item.unit}
                          {item.recipeName && (
                            <span className="ml-2 text-muted-blue-600 flex items-center gap-1">
                              <ChefHat className="w-3 h-3" />
                              {item.recipeName}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-terracotta-500 hover:text-terracotta-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {selectedList.items.length === 0 && (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-soft-brown-400 mx-auto mb-4" />
                      <p className="text-soft-brown-500">No items in this list yet</p>
                      <p className="text-sm text-soft-brown-400">Add items above or generate from your meal plan</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <ShoppingCart className="w-20 h-20 text-soft-brown-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-soft-brown-600 mb-2">No shopping list selected</h3>
                <p className="text-soft-brown-500 mb-6">Create a new list or select an existing one to get started</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-warm-green-500 to-muted-blue-500 hover:from-warm-green-600 hover:to-muted-blue-600 text-white font-semibold py-3 px-6 rounded-3xl transition-all transform hover:scale-105"
                >
                  Create Your First List
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};