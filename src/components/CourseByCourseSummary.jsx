import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import HolePerformanceChart from './HolePerformanceChart'
import { normalizeCourseData } from '../utils/dataHelpers'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'
import Loading from './ui/Loading'

const CourseByCourseSummary = () => {
  const [courseData, setCourseData] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [holeAverages, setHoleAverages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCourseData()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchHoleAverages(selectedCourse)
    }
  }, [selectedCourse])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
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

      if (error) throw error

      // Normalize course names
      const normalizedData = normalizeCourseData(data || [])

      const courseStats = {}
      normalizedData?.forEach(round => {
        const course = round.course_name
        if (!courseStats[course]) {
          courseStats[course] = {
            name: course,
            rating: round.course_rating,
            slope: round.slope_rating,
            rounds18: 0,
            rounds9: 0,
            totalScore18: 0,
            totalScore9: 0,
            bestScore18: Infinity,
            worstScore18: -Infinity,
            bestScore9: Infinity,
            worstScore9: -Infinity,
            scores18: [],
            scores9: [],
            differentials18: [],
            differentials9: [],
            par3Avg: [],
            par4Avg: [],
            par5Avg: [],
            parPercent: [],
            bogeyPercent: [],
            doublePlusPercent: []
          }
        }
        
        const stat = courseStats[course]
        
        if (round.number_of_holes === 18) {
          stat.rounds18++
          stat.totalScore18 += round.adjusted_gross_score
          stat.bestScore18 = Math.min(stat.bestScore18, round.adjusted_gross_score)
          stat.worstScore18 = Math.max(stat.worstScore18, round.adjusted_gross_score)
          stat.scores18.push(round.adjusted_gross_score)
          stat.differentials18.push(round.differential)
        } else if (round.number_of_holes === 9) {
          stat.rounds9++
          stat.totalScore9 += round.adjusted_gross_score
          stat.bestScore9 = Math.min(stat.bestScore9, round.adjusted_gross_score)
          stat.worstScore9 = Math.max(stat.worstScore9, round.adjusted_gross_score)
          stat.scores9.push(round.adjusted_gross_score)
          stat.differentials9.push(round.differential)
        }
        
        // Only include statistics for 18-hole rounds
        if (round.number_of_holes === 18 && round.statistics?.[0]) {
          const stats = round.statistics[0]
          if (stats.par3s_average) stat.par3Avg.push(stats.par3s_average)
          if (stats.par4s_average) stat.par4Avg.push(stats.par4s_average)
          if (stats.par5s_average) stat.par5Avg.push(stats.par5s_average)
          if (stats.pars_percent !== null) stat.parPercent.push(stats.pars_percent)
          if (stats.bogeys_percent !== null) stat.bogeyPercent.push(stats.bogeys_percent)
          if (stats.double_bogeys_percent !== null && stats.triple_bogeys_or_worse_percent !== null) {
            stat.doublePlusPercent.push(stats.double_bogeys_percent + stats.triple_bogeys_or_worse_percent)
          }
        }
      })

      const courseArray = Object.values(courseStats).map(course => ({
        ...course,
        totalRounds: course.rounds18 + course.rounds9,
        avgScore18: course.rounds18 > 0 ? course.totalScore18 / course.rounds18 : 0,
        avgScore9: course.rounds9 > 0 ? course.totalScore9 / course.rounds9 : 0,
        avgDifferential18: course.differentials18.length > 0 ? course.differentials18.reduce((a, b) => a + b, 0) / course.differentials18.length : 0,
        avgDifferential9: course.differentials9.length > 0 ? course.differentials9.reduce((a, b) => a + b, 0) / course.differentials9.length : 0,
        avgPar3: course.par3Avg.length > 0 ? course.par3Avg.reduce((a, b) => a + b, 0) / course.par3Avg.length : 0,
        avgPar4: course.par4Avg.length > 0 ? course.par4Avg.reduce((a, b) => a + b, 0) / course.par4Avg.length : 0,
        avgPar5: course.par5Avg.length > 0 ? course.par5Avg.reduce((a, b) => a + b, 0) / course.par5Avg.length : 0,
        avgParPercent: course.parPercent.length > 0 ? course.parPercent.reduce((a, b) => a + b, 0) / course.parPercent.length : 0,
        avgBogeyPercent: course.bogeyPercent.length > 0 ? course.bogeyPercent.reduce((a, b) => a + b, 0) / course.bogeyPercent.length : 0,
        avgDoublePlusPercent: course.doublePlusPercent.length > 0 ? course.doublePlusPercent.reduce((a, b) => a + b, 0) / course.doublePlusPercent.length : 0,
        bestScore18: course.bestScore18 === Infinity ? '-' : course.bestScore18,
        worstScore18: course.worstScore18 === -Infinity ? '-' : course.worstScore18,
        bestScore9: course.bestScore9 === Infinity ? '-' : course.bestScore9,
        worstScore9: course.worstScore9 === -Infinity ? '-' : course.worstScore9
      })).sort((a, b) => b.totalRounds - a.totalRounds)

      setCourseData(courseArray)
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
      // Only fetch hole averages for 18-hole rounds
      const { data: scoreData, error: scoreError } = await supabase
        .from('scores')
        .select('id')
        .eq('course_name', courseName)
        .eq('number_of_holes', 18)

      if (scoreError) throw scoreError

      const scoreIds = scoreData.map(s => s.id)
      
      const { data: holeData, error: holeError } = await supabase
        .from('hole_details')
        .select('hole_number, par, adjusted_gross_score')
        .in('score_id', scoreIds)

      if (holeError) throw holeError

      const holeStats = {}
      holeData.forEach(hole => {
        if (!holeStats[hole.hole_number]) {
          holeStats[hole.hole_number] = {
            hole: hole.hole_number,
            par: hole.par,
            scores: []
          }
        }
        holeStats[hole.hole_number].scores.push(hole.adjusted_gross_score)
      })

      const averages = Object.values(holeStats)
        .map(hole => ({
          ...hole,
          avgScore: hole.scores.reduce((a, b) => a + b, 0) / hole.scores.length,
          overUnderPar: (hole.scores.reduce((a, b) => a + b, 0) / hole.scores.length) - hole.par
        }))
        .sort((a, b) => a.hole - b.hole)

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

                {selectedCourseData.rounds18 > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-gray-300">Par Type Performance (18-hole rounds)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400">Par 3 Average</div>
                      <div className="text-xl font-bold text-gray-200">{selectedCourseData.avgPar3.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        +{(selectedCourseData.avgPar3 - 3).toFixed(2)} vs par
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400">Par 4 Average</div>
                      <div className="text-xl font-bold text-gray-200">{selectedCourseData.avgPar4.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        +{(selectedCourseData.avgPar4 - 4).toFixed(2)} vs par
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400">Par 5 Average</div>
                      <div className="text-xl font-bold text-gray-200">{selectedCourseData.avgPar5.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        +{(selectedCourseData.avgPar5 - 5).toFixed(2)} vs par
                      </div>
                    </div>
                    </div>
                  </div>
                )}

                {selectedCourseData.rounds18 > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-gray-300">Scoring Distribution (18-hole rounds)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-green-900/30 p-3 rounded-lg border border-green-600/30">
                      <div className="text-sm text-gray-400">Pars</div>
                      <div className="text-xl font-bold text-green-400">
                        {(selectedCourseData.avgParPercent * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-600/30">
                      <div className="text-sm text-gray-400">Bogeys</div>
                      <div className="text-xl font-bold text-yellow-400">
                        {(selectedCourseData.avgBogeyPercent * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-red-900/30 p-3 rounded-lg border border-red-600/30">
                      <div className="text-sm text-gray-400">Double+</div>
                      <div className="text-xl font-bold text-red-400">
                        {(selectedCourseData.avgDoublePlusPercent * 100).toFixed(1)}%
                      </div>
                    </div>
                    </div>
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