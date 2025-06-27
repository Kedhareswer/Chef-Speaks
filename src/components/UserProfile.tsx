import React, { useState, useEffect } from 'react'
import { Settings, Heart, Calendar, ShoppingCart, X, Save, Globe, Mic, Star, ChefHat, Trash2, AlertTriangle, Volume2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { userService, UserProfile as UserProfileType } from '../services/userService'
import { userVoiceSettingsService, UserVoiceSettings } from '../services/userVoiceSettingsService'
import { recipeService } from '../services/recipeService'
import { ProfileImageUpload } from './ProfileImageUpload'
import { AVAILABLE_VOICES, elevenLabsService } from '../services/elevenLabsService'
import { Recipe } from '../types'
import { UserProfileSkeleton } from './SkeletonLoaders'

interface UserProfileProps {
  isOpen: boolean
  onClose: () => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation()
  const { user, signOut, deleteAccount } = useAuth()
  const [profile, setProfile] = useState<UserProfileType | null>(null)
  const [voiceSettings, setVoiceSettings] = useState<UserVoiceSettings | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfileType>>({})
  const [voiceSettingsFormData, setVoiceSettingsFormData] = useState<Partial<UserVoiceSettings>>({})
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([])
  const [favoriteStats, setFavoriteStats] = useState({ count: 0, avgRating: 0 })
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      loadProfile()
      loadFavoriteRecipes()
    }
  }, [user, isOpen])

  const loadProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Load user profile
      const userProfile = await userService.getUserProfile(user.id)
      setProfile(userProfile)
      setFormData(userProfile || {})
      
      // Load voice settings
      const userVoiceSettings = await userVoiceSettingsService.getUserVoiceSettings(user.id)
      setVoiceSettings(userVoiceSettings)
      setVoiceSettingsFormData(userVoiceSettings || {
        preferredVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Default to Bella
        voiceLanguage: userProfile?.preferredLanguage || 'en',
        voiceSpeed: 1.0,
        voiceStability: 0.5,
        voiceSimilarityBoost: 0.75,
        useElevenLabs: true
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFavoriteRecipes = async () => {
    if (!user) return

    try {
      const favoriteIds = await userService.getUserFavorites(user.id)
      const allRecipes = await recipeService.getAllRecipes()
      const favorites = allRecipes.filter(recipe => favoriteIds.includes(recipe.id))
      
      setFavoriteRecipes(favorites)
      
      // Calculate stats
      const avgRating = favorites.length > 0 
        ? favorites.reduce((sum, recipe) => sum + (recipe.rating || 0), 0) / favorites.length
        : 0
      
      setFavoriteStats({
        count: favorites.length,
        avgRating: Math.round(avgRating * 10) / 10
      })
    } catch (error) {
      console.error('Error loading favorite recipes:', error)
    }
  }

  const handleSave = async () => {
    if (!user || !formData) return

    setLoading(true)
    try {
      // Update profile with new data including avatar
      const updatedProfile = await userService.updateUserProfile(user.id, formData)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      
      // Update voice settings
      if (voiceSettingsFormData) {
        const updatedVoiceSettings = await userVoiceSettingsService.updateUserVoiceSettings(
          user.id, 
          voiceSettingsFormData
        )
        if (updatedVoiceSettings) {
          setVoiceSettings(updatedVoiceSettings)
        }
      }
      
      setIsEditing(false)
      
      // Show success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmationText !== 'DELETE MY ACCOUNT') return

    setIsDeleting(true)
    try {
      await deleteAccount()
      onClose()
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleImageChange = (imageUrl: string | null) => {
    setFormData({ ...formData, avatarUrl: imageUrl })
  }

  const handleLanguageChange = (newLanguage: string) => {
    // Update form data
    setFormData({ ...formData, preferredLanguage: newLanguage })
    
    // Also update voice language to match UI language
    setVoiceSettingsFormData({
      ...voiceSettingsFormData,
      voiceLanguage: newLanguage
    })
    
    // Immediately change the UI language
    i18n.changeLanguage(newLanguage)
  }

  const handleVoiceLanguageChange = (newLanguage: string) => {
    // Update voice settings form data
    setVoiceSettingsFormData({
      ...voiceSettingsFormData,
      voiceLanguage: newLanguage,
      // Reset voice ID when language changes to ensure we get a voice that supports the language
      preferredVoiceId: getDefaultVoiceForLanguage(newLanguage).id
    })
  }

  const handleVoiceChange = (voiceId: string) => {
    setVoiceSettingsFormData({
      ...voiceSettingsFormData,
      preferredVoiceId: voiceId
    })
  }

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'hi': 'हिन्दी',
      'te': 'తెలుగు'
    }
    return languages[code] || code.toUpperCase()
  }

  const getAvailableLanguages = () => {
    return ['en', 'es', 'fr', 'hi', 'te']
  }

  const getDefaultVoiceForLanguage = (language: string) => {
    const voices = Object.values(AVAILABLE_VOICES).filter(voice => voice.language === language && voice.gender === 'female')
    return voices[0] || AVAILABLE_VOICES.bella
  }

  const getCuisinePreferenceStats = () => {
    if (!profile?.favoriteCuisines || favoriteRecipes.length === 0) return []
    
    return profile.favoriteCuisines.map(cuisine => {
      const count = favoriteRecipes.filter(recipe => 
        recipe.cuisine.toLowerCase().includes(cuisine.toLowerCase())
      ).length
      return { cuisine, count }
    }).filter(item => item.count > 0)
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-organic rounded-4xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-terracotta-200/30 shadow-soft-2xl">
        <div className="p-6 border-b border-terracotta-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ProfileImageUpload
                currentImageUrl={formData.avatarUrl}
                onImageChange={handleImageChange}
                disabled={!isEditing || loading}
              />
              <div>
                <h2 className="text-2xl font-bold text-soft-brown-900">{t('profile')}</h2>
                <p className="text-soft-brown-600">{profile?.email}</p>
                <p className="text-xs text-soft-brown-500">
                  {t('memberSince')} {new Date(profile?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-soft-brown-400 hover:text-soft-brown-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <UserProfileSkeleton />
          ) : (
            <>
              {/* Enhanced Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-r from-warm-green-50 to-muted-blue-50 rounded-3xl border border-warm-green-200">
                  <Heart className="w-8 h-8 text-terracotta-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-terracotta-600">{favoriteStats.count}</div>
                  <div className="text-sm text-terracotta-600">{t('favoriteRecipes')}</div>
                  {favoriteStats.avgRating > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-creamy-yellow-400 fill-current" />
                      <span className="text-xs text-soft-brown-600">{favoriteStats.avgRating} avg</span>
                    </div>
                  )}
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-terracotta-50 to-dusty-pink-50 rounded-3xl border border-terracotta-200">
                  <Calendar className="w-8 h-8 text-muted-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-muted-blue-600">0</div>
                  <div className="text-sm text-muted-blue-600">{t('mealPlans')}</div>
                  <div className="text-xs text-soft-brown-500 mt-1">{t('thisWeek')}</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-light-lavender-50 to-dusty-pink-50 rounded-3xl border border-light-lavender-200">
                  <ShoppingCart className="w-8 h-8 text-light-lavender-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-light-lavender-600">0</div>
                  <div className="text-sm text-light-lavender-600">{t('shoppingLists')}</div>
                  <div className="text-xs text-soft-brown-500 mt-1">{t('active')}</div>
                </div>
              </div>

              {/* Favorite Recipes Preview */}
              {favoriteRecipes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-soft-brown-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-terracotta-500" />
                    {t('yourFavoriteRecipes')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteRecipes.slice(0, 6).map((recipe) => (
                      <div key={recipe.id} className="bg-white/50 rounded-2xl p-3 border border-soft-brown-200 hover:bg-white/80 transition-colors">
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-24 object-cover rounded-xl mb-2"
                        />
                        <h4 className="font-medium text-soft-brown-900 text-sm truncate">{recipe.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-creamy-yellow-400 fill-current" />
                            <span className="text-xs text-soft-brown-600">{recipe.rating}</span>
                          </div>
                          <span className="text-xs text-soft-brown-500">{recipe.cuisine}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {favoriteRecipes.length > 6 && (
                    <p className="text-sm text-soft-brown-500 text-center">
                      {t('andMoreFavorites', { count: favoriteRecipes.length - 6 })}
                    </p>
                  )}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-soft-brown-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t('basicInformation')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-soft-brown-700 mb-2">
                      {t('fullName')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.fullName || ''}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-warm-green-500"
                        placeholder={t('enterFullName')}
                      />
                    ) : (
                      <p className="text-soft-brown-900">{profile?.fullName || t('notSet')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-soft-brown-700 mb-2">
                      {t('cookingSkillLevel')}
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.cookingSkillLevel || 'beginner'}
                        onChange={(e) => setFormData({ ...formData, cookingSkillLevel: e.target.value as any })}
                        className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-warm-green-500"
                      >
                        <option value="beginner">🌱 {t('beginner')}</option>
                        <option value="intermediate">👨‍🍳 {t('intermediate')}</option>
                        <option value="advanced">⭐ {t('advanced')}</option>
                      </select>
                    ) : (
                      <p className="text-soft-brown-900 capitalize flex items-center gap-2">
                        {profile?.cookingSkillLevel === 'beginner' && '🌱'}
                        {profile?.cookingSkillLevel === 'intermediate' && '👨‍🍳'}
                        {profile?.cookingSkillLevel === 'advanced' && '⭐'}
                        {t(profile?.cookingSkillLevel || 'beginner')}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-soft-brown-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t('preferredLanguage')}
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.preferredLanguage || 'en'}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-warm-green-500"
                    >
                      {getAvailableLanguages().map(lang => (
                        <option key={lang} value={lang}>
                          {getLanguageName(lang)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-blue-500" />
                      <p className="text-soft-brown-900">{getLanguageName(profile?.preferredLanguage || 'en')}</p>
                    </div>
                  )}
                  <p className="text-xs text-soft-brown-500 mt-1">
                    {t('languageDescription')}
                  </p>
                </div>
              </div>

              {/* Voice Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-soft-brown-900 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-muted-blue-500" />
                  {t('voiceAssistantSettings')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-soft-brown-700 mb-2">
                      {t('preferredLanguage')} ({t('voice')})
                    </label>
                    {isEditing ? (
                      <select
                        value={voiceSettingsFormData.voiceLanguage || 'en'}
                        onChange={(e) => handleVoiceLanguageChange(e.target.value)}
                        className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-warm-green-500"
                      >
                        {elevenLabsService.getSupportedLanguages().map(lang => (
                          <option key={lang} value={lang}>
                            {getLanguageName(lang)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-soft-brown-900">
                        {getLanguageName(voiceSettings?.voiceLanguage || 'en')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-soft-brown-700 mb-2">
                      {t('preferredVoice')}
                    </label>
                    {isEditing ? (
                      <select
                        value={voiceSettingsFormData.preferredVoiceId || 'EXAVITQu4vr4xnSDxMaL'}
                        onChange={(e) => handleVoiceChange(e.target.value)}
                        className="w-full px-3 py-2 border border-soft-brown-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-warm-green-500"
                      >
                        {elevenLabsService.getVoicesForLanguage(voiceSettingsFormData.voiceLanguage || 'en').map(voice => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name} ({voice.gender})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-soft-brown-900">
                        {Object.values(AVAILABLE_VOICES).find(v => v.id === voiceSettings?.preferredVoiceId)?.name || 'Bella'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-soft-brown-700 mb-2">
                    {t('useElevenLabs')}
                  </label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVoiceSettingsFormData({
                          ...voiceSettingsFormData,
                          useElevenLabs: !voiceSettingsFormData.useElevenLabs
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          voiceSettingsFormData.useElevenLabs ? 'bg-warm-green-500' : 'bg-soft-brown-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            voiceSettingsFormData.useElevenLabs ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-soft-brown-700">
                        {voiceSettingsFormData.useElevenLabs ? t('enabled') : t('disabled')}
                      </span>
                    </div>
                  ) : (
                    <p className="text-soft-brown-900">
                      {voiceSettings?.useElevenLabs ? t('enabled') : t('disabled')}
                    </p>
                  )}
                  <p className="text-xs text-soft-brown-500 mt-1">
                    {t('elevenLabsDescription')}
                  </p>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-soft-brown-900 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  {t('dietaryPreferences')}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-soft-brown-700 mb-2">
                    {t('dietaryRestrictions')}
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo', 'low-carb'].map(restriction => (
                        <label key={restriction} className="flex items-center gap-2 p-2 rounded-xl hover:bg-warm-green-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.dietaryRestrictions?.includes(restriction) || false}
                            onChange={(e) => {
                              const current = formData.dietaryRestrictions || []
                              if (e.target.checked) {
                                setFormData({ ...formData, dietaryRestrictions: [...current, restriction] })
                              } else {
                                setFormData({ ...formData, dietaryRestrictions: current.filter(r => r !== restriction) })
                              }
                            }}
                            className="rounded text-warm-green-500 focus:ring-warm-green-500"
                          />
                          <span className="text-sm text-soft-brown-700 capitalize">{t(restriction)}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.dietaryRestrictions?.length ? (
                        profile.dietaryRestrictions.map(restriction => (
                          <span key={restriction} className="bg-warm-green-100 text-warm-green-800 px-3 py-1 rounded-pill text-sm font-medium">
                            {t(restriction)}
                          </span>
                        ))
                      ) : (
                        <p className="text-soft-brown-500">{t('noneSpecified')}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-soft-brown-700 mb-2">
                    {t('favoriteCuisines')}
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      {['italian', 'mexican', 'indian', 'chinese', 'japanese', 'french', 'thai', 'mediterranean', 'korean', 'spanish'].map(cuisine => (
                        <label key={cuisine} className="flex items-center gap-2 p-2 rounded-xl hover:bg-terracotta-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.favoriteCuisines?.includes(cuisine) || false}
                            onChange={(e) => {
                              const current = formData.favoriteCuisines || []
                              if (e.target.checked) {
                                setFormData({ ...formData, favoriteCuisines: [...current, cuisine] })
                              } else {
                                setFormData({ ...formData, favoriteCuisines: current.filter(c => c !== cuisine) })
                              }
                            }}
                            className="rounded text-terracotta-500 focus:ring-terracotta-500"
                          />
                          <span className="text-sm text-soft-brown-700 capitalize">{t(cuisine)}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {profile?.favoriteCuisines?.length ? (
                          profile.favoriteCuisines.map(cuisine => (
                            <span key={cuisine} className="bg-terracotta-100 text-terracotta-800 px-3 py-1 rounded-pill text-sm font-medium">
                              {t(cuisine)}
                            </span>
                          ))
                        ) : (
                          <p className="text-soft-brown-500">{t('noneSpecified')}</p>
                        )}
                      </div>
                      
                      {/* Cuisine preference stats */}
                      {getCuisinePreferenceStats().length > 0 && (
                        <div className="mt-3 p-3 bg-terracotta-50 rounded-2xl border border-terracotta-200">
                          <h4 className="text-sm font-medium text-soft-brown-900 mb-2 flex items-center gap-1">
                            <ChefHat className="w-4 h-4" />
                            {t('yourFavoriteCuisineStats')}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {getCuisinePreferenceStats().map(({ cuisine, count }) => (
                              <div key={cuisine} className="flex justify-between items-center text-sm">
                                <span className="text-soft-brown-700 capitalize">{t(cuisine)}</span>
                                <span className="text-terracotta-600 font-medium">{count} {t('recipes')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Assistant Preview */}
              {profile?.preferredLanguage && (
                <div className="bg-gradient-to-r from-muted-blue-50 to-light-lavender-50 rounded-3xl p-4 border border-muted-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Mic className="w-5 h-5 text-muted-blue-500" />
                    <h4 className="font-semibold text-soft-brown-900">{t('voiceAssistantSettings')}</h4>
                  </div>
                  <p className="text-sm text-soft-brown-600">
                    {t('voiceAssistantDescription', { 
                      language: getLanguageName(voiceSettings?.voiceLanguage || profile.preferredLanguage),
                      restrictions: profile.dietaryRestrictions?.length ? profile.dietaryRestrictions.join(', ') : t('none')
                    })}
                  </p>
                </div>
              )}

              {/* Danger Zone */}
              <div className="border-t border-red-200 pt-6">
                <div className="bg-red-50 rounded-3xl p-6 border border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                  </div>
                  <p className="text-red-700 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-3xl font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-terracotta-200/30 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-warm-green-500 to-terracotta-500 hover:from-warm-green-600 hover:to-terracotta-600 text-white font-semibold py-3 px-6 rounded-3xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? t('saving') : t('saveChanges')}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setFormData(profile || {})
                  setVoiceSettingsFormData(voiceSettings || {})
                  // Reset language to profile language if user cancels
                  if (profile?.preferredLanguage) {
                    i18n.changeLanguage(profile.preferredLanguage)
                  }
                }}
                disabled={loading}
                className="px-6 py-3 bg-soft-brown-100 hover:bg-soft-brown-200 text-soft-brown-700 rounded-3xl transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gradient-to-r from-warm-green-500 to-terracotta-500 hover:from-warm-green-600 hover:to-terracotta-600 text-white font-semibold py-3 px-6 rounded-3xl transition-all"
              >
                {t('editProfile')}
              </button>
              <button
                onClick={handleSignOut}
                className="px-6 py-3 bg-soft-brown-100 hover:bg-soft-brown-200 text-soft-brown-700 rounded-3xl transition-colors"
              >
                {t('signOut')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="text-xl font-bold text-red-900">Delete Account</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-red-700 mb-4">
                This will permanently delete your account and all associated data including:
              </p>
              <ul className="text-sm text-red-600 space-y-1 mb-4">
                <li>• Your profile and personal information</li>
                <li>• All favorite recipes and meal plans</li>
                <li>• Shopping lists and cooking timers</li>
                <li>• Comments and reviews</li>
                <li>• Voice settings and preferences</li>
                <li>• Any recipes you've created</li>
              </ul>
              <p className="text-red-800 font-semibold">
                This action cannot be undone!
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-red-700 mb-2">
                Type "DELETE MY ACCOUNT" to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="DELETE MY ACCOUNT"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== 'DELETE MY ACCOUNT' || isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false)
                  setDeleteConfirmationText('')
                }}
                disabled={isDeleting}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}