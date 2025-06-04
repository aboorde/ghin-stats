import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Loading from './ui/Loading'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'

const PublicProfilesList = () => {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPublicProfiles()
  }, [])

  const fetchPublicProfiles = async () => {
    try {
      setLoading(true)
      
      // Fetch public profiles from the users table
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          username,
          golfer_id,
          handicap_index,
          home_course_name,
          created_at,
          profile_visibility,
          display_handicap,
          display_scores,
          display_statistics
        `)
        .eq('profile_visibility', 'public')
        .order('full_name', { ascending: true, nullsFirst: false })

      if (error) throw error

      // For each public profile, get their latest round and total rounds
      const profilesWithStats = await Promise.all(
        (data || []).map(async (profile) => {
          // Get latest round and count
          const { data: scores, error: scoresError } = await supabase
            .from('scores')
            .select('played_at, adjusted_gross_score')
            .eq('user_id', profile.id)
            .order('played_at', { ascending: false })
            .limit(1)

          const { count } = await supabase
            .from('scores')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)

          return {
            ...profile,
            latestRound: scores?.[0] || null,
            totalRounds: count || 0
          }
        })
      )

      setProfiles(profilesWithStats.filter(p => p.totalRounds > 0))
    } catch (err) {
      console.error('Error fetching public profiles:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="text-red-400 bg-red-900/20 border border-red-600/30 rounded-lg p-4 inline-block">
              Error loading profiles: {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto p-4">
        <PageHeader 
          title="Public Golf Profiles" 
          subtitle="Browse golfers who have made their profiles public"
        />

        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-400">
            {profiles.length} public {profiles.length === 1 ? 'profile' : 'profiles'} available
          </p>
          <Link 
            to="/"
            className="text-emerald-400 hover:text-emerald-300 text-sm"
          >
            ← Back to Login
          </Link>
        </div>

        {profiles.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400">No public profiles available at this time.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                to={`/profile/${profile.id}`}
                className="block hover:transform hover:scale-[1.02] transition-all duration-200"
              >
                <Card className="h-full hover:border-emerald-600/50">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {profile.full_name || profile.username || profile.email.split('@')[0]}
                        </h3>
                        {profile.home_course_name && (
                          <p className="text-sm text-gray-400 mt-1">{profile.home_course_name}</p>
                        )}
                      </div>
                      {profile.display_handicap && profile.handicap_index !== null && profile.handicap_index !== undefined && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-400">
                            {profile.handicap_index.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">Handicap</div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Rounds:</span>
                        <span className="text-gray-300">{profile.totalRounds}</span>
                      </div>
                      
                      {profile.latestRound && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Latest Round:</span>
                          <span className="text-gray-300">
                            {new Date(profile.latestRound.played_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sharing:</span>
                        <div className="flex gap-2">
                          {profile.display_scores && (
                            <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                              Scores
                            </span>
                          )}
                          {profile.display_statistics && (
                            <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                              Stats
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-500">
                        Member since {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicProfilesList