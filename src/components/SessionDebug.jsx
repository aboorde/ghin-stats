import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const SessionDebug = () => {
  const { user, loading, sessionValidated } = useAuth()
  const [sessionData, setSessionData] = useState(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    if (!user) {
      setSessionData(null)
      return
    }

    const updateSessionData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setSessionData({ error: error.message })
        return
      }

      if (session) {
        const expiresAt = new Date(session.expires_at * 1000)
        const issuedAt = new Date((session.expires_at - 3600) * 1000) // JWT typically 1 hour
        const now = new Date()
        
        setSessionData({
          user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            aud: session.user.aud
          },
          session: {
            access_token: session.access_token ? `${session.access_token.substring(0, 20)}...` : null,
            refresh_token: session.refresh_token ? `${session.refresh_token.substring(0, 20)}...` : null,
            expires_at: expiresAt.toLocaleString(),
            expires_in: Math.floor((expiresAt - now) / 1000),
            issued_at: issuedAt.toLocaleString(),
            provider_token: session.provider_token,
            provider_refresh_token: session.provider_refresh_token,
            token_type: session.token_type
          },
          auth_config: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: 'localStorage',
            storageKey: 'ghin-stats-auth'
          },
          debug_info: {
            authContextLoading: loading,
            authContextValidated: sessionValidated,
            isRedirecting: sessionStorage.getItem('auth-redirecting') || 'false',
            localStorage: localStorage.getItem('ghin-stats-auth') ? 'Present' : 'Missing',
            windowLocation: window.location.pathname
          }
        })
      }
    }

    // Update immediately
    updateSessionData()

    // Update every 5 seconds in debug mode
    const interval = setInterval(updateSessionData, 5000)

    return () => clearInterval(interval)
  }, [user, showDebug])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null
  if (!user) return null

  return (
    <>
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-20 right-4 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg text-xs font-mono"
      >
        {showDebug ? 'Hide' : 'Show'} Session Debug
      </button>

      {showDebug && sessionData && (
        <div className="fixed bottom-32 right-4 max-w-md p-4 bg-gray-900 border border-purple-600 rounded-lg shadow-xl font-mono text-xs overflow-auto max-h-96">
          <h3 className="text-purple-400 font-bold mb-2">Session Debug Info</h3>
          
          {sessionData.error ? (
            <div className="text-red-400">Error: {sessionData.error}</div>
          ) : (
            <>
              <div className="mb-3">
                <h4 className="text-green-400 mb-1">User Info:</h4>
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(sessionData.user, null, 2)}
                </pre>
              </div>

              <div className="mb-3">
                <h4 className="text-green-400 mb-1">Session Info:</h4>
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(sessionData.session, null, 2)}
                </pre>
              </div>

              <div className="mb-3">
                <h4 className="text-green-400 mb-1">Auth Config:</h4>
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(sessionData.auth_config, null, 2)}
                </pre>
              </div>

              <div className="mb-3">
                <h4 className="text-yellow-400 mb-1">Debug Info:</h4>
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(sessionData.debug_info, null, 2)}
                </pre>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className={`text-sm ${sessionData.session.expires_in < 300 ? 'text-yellow-400' : 'text-green-400'}`}>
                  Time remaining: {Math.floor(sessionData.session.expires_in / 60)}m {sessionData.session.expires_in % 60}s
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default SessionDebug