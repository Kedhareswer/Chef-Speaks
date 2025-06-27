import React, { useState, useRef } from 'react'
import { Camera, Upload, X, User, AlertTriangle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { storageService, UploadProgress } from '../services/storageService'

interface ProfileImageUploadProps {
  currentImageUrl?: string | null
  onImageChange: (imageUrl: string | null) => void
  disabled?: boolean
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onImageChange,
  disabled = false
}) => {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setError(null)
    setIsUploading(true)
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 })

    try {
      // Create preview URL immediately for better UX
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // Upload to Supabase Storage
      const result = await storageService.uploadProfileImage(
        user.id,
        file,
        (progress) => setUploadProgress(progress)
      )

      if (result.error) {
        setError(result.error)
        setPreviewUrl(currentImageUrl ?? null)
        return
      }

      // Success - update with the actual URL
      setPreviewUrl(result.url)
      onImageChange(result.url)

      // Clean up the blob URL
      URL.revokeObjectURL(preview)

      // Add haptic feedback for success
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50])
      }

    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image. Please try again.')
      setPreviewUrl(currentImageUrl ?? null)
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  const handleRemoveImage = async () => {
    if (!user) return

    try {
      // Clean up blob URL if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }

      setPreviewUrl(null)
      onImageChange(null)
      setError(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }

    } catch (error) {
      console.error('Error removing image:', error)
      setError('Failed to remove image')
    }
  }

  const triggerFileSelect = () => {
    if (error) setError(null)
    fileInputRef.current?.click()
  }

  const getProgressBarColor = () => {
    if (!uploadProgress) return 'bg-muted-blue-500'
    if (uploadProgress.percentage < 50) return 'bg-terracotta-500'
    if (uploadProgress.percentage < 90) return 'bg-creamy-yellow-500'
    return 'bg-warm-green-500'
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-warm-green-500 to-terracotta-500 flex items-center justify-center relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-white" />
          )}

          {/* Upload Progress Overlay */}
          {isUploading && uploadProgress && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 mb-2 mx-auto">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/30"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      className="text-warm-green-400"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${uploadProgress.percentage}, 100`}
                    />
                  </svg>
                </div>
                <div className="text-xs text-white font-medium">
                  {uploadProgress.percentage.toFixed(0)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload/Camera button */}
        <button
          onClick={triggerFileSelect}
          disabled={disabled || isUploading || !user}
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-muted-blue-500 hover:bg-muted-blue-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={!user ? 'Sign in to upload profile picture' : 'Change profile picture'}
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>

        {/* Remove button */}
        {previewUrl && !isUploading && (
          <button
            onClick={handleRemoveImage}
            disabled={disabled || !user}
            className="absolute -top-1 -right-1 w-6 h-6 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove profile picture"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Upload area */}
      <div className="text-center">
        {!user ? (
          <p className="text-sm text-soft-brown-500">
            Sign in to upload a profile picture
          </p>
        ) : (
          <>
            <button
              onClick={triggerFileSelect}
              disabled={disabled || isUploading}
              className="flex items-center gap-2 text-sm text-muted-blue-600 hover:text-muted-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <p className="text-xs text-soft-brown-500 mt-1">
              JPG, PNG, WebP up to 5MB
            </p>
          </>
        )}
      </div>

      {/* Progress Bar */}
      {isUploading && uploadProgress && (
        <div className="w-full max-w-xs">
          <div className="bg-soft-brown-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-soft-brown-500 mt-1">
            <span>{(uploadProgress.loaded / 1024 / 1024).toFixed(1)}MB</span>
            <span>{(uploadProgress.total / 1024 / 1024).toFixed(1)}MB</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-terracotta-50 border border-terracotta-200 rounded-2xl p-3 max-w-xs">
          <div className="flex items-center gap-2 text-terracotta-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-terracotta-600 hover:text-terracotta-700 mt-1 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading || !user}
      />
    </div>
  )
}