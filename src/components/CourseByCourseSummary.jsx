import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Course, createCoursesFromGroupedData } from '../models/Course'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'
import Loading from './ui/Loading'
import { 
  LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts'

/**
 * CourseByCourseSummary Component
 * 
 * A comprehensive course analysis dashboard that provides actionable insights
 * to help golfers identify strengths, weaknesses, and improvement opportunities.
 * 
 * DATA SOURCES (from DATABASE_STRUCTURE.md):
 * - rounds: course_name, adjusted_gross_score, differential, played_at, number_of_holes
 * - round_statistics: par3s_average, par4s_average, par5s_average, scoring percentages
 * - hole_details: hole_number, par, adjusted_gross_score for hole-by-hole analysis
 * 
 * @param {string} userId - Filter data for specific user
 */
const CourseByCourseSummary = ({ userId }) => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseDetails, setCourseDetails] = useState(null)
  const [holeDetails, setHoleDetails] = useState([])
  const [improvementData, setImprovementData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch rounds with statistics
      let query = supabase
        .from('rounds')
        .select(`
          *,
          round_statistics(*)
        `)
        .order('played_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: rounds, error } = await query

      if (error) throw error

      // Group by course
      const courseGroups = {}
      rounds.forEach(round => {
        if (!courseGroups[round.course_name]) {
          courseGroups[round.course_name] = []
        }
        courseGroups[round.course_name].push(round)
      })

      // Create Course models
      const courseModels = createCoursesFromGroupedData(courseGroups)
      const courseData = courseModels.map(course => course.toJSON())
      
      setCourses(courseData)
      
      // Select most played course by default
      if (courseData.length > 0) {
        setSelectedCourse(courseData[0])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const getDifficultyLevel = (overUnder) => {
    if (overUnder < 0) return 'birdie'
    if (overUnder < 0.5) return 'easy'
    if (overUnder < 1) return 'moderate'
    if (overUnder < 1.5) return 'difficult'
    return 'very-difficult'
  }

  const calculateHolePerformance = useCallback((holes) => {
    const holeStats = {}
    
    holes.forEach(hole => {
      if (!holeStats[hole.hole_number]) {
        holeStats[hole.hole_number] = {
          par: hole.par,
          scores: []
        }
      }
      holeStats[hole.hole_number].scores.push(hole.adjusted_gross_score)
    })

    return Object.entries(holeStats).map(([holeNum, data]) => {
      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      const overUnder = avgScore - data.par
      
      return {
        hole: parseInt(holeNum),
        par: data.par,
        avgScore: Math.round(avgScore * 100) / 100,
        overUnder: Math.round(overUnder * 100) / 100,
        difficulty: getDifficultyLevel(overUnder),
        rounds: data.scores.length
      }
    }).sort((a, b) => a.hole - b.hole)
  }, [])

  const fetchCourseDetails = useCallback(async (course) => {
    try {
      // Get detailed round and hole data for selected course
      let roundQuery = supabase
        .from('rounds')
        .select('id, played_at, adjusted_gross_score, differential')
        .eq('course_name', course.name)
        .eq('number_of_holes', 18)
        .order('played_at', { ascending: true })

      if (userId) {
        roundQuery = roundQuery.eq('user_id', userId)
      }

      const { data: roundData, error: roundError } = await roundQuery
      if (roundError) throw roundError

      // Calculate improvement trend
      if (roundData && roundData.length > 0) {
        const trend = calculateImprovementTrend(roundData)
        setImprovementData(trend)

        // Fetch hole details
        const roundIds = roundData.map(r => r.id)
        const { data: holes, error: holeError } = await supabase
          .from('hole_details')
          .select('hole_number, par, adjusted_gross_score, round_id')
          .in('round_id', roundIds)

        if (holeError) throw holeError

        const holeAverages = calculateHolePerformance(holes)
        setHoleDetails(holeAverages)
      }

      setCourseDetails(course)
    } catch (err) {
      console.error('Error fetching course details:', err)
    }
  }, [userId, calculateHolePerformance])

  useEffect(() => {
    fetchCourseData()
  }, [fetchCourseData])

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseDetails(selectedCourse)
    }
  }, [selectedCourse, fetchCourseDetails])

  const calculateImprovementTrend = (rounds) => {
    // Group by month and calculate averages
    const monthlyData = {}
    
    rounds.forEach(round => {
      const month = new Date(round.played_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          scores: [],
          differentials: []
        }
      }
      
      monthlyData[month].scores.push(round.adjusted_gross_score)
      monthlyData[month].differentials.push(round.differential)
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10,
      avgDifferential: Math.round(data.differentials.reduce((a, b) => a + b, 0) / data.differentials.length * 10) / 10,
      rounds: data.scores.length
    }))
  }

  const getDifficultyColor = (level) => {
    const colors = {
      'birdie': '#10b981',
      'easy': '#34d399',
      'moderate': '#fbbf24',
      'difficult': '#f87171',
      'very-difficult': '#dc2626'
    }
    return colors[level] || '#6b7280'
  }

  if (loading) return <Loading />
  if (error) return <div className="text-red-400">Error: {error}</div>

  // Prepare data for visualizations
  const parPerformanceData = courseDetails ? [
    { type: 'Par 3', score: courseDetails.avgPar3, par: 3, difference: courseDetails.par3VsPar },
    { type: 'Par 4', score: courseDetails.avgPar4, par: 4, difference: courseDetails.par4VsPar },
    { type: 'Par 5', score: courseDetails.avgPar5, par: 5, difference: courseDetails.par5VsPar }
  ] : []

  const scoringDistributionData = courseDetails ? [
    { name: 'Birdie+', value: courseDetails.birdiePercent, color: '#10b981' },
    { name: 'Par', value: courseDetails.parPercent, color: '#3b82f6' },
    { name: 'Bogey', value: courseDetails.bogeyPercent, color: '#f59e0b' },
    { name: 'Double+', value: courseDetails.doublePlusPercent, color: '#ef4444' }
  ] : []

  const radarData = courseDetails ? [
    { metric: 'Scoring', value: Math.max(0, 100 - ((courseDetails.avgScore18 - courseDetails.rating) * 2)), fullMark: 100 },
    { metric: 'Par 3s', value: Math.max(0, 100 - (courseDetails.par3VsPar * 25)), fullMark: 100 },
    { metric: 'Par 4s', value: Math.max(0, 100 - (courseDetails.par4VsPar * 25)), fullMark: 100 },
    { metric: 'Par 5s', value: Math.max(0, 100 - (courseDetails.par5VsPar * 25)), fullMark: 100 },
    { metric: 'Consistency', value: courseDetails.bestScore18 !== '-' ? Math.max(0, 100 - (courseDetails.worstScore18 - courseDetails.bestScore18)) : 50, fullMark: 100 }
  ] : []

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Course Mastery Dashboard"
        subtitle="Comprehensive analysis to unlock your potential"
      />

      {/* Course Selector */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Select Course</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {courses.map((course) => (
            <button
              key={course.name}
              onClick={() => setSelectedCourse(course)}
              className={`p-3 rounded-lg border transition-all ${
                selectedCourse?.name === course.name
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <div className="font-medium truncate">{course.name}</div>
              <div className="text-sm text-gray-400">{course.totalRounds} rounds</div>
            </button>
          ))}
        </div>
      </Card>

      {courseDetails && (
        <>
          {/* Course Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="text-sm text-gray-400 mb-1">Course Difficulty Index</div>
              <div className="text-3xl font-bold text-white">
                {Math.round((courseDetails.rating * 113) / courseDetails.slope * 10) / 10}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Rating: {courseDetails.rating} / Slope: {courseDetails.slope}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-gray-400 mb-1">Your Performance</div>
              <div className="text-3xl font-bold text-white">
                {courseDetails.avgScore18 ? courseDetails.avgScore18.toFixed(1) : '-'}
              </div>
              <div className={`text-sm mt-1 ${
                courseDetails.avgScore18 - courseDetails.rating < 10 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                +{courseDetails.avgScore18 ? (courseDetails.avgScore18 - courseDetails.rating).toFixed(1) : '-'} vs Rating
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-gray-400 mb-1">Best Score</div>
              <div className="text-3xl font-bold text-green-400">
                {courseDetails.bestScore18}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Worst: {courseDetails.worstScore18}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-gray-400 mb-1">Scoring Average</div>
              <div className="text-3xl font-bold text-white">
                {courseDetails.avgDifferential18 ? courseDetails.avgDifferential18.toFixed(1) : '-'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Differential</div>
            </Card>
          </div>

          {/* Performance Trend */}
          {improvementData.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Performance Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={improvementData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgScore" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#scoreGradient)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgDifferential" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Hole-by-Hole Heatmap */}
          {holeDetails.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Hole Difficulty Heatmap</h3>
              <div className="grid grid-cols-9 gap-2">
                {holeDetails.map((hole) => (
                  <div
                    key={hole.hole}
                    className="relative group cursor-pointer"
                  >
                    <div
                      className="aspect-square rounded-lg flex items-center justify-center text-white font-semibold transition-transform hover:scale-110"
                      style={{ backgroundColor: getDifficultyColor(hole.difficulty) }}
                    >
                      {hole.hole}
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div>Hole {hole.hole} (Par {hole.par})</div>
                      <div>Avg: {hole.avgScore.toFixed(1)}</div>
                      <div>{hole.overUnder > 0 ? '+' : ''}{hole.overUnder.toFixed(1)} vs Par</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                  <span className="text-gray-400">Under Par</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
                  <span className="text-gray-400">Near Par</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                  <span className="text-gray-400">Over Par</span>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Par Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Par Type Mastery</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={parPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="type" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" />
                  <Bar dataKey="par" fill="#6b7280" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Scoring Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Scoring Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scoringDistributionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#e5e7eb' }}
                    formatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Bar dataKey="value">
                    {scoringDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Skills Radar */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Performance Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                <Radar 
                  name="Performance" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Strategic Insights */}
          <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Strategic Insights</h3>
            <div className="space-y-4">
              {courseDetails.par3VsPar > 0.5 && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-200">Focus on Par 3 Accuracy</div>
                    <div className="text-sm text-gray-400">
                      You're averaging {courseDetails.avgPar3.toFixed(1)} on par 3s (+{courseDetails.par3VsPar.toFixed(1)}). 
                      Practice mid-iron accuracy and club selection to save {Math.round(courseDetails.par3VsPar * 4)} strokes per round.
                    </div>
                  </div>
                </div>
              )}
              
              {courseDetails.doublePlusPercent > 15 && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-200">Minimize Big Numbers</div>
                    <div className="text-sm text-gray-400">
                      {courseDetails.doublePlusPercent.toFixed(1)}% of your holes result in double bogey or worse. 
                      Focus on course management to eliminate blow-up holes.
                    </div>
                  </div>
                </div>
              )}

              {courseDetails.birdiePercent < 5 && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-200">Create More Birdie Opportunities</div>
                    <div className="text-sm text-gray-400">
                      Only {courseDetails.birdiePercent.toFixed(1)}% birdie rate. Work on approach shots inside 150 yards 
                      to create more scoring chances.
                    </div>
                  </div>
                </div>
              )}

              {holeDetails.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-200">Target Specific Holes</div>
                    <div className="text-sm text-gray-400">
                      Holes {holeDetails.filter(h => h.difficulty === 'very-difficult').map(h => h.hole).join(', ')} are your biggest challenges. 
                      Develop a conservative strategy for these holes.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default CourseByCourseSummary