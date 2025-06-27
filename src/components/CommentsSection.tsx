import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { Comment } from '../types';
import { commentService } from '../services/commentService';
import { useAuth } from '../hooks/useAuth';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

interface CommentsSectionProps {
  recipeId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ recipeId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [authorName, setAuthorName] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceRecognition();

  useEffect(() => {
    loadComments();
  }, [recipeId]);

  useEffect(() => {
    if (transcript && isVoiceMode) {
      setNewComment(transcript);
    }
  }, [transcript, isVoiceMode]);

  useEffect(() => {
    if (user) {
      // Auto-fill author name from user profile
      setAuthorName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const loadComments = async () => {
    try {
      const recipeComments = await commentService.getCommentsByRecipeId(recipeId);
      setComments(recipeComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim() || !user) return;

    setLoading(true);
    try {
      const comment = await commentService.addComment({
        recipeId,
        author: authorName,
        content: newComment,
        rating: newRating,
        isVoiceComment: isVoiceMode
      }, user.id);

      if (comment) {
        setComments([comment, ...comments]);
        setNewComment('');
        setNewRating(5);
        setIsVoiceMode(false);
        setShowCommentForm(false);
        speak(`Thank you ${authorName}! Your ${newRating}-star review has been added.`);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      speak('Sorry, there was an error submitting your comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceComment = () => {
    if (isListening) {
      stopListening();
    } else {
      setIsVoiceMode(true);
      startListening();
      speak("I'm listening for your comment. Please speak your review.");
    }
  };

  const readCommentAloud = (comment: Comment) => {
    const text = `${comment.author} rated this ${comment.rating} stars and said: ${comment.content}`;
    speak(text);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onRatingChange?.(star) : undefined}
            className={`${
              star <= rating ? 'text-creamy-yellow-400' : 'text-soft-brown-300'
            } ${interactive ? 'hover:text-creamy-yellow-400 cursor-pointer' : ''}`}
            disabled={!interactive}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="glass-organic rounded-4xl shadow-soft-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-muted-blue-500" />
          <h2 id="comments-title" className="text-2xl font-bold text-soft-brown-900">
            Comments ({comments.length})
          </h2>
        </div>
        {user && (
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="bg-muted-blue-500 hover:bg-muted-blue-600 text-white px-4 py-2 rounded-3xl font-medium transition-colors"
          >
            Add Review
          </button>
        )}
      </div>

      {/* Authentication prompt for non-users */}
      {!user && (
        <div className="bg-warm-green-50 border border-warm-green-200 rounded-3xl p-4 mb-6">
          <p className="text-warm-green-800 text-center">
            <strong>Sign in to leave a review</strong> and share your cooking experience with the community!
          </p>
        </div>
      )}

      {/* Comment Form */}
      {showCommentForm && user && (
        <div className="bg-warm-green-50 rounded-4xl p-6 mb-6">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-soft-brown-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-muted-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-soft-brown-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {renderStars(newRating, true, setNewRating)}
                  <span className="text-sm text-soft-brown-600">({newRating}/5)</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-soft-brown-700">
                  Your Review
                </label>
                {isSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceComment}
                    className={`flex items-center gap-2 px-3 py-1 rounded-3xl text-sm font-medium transition-colors ${
                      isListening
                        ? 'bg-terracotta-100 text-terracotta-700'
                        : 'bg-muted-blue-100 text-muted-blue-700 hover:bg-muted-blue-200'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isListening ? 'Stop Recording' : 'Voice Comment'}
                  </button>
                )}
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this recipe..."
                className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-muted-blue-500 h-24 resize-none"
                required
              />
              {isVoiceMode && (
                <p className="text-sm text-muted-blue-600 mt-1">
                  Voice mode active - your speech will be converted to text
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-muted-blue-500 hover:bg-muted-blue-600 text-white px-6 py-2 rounded-3xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCommentForm(false);
                  setNewComment('');
                  setNewRating(5);
                  setIsVoiceMode(false);
                }}
                className="bg-soft-brown-300 hover:bg-soft-brown-400 text-soft-brown-700 px-6 py-2 rounded-3xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-soft-brown-400 mx-auto mb-3" />
            <p className="text-soft-brown-500">No comments yet. Be the first to share your experience!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border border-soft-brown-200 rounded-3xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-muted-blue-500 to-light-lavender-500 rounded-full flex items-center justify-center text-white font-bold">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-soft-brown-900">{comment.author}</h4>
                      {comment.isVoiceComment && (
                        <span className="bg-warm-green-100 text-warm-green-700 px-2 py-1 rounded-pill text-xs font-medium">
                          Voice Review
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(comment.rating)}
                      <span className="text-sm text-soft-brown-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => readCommentAloud(comment)}
                  className="text-soft-brown-400 hover:text-muted-blue-500 transition-colors"
                  title="Read comment aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-soft-brown-700 leading-relaxed">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Voice Status */}
      {(isListening || isSpeaking) && (
        <div className="fixed bottom-20 right-6 glass-organic text-soft-brown-900 px-4 py-2 rounded-3xl shadow-soft-lg">
          <div className="flex items-center gap-2">
            {isListening && (
              <>
                <div className="flex gap-1">
                  <div className="w-1 h-4 organic-wave"></div>
                  <div className="w-1 h-3 organic-wave"></div>
                  <div className="w-1 h-5 organic-wave"></div>
                </div>
                <span className="text-sm">Listening for comment...</span>
              </>
            )}
            {isSpeaking && (
              <>
                <Volume2 className="w-4 h-4 text-muted-blue-400 animate-soft-pulse" />
                <span className="text-sm">Reading comment...</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};