import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import HolePerformanceChart from './HolePerformanceChart'
import { normalizeCourseData } from '../utils/dataHelpers'
import { aggregateCourseStatistics } from '../services/aggregationService'
import { calculateHoleAveragesForChart } from '../services/statisticsService'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'
import Loading from './ui/Loading'

/**
 * CourseByCourseSummary Component
 * 
 * Displays aggregated performance statistics grouped by golf course.
 * Uses the Course model and aggregation services to provide:
 * - Course-level statistics (rounds, averages, best/worst)
 * - Par type performance (par 3/4/5 averages)
 * - Scoring distribution (pars, bogeys, etc.)
 * - Hole-by-hole performance chart
 * 
 * Data Flow:
 * 1. Fetches scores with statistics from Supabase
 * 2. Aggregates data using Course model via aggregationService
 * 3. Calculates hole averages using statisticsService
 * 4. Displays data with responsive UI components
 * 
 * @param {string} userId - Filter data for specific user
 */
const CourseByCourseSummary = ({ userId }) => {
  const [courseData, setCourseData] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [holeAverages, setHoleAverages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCourseData()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedCourse) {
      fetchHoleAverages(selectedCourse)
    }
  }, [selectedCourse])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      
      // Build query with proper statistics selection
      let query = supabase
        .from('scores')
        .select(`
          course_name,
          course_rating,
          slope_rating,
          adjusted_gross_score,
          differential,
          number_of_holes,
          statistics(
            par3s_average,
            par4s_average,
            par5s_average,
            pars_percent,
            bogeys_percent,
            double_bogeys_percent,
            triple_bogeys_or_worse_percent
          )
        `)

      // Filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      // Normalize course names for consistency
      const normalizedData = normalizeCourseData(data || [])

      // Use our aggregation service to create Course model instances
      const courses = aggregateCourseStatistics(normalizedData)
      
      // Convert Course models to plain objects for state
      // The Course model's toJSON method provides all calculated values
      const courseArray = courses.map(course => course.toJSON())

      setCourseData(courseArray)
      
      // Select the first course (most played) by default
      if (courseArray.length > 0) {
        setSelectedCourse(courseArray[0].name)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchHoleAverages = async (courseName) => {
    try {
      // Fetch score IDs for 18-hole rounds at this course
      let query = supabase
        .from('scores')
        .select('id')
        .eq('course_name', courseName)
        .eq('number_of_holes', 18) // Only analyze complete rounds

      // Filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: scoreData, error: scoreError } = await query

      if (scoreError) throw scoreError

      // Exit early if no rounds found
      if (!scoreData || scoreData.length === 0) {
        setHoleAverages([])
        return
      }

      const scoreIds = scoreData.map(s => s.id)
      
      // Fetch hole details for these rounds
      const { data: holeData, error: holeError } = await supabase
        .from('hole_details')
        .select('hole_number, par, adjusted_gross_score')
        .in('score_id', scoreIds)

      if (holeError) throw holeError

      // Use our statistics service to calculate hole averages
      // This returns data in the exact format needed for the chart
      const averages = calculateHoleAveragesForChart(holeData)

      setHoleAverages(averages)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 bg-red-900/20 border border-red-600/30 rounded-lg p-4 inline-block">
          Error: {error}
        </div>
      </div>
    )
  }

  const selectedCourseData = courseData.find(c => c.name === selectedCourse)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Course by Course Summary"
        subtitle="Performance statistics by golf course"
      />
      
      {/* Mobile Course Selector */}
      <div className="block lg:hidden mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
        >
          {courseData.map(course => (
            <option key={course.name} value={course.name}>
              {course.name} ({course.totalRounds} rounds)
            </option>
          ))}
        </select>
      </div>

      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="hidden lg:block lg:col-span-1">
            <h3 className="font-semibold mb-3 text-gray-300">All Courses</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courseData.map(course => (
                <button
                  key={course.name}
                  onClick={() => setSelectedCourse(course.name)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    selectedCourse === course.name
                      ? 'bg-gradient-to-r from-green-900/40 to-yellow-900/40 border-green-600/50 border-2'
                      : 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700'
                  }`}
                >
                  <div className="font-medium text-gray-200">{course.name}</div>
                  <div className="text-sm text-gray-400">
                    {course.totalRounds} rounds total
                  </div>
                  <div className="text-xs text-gray-500">
                    18-hole: {course.rounds18} ({course.avgScore18 ? course.avgScore18.toFixed(1) : '-'})
                    {course.rounds9 > 0 && ` • 9-hole: ${course.rounds9} (${course.avgScore9.toFixed(1)})`}
                  </div>
                  <div className="text-xs text-gray-500">
                    Rating: {course.rating} / Slope: {course.slope}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {selectedCourseData && (
              <>
                <h3 className="font-semibold mb-3 text-gray-300">{selectedCourseData.name} Details</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-600/30">
                    <div className="text-xs text-gray-400">Total Rounds</div>
                    <div className="text-2xl font-bold text-blue-400">{selectedCourseData.totalRounds}</div>
                    <div className="text-xs text-gray-500">
                      {selectedCourseData.rounds18} × 18-hole
                      {selectedCourseData.rounds9 > 0 && `, ${selectedCourseData.rounds9} × 9-hole`}
                    </div>
                  </div>
                  <div className="bg-green-900/30 p-3 rounded-lg border border-green-600/30">
                    <div className="text-xs text-gray-400">Avg Score (18)</div>
                    <div className="text-2xl font-bold text-green-400">
                      {selectedCourseData.avgScore18 ? selectedCourseData.avgScore18.toFixed(1) : '-'}
                    </div>
                    {selectedCourseData.rounds9 > 0 && (
                      <div className="text-xs text-gray-500">
                        9-hole: {selectedCourseData.avgScore9.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-600/30">
                    <div className="text-xs text-gray-400">Best Score</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {selectedCourseData.bestScore18}
                    </div>
                    {selectedCourseData.rounds9 > 0 && selectedCourseData.bestScore9 !== '-' && (
                      <div className="text-xs text-gray-500">
                        9-hole: {selectedCourseData.bestScore9}
                      </div>
                    )}
                  </div>
                  <div className="bg-orange-900/30 p-3 rounded-lg border border-orange-600/30">
                    <div className="text-xs text-gray-400">Worst Score</div>
                    <div className="text-2xl font-bold text-orange-400">
                      {selectedCourseData.worstScore18}
                    </div>
                    {selectedCourseData.rounds9 > 0 && selectedCourseData.worstScore9 !== '-' && (
                      <div className="text-xs text-gray-500">
                        9-hole: {selectedCourseData.worstScore9}
                      </div>
                    )}
                  </div>
                </div>

                {selectedCourseData.rounds18 > 0 && selectedCourseData.avgPar3 > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-gray-300">Par Type Performance (18-hole rounds)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400">Par 3 Average</div>
                      <div className="text-xl font-bold text-gray-200">{selectedCourseData.avgPar3.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        +{selectedCourseData.par3VsPar.toFixed(2)} vs par
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400">Par 4 Average</div>
                      <div className="text-xl font-bold text-gray-200">{selectedCourseData.avgPar4.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        +{selectedCourseData.par4VsPar.toFixed(2)} vs par
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400">Par 5 Average</div>
                      <div className="text-xl font-bold text-gray-200">{selectedCourseData.avgPar5.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        +{selectedCourseData.par5VsPar.toFixed(2)} vs par
                      </div>
                    </div>
                    </div>
                  </div>
                )}

                {selectedCourseData.rounds18 > 0 && (selectedCourseData.parPercent > 0 || selectedCourseData.bogeyPercent > 0 || selectedCourseData.doublePlusPercent > 0) && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-gray-300">Scoring Distribution (18-hole rounds)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-green-900/30 p-3 rounded-lg border border-green-600/30">
                      <div className="text-sm text-gray-400">Pars</div>
                      <div className="text-xl font-bold text-green-400">
                        {(selectedCourseData.parPercent * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-600/30">
                      <div className="text-sm text-gray-400">Bogeys</div>
                      <div className="text-xl font-bold text-yellow-400">
                        {(selectedCourseData.bogeyPercent * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-red-900/30 p-3 rounded-lg border border-red-600/30">
                      <div className="text-sm text-gray-400">Double+</div>
                      <div className="text-xl font-bold text-red-400">
                        {(selectedCourseData.doublePlusPercent * 100).toFixed(1)}%
                      </div>
                    </div>
                    </div>
                  </div>
                )}

                {selectedCourseData.rounds18 > 0 && selectedCourseData.avgPar3 === 0 && (
                  <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 text-center">
                      Detailed statistics not available for this course. 
                      <br />
                      <span className="text-xs">Only total score was entered for these rounds.</span>
                    </p>
                  </div>
                )}

                {holeAverages.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-gray-300">Hole by Hole Performance</h4>
                    <HolePerformanceChart data={holeAverages} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CourseByCourseSummary