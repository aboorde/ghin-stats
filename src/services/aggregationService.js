import { groupByMonthYear, groupByYear, sortByDateAsc } from '../utils/dateHelpers'
import { calculateScoringStats } from '../utils/scoreHelpers'
import { createCoursesFromGroupedData } from '../models/Course'
import { Year } from '../models/Year'

/**
 * Aggregation service for data grouping and summarization
 * 
 * Provides methods for aggregating golf data by various dimensions:
 * - Time-based: Month and Year
 * - Location-based: Course
 * - Performance-based: Hole details and statistics
 * 
 * @module services/aggregationService
 */

/**
 * Aggregate scores by month
 */
export const aggregateScoresByMonth = (scores) => {
  const monthlyGroups = groupByMonthYear(scores)
  const aggregated = []
  
  Object.entries(monthlyGroups).forEach(([monthKey, monthScores]) => {
    const stats = calculateScoringStats(monthScores)
    const firstScore = monthScores[0]
    
    aggregated.push({
      month: monthKey,
      year: new Date(firstScore.played_at || firstScore.playedAt).getFullYear(),
      monthName: new Date(firstScore.played_at || firstScore.playedAt).toLocaleString('default', { month: 'long' }),
      rounds: monthScores.length,
      ...stats,
      scores: monthScores
    })
  })
  
  return aggregated.sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Aggregate scores by year
 */
export const aggregateScoresByYear = (scores) => {
  const yearlyGroups = groupByYear(scores)
  const aggregated = []
  
  Object.entries(yearlyGroups).forEach(([year, yearScores]) => {
    const stats = calculateScoringStats(yearScores)
    const sortedScores = sortByDateAsc(yearScores)
    
    // Calculate improvement within the year
    let yearImprovement = 0
    if (sortedScores.length >= 4) {
      const firstQuarter = sortedScores.slice(0, Math.floor(sortedScores.length / 4))
      const lastQuarter = sortedScores.slice(-Math.floor(sortedScores.length / 4))
      
      const firstAvg = firstQuarter.reduce((sum, s) => 
        sum + (s.adjusted_gross_score || s.adjustedGrossScore), 0) / firstQuarter.length
      const lastAvg = lastQuarter.reduce((sum, s) => 
        sum + (s.adjusted_gross_score || s.adjustedGrossScore), 0) / lastQuarter.length
      
      yearImprovement = (lastAvg - firstAvg).toFixed(1)
    }
    
    aggregated.push({
      year: parseInt(year),
      rounds: yearScores.length,
      ...stats,
      improvement: yearImprovement,
      scores: sortedScores
    })
  })
  
  return aggregated.sort((a, b) => a.year - b.year)
}

/**
 * Aggregate scores by course
 */
export const aggregateScoresByCourse = (scores) => {
  const courseGroups = {}
  
  scores.forEach(score => {
    const courseName = score.course_name || score.courseName
    const teeName = score.tee_name || score.teeName
    const key = `${courseName}|${teeName}`
    
    if (!courseGroups[key]) {
      courseGroups[key] = {
        courseName,
        teeName,
        courseRating: score.course_rating || score.courseRating,
        slopeRating: score.slope_rating || score.slopeRating,
        scores: []
      }
    }
    
    courseGroups[key].scores.push(score)
  })
  
  const aggregated = []
  
  Object.values(courseGroups).forEach(group => {
    const stats = calculateScoringStats(group.scores)
    const sortedScores = sortByDateAsc(group.scores)
    
    aggregated.push({
      course: group.courseName,
      tees: group.teeName,
      courseRating: group.courseRating,
      slopeRating: group.slopeRating,
      rounds: group.scores.length,
      ...stats,
      firstPlayed: sortedScores[0].played_at || sortedScores[0].playedAt,
      lastPlayed: sortedScores[sortedScores.length - 1].played_at || sortedScores[sortedScores.length - 1].playedAt
    })
  })
  
  return aggregated.sort((a, b) => b.rounds - a.rounds)
}

/**
 * Aggregate hole details by hole number
 */
export const aggregateHoleDetails = (holeDetails) => {
  const holeGroups = {}
  
  holeDetails.forEach(detail => {
    const holeNum = detail.hole_number || detail.holeNumber
    
    if (!holeGroups[holeNum]) {
      holeGroups[holeNum] = {
        holeNumber: holeNum,
        par: detail.par,
        strokeAllocation: detail.stroke_allocation || detail.strokeAllocation,
        scores: []
      }
    }
    
    holeGroups[holeNum].scores.push({
      score: detail.adjusted_gross_score || detail.adjustedGrossScore,
      rawScore: detail.raw_score || detail.rawScore,
      scoreId: detail.score_id || detail.scoreId
    })
  })
  
  const aggregated = []
  
  Object.values(holeGroups).forEach(group => {
    const scores = group.scores.map(s => s.score)
    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    const avgScore = totalScore / scores.length
    const scoreToPar = avgScore - group.par
    
    // Calculate score distribution
    const distribution = {
      eagles: 0,
      birdies: 0,
      pars: 0,
      bogeys: 0,
      doubles: 0,
      triples: 0
    }
    
    scores.forEach(score => {
      const diff = score - group.par
      if (diff <= -2) distribution.eagles++
      else if (diff === -1) distribution.birdies++
      else if (diff === 0) distribution.pars++
      else if (diff === 1) distribution.bogeys++
      else if (diff === 2) distribution.doubles++
      else distribution.triples++
    })
    
    aggregated.push({
      holeNumber: group.holeNumber,
      par: group.par,
      strokeAllocation: group.strokeAllocation,
      roundsPlayed: scores.length,
      avgScore: avgScore.toFixed(2),
      scoreToPar: scoreToPar.toFixed(2),
      bestScore: Math.min(...scores),
      worstScore: Math.max(...scores),
      distribution,
      difficulty: calculateDifficultyRanking(scoreToPar)
    })
  })
  
  return aggregated.sort((a, b) => a.holeNumber - b.holeNumber)
}

/**
 * Aggregate statistics data
 */
export const aggregateStatistics = (statistics) => {
  if (!statistics || statistics.length === 0) {
    return getEmptyAggregatedStats()
  }
  
  const totals = statistics.reduce((acc, stat) => {
    acc.upAndDowns += stat.up_and_downs_total || 0
    acc.par3Total += (stat.par3s_average || 0) * 4 // Assuming 4 par 3s
    acc.par4Total += (stat.par4s_average || 0) * 10 // Assuming 10 par 4s
    acc.par5Total += (stat.par5s_average || 0) * 4 // Assuming 4 par 5s
    acc.pars += (stat.pars_percent || 0)
    acc.birdies += (stat.birdies_or_better_percent || 0)
    acc.bogeys += (stat.bogeys_percent || 0)
    acc.doubles += (stat.double_bogeys_percent || 0)
    acc.triples += (stat.triple_bogeys_or_worse_percent || 0)
    acc.count++
    return acc
  }, {
    upAndDowns: 0,
    par3Total: 0,
    par4Total: 0,
    par5Total: 0,
    pars: 0,
    birdies: 0,
    bogeys: 0,
    doubles: 0,
    triples: 0,
    count: 0
  })
  
  const count = totals.count
  
  return {
    avgUpAndDowns: (totals.upAndDowns / count).toFixed(1),
    avgPar3Score: (totals.par3Total / count / 4).toFixed(1),
    avgPar4Score: (totals.par4Total / count / 10).toFixed(1),
    avgPar5Score: (totals.par5Total / count / 4).toFixed(1),
    avgParsPercent: (totals.pars / count).toFixed(1),
    avgBirdiesPercent: (totals.birdies / count).toFixed(1),
    avgBogeysPercent: (totals.bogeys / count).toFixed(1),
    avgDoublesPercent: (totals.doubles / count).toFixed(1),
    avgTriplesPercent: (totals.triples / count).toFixed(1)
  }
}

/**
 * Calculate difficulty ranking based on score to par
 */
const calculateDifficultyRanking = (scoreToPar) => {
  const diff = parseFloat(scoreToPar)
  if (diff < 0.5) return 'Easy'
  if (diff < 1.0) return 'Moderate'
  if (diff < 1.5) return 'Difficult'
  return 'Very Difficult'
}

/**
 * Get empty aggregated stats
 */
const getEmptyAggregatedStats = () => ({
  avgUpAndDowns: '0.0',
  avgPar3Score: '0.0',
  avgPar4Score: '0.0',
  avgPar5Score: '0.0',
  avgParsPercent: '0.0',
  avgBirdiesPercent: '0.0',
  avgBogeysPercent: '0.0',
  avgDoublesPercent: '0.0',
  avgTriplesPercent: '0.0'
})

/**
 * Aggregate scores by course with detailed statistics
 * Creates Course model instances with full performance tracking
 * 
 * @param {Array} scores - Array of score records with statistics
 * @returns {Array<Course>} Array of Course model instances
 */
export const aggregateCourseStatistics = (scores) => {
  // Group scores by course name
  const courseGroups = {}
  
  scores.forEach(score => {
    const courseName = score.course_name || score.courseName
    
    if (!courseGroups[courseName]) {
      courseGroups[courseName] = []
    }
    
    courseGroups[courseName].push(score)
  })
  
  // Create Course models from grouped data
  return createCoursesFromGroupedData(courseGroups)
}

/**
 * Calculate hole averages for a specific course
 * Aggregates hole-by-hole performance data
 * 
 * @param {Array} holeDetails - Array of hole detail records
 * @returns {Array} Array of hole average objects with performance metrics
 */
export const calculateCourseHoleAverages = (holeDetails) => {
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
  
  // Calculate averages and performance metrics
  const averages = Object.values(holeStats)
    .map(hole => {
      const avgScore = hole.scores.reduce((a, b) => a + b, 0) / hole.scores.length
      const overUnderPar = avgScore - hole.par
      
      // Calculate score distribution
      const distribution = {
        eagles: 0,
        birdies: 0,
        pars: 0,
        bogeys: 0,
        doubles: 0,
        triplesPlus: 0
      }
      
      hole.scores.forEach(score => {
        const diff = score - hole.par
        if (diff <= -2) distribution.eagles++
        else if (diff === -1) distribution.birdies++
        else if (diff === 0) distribution.pars++
        else if (diff === 1) distribution.bogeys++
        else if (diff === 2) distribution.doubles++
        else distribution.triplesPlus++
      })
      
      return {
        hole: hole.hole,
        par: hole.par,
        avgScore: parseFloat(avgScore.toFixed(2)),
        overUnderPar: parseFloat(overUnderPar.toFixed(2)),
        totalRounds: hole.scores.length,
        bestScore: Math.min(...hole.scores),
        worstScore: Math.max(...hole.scores),
        distribution,
        difficulty: calculateDifficultyRanking(overUnderPar)
      }
    })
    .sort((a, b) => a.hole - b.hole)
  
  return averages
}

/**
 * Aggregate scores by year using Year model
 * Creates comprehensive year statistics with monthly breakdowns,
 * course distribution, and par type performance
 * 
 * @param {Array} scores - Array of score records with statistics
 * @returns {Array<Year>} Array of Year model instances sorted by year
 */
export const aggregateScoresByYearModel = (scores) => {
  if (!scores || scores.length === 0) {
    return []
  }

  // Group scores by year
  const yearGroups = groupByYear(scores)
  const yearInstances = []
  
  // Create Year model for each year
  Object.entries(yearGroups).forEach(([year, yearScores]) => {
    const yearModel = Year.fromRounds(parseInt(year), yearScores)
    yearInstances.push(yearModel)
  })
  
  // Sort by year ascending
  return yearInstances.sort((a, b) => a.year - b.year)
}

/**
 * Get time-based aggregation summary
 * Provides overview of data distribution across months and years
 * 
 * @param {Array} scores - Array of score records
 * @returns {Object} Summary with monthly and yearly distribution
 */
export const getTimeBasedSummary = (scores) => {
  const yearModels = aggregateScoresByYearModel(scores)
  const monthlyData = aggregateScoresByMonth(scores)
  
  return {
    totalYears: yearModels.length,
    yearRange: yearModels.length > 0 ? {
      start: yearModels[0].year,
      end: yearModels[yearModels.length - 1].year
    } : null,
    totalMonths: monthlyData.length,
    yearlySummary: yearModels.map(year => ({
      year: year.year,
      rounds: year.rounds,
      avgScore: year.getAverageScore()
    })),
    mostActiveMonth: monthlyData.reduce((max, month) => 
      month.rounds > (max?.rounds || 0) ? month : max, null
    ),
    mostActiveYear: yearModels.reduce((max, year) => 
      year.rounds > (max?.rounds || 0) ? year : max, null
    )
  }
}