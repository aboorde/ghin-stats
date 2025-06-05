import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from './Layout'
import Loading from './ui/Loading'

const Settings = () => {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  
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
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-lg shadow-xl">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Player ID
                  </label>
                  <input
                    type="text"
                    name="ghin_number"
                    value={formData.ghin_number}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Home Course
                  </label>
                  <input
                    type="text"
                    name="home_course_name"
                    value={formData.home_course_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Tees
                  </label>
                  <input
                    type="text"
                    name="preferred_tees"
                    value={formData.preferred_tees}
                    onChange={handleChange}
                    placeholder="e.g., White Tees"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Privacy Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    name="profile_visibility"
                    value={formData.profile_visibility}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-400">
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
                      className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-gray-300">Display handicap index on profile</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="display_scores"
                      checked={formData.display_scores}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-gray-300">Display individual scores on public profile</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="display_statistics"
                      checked={formData.display_statistics}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-gray-300">Display statistics (course summary, yearly analysis) on public profile</span>
                  </label>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Preferences</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Measurement System
                  </label>
                  <select
                    name="measurement_system"
                    value={formData.measurement_system}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="imperial">Imperial (yards)</option>
                    <option value="metric">Metric (meters)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Danger Zone */}
            <div className="px-6 py-4 border-t border-gray-700">
              <h3 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h3>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Settings