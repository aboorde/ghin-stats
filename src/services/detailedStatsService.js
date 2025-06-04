/**
 * Detailed Statistics Service
 * 
 * Provides comprehensive statistical analysis for golf performance
 * Includes score distribution, trends, consistency, and par type analysis
 * 
 * @module services/detailedStatsService
 */

import { calculateAverage, calculateScoreStandardDeviation } from '../utils/scoreHelpers'
import { sortByDateDesc } from '../utils/dateHelpers'

/**
 * Calculate detailed statistics for a set of golf rounds
 * Provides comprehensive analysis including distribution, trends, and performance metrics
 * 
 * @param {Array} scores - Array of score objects with statistics
 * @returns {Object} Detailed statistics object
 */
export const calculateDetailedStatistics = (scores) => {
  if (!scores || scores.length === 0) {
    return getEmptyDetailedStatistics()
  }

  // Calculate score distribution
  const scoreDistribution = calculateScoreDistribution(scores)
  
  // Calculate improvement metrics
  const improvementMetrics = calculateRecentImprovement(scores)
  
  // Calculate consistency (standard deviation)
  const consistency = calculateScoreStandardDeviation(scores)
  
  // Calculate par type performance
  const parTypeStats = calculateDetailedParTypePerformance(scores)
  
  return {
    scoreDistribution,
    ...improvementMetrics,
    consistency,
    ...parTypeStats,
    totalRounds: scores.length
  }
}

/**
 * Calculate score distribution across predefined ranges
 * Uses ranges suitable for lower handicap players
 * 
 * @param {Array} scores - Array of score objects
 * @returns {Object} Score distribution with counts and percentages
 */
export const calculateScoreDistribution = (scores) => {
  const ranges = {
    'under90': { label: '< 90', count: 0, min: 0, max: 89 },
    'range90to94': { label: '90-94', count: 0, min: 90, max: 94 },
    'range95to99': { label: '95-99', count: 0, min: 95, max: 99 },
    'over100': { label: '100+', count: 0, min: 100, max: Infinity }
  }
  
  // Count scores in each range
  scores.forEach(score => {
    const scoreValue = score.adjusted_gross_score || score.adjustedGrossScore
    
    if (scoreValue < 90) ranges.under90.count++
    else if (scoreValue <= 94) ranges.range90to94.count++
    else if (scoreValue <= 99) ranges.range95to99.count++
    else ranges.over100.count++
  })
  
  // Calculate percentages
  const total = scores.length
  Object.values(ranges).forEach(range => {
    range.percentage = total > 0 ? ((range.count / total) * 100).toFixed(1) : '0.0'
  })
  
  return ranges
}

/**
 * Calculate improvement by comparing recent rounds to older rounds
 * Compares most recent 10 rounds to oldest 10 rounds
 * 
 * @param {Array} scores - Array of score objects sorted by date
 * @returns {Object} Improvement metrics
 */
export const calculateRecentImprovement = (scores) => {
  if (scores.length < 10) {
    return {
      recentAverage: calculateAverage(scores.map(s => s.adjusted_gross_score || s.adjustedGrossScore)) || 0,
      olderAverage: null,
      improvement: null,
      improvementDirection: 'insufficient-data'
    }
  }
  
  // Sort by date (newest first)
  const sortedScores = sortByDateDesc(scores)
  
  // Get recent 10 and older 10 rounds
  const recentScores = sortedScores.slice(0, 10)
  const olderScores = sortedScores.slice(-10)
  
  // Calculate averages
  const recentValues = recentScores.map(s => s.adjusted_gross_score || s.adjustedGrossScore)
  const olderValues = olderScores.map(s => s.adjusted_gross_score || s.adjustedGrossScore)
  
  const recentAvg = calculateAverage(recentValues) || 0
  const olderAvg = calculateAverage(olderValues) || 0
  
  // Calculate improvement (negative is better in golf)
  const improvement = olderAvg - recentAvg
  
  return {
    recentAverage: recentAvg.toFixed(1),
    olderAverage: olderAvg.toFixed(1),
    improvement: improvement.toFixed(1),
    improvementDirection: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable',
    recentRounds: recentScores.length,
    comparisonRounds: olderScores.length
  }
}

/**
 * Calculate detailed par type performance statistics
 * Includes averages and performance vs par for each type
 * 
 * @param {Array} scores - Array of score objects with statistics
 * @returns {Object} Par type performance metrics
 */
export const calculateDetailedParTypePerformance = (scores) => {
  // Filter scores that have statistics
  const scoresWithStats = scores.filter(s => s.statistics && s.statistics[0])
  
  if (scoresWithStats.length === 0) {
    return {
      par3Average: null,
      par4Average: null,
      par5Average: null,
      par3VsPar: null,
      par4VsPar: null,
      par5VsPar: null,
      hasParTypeData: false
    }
  }
  
  // Extract par averages from statistics
  const par3Values = []
  const par4Values = []
  const par5Values = []
  
  scoresWithStats.forEach(score => {
    const stats = score.statistics[0]
    if (stats.par3s_average !== null && stats.par3s_average !== undefined) {
      par3Values.push(stats.par3s_average)
    }
    if (stats.par4s_average !== null && stats.par4s_average !== undefined) {
      par4Values.push(stats.par4s_average)
    }
    if (stats.par5s_average !== null && stats.par5s_average !== undefined) {
      par5Values.push(stats.par5s_average)
    }
  })
  
  // Calculate averages
  const par3Avg = calculateAverage(par3Values)
  const par4Avg = calculateAverage(par4Values)
  const par5Avg = calculateAverage(par5Values)
  
  return {
    par3Average: par3Avg ? par3Avg.toFixed(2) : null,
    par4Average: par4Avg ? par4Avg.toFixed(2) : null,
    par5Average: par5Avg ? par5Avg.toFixed(2) : null,
    par3VsPar: par3Avg ? (par3Avg - 3).toFixed(2) : null,
    par4VsPar: par4Avg ? (par4Avg - 4).toFixed(2) : null,
    par5VsPar: par5Avg ? (par5Avg - 5).toFixed(2) : null,
    hasParTypeData: true
  }
}

/**
 * Get consistency rating based on standard deviation
 * Lower standard deviation indicates more consistent play
 * 
 * @param {number} stdDev - Standard deviation value
 * @returns {Object} Consistency rating and description
 */
export const getConsistencyRating = (stdDev) => {
  const std = parseFloat(stdDev)
  
  if (std < 3) {
    return { rating: 'excellent', description: 'Very Consistent', color: 'text-green-400' }
  }
  if (std < 5) {
    return { rating: 'good', description: 'Consistent', color: 'text-blue-400' }
  }
  if (std < 7) {
    return { rating: 'average', description: 'Average Consistency', color: 'text-yellow-400' }
  }
  if (std < 9) {
    return { rating: 'below-average', description: 'Inconsistent', color: 'text-orange-400' }
  }
  
  return { rating: 'poor', description: 'Very Inconsistent', color: 'text-red-400' }
}

/**
 * Format detailed statistics for display
 * Ensures all values are properly formatted with appropriate precision
 * 
 * @param {Object} stats - Raw statistics object
 * @returns {Object} Formatted statistics
 */
export const formatDetailedStatistics = (stats) => {
  return {
    scoreDistribution: Object.entries(stats.scoreDistribution).map(([key, data]) => ({
      range: data.label,
      count: data.count,
      percentage: parseFloat(data.percentage),
      displayPercentage: `${data.percentage}%`
    })),
    improvement: {
      value: stats.improvement,
      display: stats.improvement !== null 
        ? `${stats.improvement > 0 ? '-' : '+'}${Math.abs(stats.improvement)} strokes`
        : 'N/A',
      isImproving: stats.improvementDirection === 'improving'
    },
    recentAverage: stats.recentAverage,
    consistency: {
      value: stats.consistency,
      display: `±${stats.consistency}`,
      rating: getConsistencyRating(stats.consistency)
    },
    parTypePerformance: {
      par3: {
        average: stats.par3Average,
        vsPar: stats.par3VsPar,
        display: stats.par3Average || 'N/A'
      },
      par4: {
        average: stats.par4Average,
        vsPar: stats.par4VsPar,
        display: stats.par4Average || 'N/A'
      },
      par5: {
        average: stats.par5Average,
        vsPar: stats.par5VsPar,
        display: stats.par5Average || 'N/A'
      }
    }
  }
}

/**
 * Get empty detailed statistics object
 * Used when no data is available
 * 
 * @returns {Object} Empty statistics structure
 */
const getEmptyDetailedStatistics = () => ({
  scoreDistribution: {
    under90: { label: '< 90', count: 0, percentage: '0.0' },
    range90to94: { label: '90-94', count: 0, percentage: '0.0' },
    range95to99: { label: '95-99', count: 0, percentage: '0.0' },
    over100: { label: '100+', count: 0, percentage: '0.0' }
  },
  recentAverage: '0.0',
  olderAverage: null,
  improvement: null,
  improvementDirection: 'no-data',
  consistency: '0.0',
  par3Average: null,
  par4Average: null,
  par5Average: null,
  par3VsPar: null,
  par4VsPar: null,
  par5VsPar: null,
  hasParTypeData: false,
  totalRounds: 0
})