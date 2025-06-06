import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Constants for retry logic
const MAX_REFRESH_ATTEMPTS = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second
const MAX_RETRY_DELAY = 30000 // 30 seconds

// Hook to monitor session health and refresh when needed
export const useSessionMonitor = () => {
  const { user, refreshSession } = useAuth()
  const refreshAttemptsRef = useRef(0)
  const lastRefreshAttemptRef = useRef(0)
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY)

  const checkSessionHealth = useCallback(async () => {
    if (!user) return

    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // Check if we've exceeded max refresh attempts
        const now = Date.now()
        const timeSinceLastAttempt = now - lastRefreshAttemptRef.current
        
        // Reset attempts if enough time has passed (1 hour)
        if (timeSinceLastAttempt > 3600000) {
          refreshAttemptsRef.current = 0
          retryDelayRef.current = INITIAL_RETRY_DELAY
        }
        
        if (refreshAttemptsRef.current >= MAX_REFRESH_ATTEMPTS) {
          console.error('Max refresh attempts reached. Session recovery failed.')
          return
        }
        
        console.log(`Session check failed, attempting refresh... (attempt ${refreshAttemptsRef.current + 1}/${MAX_REFRESH_ATTEMPTS})`)
        
        // Wait with exponential backoff
        if (refreshAttemptsRef.current > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelayRef.current))
          retryDelayRef.current = Math.min(retryDelayRef.current * 2, MAX_RETRY_DELAY)
        }
        
        refreshAttemptsRef.current++
        lastRefreshAttemptRef.current = now
        
        const refreshResult = await refreshSession()
        if (refreshResult) {
          // Success - reset counters
          refreshAttemptsRef.current = 0
          retryDelayRef.current = INITIAL_RETRY_DELAY
        }
        return
      }

      // Check if session is about to expire (within 5 minutes)
      const expiresAt = session.expires_at
      const expiresIn = expiresAt ? (expiresAt * 1000) - Date.now() : 0
      const fiveMinutes = 5 * 60 * 1000

      if (expiresIn > 0 && expiresIn < fiveMinutes) {
        console.log('Session expiring soon, refreshing...')
        const refreshResult = await refreshSession()
        if (refreshResult) {
          // Success - reset counters
          refreshAttemptsRef.current = 0
          retryDelayRef.current = INITIAL_RETRY_DELAY
        }
      } else {
        // Session is healthy - reset counters
        refreshAttemptsRef.current = 0
        retryDelayRef.current = INITIAL_RETRY_DELAY
      }
    } catch (error) {
      console.error('Session health check error:', error)
      refreshAttemptsRef.current++
    }
  }, [user, refreshSession])

  useEffect(() => {
    if (!user) return

    // Check session health immediately
    checkSessionHealth()

    // Check session health every 2 minutes
    const interval = setInterval(checkSessionHealth, 2 * 60 * 1000)

    // Also check on window focus
    const handleFocus = () => {
      console.log('Window focused, checking session...')
      checkSessionHealth()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, checkSessionHealth])

  return { checkSessionHealth }
}