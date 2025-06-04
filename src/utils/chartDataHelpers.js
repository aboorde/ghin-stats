import { formatDate, getMonthYearKey, getShortMonthName } from './dateHelpers'
import { getPerformanceName } from './scoreHelpers'

/**
 * Chart data helper utilities for preparing data for visualization
 */

/**
 * Prepare score trend data for line chart
 */
export const prepareScoreTrendData = (scores) => {
  return scores.map((score, index) => ({
    index: index + 1,
    date: score.played_at || score.playedAt,
    displayDate: formatDate(score.played_at || score.playedAt, 'MMM dd'),
    score: score.adjusted_gross_score || score.adjustedGrossScore,
    differential: score.differential,
    course: score.course_name || score.courseName,
    tees: score.tee_name || score.teeName
  }))
}

/**
 * Prepare hole performance data for bar chart
 */
export const prepareHolePerformanceData = (holeStats) => {
  return holeStats.map(stat => ({
    hole: stat.hole_number || stat.holeNumber,
    avgScore: parseFloat(stat.avg_score || stat.avgScore || 0),
    par: stat.par,
    diffToPar: parseFloat(stat.diff_to_par || stat.diffToPar || 0),
    rounds: stat.rounds_played || stat.roundsPlayed || 0
  }))
}

/**
 * Prepare scoring distribution data for pie chart
 */
export const prepareScoringDistributionData = (performanceCounts) => {
  const total = Object.values(performanceCounts).reduce((sum, count) => sum + count, 0)
  
  return [
    { 
      name: 'Eagles', 
      value: performanceCounts.eagles || 0,
      percentage: total > 0 ? ((performanceCounts.eagles || 0) / total * 100).toFixed(1) : '0.0',
      color: '#8b5cf6'
    },
    { 
      name: 'Birdies', 
      value: performanceCounts.birdies || 0,
      percentage: total > 0 ? ((performanceCounts.birdies || 0) / total * 100).toFixed(1) : '0.0',
      color: '#3b82f6'
    },
    { 
      name: 'Pars', 
      value: performanceCounts.pars || 0,
      percentage: total > 0 ? ((performanceCounts.pars || 0) / total * 100).toFixed(1) : '0.0',
      color: '#10b981'
    },
    { 
      name: 'Bogeys', 
      value: performanceCounts.bogeys || 0,
      percentage: total > 0 ? ((performanceCounts.bogeys || 0) / total * 100).toFixed(1) : '0.0',
      color: '#eab308'
    },
    { 
      name: 'Doubles', 
      value: performanceCounts.doubles || 0,
      percentage: total > 0 ? ((performanceCounts.doubles || 0) / total * 100).toFixed(1) : '0.0',
      color: '#f97316'
    },
    { 
      name: 'Triples+', 
      value: performanceCounts.triples || 0,
      percentage: total > 0 ? ((performanceCounts.triples || 0) / total * 100).toFixed(1) : '0.0',
      color: '#ef4444'
    }
  ].filter(item => item.value > 0) // Only show categories with data
}

/**
 * Prepare monthly trend data
 */
export const prepareMonthlyTrendData = (scores) => {
  const monthlyData = {}
  
  scores.forEach(score => {
    const monthKey = getMonthYearKey(score.played_at || score.playedAt)
    if (!monthKey) return
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        displayMonth: getShortMonthName(score.played_at || score.playedAt),
        rounds: 0,
        totalScore: 0,
        totalDifferential: 0,
        bestScore: Infinity,
        worstScore: -Infinity
      }
    }
    
    const month = monthlyData[monthKey]
    const scoreValue = score.adjusted_gross_score || score.adjustedGrossScore
    
    month.rounds++
    month.totalScore += scoreValue
    month.totalDifferential += score.differential
    month.bestScore = Math.min(month.bestScore, scoreValue)
    month.worstScore = Math.max(month.worstScore, scoreValue)
  })
  
  // Calculate averages and format
  return Object.values(monthlyData)
    .map(month => ({
      month: month.month,
      displayMonth: month.displayMonth,
      rounds: month.rounds,
      avgScore: (month.totalScore / month.rounds).toFixed(1),
      avgDifferential: (month.totalDifferential / month.rounds).toFixed(1),
      bestScore: month.bestScore === Infinity ? null : month.bestScore,
      worstScore: month.worstScore === -Infinity ? null : month.worstScore
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Prepare year comparison data
 */
export const prepareYearComparisonData = (yearlyStats) => {
  return Object.entries(yearlyStats)
    .map(([year, stats]) => ({
      year: parseInt(year),
      rounds: stats.rounds || 0,
      avgScore: parseFloat(stats.avgScore || 0),
      avgDifferential: parseFloat(stats.avgDifferential || 0),
      bestScore: stats.bestScore || 0,
      worstScore: stats.worstScore || 0,
      improvement: stats.improvement || 0
    }))
    .sort((a, b) => a.year - b.year)
}

/**
 * Prepare hole-by-hole scorecard data
 */
export const prepareScorecardData = (holes) => {
  const frontNine = []
  const backNine = []
  
  holes.forEach(hole => {
    const holeData = {
      hole: hole.hole_number || hole.holeNumber,
      par: hole.par,
      score: hole.adjusted_gross_score || hole.adjustedGrossScore,
      toPar: (hole.adjusted_gross_score || hole.adjustedGrossScore) - hole.par,
      strokeIndex: hole.stroke_allocation || hole.strokeAllocation
    }
    
    if (holeData.hole <= 9) {
      frontNine.push(holeData)
    } else {
      backNine.push(holeData)
    }
  })
  
  return { frontNine, backNine }
}

/**
 * Prepare course comparison data
 */
export const prepareCourseComparisonData = (courseStats) => {
  return courseStats
    .map(stat => ({
      course: stat.course_name || stat.courseName,
      tees: stat.tee_name || stat.teeName,
      rounds: stat.rounds || 0,
      avgScore: parseFloat(stat.avgScore || 0),
      avgDifferential: parseFloat(stat.avgDifferential || 0),
      bestScore: stat.bestScore || 0,
      rating: stat.course_rating || stat.courseRating,
      slope: stat.slope_rating || stat.slopeRating
    }))
    .sort((a, b) => b.rounds - a.rounds) // Sort by most played
}

/**
 * Prepare score frequency distribution
 */
export const prepareScoreFrequencyData = (scores, binSize = 2) => {
  const frequency = {}
  
  scores.forEach(score => {
    const scoreValue = score.adjusted_gross_score || score.adjustedGrossScore
    const bin = Math.floor(scoreValue / binSize) * binSize
    const binLabel = `${bin}-${bin + binSize - 1}`
    
    frequency[binLabel] = (frequency[binLabel] || 0) + 1
  })
  
  return Object.entries(frequency)
    .map(([range, count]) => ({
      range,
      count,
      percentage: ((count / scores.length) * 100).toFixed(1)
    }))
    .sort((a, b) => {
      const aStart = parseInt(a.range.split('-')[0])
      const bStart = parseInt(b.range.split('-')[0])
      return aStart - bStart
    })
}

/**
 * Prepare hole averages data specifically for course hole performance chart
 * Matches the exact format expected by HolePerformanceChart component
 * 
 * @param {Array} holeAverages - Array of hole average calculations
 * @returns {Array} Formatted data for HolePerformanceChart
 */
export const prepareCourseHolePerformanceData = (holeAverages) => {
  return holeAverages.map(hole => ({
    hole: hole.hole,
    par: hole.par,
    avgScore: parseFloat(hole.avgScore.toFixed(2)),
    overUnderPar: parseFloat(hole.overUnderPar.toFixed(2)),
    roundsPlayed: hole.roundsPlayed || hole.totalRounds || 0,
    // Include any additional metrics if available
    distribution: hole.distribution || null,
    difficulty: hole.difficulty || null
  }))
}

/**
 * Calculate performance color for hole based on strokes over par
 * Used for consistent coloring across hole performance visualizations
 * 
 * @param {number} overUnderPar - Strokes over/under par
 * @returns {string} Hex color code
 */
export const getHolePerformanceColor = (overUnderPar) => {
  const diff = parseFloat(overUnderPar)
  if (diff <= 0.5) return '#10b981' // Green for good performance
  if (diff <= 1.0) return '#fbbf24' // Yellow for average
  if (diff <= 1.5) return '#f59e0b' // Orange for poor
  return '#ef4444' // Red for very poor
}

/**
 * Custom tooltip content for charts
 */
export const createCustomTooltip = (props) => {
  const { active, payload, label } = props
  
  if (!active || !payload || !payload.length) {
    return null
  }
  
  return `
    <div class="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
      <p class="text-gray-300 text-sm font-medium">${label}</p>
      ${payload.map(entry => `
        <p class="text-sm" style="color: ${entry.color}">
          ${entry.name}: ${entry.value}
        </p>
      `).join('')}
    </div>
  `
}

/**
 * Prepare year trend data for multi-line chart
 * Shows average score and best score trends over years
 * 
 * @param {Array} yearData - Array of year statistics
 * @returns {Array} Formatted data for line chart
 */
export const prepareYearTrendData = (yearData) => {
  return yearData.map(year => ({
    year: year.year,
    avgScore: parseFloat(year.avgScore?.toFixed(1) || 0),
    bestScore: year.bestScore || null,
    worstScore: year.worstScore || null,
    rounds: year.rounds,
    avgDifferential: parseFloat(year.avgDifferential?.toFixed(1) || 0)
  }))
}

/**
 * Prepare monthly performance data for bar chart
 * Formats monthly data for a specific year
 * 
 * @param {Array} monthlyData - Monthly data from Year model
 * @returns {Array} Formatted data for bar chart
 */
export const prepareMonthlyPerformanceData = (monthlyData) => {
  if (!monthlyData || monthlyData.length === 0) return []
  
  return monthlyData.map(month => ({
    month: month.month,
    avgScore: parseFloat(month.avgScore?.toFixed(1) || 0),
    rounds: month.rounds
  }))
}

/**
 * Prepare seasonal performance data
 * Groups monthly data into seasons
 * 
 * @param {Array} seasonalData - Seasonal analysis data
 * @returns {Array} Formatted data for seasonal chart
 */
export const prepareSeasonalData = (seasonalData) => {
  const seasonColors = {
    Spring: '#10b981',
    Summer: '#fbbf24',
    Fall: '#f97316',
    Winter: '#3b82f6'
  }
  
  return seasonalData.map(season => ({
    season: season.season,
    avgScore: parseFloat(season.avgScore?.toFixed(1) || 0),
    rounds: season.rounds,
    color: seasonColors[season.season] || '#8b5cf6'
  }))
}

/**
 * Prepare scoring distribution for pie chart
 * Specific to year analysis with custom colors
 * 
 * @param {Array} distributionData - Scoring distribution from Year model
 * @returns {Array} Formatted data for pie chart
 */
export const prepareYearScoringDistribution = (distributionData) => {
  return distributionData.map(item => ({
    name: item.name,
    value: item.value,
    color: item.color,
    percentage: item.percentage || 
      (distributionData.reduce((sum, d) => sum + d.value, 0) > 0 
        ? ((item.value / distributionData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)
        : '0.0')
  }))
}

/**
 * Prepare course breakdown data for year
 * Formats course play frequency for horizontal bar chart
 * 
 * @param {Array} courseData - Course breakdown from Year model
 * @returns {Array} Formatted data for bar chart
 */
export const prepareCourseBreakdownData = (courseData) => {
  return courseData.map((course, index) => ({
    course: course.course,
    rounds: course.rounds,
    // Add color gradient based on frequency
    color: index === 0 ? '#10b981' : // Most played
           index === 1 ? '#3b82f6' : 
           index === 2 ? '#8b5cf6' : '#6b7280'
  }))
}

/**
 * Prepare par type performance comparison
 * Formats par 3/4/5 averages for display
 * 
 * @param {Object} parTypeData - Par type averages
 * @returns {Array} Formatted data for display cards
 */
export const prepareParTypeComparison = (parTypeData) => {
  return [
    {
      type: 'Par 3',
      average: parseFloat(parTypeData.avgPar3?.toFixed(2) || 0),
      overPar: parseFloat((parTypeData.avgPar3 - 3).toFixed(2) || 0),
      color: getParPerformanceColor(parTypeData.avgPar3 - 3)
    },
    {
      type: 'Par 4',
      average: parseFloat(parTypeData.avgPar4?.toFixed(2) || 0),
      overPar: parseFloat((parTypeData.avgPar4 - 4).toFixed(2) || 0),
      color: getParPerformanceColor(parTypeData.avgPar4 - 4)
    },
    {
      type: 'Par 5',
      average: parseFloat(parTypeData.avgPar5?.toFixed(2) || 0),
      overPar: parseFloat((parTypeData.avgPar5 - 5).toFixed(2) || 0),
      color: getParPerformanceColor(parTypeData.avgPar5 - 5)
    }
  ]
}

/**
 * Get color based on strokes over par for par type
 * 
 * @param {number} overPar - Strokes over par
 * @returns {string} Color class name
 */
const getParPerformanceColor = (overPar) => {
  if (overPar <= 0.5) return 'text-green-400'
  if (overPar <= 1.0) return 'text-yellow-400'
  if (overPar <= 1.5) return 'text-orange-400'
  return 'text-red-400'
}

/**
 * Calculate year-over-year improvement display
 * Formats improvement metrics for display
 * 
 * @param {Object} trends - Year over year trends
 * @returns {Object} Formatted improvement data
 */
export const formatYearImprovement = (trends) => {
  if (!trends.hasImprovement) {
    return { message: trends.message }
  }
  
  return {
    scoreImprovement: {
      value: trends.scoreImprovement.value > 0 ? 
        `-${trends.scoreImprovement.value.toFixed(1)}` : 
        `+${Math.abs(trends.scoreImprovement.value).toFixed(1)}`,
      isImproved: trends.scoreImprovement.isImproved,
      percentage: Math.abs(trends.scoreImprovement.percentage).toFixed(1)
    },
    roundsChange: {
      value: trends.roundsChange.value > 0 ? 
        `+${trends.roundsChange.value}` : 
        `${trends.roundsChange.value}`,
      percentage: Math.abs(trends.roundsChange.percentage).toFixed(1)
    }
  }
}