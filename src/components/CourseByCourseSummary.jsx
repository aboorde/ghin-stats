import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { normalizeCourseData } from '../utils/dataHelpers'
import { aggregateCourseStatistics } from '../services/aggregationService'
import { calculateHoleAveragesForChart } from '../services/statisticsService'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'
import Loading from './ui/Loading'
import { CourseSelector } from './molecules'
import { CourseStatistics } from './organisms'

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
      
      <CourseSelector
        courses={courseData}
        selectedCourse={selectedCourse}
        onCourseSelect={setSelectedCourse}
        showDesktop={false}
      />

      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CourseSelector
              courses={courseData}
              selectedCourse={selectedCourse}
              onCourseSelect={setSelectedCourse}
              showMobile={false}
            />
          </div>
          
          <div className="lg:col-span-2">
            <CourseStatistics
              courseData={selectedCourseData}
              holeAverages={holeAverages}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CourseByCourseSummary