import React, { useState } from 'react'
import { Share2, Facebook, Twitter, MessageCircle, Mail, Link, Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Recipe } from '../types'
import { useAuth } from '../hooks/useAuth'
import { shareService } from '../services/shareService'

interface ShareRecipeProps {
  recipe: Recipe
  isOpen: boolean
  onClose: () => void
}

export const ShareRecipe: React.FC<ShareRecipeProps> = ({ recipe, isOpen, onClose }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const recipeUrl = `${window.location.origin}/recipe/${recipe.id}`
  const shareText = `Check out this amazing recipe: ${recipe.title}`
  const shareDescription = `${recipe.description.substring(0, 150)}...`

  const handleShare = async (platform: string) => {
    // Track the share
    if (user) {
      await shareService.trackShare(recipe.id, user.id, platform)
    }

    let shareUrl = ''

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}&quote=${encodeURIComponent(shareText)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(recipeUrl)}&hashtags=recipe,cooking,ChefSpeak`
        break
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(recipeUrl)}&media=${encodeURIComponent(recipe.imageUrl)}&description=${encodeURIComponent(shareText)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${recipeUrl}`)}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareDescription}\n\nView the full recipe: ${recipeUrl}`)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recipeUrl)
      setCopied(true)
      
      // Track copy action
      if (user) {
        await shareService.trackShare(recipe.id, user.id, 'copy_link')
      }

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: shareDescription,
          url: recipeUrl
        })
        
        // Track native share
        if (user) {
          await shareService.trackShare(recipe.id, user.id, 'native_share')
        }
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  const shareOptions = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white'
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: Share2,
      color: 'bg-red-600 hover:bg-red-700',
      textColor: 'text-white'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">{t('shareRecipe')}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Recipe Preview */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <div className="flex gap-3">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{recipe.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>{recipe.cookTime}m</span>
                <span>{recipe.servings} servings</span>
                <span>{recipe.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Native Share (if supported) */}
        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-2xl font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share via Device
          </button>
        )}

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {shareOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className={`${option.color} ${option.textColor} py-3 px-4 rounded-2xl font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2`}
              >
                <Icon className="w-4 h-4" />
                {option.name}
              </button>
            )
          })}
        </div>

        {/* Copy Link */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={recipeUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}