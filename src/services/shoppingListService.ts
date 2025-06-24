import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type ShoppingListRow = Database['public']['Tables']['shopping_lists']['Row']

export interface ShoppingListItem {
  id: string
  ingredient: string
  quantity: number
  unit: string
  checked: boolean
  recipeId?: string
  recipeName?: string
}

export interface ShoppingList {
  id: string
  userId: string
  name: string
  items: ShoppingListItem[]
  createdAt: string
  updatedAt: string
}

// Convert database row to ShoppingList type
const convertDbShoppingListToShoppingList = (dbList: ShoppingListRow): ShoppingList => ({
  id: dbList.id,
  userId: dbList.user_id,
  name: dbList.name,
  items: Array.isArray(dbList.items) ? dbList.items as ShoppingListItem[] : [],
  createdAt: dbList.created_at,
  updatedAt: dbList.updated_at
})

export const shoppingListService = {
  // Get user's shopping lists
  async getUserShoppingLists(userId: string): Promise<ShoppingList[]> {
    try {
      console.log('Fetching shopping lists for user:', userId)
      
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching shopping lists:', error)
        throw error
      }
      
      console.log('Fetched shopping lists:', data?.length || 0)
      return data?.map(convertDbShoppingListToShoppingList) || []
    } catch (error) {
      console.error('Error fetching shopping lists:', error)
      throw error
    }
  },

  // Create new shopping list
  async createShoppingList(userId: string, name: string, items: ShoppingListItem[] = []): Promise<ShoppingList | null> {
    try {
      console.log('Creating shopping list:', { userId, name, itemCount: items.length })
      
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: userId,
          name: name.trim(),
          items: items
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating shopping list:', error)
        throw error
      }

      console.log('Created shopping list:', data?.id)
      return data ? convertDbShoppingListToShoppingList(data) : null
    } catch (error) {
      console.error('Error creating shopping list:', error)
      throw error
    }
  },

  // Update shopping list
  async updateShoppingList(listId: string, updates: { name?: string; items?: ShoppingListItem[] }): Promise<ShoppingList | null> {
    try {
      console.log('Updating shopping list:', listId, updates)
      
      const updateData: any = {}
      if (updates.name !== undefined) updateData.name = updates.name.trim()
      if (updates.items !== undefined) updateData.items = updates.items

      const { data, error } = await supabase
        .from('shopping_lists')
        .update(updateData)
        .eq('id', listId)
        .select()
        .single()

      if (error) {
        console.error('Error updating shopping list:', error)
        throw error
      }

      console.log('Updated shopping list:', data?.id)
      return data ? convertDbShoppingListToShoppingList(data) : null
    } catch (error) {
      console.error('Error updating shopping list:', error)
      throw error
    }
  },

  // Delete shopping list
  async deleteShoppingList(listId: string): Promise<boolean> {
    try {
      console.log('Deleting shopping list:', listId)
      
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId)

      if (error) {
        console.error('Error deleting shopping list:', error)
        throw error
      }

      console.log('Deleted shopping list:', listId)
      return true
    } catch (error) {
      console.error('Error deleting shopping list:', error)
      throw error
    }
  },

  // Generate shopping list from recipes
  async generateShoppingListFromRecipes(userId: string, recipeIds: string[], listName: string): Promise<ShoppingList | null> {
    try {
      console.log('Generating shopping list from recipes:', { userId, recipeIds, listName })
      
      // Get recipes
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('id, title, ingredients, servings')
        .in('id', recipeIds)

      if (recipesError) {
        console.error('Error fetching recipes for shopping list:', recipesError)
        throw recipesError
      }

      console.log('Found recipes for shopping list:', recipes?.length || 0)

      // Aggregate ingredients
      const ingredientMap = new Map<string, ShoppingListItem>()

      recipes?.forEach(recipe => {
        const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients as string[] : []
        ingredients.forEach((ingredient, index) => {
          const key = ingredient.toLowerCase().trim()
          const itemId = `${recipe.id}-${index}-${Date.now()}`
          
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!
            existing.quantity += 1 // Simple aggregation - could be more sophisticated
          } else {
            ingredientMap.set(key, {
              id: itemId,
              ingredient,
              quantity: 1,
              unit: 'item',
              checked: false,
              recipeId: recipe.id,
              recipeName: recipe.title
            })
          }
        })
      })

      const items = Array.from(ingredientMap.values())
      console.log('Generated shopping list items:', items.length)
      
      return await this.createShoppingList(userId, listName, items)
    } catch (error) {
      console.error('Error generating shopping list from recipes:', error)
      throw error
    }
  }
}