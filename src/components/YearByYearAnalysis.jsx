import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'
import { 
  aggregateYearlyStatistics, 
  formatYearDataForCharts,
  formatYearSelectionOptions,
  getCompleteYearAnalysis
} from '../services/yearAnalysisService'
import {
  prepareYearTrendData,
  prepareMonthlyPerformanceData,
  prepareYearScoringDistribution,
  prepareCourseBreakdownData,
  prepareParTypeComparison
} from '../utils/chartDataHelpers'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'
import Loading from './ui/Loading'
import { MonthlyPerformanceChart } from './molecules'
import { chartTheme } from '../utils/theme'

const YearByYearAnalysis = ({ userId }) => {
  const [yearStats, setYearStats] = useState({})
  const [selectedYear, setSelectedYear] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchYearData()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchYearData = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('rounds')
        .select(`
          played_at,
          adjusted_gross_score,
          differential,
          course_name,
          number_of_holes,
          round_statistics(
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

      // Filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      // Use service to aggregate year statistics
      const aggregatedYearStats = aggregateYearlyStatistics(data || [])
      console.log(" aggregatedYearStats", {aggregatedYearStats})
      setYearStats(aggregatedYearStats)
      
      // Set most recent year as selected by default
      const yearData = formatYearDataForCharts(aggregatedYearStats)
      if (yearData.length > 0) {
        setSelectedYear(yearData[yearData.length - 1].year)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Memoized calculations for chart data
  const yearData = useMemo(() => 
    formatYearDataForCharts(yearStats), 
    [yearStats]
  )
  
  const yearChartData = useMemo(() => 
    prepareYearTrendData(yearData), 
    [yearData]
  )
  
  const yearOptions = useMemo(() => 
    formatYearSelectionOptions(yearData), 
    [yearData]
  )
  
  // Get complete analysis for selected year
  const selectedYearAnalysis = useMemo(() => 
    selectedYear ? getCompleteYearAnalysis(yearStats, selectedYear) : null,
    [yearStats, selectedYear]
  )
  
  // Prepare chart data for selected year
  const monthlyChartData = useMemo(() => 
    selectedYearAnalysis ? prepareMonthlyPerformanceData(selectedYearAnalysis.monthlyData) : [],
    [selectedYearAnalysis]
  )
  
  const scoringDistData = useMemo(() => 
    selectedYearAnalysis ? prepareYearScoringDistribution(selectedYearAnalysis.scoringBreakdown) : [],
    [selectedYearAnalysis]
  )
  
  const courseData = useMemo(() => 
    selectedYearAnalysis ? prepareCourseBreakdownData(selectedYearAnalysis.topCourses) : [],
    [selectedYearAnalysis]
  )
  
  const parTypeComparison = useMemo(() => 
    selectedYearAnalysis ? prepareParTypeComparison(selectedYearAnalysis.parTypePerformance) : [],
    [selectedYearAnalysis]
  )

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
              <LineChart data={yearChartData}>
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
            {yearOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {selectedYearAnalysis && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-600/30 transition-all duration-200 hover:bg-blue-900/40">
                <div className="text-sm text-gray-400">Rounds Played</div>
                <div className="text-3xl font-bold text-blue-400">{selectedYearAnalysis.rounds}</div>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg border border-green-600/30 transition-all duration-200 hover:bg-green-900/40">
                <div className="text-sm text-gray-400">Average Score</div>
                <div className="text-3xl font-bold text-green-400">
                  {selectedYearAnalysis.avgScore?.toFixed(1) || '-'}
                </div>
              </div>
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-600/30 transition-all duration-200 hover:bg-purple-900/40">
                <div className="text-sm text-gray-400">Best Score</div>
                <div className="text-3xl font-bold text-purple-400">{selectedYearAnalysis.bestScore || '-'}</div>
              </div>
              <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-600/30 transition-all duration-200 hover:bg-orange-900/40">
                <div className="text-sm text-gray-400">Worst Score</div>
                <div className="text-3xl font-bold text-orange-400">{selectedYearAnalysis.worstScore || '-'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium mb-3 text-gray-300">Monthly Performance</h4>
                <MonthlyPerformanceChart 
                  monthlyData={monthlyChartData}
                  yearAverage={selectedYearAnalysis.avgScore}
                />
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
                  {parTypeComparison.map(parType => (
                    <div key={parType.type} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 transition-all duration-200">
                      <span className="font-medium text-gray-400">{parType.type} Average</span>
                      <span className={`text-lg font-bold ${parType.color}`}>{parType.average.toFixed(2)}</span>
                    </div>
                  ))}
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