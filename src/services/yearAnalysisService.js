/**
 * Year Analysis Service
 * 
 * Provides comprehensive year-by-year golf performance analysis.
 * Handles aggregation of rounds by year, trend analysis, and
 * formatting data for visualization components.
 */

import { Year } from '../models/Year'
import { normalizeCourseData } from '../utils/dataHelpers'

/**
 * Aggregate rounds into yearly statistics
 * @param {Array} scores - Array of score records with statistics
 * @returns {Object} Object with year as key and Year instance as value
 */
export const aggregateYearlyStatistics = (scores) => {
  if (!scores || scores.length === 0) {
    return {}
  }

  // Normalize course names first
  const normalizedScores = normalizeCourseData(scores)
  
  // Group rounds by year
  const yearGroups = {}
  
  normalizedScores.forEach(round => {
    const year = new Date(round.played_at).getFullYear()
    
    if (!yearGroups[year]) {
      yearGroups[year] = []
    }
    
    yearGroups[year].push(round)
  })
  
  // Create Year instances for each year
  const yearStats = {}
  
  Object.entries(yearGroups).forEach(([year, rounds]) => {
    yearStats[year] = Year.fromRounds(parseInt(year), rounds)
  })
  
  return yearStats
}

/**
 * Convert year statistics to array format for charts
 * @param {Object} yearStats - Object with year as key and Year instance as value
 * @returns {Array} Array of year data sorted by year
 */
export const formatYearDataForCharts = (yearStats) => {
  return Object.values(yearStats)
    .map(year => year.toJSON())
    .sort((a, b) => a.year - b.year)
}

/**
 * Calculate year-over-year improvement metrics
 * @param {Array} yearData - Array of year data from formatYearDataForCharts
 * @returns {Object} Improvement metrics and trends
 */
export const calculateYearOverYearTrends = (yearData) => {
  if (!yearData || yearData.length < 2) {
    return {
      hasImprovement: false,
      message: 'Need at least 2 years of data for trends'
    }
  }
  
  const latestYear = yearData[yearData.length - 1]
  const previousYear = yearData[yearData.length - 2]
  
  const scoreImprovement = previousYear.avgScore - latestYear.avgScore
  const differentialImprovement = previousYear.avgDifferential - latestYear.avgDifferential
  
  return {
    hasImprovement: true,
    latestYear: latestYear.year,
    previousYear: previousYear.year,
    scoreImprovement: {
      value: scoreImprovement,
      percentage: (scoreImprovement / previousYear.avgScore) * 100,
      isImproved: scoreImprovement > 0
    },
    differentialImprovement: {
      value: differentialImprovement,
      percentage: (differentialImprovement / previousYear.avgDifferential) * 100,
      isImproved: differentialImprovement > 0
    },
    roundsChange: {
      value: latestYear.rounds - previousYear.rounds,
      percentage: ((latestYear.rounds - previousYear.rounds) / previousYear.rounds) * 100
    }
  }
}

/**
 * Find best and worst performing years
 * @param {Array} yearData - Array of year data
 * @returns {Object} Best and worst year information
 */
export const findBestAndWorstYears = (yearData) => {
  if (!yearData || yearData.length === 0) {
    return { bestYear: null, worstYear: null }
  }
  
  // Sort by average score (lower is better)
  const sorted = [...yearData].sort((a, b) => a.avgScore - b.avgScore)
  
  return {
    bestYear: {
      year: sorted[0].year,
      avgScore: sorted[0].avgScore,
      rounds: sorted[0].rounds
    },
    worstYear: {
      year: sorted[sorted.length - 1].year,
      avgScore: sorted[sorted.length - 1].avgScore,
      rounds: sorted[sorted.length - 1].rounds
    }
  }
}

/**
 * Get seasonal performance analysis
 * @param {Object} yearStats - Year statistics object
 * @param {number} year - Year to analyze
 * @returns {Object} Seasonal performance data
 */
export const getSeasonalAnalysis = (yearStats, year) => {
  const yearData = yearStats[year]
  if (!yearData) {
    return null
  }
  
  const monthlyData = yearData.getMonthlyChartData()
  
  // Group by seasons
  const seasons = {
    Spring: { months: ['Mar', 'Apr', 'May'], scores: [], rounds: 0 },
    Summer: { months: ['Jun', 'Jul', 'Aug'], scores: [], rounds: 0 },
    Fall: { months: ['Sep', 'Oct', 'Nov'], scores: [], rounds: 0 },
    Winter: { months: ['Dec', 'Jan', 'Feb'], scores: [], rounds: 0 }
  }
  
  monthlyData.forEach(({ month, avgScore, rounds }) => {
    Object.entries(seasons).forEach(([season, data]) => {
      if (data.months.includes(month)) {
        data.scores.push(avgScore)
        data.rounds += rounds
      }
    })
  })
  
  // Calculate seasonal averages
  return Object.entries(seasons).map(([season, data]) => ({
    season,
    avgScore: data.scores.length > 0 
      ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length 
      : null,
    rounds: data.rounds
  })).filter(s => s.avgScore !== null)
}

/**
 * Get most played courses for a specific year
 * @param {Object} yearStats - Year statistics object
 * @param {number} year - Year to analyze
 * @param {number} limit - Maximum number of courses to return
 * @returns {Array} Top courses by round count
 */
export const getTopCoursesForYear = (yearStats, year, limit = 5) => {
  const yearData = yearStats[year]
  if (!yearData) {
    return []
  }
  
  return yearData.getCourseBreakdown().slice(0, limit)
}

/**
 * Calculate consistency metrics for each year
 * @param {Array} yearData - Array of year data
 * @returns {Array} Year data with consistency metrics added
 */
export const calculateYearlyConsistency = (yearData) => {
  return yearData.map(year => {
    // Calculate standard deviation of scores for the year
    if (!year.scores || year.scores.length < 2) {
      return { ...year, consistency: null }
    }
    
    const mean = year.avgScore
    const variance = year.scores.reduce((sum, score) => {
      return sum + Math.pow(score - mean, 2)
    }, 0) / year.scores.length
    
    const stdDev = Math.sqrt(variance)
    
    return {
      ...year,
      consistency: {
        standardDeviation: stdDev,
        coefficientOfVariation: (stdDev / mean) * 100,
        rating: getConsistencyRating(stdDev)
      }
    }
  })
}

/**
 * Get consistency rating based on standard deviation
 * @param {number} stdDev - Standard deviation of scores
 * @returns {string} Consistency rating
 */
const getConsistencyRating = (stdDev) => {
  if (stdDev < 3) return 'Very Consistent'
  if (stdDev < 5) return 'Consistent'
  if (stdDev < 7) return 'Average'
  if (stdDev < 9) return 'Inconsistent'
  return 'Very Inconsistent'
}

/**
 * Format year selection options
 * @param {Array} yearData - Array of year data
 * @returns {Array} Formatted options for select dropdown
 */
export const formatYearSelectionOptions = (yearData) => {
  return yearData.map(year => ({
    value: year.year,
    label: `${year.year} (${year.rounds} rounds)`,
    rounds: year.rounds
  }))
}

/**
 * Get complete year analysis for a specific year
 * @param {Object} yearStats - Year statistics object
 * @param {number} year - Year to analyze
 * @returns {Object} Complete analysis for the year
 */
export const getCompleteYearAnalysis = (yearStats, year) => {
  const yearData = yearStats[year]
  if (!yearData) {
    return null
  }
  
  const jsonData = yearData.toJSON()
  
  return {
    ...jsonData,
    seasonalAnalysis: getSeasonalAnalysis(yearStats, year),
    topCourses: getTopCoursesForYear(yearStats, year),
    parTypePerformance: yearData.getParTypeAverages(),
    monthlyTrend: yearData.getMonthlyChartData(),
    scoringBreakdown: yearData.getScoringDistributionData()
  }
}