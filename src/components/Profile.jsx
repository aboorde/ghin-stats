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
import ProfileEmptyState from './molecules/ProfileEmptyState'

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
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [handicapIndex, setHandicapIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('rounds')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasRounds, setHasRounds] = useState(true) // Default to true to avoid flash

  const isOwnProfile = user?.id === userId

  useEffect(() => {
    fetchUserProfile()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    let timeoutId
    try {
      setLoading(true)
      setError(null)
      
      // Add a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        setError('Request timed out. Please try refreshing the page.')
        setLoading(false)
      }, 30000) // 30 second timeout

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        clearTimeout(timeoutId)
        if (profileError.code === 'PGRST116') {
          setError('User not found')
        } else if (profileError.message?.includes('JWT') || profileError.message?.includes('token')) {
          // Auth error - redirect to login
          console.error('Auth error in profile:', profileError)
          navigate('/login')
          return
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
      
      // Check if user has any rounds
      const { count } = await supabase
        .from('rounds')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      setHasRounds(count > 0)
       console.log("WARWTGE", {profileData})
      // Calculate handicap index if not stored
      if (profileData.handicap_index === null || profileData.handicap_index === undefined) {
        const { data: rounds } = await supabase
          .from('rounds')
          .select('differential, played_at, number_of_holes')
          .eq('user_id', userId)
          .eq('number_of_holes', 18)
          .order('played_at', { ascending: false })
          .limit(20)
          .throwOnError()
        console.log("WAT", { rounds})
        if (rounds && rounds.length >= 3) {
          const calculatedIndex = calculateHandicapIndex(rounds)
          setHandicapIndex(calculatedIndex)
        }
      } else {
        setHandicapIndex(profileData.handicap_index)
      }
      
      // Clear timeout on success
      clearTimeout(timeoutId)
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('Error fetching profile:', err)
      
      // Check for auth errors
      if (err.message?.includes('JWT') || err.message?.includes('token') || err.code === '401') {
        console.error('Auth error in profile:', err)
        navigate('/login')
        return
      }
      
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
      <div className="min-h-screen">
        {/* Profile Header */}
        <div className="bg-slate-900/90 backdrop-blur-sm border-b border-pink-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {profile.full_name || 'Anonymous Golfer'}
                </h1>
                <div className="mt-2 flex items-center space-x-4 text-gray-400">
                  {profile.ghin_number && (
                    <span>ID: {profile.ghin_number}</span>
                  )}
                  {profile.home_course_name && (
                    <span>Home: {profile.home_course_name}</span>
                  )}
                  {(isOwnProfile || profile.display_handicap) && handicapIndex !== null && handicapIndex !== undefined && (
                    <span className="text-pink-400 font-medium">
                      Index: {handicapIndex.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {!user && (
                  <button
                    onClick={() => navigate('/profiles/public')}
                    className="px-4 py-2 bg-slate-800/80 text-white rounded-lg hover:bg-pink-900/30 border border-pink-900/30 hover:border-pink-700/50 transition-all duration-200"
                  >
                    ← Back to Profiles
                  </button>
                )}
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => navigate('/add-round')}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all duration-200 font-medium"
                    >
                      + Add Round
                    </button>
                    <button
                      onClick={() => navigate('/manage-rounds')}
                      className="px-4 py-2 bg-slate-800/80 text-white rounded-lg hover:bg-pink-900/30 border border-pink-900/30 hover:border-pink-700/50 transition-all duration-200"
                    >
                      Manage Rounds
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="px-4 py-2 bg-slate-800/80 text-white rounded-lg hover:bg-pink-900/30 border border-pink-900/30 hover:border-pink-700/50 transition-all duration-200"
                    >
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Show empty state if user is viewing their own profile and has no rounds */}
        {isOwnProfile && !hasRounds ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProfileEmptyState onEditProfile={() => navigate('/settings')} />
          </div>
        ) : (
          <>
            {/* Navigation */}
            <div className="bg-slate-900/90 backdrop-blur-sm border-b border-pink-900/30 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button and current view */}
            <div className="flex items-center justify-between lg:hidden py-3">
              <div>
                <h2 className="text-lg font-medium text-white">
                  {navigationItems.find(item => item.id === activeView)?.label}
                </h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-pink-900/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
              >
                <span className="sr-only">Open menu</span>
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile dropdown menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden pb-3">
                <div className="border-t border-pink-900/30 pt-3">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-md font-medium ${
                        activeView === item.id
                          ? 'bg-gray-700 text-emerald-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop navigation */}
            <nav className="hidden lg:flex space-x-8">
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
          </>
        )}
      </div>
    </Layout>
  )
}

export default Profile