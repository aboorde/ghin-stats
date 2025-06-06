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
        
        console.log('Checking authentication status...')
        
        // Use getUser() for secure authentication check
        // This makes a network request to validate the session
        try {
          console.log('Calling getUser() for secure auth check...')
          
          // Wrap in a Promise to ensure we can timeout
          const userPromise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('Auth check timeout'))
            }, 10000) // 10 second timeout
            
            supabase.auth.getUser()
              .then(result => {
                clearTimeout(timeoutId)
                resolve(result)
              })
              .catch(err => {
                clearTimeout(timeoutId)
                reject(err)
              })
          })
          
          const { data: { user }, error } = await userPromise.catch(err => {
            // Don't log timeout or auth session missing as errors
            if (err.message?.includes('timeout') || err.message?.includes('Auth session missing')) {
              console.log('Auth check:', err.message)
            } else {
              console.error('Auth check error:', err)
            }
            return { data: { user: null }, error: err }
          })
          
          console.log('Auth check completed:', { hasUser: !!user, hasError: !!error })
          
          if (error) {
            // Check if it's just a missing session (expected when not logged in)
            if (error.message?.includes('Auth session missing') || error.message?.includes('no Session')) {
              console.log('No active session found (user not logged in)')
            } else {
              // This is an actual error
              console.error('Error getting user:', error)
              // If error is about invalid JWT, clear auth state
              if (error.message?.includes('JWT') || error.message?.includes('invalid') || error.message?.includes('malformed')) {
                console.warn('Invalid session detected, clearing auth state...')
                // Clear all auth-related items from localStorage
                const keysToRemove = []
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i)
                  if (key && (key.includes('supabase') || key.includes('ghin-stats-auth'))) {
                    keysToRemove.push(key)
                  }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key))
                sessionStorage.clear()
              }
            }
            setUser(null)
            setProfile(null)
          } else if (user) {
            console.log('Valid user found:', user.id)
            setUser(user)
            await fetchProfile(user.id)
          } else {
            console.log('No authenticated user')
            setUser(null)
            setProfile(null)
          }
        } catch (authError) {
          // Only log as error if it's not an expected "no session" error
          if (!authError.message?.includes('Auth session missing') && !authError.message?.includes('no Session')) {
            console.error('Critical auth check error:', authError)
          }
          setUser(null)
          setProfile(null)
        }
        
        setSessionValidated(true)
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      
      // For auth state changes, we need to validate with getUser()
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          try {
            // Validate the session is real
            const { data: { user }, error } = await supabase.auth.getUser()
            if (!error && user) {
              console.log('Session validated for user:', user.id)
              setUser(user)
              await fetchProfile(user.id)
            } else {
              // Only log as error if it's not a missing session
              if (error && !error.message?.includes('Auth session missing')) {
                console.error('Session validation failed:', error)
              }
              setUser(null)
              setProfile(null)
            }
          } catch (err) {
            console.error('Error validating session:', err)
            setUser(null)
            setProfile(null)
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setUser(null)
        setProfile(null)
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && !window.location.pathname.includes('/ghin-stats/login')) {
          const loginPath = window.location.pathname.includes('/ghin-stats') ? '/ghin-stats/login' : '/login'
          window.location.replace(loginPath)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId)
      
      // Add timeout for profile fetch
      const profilePromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Profile fetch timeout'))
        }, 5000)
        
        supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
          .then(result => {
            clearTimeout(timeoutId)
            resolve(result)
          })
          .catch(err => {
            clearTimeout(timeoutId)
            reject(err)
          })
      })
      
      const { data, error } = await profilePromise.catch(err => {
        console.error('Profile fetch error:', err)
        return { data: null, error: err }
      })

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
      console.error('Sign in error:', error.message)
      throw error
    }
    
    // After sign in, validate with getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Failed to validate session after sign in')
    }
    
    return data
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Session refresh failed:', error)
        return null
      }
      
      // Validate the refreshed session
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Session validation failed after refresh:', userError)
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
      if (error && !forceLogout) {
        // Only throw if not force logout
        throw error
      }
      
      // Force reload to clear any remaining state if force logout
      if (forceLogout) {
        const loginPath = window.location.pathname.includes('/ghin-stats') ? '/ghin-stats/login' : '/login'
        window.location.href = loginPath
      }
    } catch (error) {
      console.error('Error during sign out:', error)
      if (forceLogout) {
        // Force redirect even on error
        const loginPath = window.location.pathname.includes('/ghin-stats') ? '/ghin-stats/login' : '/login'
        window.location.href = loginPath
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
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}