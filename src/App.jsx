import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Profile from './components/Profile'
import Settings from './components/Settings'
import PublicProfilesList from './components/PublicProfilesList'
import AddRound from './components/AddRound'
import ManageRounds from './components/ManageRounds'
import Loading from './components/ui/Loading'
import { useSessionMonitor } from './hooks/useSessionMonitor'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <Loading />
  if (!user) return <Navigate to="/" replace />
  
  return children
}

// App router component
const AppRouter = () => {
  const { user, loading } = useAuth()
  
  // Monitor session health for authenticated users
  useSessionMonitor()
  
  if (loading) return <Loading />
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to={`/profile/${user.id}`} replace /> : <Login />} />
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
    </Routes>
  )
}

function App() {
  // Handle both /ghin-stats and /ghin-stats/ paths
  const basename = window.location.pathname.includes('/scratch-pad') ? '/scratch-pad' : '';
  
  return (
    <Router basename={basename}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Router>
  )
}

export default App