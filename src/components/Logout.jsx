import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Loading from './ui/Loading'

const Logout = () => {
  const { signOut } = useAuth()

  useEffect(() => {
    // Force logout immediately when component mounts
    const performLogout = async () => {
      try {
        await signOut(true) // true = force logout
      } catch (error) {
        console.error('Logout failed:', error)
        // Force redirect even on error
        window.location.href = '/login'
      }
    }
    
    performLogout()
  }, [signOut])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-pink-950/20 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loading message="Signing out..." />
        <p className="text-pink-300/60 mt-4">Clearing session data...</p>
      </div>
    </div>
  )
}

export default Logout