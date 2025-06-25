import { useState, useEffect } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
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
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        
        // Handle user profile setup
        if (session?.user) {
          await handleUserSetup(session.user)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (!mounted) return

      console.log('Auth state change:', event, session?.user?.id)
      
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        if (event === 'SIGNED_UP' || event === 'SIGNED_IN') {
          setLoading(true)
          try {
            await handleUserSetup(session.user)
          } catch (error) {
            console.error('Error during user setup:', error)
          } finally {
            setLoading(false)
          }
        }
      } else {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Handle user profile and voice settings setup
  const handleUserSetup = async (user: User) => {
    try {
      console.log('Setting up user profile for:', user.id)
      
      // Check if profile exists
      let profile = await userService.getUserProfile(user.id)
      
      if (!profile) {
        console.log('Creating new profile for user:', user.id)
        // Create profile if it doesn't exist
        await createProfile(user)
        profile = await userService.getUserProfile(user.id)
      }
      
      // Ensure voice settings exist
      await userVoiceSettingsService.ensureUserVoiceSettings(user.id)
      
      console.log('User setup completed successfully')
    } catch (error) {
      console.error('Error in user setup:', error)
      // Don't throw the error - let the user continue even if profile setup fails
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
        // If profile already exists, that's okay
        if (error.code === '23505') {
          console.log('Profile already exists for user:', user.id)
          return
        }
        console.error('Error creating profile:', error)
        throw error
      }
      
      console.log('Profile created successfully for user:', user.id)
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
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
      setLoading(false)
      throw error
    }
    // Don't set loading to false here - let the auth state change handler do it
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
      setLoading(false)
      throw error
    }
    // Don't set loading to false here - let the auth state change handler do it
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