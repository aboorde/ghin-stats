import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { calculateHandicapIndex } from '../utils/handicapCalculator'
import Layout from './Layout'
import RoundByRoundView from './RoundByRoundView'
import HoleByHoleView from './HoleByHoleView'
import CourseByCourseSummary from './CourseByCourseSummary'
import YearByYearAnalysis from './YearByYearAnalysis'
import PineValleyAnalysis from './PineValleyAnalysis'
import Loading from './ui/Loading'
import Card from './ui/Card'

// Component to show when data is restricted
const RestrictedView = ({ type }) => (
  <Card className="text-center py-12">
    <div className="text-gray-400">
      <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <p className="text-lg">This golfer has chosen not to share their {type}</p>
    </div>
  </Card>
)

const Profile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user, profile: currentUserProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [handicapIndex, setHandicapIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('rounds')

  const isOwnProfile = user?.id === userId

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setError('User not found')
        } else {
          throw profileError
        }
        return
      }

      // Check if profile is public or if it's the user's own profile
      if (!isOwnProfile && profileData.profile_visibility !== 'public') {
        setError('This profile is private')
        return
      }

      setProfile(profileData)
      
      // Calculate handicap index if not stored
      if (profileData.handicap_index === null || profileData.handicap_index === undefined) {
        const { data: scores } = await supabase
          .from('scores')
          .select('differential, played_at')
          .eq('user_id', userId)
          .eq('number_of_holes', 18)
          .order('played_at', { ascending: false })
          .limit(20)
        
        if (scores && scores.length >= 3) {
          const calculatedIndex = calculateHandicapIndex(scores)
          setHandicapIndex(calculatedIndex)
        }
      } else {
        setHandicapIndex(profileData.handicap_index)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{error}</h2>
          <button
            onClick={() => navigate('/')}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Go back home
          </button>
        </div>
      </div>
    )
  }

  // Determine which views are available based on privacy settings
  const canViewScores = isOwnProfile || profile?.display_scores
  const canViewStatistics = isOwnProfile || profile?.display_statistics
  
  const viewComponents = {
    rounds: canViewScores ? <RoundByRoundView userId={userId} /> : <RestrictedView type="scores" />,
    holes: canViewScores ? <HoleByHoleView userId={userId} /> : <RestrictedView type="scores" />,
    course: canViewStatistics ? <CourseByCourseSummary userId={userId} /> : <RestrictedView type="statistics" />,
    yearly: canViewStatistics ? <YearByYearAnalysis userId={userId} /> : <RestrictedView type="statistics" />,
    pine: profile?.home_course_name === 'Pine Valley CC' && canViewStatistics ? <PineValleyAnalysis userId={userId} /> : null,
  }

  const navigationItems = [
    { id: 'rounds', label: 'Round by Round' },
    { id: 'holes', label: 'Hole by Hole' },
    { id: 'course', label: 'Course Summary' },
    { id: 'yearly', label: 'Year by Year' },
    ...(profile?.home_course_name === 'Pine Valley CC' 
      ? [{ id: 'pine', label: 'Pine Valley Analysis' }] 
      : []),
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        {/* Profile Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {profile.full_name || 'Anonymous Golfer'}
                </h1>
                <div className="mt-2 flex items-center space-x-4 text-gray-400">
                  {profile.ghin_number && (
                    <span>GHIN: {profile.ghin_number}</span>
                  )}
                  {profile.home_course_name && (
                    <span>Home: {profile.home_course_name}</span>
                  )}
                  {(isOwnProfile || profile.display_handicap) && handicapIndex !== null && handicapIndex !== undefined && (
                    <span className="text-emerald-400 font-medium">
                      Index: {handicapIndex.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {!user && (
                  <button
                    onClick={() => navigate('/profiles/public')}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Back to Profiles
                  </button>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/settings')}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeView === item.id
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {viewComponents[activeView]}
        </div>
      </div>
    </Layout>
  )
}

export default Profile