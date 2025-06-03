import React from 'react'
import { NavLink } from 'react-router-dom'

const Layout = ({ children }) => {
  const navItems = [
    { path: '/', label: 'Round by Round', icon: '📊' },
    { path: '/hole-by-hole', label: 'Hole by Hole', icon: '⛳' },
    { path: '/course-summary', label: 'Course Summary', icon: '🏌️' },
    { path: '/year-by-year', label: 'Year by Year', icon: '📅' },
    { path: '/pine-valley', label: 'Pine Valley', icon: '🌲' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950">
      {/* Background texture */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-gray-900/80 border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">
                G
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
                <span className="hidden sm:inline">Golf Stats Dashboard</span>
                <span className="sm:hidden">Golf Stats</span>
              </h1>
            </div>
            <div className="text-xs sm:text-sm text-gray-400 hidden xs:block">
              Track • Analyze • Improve
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 backdrop-blur-md bg-gray-900/60 border-b border-gray-800 sticky top-0">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {navItems.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `
                  flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg
                  transition-all duration-300
                  whitespace-nowrap min-w-fit
                  text-sm sm:text-base
                  ${isActive 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                  }
                `}
              >
                <span className="text-base sm:text-lg">{icon}</span>
                <span className="font-medium hidden sm:inline">{label}</span>
                <span className="font-medium sm:hidden text-xs">{label.split(' ')[0]}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-gray-800 bg-gray-900/60 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center text-xs sm:text-sm text-gray-500">
            <p>Elevate your game with data-driven insights</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout