import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  isValidEmail, 
  validatePassword, 
  sanitizeInput, 
  checkRateLimit, 
  recordLoginAttempt, 
  clearLoginAttempts,
  getSecureErrorMessage,
  generateCSRFToken
} from '../utils/security'

const Login = () => {
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [csrfToken] = useState(() => generateCSRFToken())
  const [rateLimitInfo, setRateLimitInfo] = useState(null)
  
  // Clear rate limit message after reset time
  useEffect(() => {
    if (rateLimitInfo?.resetTime) {
      const timeUntilReset = rateLimitInfo.resetTime - Date.now()
      if (timeUntilReset > 0) {
        const timer = setTimeout(() => {
          setRateLimitInfo(null)
        }, timeUntilReset)
        return () => clearTimeout(timer)
      }
    }
  }, [rateLimitInfo])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email)
    
    // Validate inputs
    const errors = {}
    if (!isValidEmail(sanitizedEmail)) {
      errors.email = 'Please enter a valid email address'
    }
    
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.errors[0]
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    
    // Check rate limiting
    const rateLimit = checkRateLimit(sanitizedEmail)
    if (rateLimit.limited) {
      const resetDate = new Date(rateLimit.resetTime)
      setRateLimitInfo({
        message: `Too many login attempts. Please try again after ${resetDate.toLocaleTimeString()}.`,
        resetTime: rateLimit.resetTime
      })
      return
    }
    
    setLoading(true)
    
    try {
      // Record the attempt
      recordLoginAttempt(sanitizedEmail)
      
      // Attempt sign in with sanitized email
      await signIn(sanitizedEmail, password)
      
      // Clear rate limiting on successful login
      clearLoginAttempts(sanitizedEmail)
    } catch (err) {
      // Use secure error message
      setError(getSecureErrorMessage(err))
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
          {/* Security indicator */}
          <div className="flex items-center justify-center mb-4 text-xs text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>
              {window.location.protocol === 'https:' ? 'Secure connection' : 'Local development mode'}
            </span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden CSRF token field */}
            <input type="hidden" name="csrf_token" value={csrfToken} />
            
            {/* Rate limit error */}
            {rateLimitInfo && (
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm">
                {rateLimitInfo.message}
              </div>
            )}
            
            {/* General error */}
            {error && !rateLimitInfo && (
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
                onChange={(e) => {
                  setEmail(e.target.value)
                  // Clear validation error on change
                  if (validationErrors.email) {
                    setValidationErrors(prev => ({ ...prev, email: undefined }))
                  }
                }}
                required
                aria-invalid={!!validationErrors.email}
                aria-describedby={validationErrors.email ? "email-error" : undefined}
                className={`w-full px-4 py-2 bg-slate-800/50 border ${
                  validationErrors.email ? 'border-red-500' : 'border-pink-900/30'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-all duration-200`}
                placeholder="your@email.com"
                autoComplete="email"
              />
              {validationErrors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-400">
                  {validationErrors.email}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  // Clear validation error on change
                  if (validationErrors.password) {
                    setValidationErrors(prev => ({ ...prev, password: undefined }))
                  }
                }}
                required
                aria-invalid={!!validationErrors.password}
                aria-describedby={validationErrors.password ? "password-error" : undefined}
                className={`w-full px-4 py-2 bg-slate-800/50 border ${
                  validationErrors.password ? 'border-red-500' : 'border-pink-900/30'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-all duration-200`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {validationErrors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-400">
                  {validationErrors.password}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !!rateLimitInfo}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-pink-600/25 hover:shadow-xl hover:shadow-pink-600/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {loading ? 'Signing in...' : rateLimitInfo ? 'Too Many Attempts' : 'Sign In'}
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