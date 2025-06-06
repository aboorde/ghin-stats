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
  const [sessionValidated, setSessionValidated] = useState(false)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        setSessionValidated(false)
        
        // Clear any redirect flags when starting fresh
        sessionStorage.removeItem('auth-redirecting')
        
        console.log('Getting session from Supabase...')
        
        // Add timeout for the getSession call
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
        )
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]).catch(err => {
          console.error('Session fetch failed:', err)
          return { data: { session: null }, error: err }
        })
        
        console.log('Session fetch completed:', { hasSession: !!session, hasError: !!error })
        
        if (error) {
          console.error('Error getting session:', error)
          // Clear any corrupted auth state
          if (error.message?.includes('invalid') || error.message?.includes('malformed') || error.message?.includes('timeout')) {
            console.warn('Clearing corrupted/expired auth state...')
            // Clear all Supabase-related items from localStorage
            const keysToRemove = []
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && key.includes('supabase')) {
                keysToRemove.push(key)
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key))
            sessionStorage.clear()
          }
          setUser(null)
          setProfile(null)
          setSessionValidated(true)
        } else {
          // Validate the session is actually valid
          if (session?.user) {
            console.log('Session found, validating...')
            try {
              // Skip additional validation on GitHub Pages to avoid hanging
              // The session from getSession is sufficient
              setUser(session.user)
              console.log('User set, fetching profile...')
              await fetchProfile(session.user.id)
            } catch (validationError) {
              console.error('Session validation error:', validationError)
              setUser(null)
              setProfile(null)
            }
          } else {
            console.log('No session found')
            setUser(null)
            setProfile(null)
          }
          setSessionValidated(true)
        }
      } catch (error) {
        console.error('Fatal error during auth initialization:', error)
        setUser(null)
        setProfile(null)
        setSessionValidated(true)
      } finally {
        // Always set loading to false, even on error
        console.log('Auth initialization complete')
        setLoading(false)
      }
    }
    
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only log auth events without exposing user data
      console.log('Auth state changed:', event)
      
      // Handle auth errors and expiration
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        // Clear all local state
        setUser(null)
        setProfile(null)
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && !window.location.pathname.includes('/ghin-stats/login')) {
          const loginPath = window.location.pathname.includes('/ghin-stats') ? '/ghin-stats/login' : '/login'
          window.location.replace(loginPath)
        }
      } else if (event === 'USER_UPDATED' && !session) {
        // Session expired or was invalidated
        console.warn('Session expired or invalidated')
        setUser(null)
        setProfile(null)
        // Redirect to login
        if (window.location.pathname !== '/login' && !window.location.pathname.includes('/ghin-stats/login')) {
          const loginPath = window.location.pathname.includes('/ghin-stats') ? '/ghin-stats/login' : '/login'
          window.location.replace(loginPath)
        }
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
      console.log('Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        throw error
      }
      console.log('Profile fetched successfully')
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

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Session refresh failed:', error)
        return null
      }
      return data.session
    } catch (error) {
      console.error('Session refresh error:', error)
      return null
    }
  }

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


  const value = {
    user,
    profile,
    loading,
    sessionValidated,
    signIn,
    // signUp, // Disabled for now
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}