import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SessionStatus from './SessionStatus'
import SessionDebug from './SessionDebug'

const Layout = ({ children, hideHeader = false }) => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

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
                  onClick={() => navigate('/')}
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
                    onClick={async () => {
                      await signOut()
                      navigate('/')
                    }}
                    className="text-xs sm:text-sm text-gray-400 hover:text-pink-400 transition-colors duration-200"
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
    </div>
  )
}

export default Layout