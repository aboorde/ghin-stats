import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'
import { normalizeCourseData } from '../utils/dataHelpers'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'
import Loading from './ui/Loading'
import { chartTheme } from '../utils/theme'

const YearByYearAnalysis = () => {
  const [yearData, setYearData] = useState([])
  const [detailedData, setDetailedData] = useState({})
  const [selectedYear, setSelectedYear] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchYearData()
  }, [])

  const fetchYearData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('scores')
        .select(`
          played_at,
          adjusted_gross_score,
          differential,
          course_name,
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
        .eq('number_of_holes', 18)
        .order('played_at', { ascending: true })

      if (error) throw error

      // Normalize course names
      const normalizedData = normalizeCourseData(data || [])

      const yearStats = {}
      normalizedData?.forEach(round => {
        const year = new Date(round.played_at).getFullYear()
        if (!yearStats[year]) {
          yearStats[year] = {
            year,
            rounds: 0,
            scores: [],
            differentials: [],
            monthlyScores: {},
            courseBreakdown: {},
            par3Avg: [],
            par4Avg: [],
            par5Avg: [],
            scoringDistribution: {
              pars: 0,
              bogeys: 0,
              doublePlus: 0
            }
          }
        }
        
        const stat = yearStats[year]
        const month = new Date(round.played_at).getMonth()
        
        stat.rounds++
        stat.scores.push(round.adjusted_gross_score)
        stat.differentials.push(round.differential)
        
        if (!stat.monthlyScores[month]) {
          stat.monthlyScores[month] = []
        }
        stat.monthlyScores[month].push(round.adjusted_gross_score)
        
        if (!stat.courseBreakdown[round.course_name]) {
          stat.courseBreakdown[round.course_name] = 0
        }
        stat.courseBreakdown[round.course_name]++
        
        if (round.statistics?.[0]) {
          const stats = round.statistics[0]
          if (stats.par3s_average) stat.par3Avg.push(stats.par3s_average)
          if (stats.par4s_average) stat.par4Avg.push(stats.par4s_average)
          if (stats.par5s_average) stat.par5Avg.push(stats.par5s_average)
          
          stat.scoringDistribution.pars += Math.round((stats.pars_percent || 0) * 18)
          stat.scoringDistribution.bogeys += Math.round((stats.bogeys_percent || 0) * 18)
          stat.scoringDistribution.doublePlus += Math.round(
            ((stats.double_bogeys_percent || 0) + (stats.triple_bogeys_or_worse_percent || 0)) * 18
          )
        }
      })

      const yearArray = Object.values(yearStats).map(year => ({
        ...year,
        avgScore: year.scores.reduce((a, b) => a + b, 0) / year.scores.length,
        bestScore: Math.min(...year.scores),
        worstScore: Math.max(...year.scores),
        avgDifferential: year.differentials.reduce((a, b) => a + b, 0) / year.differentials.length,
        avgPar3: year.par3Avg.length > 0 ? year.par3Avg.reduce((a, b) => a + b, 0) / year.par3Avg.length : 0,
        avgPar4: year.par4Avg.length > 0 ? year.par4Avg.reduce((a, b) => a + b, 0) / year.par4Avg.length : 0,
        avgPar5: year.par5Avg.length > 0 ? year.par5Avg.reduce((a, b) => a + b, 0) / year.par5Avg.length : 0,
        monthlyData: Object.entries(year.monthlyScores).map(([month, scores]) => ({
          month: new Date(2000, parseInt(month)).toLocaleString('default', { month: 'short' }),
          avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
          rounds: scores.length
        })).sort((a, b) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          return months.indexOf(a.month) - months.indexOf(b.month)
        })
      })).sort((a, b) => a.year - b.year)

      setYearData(yearArray)
      setDetailedData(yearStats)
      if (yearArray.length > 0) {
        setSelectedYear(yearArray[yearArray.length - 1].year)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  const selectedYearData = yearData.find(y => y.year === selectedYear)
  
  const scoringDistData = selectedYearData ? [
    { name: 'Pars', value: selectedYearData.scoringDistribution.pars, color: '#10b981' },
    { name: 'Bogeys', value: selectedYearData.scoringDistribution.bogeys, color: '#f59e0b' },
    { name: 'Double+', value: selectedYearData.scoringDistribution.doublePlus, color: '#ef4444' }
  ] : []

  const courseData = selectedYearData ? Object.entries(selectedYearData.courseBreakdown)
    .map(([course, rounds]) => ({ course, rounds }))
    .sort((a, b) => b.rounds - a.rounds) : []

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Year by Year Analysis"
        subtitle="Historical performance trends and statistics"
      />
      
      <Card>
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-300">Yearly Performance Trend</h3>
          <div className="h-64 sm:h-80 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis 
                dataKey="year" 
                tick={{ fill: chartTheme.textColor }}
                stroke={chartTheme.gridColor}
              />
              <YAxis 
                domain={[95, 115]}
                ticks={[95, 100, 105, 110, 115]}
                tick={{ fill: chartTheme.textColor }}
                stroke={chartTheme.gridColor}
              />
              <Tooltip 
                contentStyle={chartTheme.tooltipStyle}
                itemStyle={{ color: chartTheme.textColor }}
              />
              <Legend 
                wrapperStyle={{ color: chartTheme.textColor }}
              />
              <Line 
                type="monotone" 
                dataKey="avgScore" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Average Score"
                dot={{ r: 6, fill: '#10b981' }}
              />
              <Line 
                type="monotone" 
                dataKey="bestScore" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Best Score"
                dot={{ r: 6, fill: '#8b5cf6' }}
              />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Select Year for Detailed Analysis
          </label>
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-600"
          >
            {yearData.map(year => (
              <option key={year.year} value={year.year} className="bg-gray-800">
                {year.year} ({year.rounds} rounds)
              </option>
            ))}
          </select>
        </div>

        {selectedYearData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-600/30 transition-all duration-200 hover:bg-blue-900/40">
                <div className="text-sm text-gray-400">Rounds Played</div>
                <div className="text-3xl font-bold text-blue-400">{selectedYearData.rounds}</div>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg border border-green-600/30 transition-all duration-200 hover:bg-green-900/40">
                <div className="text-sm text-gray-400">Average Score</div>
                <div className="text-3xl font-bold text-green-400">
                  {selectedYearData.avgScore.toFixed(1)}
                </div>
              </div>
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-600/30 transition-all duration-200 hover:bg-purple-900/40">
                <div className="text-sm text-gray-400">Best Score</div>
                <div className="text-3xl font-bold text-purple-400">{selectedYearData.bestScore}</div>
              </div>
              <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-600/30 transition-all duration-200 hover:bg-orange-900/40">
                <div className="text-sm text-gray-400">Worst Score</div>
                <div className="text-3xl font-bold text-orange-400">{selectedYearData.worstScore}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium mb-3 text-gray-300">Monthly Performance</h4>
                <div className="h-48 sm:h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedYearData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: chartTheme.textColor }}
                      stroke={chartTheme.gridColor}
                    />
                    <YAxis 
                      domain={[100, 120]} 
                      tick={{ fill: chartTheme.textColor }}
                      stroke={chartTheme.gridColor}
                    />
                    <Tooltip 
                      contentStyle={chartTheme.tooltipStyle}
                      itemStyle={{ color: chartTheme.textColor }}
                    />
                      <Bar dataKey="avgScore" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-gray-300">Scoring Distribution</h4>
                <div className="h-48 sm:h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                      data={scoringDistData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scoringDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={chartTheme.tooltipStyle}
                      itemStyle={{ color: chartTheme.textColor }}
                    />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-gray-300">Par Type Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 transition-all duration-200">
                    <span className="font-medium text-gray-400">Par 3 Average</span>
                    <span className="text-lg font-bold text-gray-200">{selectedYearData.avgPar3.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 transition-all duration-200">
                    <span className="font-medium text-gray-400">Par 4 Average</span>
                    <span className="text-lg font-bold text-gray-200">{selectedYearData.avgPar4.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 transition-all duration-200">
                    <span className="font-medium text-gray-400">Par 5 Average</span>
                    <span className="text-lg font-bold text-gray-200">{selectedYearData.avgPar5.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-gray-300">Courses Played</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {courseData.map(({ course, rounds }) => (
                    <div key={course} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 transition-all duration-200">
                      <span className="font-medium text-sm text-gray-400">{course}</span>
                      <span className="text-lg font-bold text-gray-200">{rounds}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default YearByYearAnalysis