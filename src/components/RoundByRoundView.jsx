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
import { countScoreTypes } from '../utils/scoringUtils'

const RoundByRoundView = ({ userId }) => {
  const [rounds, setRounds] = useState([])
  const [scores, setScores] = useState([]) // Score model instances
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tableSortField, setTableSortField] = useState('played_at')
  const [tableSortOrder, setTableSortOrder] = useState('desc')
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterScoreRange, setFilterScoreRange] = useState('all')
  const [courses, setCourses] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  useEffect(() => {
    fetchRounds()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterCourse, filterScoreRange, tableSortField, tableSortOrder])

  const fetchRounds = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('rounds')
        .select(`
          *,
          round_statistics(
            par3s_average,
            par4s_average,
            par5s_average
          ),
          hole_details(
            adjusted_gross_score,
            par
          )
        `)
        .order('played_at', { ascending: true }) // Always fetch in chronological order

      // Filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId)
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

  // Filter and sort data for the table
  const getFilteredAndSortedRounds = () => {
    let filtered = [...rounds]
    
    // Apply course filter
    if (filterCourse !== 'all') {
      filtered = filtered.filter(r => r.course_name === filterCourse)
    }
    
    // Apply score range filter
    if (filterScoreRange !== 'all') {
      filtered = filtered.filter(r => {
        const score = r.adjusted_gross_score
        switch (filterScoreRange) {
          case 'under100': return score < 100
          case '100-109': return score >= 100 && score <= 109
          case '110-119': return score >= 110 && score <= 119
          case 'over120': return score >= 120
          default: return true
        }
      })
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (tableSortField) {
        case 'played_at':
          aVal = new Date(a.played_at)
          bVal = new Date(b.played_at)
          break
        case 'adjusted_gross_score':
          aVal = a.adjusted_gross_score
          bVal = b.adjusted_gross_score
          break
        case 'differential':
          aVal = a.differential
          bVal = b.differential
          break
        case 'course_name':
          aVal = a.course_name
          bVal = b.course_name
          break
        default:
          aVal = a[tableSortField]
          bVal = b[tableSortField]
      }
      
      if (tableSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
    
    return filtered
  }

  const toggleSort = (field) => {
    if (tableSortField === field) {
      setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setTableSortField(field)
      setTableSortOrder('desc')
    }
  }

  // Pagination logic
  const getPaginatedRounds = () => {
    const filteredRounds = getFilteredAndSortedRounds()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredRounds.slice(startIndex, endIndex)
  }

  const totalPages = Math.max(1, Math.ceil(getFilteredAndSortedRounds().length / itemsPerPage))

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll to top of table
    document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(Number(newItemsPerPage))
    setCurrentPage(1)
  }

  // Generate page numbers for pagination controls
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)
      
      if (currentPage <= 2) {
        endPage = Math.min(4, totalPages - 1)
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3)
      }
      
      if (startPage > 2) pages.push('...')
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      if (endPage < totalPages - 1) pages.push('...')
      
      pages.push(totalPages)
    }
    
    return pages
  }


  if (loading) {
    return <Loading message="Loading rounds..." />
  }

  if (error) {
    return (
      <Card variant="elevated" className="text-center py-12 mx-auto max-w-md">
        <div className="text-red-400 text-xl font-semibold mb-2">⚠️ Error Loading Rounds</div>
        <div className="text-pink-300/60">{error}</div>
      </Card>
    )
  }

  // Create a map for quick score lookups
  const scoreMap = new Map(scores.map(s => [s.id, s]))
  
  // Get 18-hole and 9-hole rounds
  const rounds18Hole = scores.filter(s => s.numberOfHoles === 18)
  const rounds9Hole = scores.filter(s => s.numberOfHoles === 9)

  return (
    <>
      <style>{`
        /* Custom option styling for dark theme */
        option {
          background-color: #020617;
          color: #f1f5f9;
          padding: 0.5rem;
        }
        option:hover {
          background-color: #1e293b;
        }
        /* Smooth animations for all transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      <div className="space-y-6 animate-fadeIn">
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

      <Card variant="elevated" className="p-6 mb-6 bg-gradient-to-br from-slate-900/95 to-pink-950/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Score Trend</h3>
          <span className="text-xs text-pink-300/50 font-medium uppercase tracking-wider">18-Hole Rounds Only</span>
        </div>
        <ScoreTrendChart data={rounds18Hole} />
      </Card>

      <Card variant="elevated" className="p-6 mb-6 bg-gradient-to-br from-slate-900/95 to-pink-950/10 border-pink-900/40">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Table Filters & Sorting</h3>
          <div className="text-right">
            <span className="text-sm text-pink-400/60 font-medium">
              Showing {Math.min(itemsPerPage * currentPage, getFilteredAndSortedRounds().length)} of {getFilteredAndSortedRounds().length} filtered rounds
            </span>
            {getFilteredAndSortedRounds().length !== rounds.length && (
              <span className="block text-xs text-pink-300/40 mt-1">
                ({rounds.length} total)
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
              Filter by Course
            </label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 text-sm hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_1rem_center] bg-no-repeat pr-10"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
              Filter by Score Range
            </label>
            <select
              value={filterScoreRange}
              onChange={(e) => setFilterScoreRange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 text-sm hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_1rem_center] bg-no-repeat pr-10"
            >
              <option value="all">All Scores</option>
              <option value="under100">Under 100</option>
              <option value="100-109">100 - 109</option>
              <option value="110-119">110 - 119</option>
              <option value="over120">120+</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-pink-300/70 mb-2 uppercase tracking-wider">
              Sort By
            </label>
            <select
              value={`${tableSortField}-${tableSortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setTableSortField(field)
                setTableSortOrder(order)
              }}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 text-sm hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_1rem_center] bg-no-repeat pr-10"
            >
              <option value="played_at-desc">Date (Newest First)</option>
              <option value="played_at-asc">Date (Oldest First)</option>
              <option value="adjusted_gross_score-asc">Score (Low to High)</option>
              <option value="adjusted_gross_score-desc">Score (High to Low)</option>
              <option value="differential-asc">Differential (Low to High)</option>
              <option value="differential-desc">Differential (High to Low)</option>
              <option value="course_name-asc">Course (A-Z)</option>
              <option value="course_name-desc">Course (Z-A)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {getPaginatedRounds().map((round) => {
          const scoreCounts = round.hole_details ? countScoreTypes(round.hole_details) : {}
          return (
            <Card key={round.id} variant="elevated" className="p-5 hover:shadow-pink-500/20 transition-all duration-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm text-pink-400/60 font-medium">{formatDate(round.played_at)}</div>
                  <div className="font-semibold text-slate-100">{round.course_name}</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${scoreMap.get(round.id)?.getPerformanceLevel().color || ''}`}>
                    {round.adjusted_gross_score}
                  </div>
                  <div className={`text-xs font-medium ${round.number_of_holes === 9 ? 'text-blue-400' : 'text-pink-300/60'}`}>
                    {round.number_of_holes} holes
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-pink-300/60">Differential:</span>
                  <span className={scoreMap.get(round.id)?.getDifferentialColor() || ''}>{round.differential}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pink-300/60">Birdies:</span>
                  <span className="text-blue-400 font-semibold">
                    {(scoreCounts.eagles || 0) + (scoreCounts.birdies || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pink-300/60">Pars:</span>
                  <span className="text-green-400">
                    {scoreCounts.pars || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pink-300/60">Bogeys:</span>
                  <span className="text-yellow-400">
                    {scoreCounts.bogeys || 0}
                  </span>
                </div>
              </div>
            </Card>
          )
        })}
        
        {/* Mobile Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-slate-900/80 text-pink-300 border border-pink-900/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-900/30 hover:border-pink-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => page !== '...' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                      page === currentPage
                        ? 'bg-gradient-to-br from-pink-500 to-pink-700 text-white shadow-lg shadow-pink-500/25'
                        : page === '...'
                        ? 'text-pink-300/50 cursor-default'
                        : 'bg-slate-900/80 text-pink-300 border border-pink-900/30 hover:bg-pink-900/30 hover:border-pink-700/50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-slate-900/80 text-pink-300 border border-pink-900/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-900/30 hover:border-pink-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-xs text-pink-300/70 font-medium uppercase tracking-wider">Per Page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="px-3 py-1.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_0.5rem_center] bg-no-repeat pr-8"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <Card variant="elevated" className="overflow-hidden hidden md:block p-0 bg-gradient-to-br from-slate-900/95 to-pink-950/10 table-container">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-pink-900/20">
            <thead className="bg-slate-950/60 backdrop-blur-sm">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-pink-300/70 uppercase tracking-wider cursor-pointer hover:text-pink-400 transition-all duration-200"
                  onClick={() => toggleSort('played_at')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {tableSortField === 'played_at' && (
                      <span className="text-pink-500">
                        {tableSortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-pink-300/70 uppercase tracking-wider cursor-pointer hover:text-pink-400 transition-all duration-200"
                  onClick={() => toggleSort('course_name')}
                >
                  <div className="flex items-center gap-1">
                    Course
                    {tableSortField === 'course_name' && (
                      <span className="text-pink-500">
                        {tableSortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-pink-300/70 uppercase tracking-wider">
                  Holes
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-medium text-pink-300/70 uppercase tracking-wider cursor-pointer hover:text-pink-400 transition-all duration-200"
                  onClick={() => toggleSort('adjusted_gross_score')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Score
                    {tableSortField === 'adjusted_gross_score' && (
                      <span className="text-pink-500">
                        {tableSortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-medium text-pink-300/70 uppercase tracking-wider cursor-pointer hover:text-pink-400 transition-all duration-200"
                  onClick={() => toggleSort('differential')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Differential
                    {tableSortField === 'differential' && (
                      <span className="text-pink-500">
                        {tableSortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-pink-300/70 uppercase tracking-wider">
                  Birdies
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-pink-300/70 uppercase tracking-wider">
                  Pars
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-pink-300/70 uppercase tracking-wider">
                  Bogeys
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-pink-300/70 uppercase tracking-wider">
                  Double+
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-pink-300/70 uppercase tracking-wider hidden md:table-cell">
                  Par 3 Avg
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-pink-300/70 uppercase tracking-wider hidden md:table-cell">
                  Par 4 Avg
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-pink-300/70 uppercase tracking-wider hidden md:table-cell">
                  Par 5 Avg
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-900/10">
              {getPaginatedRounds().map((round) => {
                const stats = round.round_statistics?.[0] || {}
                const scoreCounts = round.hole_details ? countScoreTypes(round.hole_details) : {}
                return (
                  <tr key={round.id} className="hover:bg-pink-900/10 transition-all duration-200 backdrop-blur-sm">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-100">
                      {formatDate(round.played_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-pink-300/70">
                      {round.course_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        round.number_of_holes === 9 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-pink-300/60 border border-pink-900/20'
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
                      {(scoreCounts.eagles || 0) + (scoreCounts.birdies || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-green-400">
                      {scoreCounts.pars || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-yellow-400">
                      {scoreCounts.bogeys || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-red-400">
                      {scoreCounts.doublePlus || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center hidden md:table-cell">
                      {stats.par3s_average ? parseFloat(stats.par3s_average).toFixed(1) : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center hidden md:table-cell">
                      {stats.par4s_average ? parseFloat(stats.par4s_average).toFixed(1) : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center hidden md:table-cell">
                      {stats.par5s_average ? parseFloat(stats.par5s_average).toFixed(1) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Desktop Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-950/60 backdrop-blur-sm border-t border-pink-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-pink-300/70 font-medium">Per Page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950/80 border border-pink-900/30 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:border-pink-700/50 backdrop-blur-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNDEgMEw2IDQuNThMMTAuNTkgMEwxMiAxLjQxTDYgNy40MUwwIDEuNDFMMC41OSAwTDEuNDEgMFoiIGZpbGw9IiNmNDcyYjYiLz48L3N2Zz4=')] bg-[position:right_0.5rem_center] bg-no-repeat pr-8"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-slate-900/80 text-pink-300 border border-pink-900/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-900/30 hover:border-pink-700/50 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => page !== '...' && handlePageChange(page)}
                      disabled={page === '...'}
                      className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                        page === currentPage
                          ? 'bg-gradient-to-br from-pink-500 to-pink-700 text-white shadow-lg shadow-pink-500/25'
                          : page === '...'
                          ? 'text-pink-300/50 cursor-default'
                          : 'bg-slate-900/80 text-pink-300 border border-pink-900/30 hover:bg-pink-900/30 hover:border-pink-700/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-slate-900/80 text-pink-300 border border-pink-900/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-900/30 hover:border-pink-700/50 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-pink-300/60">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
        )}
      </Card>
      </div>
    </>
  )
}

export default RoundByRoundView