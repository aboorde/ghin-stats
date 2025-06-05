import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full flex items-center justify-center text-white font-bold shadow-2xl shadow-pink-500/30 text-3xl mb-4">
              S
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent mb-2">Scratch Pad</h1>
          </div>
          <p className="text-gray-300">Track and analyze your golf performance</p>
        </div>
        
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl shadow-pink-900/20 border border-pink-900/30 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-pink-900/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-pink-900/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-pink-600/25 hover:shadow-xl hover:shadow-pink-600/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            View public profiles without signing in
          </p>
          <Link 
            to="/profiles/public" 
            className="text-pink-400 hover:text-pink-300 text-sm mt-2 inline-block transition-colors duration-200"
          >
            Browse Public Profiles →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login