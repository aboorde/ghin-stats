import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          // Clear any corrupted auth state
          if (error.message?.includes('invalid') || error.message?.includes('malformed')) {
            console.warn('Clearing corrupted auth state...')
            localStorage.removeItem('ghin-stats-auth')
            sessionStorage.clear()
          }
        }
        
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Fatal error during auth initialization:', error)
        setUser(null)
        setProfile(null)
      } finally {
        // Always set loading to false, even on error
        setLoading(false)
      }
    }
    
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only log auth events without exposing user data
      console.log('Auth state changed:', event)
      
      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
      }
      
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      // Don't log the full error object which might contain sensitive data
      console.error('Sign in error:', error.message)
      throw error
    }
    // Session will be automatically managed by onAuthStateChange
    return data
  }

  // Sign up functionality disabled for now
  // const signUp = async (email, password, fullName) => {
  //   const { data, error } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       data: {
  //         full_name: fullName,
  //       }
  //     }
  //   })
  //   if (error) throw error
  //   return data
  // }

  const signOut = async (forceLogout = false) => {
    try {
      // Clear all local state immediately
      setUser(null)
      setProfile(null)
      
      // Clear any cached data from localStorage
      if (typeof window !== 'undefined') {
        // Clear all localStorage items related to the app
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('ghin'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // Clear sessionStorage as well
        sessionStorage.clear()
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        // If it's a force logout, don't throw - just continue
        if (!forceLogout) {
          throw error
        }
      }
      
      // Force reload to clear any remaining state if force logout
      if (forceLogout) {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error during sign out:', error)
      if (forceLogout) {
        // Force redirect even on error
        window.location.href = '/login'
      } else {
        throw error
      }
    }
  }

  // Helper function to refresh session
  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('Error refreshing session:', error)
      return null
    }
    return data.session
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    // signUp, // Disabled for now
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}