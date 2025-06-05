import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const SessionStatus = () => {
  const { user, refreshSession } = useAuth()
  const [sessionInfo, setSessionInfo] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!user) {
      setSessionInfo(null)
      return
    }

    const updateSessionInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const minutesLeft = Math.floor((expiresAt - now) / 1000 / 60)
        
        setSessionInfo({
          expiresAt,
          minutesLeft,
          isExpiringSoon: minutesLeft < 10
        })
      }
    }

    // Update immediately
    updateSessionInfo()

    // Update every 30 seconds
    const interval = setInterval(updateSessionInfo, 30000)

    return () => clearInterval(interval)
  }, [user])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
      // Force update of session info
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const minutesLeft = Math.floor((expiresAt - now) / 1000 / 60)
        
        setSessionInfo({
          expiresAt,
          minutesLeft,
          isExpiringSoon: minutesLeft < 10
        })
      }
    } catch (error) {
      console.error('Manual refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!user || !sessionInfo) return null

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-gray-800 rounded-lg shadow-lg text-sm">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${sessionInfo.isExpiringSoon ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
        <span className="text-gray-300">
          Session: {sessionInfo.minutesLeft}m
        </span>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}

export default SessionStatus