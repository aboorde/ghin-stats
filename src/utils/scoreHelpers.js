/**
 * Score helper utilities for common score-related calculations and transformations
 */

/**
 * Calculate average of an array of numbers
 * Returns null if array is empty or invalid
 * 
 * @param {number[]} numbers - Array of numbers to average
 * @returns {number|null} Average value or null
 */
export const calculateAverage = (numbers) => {
  if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
    return null
  }
  
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  return sum / numbers.length
}

/**
 * Score thresholds for different performance levels
 */
export const SCORE_THRESHOLDS = {
  18: {
    excellent: 105,
    good: 110,
    average: 115
  },
  9: {
    excellent: 52,
    good: 55,
    average: 57
  }
}

/**
 * Get performance level for a score
 */
export const getScorePerformanceLevel = (score, holes = 18) => {
  const thresholds = SCORE_THRESHOLDS[holes] || SCORE_THRESHOLDS[18]
  
  if (score < thresholds.excellent) {
    return { color: 'text-green-400 font-bold', level: 'excellent' }
  }
  if (score < thresholds.good) {
    return { color: 'text-yellow-400', level: 'good' }
  }
  if (score < thresholds.average) {
    return { color: 'text-orange-400', level: 'average' }
  }
  return { color: 'text-red-400', level: 'poor' }
}

/**
 * Get color for differential value
 */
export const getDifferentialColor = (differential) => {
  if (differential < 35.0) return 'text-green-400'
  if (differential < 38.0) return 'text-yellow-400'
  if (differential < 40.0) return 'text-orange-400'
  return 'text-red-400'
}

/**
 * Calculate score relative to par
 */
export const calculateScoreToPar = (score, holes = 18) => {
  const par = holes === 9 ? 36 : 72
  return score - par
}

/**
 * Format score to par for display
 */
export const formatScoreToPar = (score, holes = 18) => {
  const toPar = calculateScoreToPar(score, holes)
  if (toPar === 0) return 'E'
  if (toPar > 0) return `+${toPar}`
  return toPar.toString()
}

/**
 * Get performance name for score relative to par
 */
export const getPerformanceName = (scoreToPar) => {
  if (scoreToPar <= -2) return 'eagle'
  if (scoreToPar === -1) return 'birdie'
  if (scoreToPar === 0) return 'par'
  if (scoreToPar === 1) return 'bogey'
  if (scoreToPar === 2) return 'double'
  return 'triple+'
}

/**
 * Get background color class for hole score
 */
export const getHoleScoreBackgroundColor = (scoreToPar) => {
  if (scoreToPar <= -2) return 'bg-purple-600 text-white font-bold'
  if (scoreToPar === -1) return 'bg-blue-600 text-white font-bold'
  if (scoreToPar === 0) return 'bg-green-600 text-white'
  if (scoreToPar === 1) return 'bg-yellow-500 text-white'
  if (scoreToPar === 2) return 'bg-orange-500 text-white'
  return 'bg-red-600 text-white'
}

/**
 * Calculate scoring statistics from an array of scores
 */
export const calculateScoringStats = (scores) => {
  if (!scores || scores.length === 0) {
    return {
      totalRounds: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      averageDifferential: 0,
      bestDifferential: 0,
      worstDifferential: 0
    }
  }
  
  const stats = scores.reduce((acc, score) => {
    acc.totalScore += score.adjusted_gross_score || score.adjustedGrossScore || 0
    acc.totalDifferential += score.differential || 0
    acc.bestScore = Math.min(acc.bestScore, score.adjusted_gross_score || score.adjustedGrossScore || Infinity)
    acc.worstScore = Math.max(acc.worstScore, score.adjusted_gross_score || score.adjustedGrossScore || -Infinity)
    acc.bestDifferential = Math.min(acc.bestDifferential, score.differential || Infinity)
    acc.worstDifferential = Math.max(acc.worstDifferential, score.differential || -Infinity)
    return acc
  }, {
    totalScore: 0,
    totalDifferential: 0,
    bestScore: Infinity,
    worstScore: -Infinity,
    bestDifferential: Infinity,
    worstDifferential: -Infinity
  })
  
  return {
    totalRounds: scores.length,
    averageScore: (stats.totalScore / scores.length).toFixed(1),
    bestScore: stats.bestScore === Infinity ? 0 : stats.bestScore,
    worstScore: stats.worstScore === -Infinity ? 0 : stats.worstScore,
    averageDifferential: (stats.totalDifferential / scores.length).toFixed(1),
    bestDifferential: stats.bestDifferential === Infinity ? 0 : stats.bestDifferential.toFixed(1),
    worstDifferential: stats.worstDifferential === -Infinity ? 0 : stats.worstDifferential.toFixed(1)
  }
}

/**
 * Calculate standard deviation of scores
 */
export const calculateScoreStandardDeviation = (scores) => {
  if (!scores || scores.length < 2) return 0
  
  const values = scores.map(s => s.adjusted_gross_score || s.adjustedGrossScore || 0)
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  
  return Math.sqrt(variance).toFixed(1)
}

/**
 * Calculate improvement trend (negative is improvement)
 */
export const calculateImprovementTrend = (scores) => {
  if (!scores || scores.length < 2) return 0
  
  // Sort by date
  const sortedScores = [...scores].sort((a, b) => 
    new Date(a.played_at || a.playedAt) - new Date(b.played_at || b.playedAt)
  )
  
  // Compare first half average to second half average
  const midpoint = Math.floor(sortedScores.length / 2)
  const firstHalf = sortedScores.slice(0, midpoint)
  const secondHalf = sortedScores.slice(midpoint)
  
  const firstAvg = firstHalf.reduce((sum, s) => 
    sum + (s.adjusted_gross_score || s.adjustedGrossScore || 0), 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, s) => 
    sum + (s.adjusted_gross_score || s.adjustedGrossScore || 0), 0) / secondHalf.length
  
  return (secondAvg - firstAvg).toFixed(1)
}

/**
 * Group scores by performance level
 */
export const groupScoresByPerformance = (scores, holes = 18) => {
  const groups = {
    excellent: [],
    good: [],
    average: [],
    poor: []
  }
  
  scores.forEach(score => {
    const scoreValue = score.adjusted_gross_score || score.adjustedGrossScore
    const { level } = getScorePerformanceLevel(scoreValue, holes)
    groups[level].push(score)
  })
  
  return groups
}