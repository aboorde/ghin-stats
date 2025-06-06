import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SessionStatus from './SessionStatus'
import SessionDebug from './SessionDebug'

const Layout = ({ children, hideHeader = false }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showEmergencyReset, setShowEmergencyReset] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  // Show emergency reset after 5 rapid clicks on the logo
  useEffect(() => {
    if (clickCount >= 5) {
      setShowEmergencyReset(true)
      // Hide after 10 seconds
      const timer = setTimeout(() => {
        setShowEmergencyReset(false)
        setClickCount(0)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [clickCount])

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1)
    // Reset counter after 2 seconds of no clicks
    setTimeout(() => setClickCount(0), 2000)
    navigate('/')
  }

  const handleEmergencyReset = () => {
    if (window.confirm('⚠️ Emergency Reset\n\nThis will clear ALL application data and force a complete reload.\n\nAre you sure you want to continue?')) {
      try {
        // Clear everything
        localStorage.clear()
        sessionStorage.clear()
        
        // Clear IndexedDB
        if (window.indexedDB) {
          indexedDB.databases().then(databases => {
            databases.forEach(db => indexedDB.deleteDatabase(db.name))
          }).catch(() => {})
        }
        
        // Navigate to root
        window.location.href = '/'
      } catch (error) {
        console.error('Emergency reset error:', error)
        window.location.href = '/'
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950/20">
      {/* Background texture */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ec4899' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Header */}
      {!hideHeader && (
        <header className="relative z-10 backdrop-blur-md bg-slate-900/90 border-b border-pink-900/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-2 sm:gap-3">
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/25 text-sm sm:text-base cursor-pointer hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300"
                  onClick={handleLogoClick}
                >
                  S
                </div>
                <h1 
                  className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent cursor-pointer hover:from-pink-300 hover:to-yellow-300 transition-all duration-300"
                  onClick={() => navigate('/')}
                >
                  <span className="hidden sm:inline">Scratch Pad</span>
                  <span className="sm:hidden">Scratch Pad</span>
                </h1>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <button
                    onClick={() => {
                      navigate('/logout')
                    }}
                    className="text-xs sm:text-sm text-gray-400 hover:text-pink-400 transition-colors duration-200 font-medium"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}


      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Session Status Indicator */}
      {user && <SessionStatus />}
      
      {/* Session Debug Panel (Development Only) */}
      <SessionDebug />
      
      {/* Emergency Reset Button (Hidden until activated) */}
      {showEmergencyReset && (
        <div className="fixed bottom-20 right-4 z-50 animate-fadeIn">
          <button
            onClick={handleEmergencyReset}
            className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-800 text-white font-medium rounded-lg shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-500 hover:to-red-700 transition-all duration-200 flex items-center gap-2"
            title="Emergency Reset - Clear all data and reload"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Emergency Reset
          </button>
          <p className="text-xs text-red-300/70 mt-2 text-right">
            Click to clear all data
          </p>
        </div>
      )}
    </div>
  )
}

export default Layout