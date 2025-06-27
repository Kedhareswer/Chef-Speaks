import React, { useState, useEffect } from 'react'
import { Share2, Facebook, Twitter, MessageCircle, Mail, Copy, Check, QrCode, Download, Link2, Users, Heart, Linkedin } from 'lucide-react'
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
  const [shareStats, setShareStats] = useState({ total: 0, byPlatform: {} as Record<string, number> })
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadShareStats()
    }
  }, [isOpen, recipe.id])

  const loadShareStats = async () => {
    try {
      const stats = await shareService.getRecipeShareStats(recipe.id)
      setShareStats(stats)
    } catch (error) {
      console.error('Error loading share stats:', error)
    }
  }

  if (!isOpen) return null

  const recipeUrl = `${window.location.origin}/recipe/${recipe.id}`
  const shareText = `Check out this amazing recipe: ${recipe.title}`
  const shareDescription = `${recipe.description.substring(0, 150)}...`
  const hashtags = recipe.tags.slice(0, 3).join(',')

  const handleShare = async (platform: string) => {
    try {
      setShareError(null)
      
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
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(recipeUrl)}&hashtags=${hashtags},recipe,cooking,ChefSpeak`
          break
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(recipeUrl)}&title=${encodeURIComponent(recipe.title)}&summary=${encodeURIComponent(shareDescription)}`
          break
        case 'pinterest':
          shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(recipeUrl)}&media=${encodeURIComponent(recipe.imageUrl)}&description=${encodeURIComponent(shareText)}`
          break
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${recipeUrl}`)}`
          break
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(recipeUrl)}&text=${encodeURIComponent(shareText)}`
          break
        case 'reddit':
          shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(recipeUrl)}&title=${encodeURIComponent(shareText)}`
          break
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareDescription}\n\nIngredients: ${recipe.ingredients.slice(0, 3).join(', ')}...\n\nView the full recipe: ${recipeUrl}`)}`
          break
      }

      if (shareUrl) {
        // Add haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
        
        // Update stats locally for immediate feedback
        setShareStats(prev => ({
          total: prev.total + 1,
          byPlatform: {
            ...prev.byPlatform,
            [platform]: (prev.byPlatform[platform] || 0) + 1
          }
        }))
      }
    } catch (error) {
      console.error('Error sharing:', error)
      setShareError('Failed to share. Please try again.')
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

      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50])
      }

      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      setShareError('Failed to copy link to clipboard')
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

        // Add haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(100)
        }
      } catch (error) {
        console.error('Error sharing:', error)
        if ((error as Error).name !== 'AbortError') {
          setShareError('Failed to share via device')
        }
      }
    }
  }

  const generateQRCode = async () => {
    try {
      setIsGeneratingQR(true)
      setShareError(null)
      
      // Using QR Server API (free service)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(recipeUrl)}&format=png&bgcolor=ffffff&color=000000&margin=10`
      
      // Validate the QR code by loading it
      const img = new Image()
      img.onload = () => {
        setQrCodeUrl(qrUrl)
        if (user) {
          shareService.trackShare(recipe.id, user.id, 'qr_code')
        }
      }
      img.onerror = () => {
        setShareError('Failed to generate QR code')
      }
      img.src = qrUrl
      
    } catch (error) {
      console.error('Error generating QR code:', error)
      setShareError('Failed to generate QR code')
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return
    
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${recipe.title.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100)
      }
    } catch (error) {
      console.error('Error downloading QR code:', error)
      setShareError('Failed to download QR code')
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
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
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
      id: 'telegram',
      name: 'Telegram',
      icon: MessageCircle,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: Share2,
      color: 'bg-orange-600 hover:bg-orange-700',
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
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">{t('shareRecipe')}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
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
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {recipe.rating || 'N/A'}
                  </span>
                  <span>{recipe.cookTime}m</span>
                  <span>{recipe.servings} servings</span>
                  <span>{recipe.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share Stats */}
          {shareStats.total > 0 && (
            <div className="bg-warm-green-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 text-warm-green-800 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Shared {shareStats.total} times</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(shareStats.byPlatform).map(([platform, count]) => (
                  <span key={platform} className="bg-warm-green-100 text-warm-green-700 px-2 py-1 rounded-full text-xs">
                    {platform}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {shareError && (
            <div className="bg-terracotta-50 border border-terracotta-200 rounded-2xl p-3 mb-4">
              <p className="text-terracotta-700 text-sm">{shareError}</p>
              <button
                onClick={() => setShareError(null)}
                className="text-terracotta-600 hover:text-terracotta-700 text-xs underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Native Share (if supported) */}
          {typeof window !== 'undefined' && 'share' in navigator && (
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
                  className={`${option.color} ${option.textColor} py-3 px-4 rounded-2xl font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-sm`}
                >
                  <Icon className="w-4 h-4" />
                  {option.name}
                </button>
              )
            })}
          </div>

          {/* QR Code Section */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code
              </h3>
              {!qrCodeUrl && (
                <button
                  onClick={generateQRCode}
                  disabled={isGeneratingQR}
                  className="bg-muted-blue-100 hover:bg-muted-blue-200 text-muted-blue-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isGeneratingQR ? 'Generating...' : 'Generate QR'}
                </button>
              )}
            </div>
            
            {qrCodeUrl && (
              <div className="text-center">
                <div className="inline-block bg-white p-4 rounded-2xl shadow-lg mb-4">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={downloadQRCode}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Copy Link */}
          <div className="border-t border-gray-200 pt-6">
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Recipe Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={recipeUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  )
}