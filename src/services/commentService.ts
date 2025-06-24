import { supabase } from '../lib/supabase'
import { Comment } from '../types'
import { Database } from '../types/database'

type CommentRow = Database['public']['Tables']['comments']['Row']
type CommentInsert = Database['public']['Tables']['comments']['Insert']

// Convert database row to Comment type
const convertDbCommentToComment = (dbComment: CommentRow): Comment => ({
  id: dbComment.id,
  recipeId: dbComment.recipe_id,
  author: dbComment.author_name,
  content: dbComment.content,
  rating: dbComment.rating,
  createdAt: new Date(dbComment.created_at),
  isVoiceComment: dbComment.is_voice_comment,
  audioUrl: dbComment.audio_url || undefined
})

export const commentService = {
  // Get comments for a recipe
  async getCommentsByRecipeId(recipeId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(convertDbCommentToComment)
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  },

  // Add new comment
  async addComment(comment: {
    recipeId: string
    author: string
    content: string
    rating: number
    isVoiceComment?: boolean
    audioUrl?: string
  }, authorId: string): Promise<Comment | null> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          recipe_id: comment.recipeId,
          author_id: authorId,
          author_name: comment.author,
          content: comment.content,
          rating: comment.rating,
          is_voice_comment: comment.isVoiceComment || false,
          audio_url: comment.audioUrl || null
        })
        .select()
        .single()

      if (error) throw error

      // Update recipe rating
      await this.updateRecipeRating(comment.recipeId)

      return convertDbCommentToComment(data)
    } catch (error) {
      console.error('Error adding comment:', error)
      return null
    }
  },

  // Update recipe rating based on comments
  async updateRecipeRating(recipeId: string): Promise<void> {
    try {
      // Get all ratings for this recipe
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('rating')
        .eq('recipe_id', recipeId)

      if (commentsError) throw commentsError

      if (comments.length > 0) {
        const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0)
        const averageRating = totalRating / comments.length

        // Update recipe with new rating
        const { error: updateError } = await supabase
          .from('recipes')
          .update({
            rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
            total_ratings: comments.length
          })
          .eq('id', recipeId)

        if (updateError) throw updateError
      }
    } catch (error) {
      console.error('Error updating recipe rating:', error)
    }
  },

  // Delete comment
  async deleteComment(commentId: string, recipeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      // Update recipe rating after deletion
      await this.updateRecipeRating(recipeId)

      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  }
}