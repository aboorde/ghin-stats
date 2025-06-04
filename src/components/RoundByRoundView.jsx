import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ScoreTrendChart from './ScoreTrendChart'
import Card from './ui/Card'
import StatCard from './ui/StatCard'
import PageHeader from './ui/PageHeader'
import Loading from './ui/Loading'
import { createScoresFromData } from '../models/Score'
import { calculateRoundStatistics } from '../services/statisticsService'
import { formatDate } from '../utils/dateHelpers'
import { normalizeCourseData } from '../utils/dataHelpers'

const RoundByRoundView = ({ userId }) => {
  const [rounds, setRounds] = useState([])
  const [scores, setScores] = useState([]) // Score model instances
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc')
  const [filterCourse, setFilterCourse] = useState('all')
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetchRounds()
  }, [sortOrder, filterCourse, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRounds = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('scores')
        .select(`
          *,
          statistics(
            pars_percent,
            bogeys_percent,
            double_bogeys_percent,
            triple_bogeys_or_worse_percent,
            birdies_or_better_percent,
            par3s_average,
            par4s_average,
            par5s_average
          )
        `)
        .order('played_at', { ascending: sortOrder === 'asc' })

      // Filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (filterCourse !== 'all') {
        query = query.eq('course_name', filterCourse)
      }

      const { data, error } = await query

      if (error) throw error

      // Normalize course names
      const normalizedData = normalizeCourseData(data || [])
      setRounds(normalizedData)
      
      // Create Score model instances
      const scoreInstances = createScoresFromData(normalizedData)
      setScores(scoreInstances)
      
      // Calculate statistics for 18-hole rounds
      const rounds18Hole = normalizedData.filter(r => r.number_of_holes === 18)
      const stats = calculateRoundStatistics(rounds18Hole)
      setStatistics(stats)
      
      const uniqueCourses = [...new Set(normalizedData?.map(r => r.course_name) || [])]
      setCourses(uniqueCourses)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return <Loading message="Loading rounds..." />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 text-xl">⚠️ Error: {error}</div>
      </div>
    )
  }

  // Create a map for quick score lookups
  const scoreMap = new Map(scores.map(s => [s.id, s]))
  
  // Get 18-hole and 9-hole rounds
  const rounds18Hole = scores.filter(s => s.numberOfHoles === 18)
  const rounds9Hole = scores.filter(s => s.numberOfHoles === 9)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Round by Round Performance" 
        subtitle="Track your scoring trends and detailed statistics"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Rounds"
          value={rounds.length}
          subValue={`${rounds18Hole.length} × 18-hole${rounds9Hole.length > 0 ? `, ${rounds9Hole.length} × 9-hole` : ''}`}
          color="blue"
          icon="🏌️"
        />
        <StatCard
          label="Avg Score (18)"
          value={statistics?.averageScore || 0}
          color="green"
          icon="📊"
        />
        <StatCard
          label="Best Score (18)"
          value={statistics?.bestScore || 0}
          color="purple"
          icon="🏆"
        />
        <StatCard
          label="Worst Score (18)"
          value={statistics?.worstScore || 0}
          color="gold"
          icon="📈"
        />
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">Score Trend</h3>
        <ScoreTrendChart data={rounds18Hole} />
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
            Sort Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm sm:text-base"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
            Filter by Course
          </label>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm sm:text-base"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {rounds.map((round) => {
          const stats = round.statistics?.[0] || {}
          return (
            <Card key={round.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm text-gray-400">{formatDate(round.played_at)}</div>
                  <div className="font-medium text-gray-200">{round.course_name}</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${scoreMap.get(round.id)?.getPerformanceLevel().color || ''}`}>
                    {round.adjusted_gross_score}
                  </div>
                  <div className={`text-xs ${round.number_of_holes === 9 ? 'text-blue-400' : 'text-gray-400'}`}>
                    {round.number_of_holes} holes
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Differential:</span>
                  <span className={scoreMap.get(round.id)?.getDifferentialColor() || ''}>{round.differential}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Birdies:</span>
                  <span className="text-blue-400 font-semibold">
                    {Math.round((stats.birdies_or_better_percent || 0) * round.number_of_holes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pars:</span>
                  <span className="text-green-400">
                    {Math.round((stats.pars_percent || 0) * round.number_of_holes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bogeys:</span>
                  <span className="text-yellow-400">
                    {Math.round((stats.bogeys_percent || 0) * round.number_of_holes)}
                  </span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Desktop Table View */}
      <Card className="overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Holes
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Differential
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Birdies
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Pars
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Bogeys
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Double+
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Par 3 Avg
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Par 4 Avg
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Par 5 Avg
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rounds.map((round) => {
                const stats = round.statistics?.[0] || {}
                return (
                  <tr key={round.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">
                      {formatDate(round.played_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                      {round.course_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        round.number_of_holes === 9 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {round.number_of_holes}
                      </span>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-center font-semibold ${scoreMap.get(round.id)?.getPerformanceLevel().color || ''}`}>
                      {round.adjusted_gross_score}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${scoreMap.get(round.id)?.getDifferentialColor() || ''}`}>
                      {round.differential}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-blue-400 font-semibold">
                      {Math.round((stats.birdies_or_better_percent || 0) * round.number_of_holes)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-green-400">
                      {Math.round((stats.pars_percent || 0) * round.number_of_holes)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-yellow-400">
                      {Math.round((stats.bogeys_percent || 0) * round.number_of_holes)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-red-400">
                      {Math.round(((stats.double_bogeys_percent || 0) + (stats.triple_bogeys_or_worse_percent || 0)) * round.number_of_holes)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center hidden md:table-cell">
                      {stats.par3s_average?.toFixed(1) || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center hidden md:table-cell">
                      {stats.par4s_average?.toFixed(1) || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center hidden md:table-cell">
                      {stats.par5s_average?.toFixed(1) || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default RoundByRoundView