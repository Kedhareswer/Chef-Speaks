import { supabase } from '../lib/supabase'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  url: string
  path: string
  error?: string
}

class StorageService {
  private readonly PROFILE_BUCKET = 'profile-images'
  private readonly RECIPE_BUCKET = 'recipe-images'

  // Initialize storage buckets (call this once during app setup)
  async initializeBuckets(): Promise<void> {
    try {
      // Create profile images bucket if it doesn't exist
      await this.createBucketIfNotExists(this.PROFILE_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      })

      // Create recipe images bucket if it doesn't exist
      await this.createBucketIfNotExists(this.RECIPE_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      })
    } catch (error) {
      console.warn('Storage bucket initialization warning:', error)
      // Don't throw error - app should work even if buckets aren't set up
    }
  }

  private async createBucketIfNotExists(
    bucketName: string, 
    options: {
      public: boolean
      allowedMimeTypes: string[]
      fileSizeLimit: number
    }
  ): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.warn(`Error checking buckets: ${listError.message}`)
        return
      }

      const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
      
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: options.public,
          allowedMimeTypes: options.allowedMimeTypes,
          fileSizeLimit: options.fileSizeLimit
        })

        if (createError) {
          console.warn(`Warning creating bucket ${bucketName}:`, createError.message)
        } else {
          console.log(`Storage bucket '${bucketName}' created successfully`)
        }
      }
    } catch (error) {
      console.warn(`Error managing bucket ${bucketName}:`, error)
    }
  }

  // Upload profile image
  async uploadProfileImage(
    userId: string, 
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateImageFile(file, 5 * 1024 * 1024) // 5MB limit
      if (!validation.valid) {
        return { url: '', path: '', error: validation.error }
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const fileName = `${userId}/profile-${Date.now()}.${fileExtension}`

      // Simulate progress for UI feedback
      if (onProgress) {
        onProgress({ loaded: 0, total: file.size, percentage: 0 })
      }

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(this.PROFILE_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (onProgress) {
        onProgress({ loaded: file.size, total: file.size, percentage: 100 })
      }

      if (error) {
        console.error('Storage upload error:', error)
        return { url: '', path: '', error: error.message }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.PROFILE_BUCKET)
        .getPublicUrl(fileName)

      return {
        url: urlData.publicUrl,
        path: fileName,
        error: undefined
      }
    } catch (error) {
      console.error('Upload error:', error)
      return { 
        url: '', 
        path: '', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }
    }
  }

  // Upload recipe image
  async uploadRecipeImage(
    userId: string,
    file: File,
    recipeId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateImageFile(file, 10 * 1024 * 1024) // 10MB limit
      if (!validation.valid) {
        return { url: '', path: '', error: validation.error }
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const fileName = recipeId 
        ? `${userId}/recipes/${recipeId}-${Date.now()}.${fileExtension}`
        : `${userId}/recipes/recipe-${Date.now()}.${fileExtension}`

      if (onProgress) {
        onProgress({ loaded: 0, total: file.size, percentage: 0 })
      }

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(this.RECIPE_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (onProgress) {
        onProgress({ loaded: file.size, total: file.size, percentage: 100 })
      }

      if (error) {
        console.error('Storage upload error:', error)
        return { url: '', path: '', error: error.message }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.RECIPE_BUCKET)
        .getPublicUrl(fileName)

      return {
        url: urlData.publicUrl,
        path: fileName,
        error: undefined
      }
    } catch (error) {
      console.error('Upload error:', error)
      return { 
        url: '', 
        path: '', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }
    }
  }

  // Delete file from storage
  async deleteFile(bucketName: string, filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath])

      if (error) {
        console.error('Error deleting file:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Delete error:', error)
      return false
    }
  }

  // Delete profile image
  async deleteProfileImage(filePath: string): Promise<boolean> {
    return this.deleteFile(this.PROFILE_BUCKET, filePath)
  }

  // Delete recipe image
  async deleteRecipeImage(filePath: string): Promise<boolean> {
    return this.deleteFile(this.RECIPE_BUCKET, filePath)
  }

  // Validate image file
  private validateImageFile(file: File, maxSize: number): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Please select an image file (JPG, PNG, or WebP)' }
    }

    // Check allowed formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please select a JPG, PNG, or WebP image' }
    }

    // Check file size
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024))
      return { valid: false, error: `Image size must be less than ${maxMB}MB` }
    }

    return { valid: true }
  }

  // Get bucket names (for external use)
  getBucketNames() {
    return {
      PROFILE_BUCKET: this.PROFILE_BUCKET,
      RECIPE_BUCKET: this.RECIPE_BUCKET
    }
  }
}

export const storageService = new StorageService() 