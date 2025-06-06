import { supabase } from '../lib/supabase'

/**
 * Force logout utility function
 * Clears all session data and redirects to login
 * Can be called from anywhere in the app
 */
export const forceLogout = async () => {
  try {
    // Clear localStorage items
    if (typeof window !== 'undefined') {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('ghin'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Clear sessionStorage
      sessionStorage.clear()
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error during force logout:', error)
  } finally {
    // Always redirect to login, even on error
    window.location.href = '/logout'
  }
}

/**
 * Direct logout that immediately redirects
 */
export const instantLogout = () => {
  // Clear storage immediately
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
  }
  
  // Navigate to logout route
  window.location.href = '/logout'
}