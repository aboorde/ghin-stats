import React, { useState, useEffect } from 'react'
import Card from './ui/Card'

/**
 * LoadingRecovery component that detects stuck loading states
 * and provides recovery options after a timeout
 */
const LoadingRecovery = ({ loading, timeout = 10000, children }) => {
  const [showRecovery, setShowRecovery] = useState(false)
  const [timeoutId, setTimeoutId] = useState(null)

  useEffect(() => {
    let id
    
    if (loading) {
      // Start timeout when loading begins
      id = setTimeout(() => {
        setShowRecovery(true)
      }, timeout)
      
      setTimeoutId(id)
    } else {
      // Clear timeout when loading completes
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      setShowRecovery(false)
    }

    // Cleanup
    return () => {
      if (id) {
        clearTimeout(id)
      }
    }
  }, [loading, timeout, timeoutId])

  const handleSoftReset = () => {
    // Try to recover by clearing auth state and reloading
    try {
      // Only clear auth-related storage
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('ghin-stats-auth'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Clear session storage
      sessionStorage.clear()
      
      // Reload the page
      window.location.reload()
    } catch (error) {
      console.error('Error during soft reset:', error)
      window.location.reload()
    }
  }

  const handleHardReset = () => {
    // Nuclear option - clear everything
    try {
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear IndexedDB (if used)
      if (window.indexedDB) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            indexedDB.deleteDatabase(db.name)
          })
        }).catch(() => {
          // Ignore errors
        })
      }
      
      // Navigate to root
      window.location.href = '/'
    } catch (error) {
      console.error('Error during hard reset:', error)
      window.location.href = '/'
    }
  }

  // If loading and timeout exceeded, show recovery options
  if (loading && showRecovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950/20 flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-lg w-full p-8 bg-gradient-to-br from-slate-900/95 to-pink-950/10 border-yellow-900/40">
          <div className="text-center space-y-6">
            {/* Loading Icon with animation */}
            <div className="relative">
              <div className="text-6xl animate-pulse">⏳</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-yellow-400">Taking longer than expected...</h1>
            
            {/* Message */}
            <div className="text-pink-300/70 space-y-2">
              <p>The app seems to be stuck loading. This can happen if:</p>
              <ul className="text-sm text-left inline-block space-y-1 mt-2">
                <li>• Your session data is corrupted</li>
                <li>• The authentication service is slow</li>
                <li>• Your browser cache needs clearing</li>
              </ul>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleSoftReset}
                className="px-6 py-3 bg-gradient-to-br from-yellow-500 to-yellow-700 text-white font-medium rounded-lg shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40 hover:from-yellow-400 hover:to-yellow-600 transition-all duration-200"
              >
                Clear Session & Reload
              </button>
              
              <button
                onClick={handleHardReset}
                className="px-6 py-3 bg-gradient-to-br from-red-600 to-red-800 text-white font-medium rounded-lg shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-500 hover:to-red-700 transition-all duration-200"
              >
                Reset Everything
              </button>
            </div>
            
            {/* Keep waiting option */}
            <button
              onClick={() => setShowRecovery(false)}
              className="text-sm text-pink-300/50 hover:text-pink-300/70 transition-colors duration-200 underline"
            >
              Keep waiting...
            </button>
          </div>
        </Card>
      </div>
    )
  }

  // Normal rendering
  return children
}

export default LoadingRecovery