import { useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Hook to monitor session health and refresh when needed
export const useSessionMonitor = () => {
  const { user, refreshSession } = useAuth()

  const checkSessionHealth = useCallback(async () => {
    if (!user) return

    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.log('Session check failed, attempting refresh...')
        await refreshSession()
        return
      }

      // Check if session is about to expire (within 5 minutes)
      const expiresAt = session.expires_at
      const expiresIn = expiresAt ? (expiresAt * 1000) - Date.now() : 0
      const fiveMinutes = 5 * 60 * 1000

      if (expiresIn > 0 && expiresIn < fiveMinutes) {
        console.log('Session expiring soon, refreshing...')
        await refreshSession()
      }
    } catch (error) {
      console.error('Session health check error:', error)
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