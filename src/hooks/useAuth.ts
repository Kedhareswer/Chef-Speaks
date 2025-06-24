import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { userService } from '../services/userService'
import { userVoiceSettingsService } from '../services/userVoiceSettingsService'

interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<void>
  deleteAccount: () => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // Check if user has a profile and create one if needed
      if (session?.user) {
        ensureUserProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Create profile on sign up or ensure it exists on sign in
      if (session?.user) {
        if (event === 'SIGNED_UP') {
          await createProfile(session.user)
        } else if (event === 'SIGNED_IN') {
          await ensureUserProfile(session.user)
        }
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Ensure user has a profile, create one if it doesn't exist
  const ensureUserProfile = async (user: User) => {
    try {
      setLoading(true)
      const profile = await userService.getUserProfile(user.id)
      
      if (!profile) {
        console.log('No profile found for user, creating one...')
        await createProfile(user)
      }
      
      // Also ensure user has voice settings
      await userVoiceSettingsService.ensureUserVoiceSettings(user.id)
    } catch (error) {
      console.error('Error ensuring user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (user: User) => {
    try {
      console.log('Creating profile for user:', user.id)
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        })

      if (error) {
        console.error('Error creating profile:', error)
        throw error
      }
      
      console.log('Profile created successfully')
      
      // Also create default voice settings
      await userVoiceSettingsService.ensureUserVoiceSettings(user.id)
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const deleteAccount = async () => {
    try {
      if (!user) throw new Error('No user logged in')

      // Delete user account (this will cascade delete all related data due to foreign key constraints)
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      
      if (error) {
        // If admin delete fails, try to delete the user's own account
        const { error: userDeleteError } = await supabase.rpc('delete_user_account')
        if (userDeleteError) throw userDeleteError
      }

      // Sign out after successful deletion
      await signOut()
    } catch (error) {
      console.error('Error deleting account:', error)
      throw error
    }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    deleteAccount,
  }
}