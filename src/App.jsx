import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Logout from './components/Logout'
import Profile from './components/Profile'
import Settings from './components/Settings'
import PublicProfilesList from './components/PublicProfilesList'
import AddRound from './components/AddRound'
import EditRound from './components/EditRound'
import ManageRounds from './components/ManageRounds'
import Loading from './components/ui/Loading'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingRecovery from './components/LoadingRecovery'
import { useSessionMonitor } from './hooks/useSessionMonitor'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return (
    <LoadingRecovery loading={loading}>
      <Loading />
    </LoadingRecovery>
  )
  if (!user) return <Navigate to="/" replace />
  
  return children
}

// App router component
const AppRouter = () => {
  const { user, loading } = useAuth()
  
  // Monitor session health for authenticated users
  useSessionMonitor()
  
  if (loading) return (
    <LoadingRecovery loading={loading}>
      <Loading />
    </LoadingRecovery>
  )
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to={`/profile/${user.id}`} replace /> : <Login />} />
      <Route path="/login" element={user ? <Navigate to={`/profile/${user.id}`} replace /> : <Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/profiles/public" element={<PublicProfilesList />} />
      <Route path="/profile/:userId" element={<Profile />} />
      
      {/* Protected routes */}
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/add-round" element={
        <ProtectedRoute>
          <AddRound />
        </ProtectedRoute>
      } />
      <Route path="/manage-rounds" element={
        <ProtectedRoute>
          <ManageRounds />
        </ProtectedRoute>
      } />
      <Route path="/edit-round/:roundId" element={
        <ProtectedRoute>
          <EditRound />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  // Check for emergency reset URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('reset') === 'emergency') {
      console.warn('Emergency reset triggered via URL parameter')
      
      // Clear all storage
      try {
        localStorage.clear()
        sessionStorage.clear()
        
        // Clear IndexedDB
        if (window.indexedDB) {
          indexedDB.databases().then(databases => {
            databases.forEach(db => indexedDB.deleteDatabase(db.name))
          }).catch(() => {})
        }
      } catch (error) {
        console.error('Error during emergency reset:', error)
      }
      
      // Remove the parameter and reload
      const newUrl = window.location.pathname + window.location.hash
      window.history.replaceState({}, document.title, newUrl)
      window.location.reload()
    }
  }, [])
  
  // Handle both /ghin-stats and /ghin-stats/ paths
  const basename = window.location.pathname.includes('/ghin-stats') ? '/ghin-stats' : '';
  
  return (
    <ErrorBoundary>
      <Router basename={basename}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App