import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from './Layout'
import Card from './ui/Card'
import { importGolfRounds, formatImportSummary } from '../services/importService'

const Settings = () => {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [importToken, setImportToken] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    ghin_number: '',
    home_course_name: '',
    preferred_tees: '',
    profile_visibility: 'private',
    display_handicap: true,
    display_scores: false,
    display_statistics: true,
    measurement_system: 'imperial',
  })
  
  const [golferId, setGolferId] = useState('')

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        ghin_number: profile.ghin_number || '',
        home_course_name: profile.home_course_name || '',
        preferred_tees: profile.preferred_tees || '',
        profile_visibility: profile.profile_visibility || 'private',
        display_handicap: profile.display_handicap ?? true,
        display_scores: profile.display_scores ?? false,
        display_statistics: profile.display_statistics ?? true,
        measurement_system: profile.measurement_system || 'imperial',
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // Convert empty strings to null for fields with unique constraints
      const dataToUpdate = {
        ...formData,
        ghin_number: formData.ghin_number?.trim() || null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('users')
        .update(dataToUpdate)
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Refresh profile in context
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleImportData = async () => {
    console.log('🚀 handleImportData called')
    console.log('Token present:', !!importToken)
    console.log('Golfer ID:', golferId)
    console.log('User ID:', user?.id)
    
    if (!importToken || !golferId) {
      setImportMessage({ 
        type: 'error', 
        text: 'Please provide both token and golfer ID'
      })
      return
    }
    
    setImporting(true)
    setImportMessage(null)
    
    try {
      // Make HTTP GET request with bearer token
      const url = `https://api2.ghin.com/api/v1/scores.json?golfer_id=${golferId}&offset=0&limit=100&from_date_played=2022-01-01&to_date_played=2025-12-31&statuses=Validated&source=GHINcom`
      console.log('📡 Fetching from API:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${importToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📡 API Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📡 API Response data:', {
        hasScores: !!data.scores,
        scoresCount: data.scores?.length,
        firstScore: data.scores?.[0]
      })
      
      const scores = data.scores || [];
      
      console.log('📥 Calling importGolfRounds with', scores.length, 'scores')
      // Import the rounds into Supabase
      const importResults = await importGolfRounds(scores, user.id)
      console.log('📥 Import results:', importResults)
      
      // Format the results for display
      const summary = formatImportSummary(importResults)
      
      setImportMessage({
        type: summary.type,
        text: summary.message,
        details: summary.details
      })
      
      // Clear the token and golfer ID for security
      setImportToken('')
      setGolferId('')
      
      // Refresh the page data if any rounds were imported
      if (importResults.successful > 0) {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error('Error importing data:', error)
      setImportMessage({ 
        type: 'error', 
        text: 'Failed to import data',
        details: error.message
      })
    } finally {
      setImporting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setMessage({ type: 'error', text: 'Failed to sign out' })
    }
  }

  if (!user) {
    navigate('/')
    return null
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950/10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card variant="elevated" className="p-0 bg-gradient-to-br from-slate-900/95 to-pink-950/10 border-pink-900/40 shadow-2xl shadow-pink-900/10">
            <div className="px-6 py-5 border-b border-pink-900/30 bg-slate-950/60 backdrop-blur-sm rounded-t-xl">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Profile Settings</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {message && (
                <div className={`p-4 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                  message.type === 'success' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-pink-300/90">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_1rem_center] bg-no-repeat pr-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
                    Player ID
                  </label>
                  <input
                    type="text"
                    name="ghin_number"
                    value={formData.ghin_number}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_1rem_center] bg-no-repeat pr-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
                    Home Course
                  </label>
                  <input
                    type="text"
                    name="home_course_name"
                    value={formData.home_course_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_1rem_center] bg-no-repeat pr-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
                    Preferred Tees
                  </label>
                  <input
                    type="text"
                    name="preferred_tees"
                    value={formData.preferred_tees}
                    onChange={handleChange}
                    placeholder="e.g., White Tees"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_1rem_center] bg-no-repeat pr-10"
                  />
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-pink-300/90">Privacy Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
                    Profile Visibility
                  </label>
                  <select
                    name="profile_visibility"
                    value={formData.profile_visibility}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_1rem_center] bg-no-repeat pr-10"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                  <p className="mt-1 text-sm text-pink-300/50">
                    Public profiles can be viewed by anyone with the link
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="display_handicap"
                      checked={formData.display_handicap}
                      onChange={handleChange}
                      className="w-4 h-4 text-pink-500 bg-slate-950 border-pink-900/30 rounded focus:ring-pink-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200"
                    />
                    <span className="text-slate-200">Display handicap index on profile</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="display_scores"
                      checked={formData.display_scores}
                      onChange={handleChange}
                      className="w-4 h-4 text-pink-500 bg-slate-950 border-pink-900/30 rounded focus:ring-pink-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200"
                    />
                    <span className="text-slate-200">Display individual scores on public profile</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="display_statistics"
                      checked={formData.display_statistics}
                      onChange={handleChange}
                      className="w-4 h-4 text-pink-500 bg-slate-950 border-pink-900/30 rounded focus:ring-pink-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200"
                    />
                    <span className="text-slate-200">Display statistics (course summary, yearly analysis) on public profile</span>
                  </label>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-pink-300/90">Preferences</h3>
                
                <div>
                  <label className="block text-sm font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
                    Measurement System
                  </label>
                  <select
                    name="measurement_system"
                    value={formData.measurement_system}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_1rem_center] bg-no-repeat pr-10"
                  >
                    <option value="imperial">Imperial (yards)</option>
                    <option value="metric">Metric (meters)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t border-pink-900/30">
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="px-5 py-2.5 bg-slate-800/80 text-pink-300 border border-pink-900/30 rounded-lg hover:bg-pink-900/30 hover:border-pink-700/50 hover:text-pink-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-br from-pink-500 to-pink-700 text-white font-medium rounded-lg shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 hover:from-pink-400 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Data Import Section */}
            <div className="px-6 py-6 border-t border-pink-900/30 bg-slate-950/40">
              <h3 className="text-lg font-semibold text-pink-300/90 mb-4">Data Import</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
                    Golfer ID
                  </label>
                  <input
                    type="text"
                    value={golferId}
                    onChange={(e) => setGolferId(e.target.value)}
                    placeholder="Enter your golfer ID"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 placeholder-pink-300/30 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:border-pink-700/50 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
                    Import Token
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="password"
                      value={importToken}
                      onChange={(e) => setImportToken(e.target.value)}
                      placeholder="Enter your API token"
                      className="flex-1 px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 placeholder-pink-300/30 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:border-pink-700/50 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={handleImportData}
                      disabled={!importToken || !golferId || importing}
                      className="px-6 py-2.5 bg-gradient-to-br from-pink-500 to-pink-700 text-white font-medium rounded-lg shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 hover:from-pink-400 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {importing ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Importing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Import Data
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-pink-300/50">
                    Enter your golfer ID and API token to import golf data from external services
                  </p>
                </div>
                
                {importMessage && (
                  <div className={`p-4 rounded-lg backdrop-blur-sm transition-all duration-300 animate-fadeIn ${
                    importMessage.type === 'success' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      {importMessage.type === 'success' ? (
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <div>
                        <p className="font-medium">{importMessage.text}</p>
                        {importMessage.details && (
                          <p className="text-sm mt-1 opacity-75">{importMessage.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="px-6 py-4 border-t border-pink-900/30 bg-red-950/10">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
              <button
                onClick={handleSignOut}
                className="px-5 py-2.5 bg-gradient-to-br from-red-600 to-red-800 text-white font-medium rounded-lg shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-500 hover:to-red-700 transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default Settings