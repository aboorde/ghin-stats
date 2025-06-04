import { calculateScoringStats, calculateScoreStandardDeviation, calculateImprovementTrend } from '../utils/scoreHelpers'
import { groupByMonthYear, groupByYear } from '../utils/dateHelpers'

/**
 * Statistics service for complex statistical calculations and aggregations
 */

/**
 * Calculate comprehensive statistics for a set of rounds
 */
export const calculateRoundStatistics = (scores) => {
  if (!scores || scores.length === 0) {
    return getEmptyStatistics()
  }

  // Basic scoring stats
  const basicStats = calculateScoringStats(scores)
  
  // Additional calculations
  const standardDeviation = calculateScoreStandardDeviation(scores)
  const improvementTrend = calculateImprovementTrend(scores)
  
  // Count rounds by score ranges
  const scoreRanges = {
    under105: scores.filter(s => (s.adjusted_gross_score || s.adjustedGrossScore) < 105).length,
    range105to109: scores.filter(s => {
      const score = s.adjusted_gross_score || s.adjustedGrossScore
      return score >= 105 && score < 110
    }).length,
    range110to114: scores.filter(s => {
      const score = s.adjusted_gross_score || s.adjustedGrossScore
      return score >= 110 && score < 115
    }).length,
    over115: scores.filter(s => (s.adjusted_gross_score || s.adjustedGrossScore) >= 115).length
  }
  
  return {
    ...basicStats,
    standardDeviation,
    improvementTrend,
    scoreRanges,
    consistency: calculateConsistencyRating(standardDeviation)
  }
}

/**
 * Calculate statistics by time period
 */
export const calculateTimeBasedStatistics = (scores, period = 'month') => {
  const grouped = period === 'month' ? groupByMonthYear(scores) : groupByYear(scores)
  const statistics = {}
  
  Object.entries(grouped).forEach(([key, periodScores]) => {
    statistics[key] = calculateRoundStatistics(periodScores)
  })
  
  return statistics
}

/**
 * Calculate course-specific statistics
 */
export const calculateCourseStatistics = (scores) => {
  const courseStats = {}
  
  scores.forEach(score => {
    const courseName = score.course_name || score.courseName
    const teeName = score.tee_name || score.teeName
    const key = `${courseName} - ${teeName}`
    
    if (!courseStats[key]) {
      courseStats[key] = {
        courseName,
        teeName,
        scores: [],
        courseRating: score.course_rating || score.courseRating,
        slopeRating: score.slope_rating || score.slopeRating
      }
    }
    
    courseStats[key].scores.push(score)
  })
  
  // Calculate stats for each course
  const results = []
  Object.entries(courseStats).forEach(([key, data]) => {
    const stats = calculateRoundStatistics(data.scores)
    results.push({
      course: data.courseName,
      tees: data.teeName,
      courseRating: data.courseRating,
      slopeRating: data.slopeRating,
      rounds: data.scores.length,
      ...stats
    })
  })
  
  return results.sort((a, b) => b.rounds - a.rounds)
}

/**
 * Calculate hole-by-hole statistics
 */
export const calculateHoleStatistics = (holeDetails) => {
  const holeStats = {}
  
  holeDetails.forEach(detail => {
    const holeNum = detail.hole_number || detail.holeNumber
    
    if (!holeStats[holeNum]) {
      holeStats[holeNum] = {
        holeNumber: holeNum,
        par: detail.par,
        scores: [],
        strokeAllocation: detail.stroke_allocation || detail.strokeAllocation
      }
    }
    
    holeStats[holeNum].scores.push(detail.adjusted_gross_score || detail.adjustedGrossScore)
  })
  
  // Calculate stats for each hole
  return Object.values(holeStats).map(hole => {
    const totalScore = hole.scores.reduce((sum, score) => sum + score, 0)
    const avgScore = totalScore / hole.scores.length
    const diffToPar = avgScore - hole.par
    
    // Calculate score distribution
    const distribution = calculateHoleScoreDistribution(hole.scores, hole.par)
    
    return {
      holeNumber: hole.holeNumber,
      par: hole.par,
      strokeAllocation: hole.strokeAllocation,
      roundsPlayed: hole.scores.length,
      avgScore: avgScore.toFixed(2),
      diffToPar: diffToPar.toFixed(2),
      bestScore: Math.min(...hole.scores),
      worstScore: Math.max(...hole.scores),
      ...distribution
    }
  }).sort((a, b) => a.holeNumber - b.holeNumber)
}

/**
 * Calculate scoring distribution
 */
export const calculateScoringDistribution = (scores, holeDetails) => {
  const distribution = {
    eagles: 0,
    birdies: 0,
    pars: 0,
    bogeys: 0,
    doubles: 0,
    triples: 0
  }
  
  holeDetails.forEach(detail => {
    const score = detail.adjusted_gross_score || detail.adjustedGrossScore
    const par = detail.par
    const diff = score - par
    
    if (diff <= -2) distribution.eagles++
    else if (diff === -1) distribution.birdies++
    else if (diff === 0) distribution.pars++
    else if (diff === 1) distribution.bogeys++
    else if (diff === 2) distribution.doubles++
    else distribution.triples++
  })
  
  const totalHoles = holeDetails.length
  
  return {
    counts: distribution,
    percentages: {
      eagles: ((distribution.eagles / totalHoles) * 100).toFixed(1),
      birdies: ((distribution.birdies / totalHoles) * 100).toFixed(1),
      pars: ((distribution.pars / totalHoles) * 100).toFixed(1),
      bogeys: ((distribution.bogeys / totalHoles) * 100).toFixed(1),
      doubles: ((distribution.doubles / totalHoles) * 100).toFixed(1),
      triples: ((distribution.triples / totalHoles) * 100).toFixed(1)
    },
    totalHoles
  }
}

/**
 * Calculate par type performance
 */
export const calculateParTypePerformance = (holeDetails) => {
  const parTypes = {
    3: { scores: [], pars: [] },
    4: { scores: [], pars: [] },
    5: { scores: [], pars: [] }
  }
  
  holeDetails.forEach(detail => {
    const par = detail.par
    const score = detail.adjusted_gross_score || detail.adjustedGrossScore
    
    if (parTypes[par]) {
      parTypes[par].scores.push(score)
      parTypes[par].pars.push(par)
    }
  })
  
  const results = {}
  
  Object.entries(parTypes).forEach(([par, data]) => {
    if (data.scores.length > 0) {
      const totalScore = data.scores.reduce((sum, score) => sum + score, 0)
      const totalPar = data.pars.reduce((sum, p) => sum + p, 0)
      const avgScore = totalScore / data.scores.length
      const avgToPar = avgScore - parseInt(par)
      
      results[`par${par}`] = {
        holesPlayed: data.scores.length,
        avgScore: avgScore.toFixed(2),
        avgToPar: avgToPar.toFixed(2),
        totalScore,
        totalPar,
        scoring: ((totalScore - totalPar) / data.scores.length).toFixed(2)
      }
    }
  })
  
  return results
}

/**
 * Calculate consistency rating based on standard deviation
 */
const calculateConsistencyRating = (stdDev) => {
  const std = parseFloat(stdDev)
  if (std < 3) return 'Very Consistent'
  if (std < 5) return 'Consistent'
  if (std < 7) return 'Average'
  if (std < 9) return 'Inconsistent'
  return 'Very Inconsistent'
}

/**
 * Calculate hole score distribution
 */
const calculateHoleScoreDistribution = (scores, par) => {
  const distribution = {
    eagles: 0,
    birdies: 0,
    pars: 0,
    bogeys: 0,
    doubles: 0,
    triples: 0
  }
  
  scores.forEach(score => {
    const diff = score - par
    if (diff <= -2) distribution.eagles++
    else if (diff === -1) distribution.birdies++
    else if (diff === 0) distribution.pars++
    else if (diff === 1) distribution.bogeys++
    else if (diff === 2) distribution.doubles++
    else distribution.triples++
  })
  
  return distribution
}

/**
 * Get empty statistics object
 */
const getEmptyStatistics = () => ({
  totalRounds: 0,
  averageScore: 0,
  bestScore: 0,
  worstScore: 0,
  averageDifferential: 0,
  bestDifferential: 0,
  worstDifferential: 0,
  standardDeviation: 0,
  improvementTrend: 0,
  scoreRanges: {
    under105: 0,
    range105to109: 0,
    range110to114: 0,
    over115: 0
  },
  consistency: 'No Data'
})

/**
 * Calculate hole-by-hole averages for chart display
 * Optimized for HolePerformanceChart component
 * 
 * @param {Array} holeDetails - Array of hole detail records
 * @returns {Array} Array of hole averages with over/under par calculations
 */
export const calculateHoleAveragesForChart = (holeDetails) => {
  const holeStats = {}
  
  // Group scores by hole number
  holeDetails.forEach(hole => {
    const holeNum = hole.hole_number || hole.holeNumber
    
    if (!holeStats[holeNum]) {
      holeStats[holeNum] = {
        hole: holeNum,
        par: hole.par,
        scores: []
      }
    }
    
    holeStats[holeNum].scores.push(
      hole.adjusted_gross_score || hole.adjustedGrossScore
    )
  })
  
  // Calculate averages and format for chart
  return Object.values(holeStats)
    .map(hole => ({
      hole: hole.hole,
      par: hole.par,
      avgScore: hole.scores.reduce((a, b) => a + b, 0) / hole.scores.length,
      overUnderPar: (hole.scores.reduce((a, b) => a + b, 0) / hole.scores.length) - hole.par,
      roundsPlayed: hole.scores.length
    }))
    .sort((a, b) => a.hole - b.hole)
}