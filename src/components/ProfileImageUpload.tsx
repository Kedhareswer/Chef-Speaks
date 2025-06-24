import React, { useState, useRef } from 'react'
import { Camera, Upload, X, User } from 'lucide-react'

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
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // For now, we'll use a placeholder service
      // In production, you'd upload to Supabase Storage or another service
      const formData = new FormData()
      formData.append('file', file)

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // For demo purposes, we'll use the preview URL
      // In production, replace this with actual upload logic
      onImageChange(preview)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
      setPreviewUrl(currentImageUrl ?? null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-warm-green-500 to-terracotta-500 flex items-center justify-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-white" />
          )}
        </div>

        {/* Upload/Camera button */}
        <button
          onClick={triggerFileSelect}
          disabled={disabled || isUploading}
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-muted-blue-500 hover:bg-muted-blue-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Change profile picture"
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
            disabled={disabled}
            className="absolute -top-1 -right-1 w-6 h-6 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove profile picture"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Upload area */}
      <div className="text-center">
        <button
          onClick={triggerFileSelect}
          disabled={disabled || isUploading}
          className="flex items-center gap-2 text-sm text-muted-blue-600 hover:text-muted-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </button>
        <p className="text-xs text-soft-brown-500 mt-1">
          JPG, PNG up to 5MB
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}