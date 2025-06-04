/**
 * Course Model
 * 
 * Represents aggregated statistics for a golf course
 * Tracks separate statistics for 18-hole and 9-hole rounds
 * Provides methods for performance analysis and display formatting
 * 
 * @module models/Course
 */

import { calculateAverage } from '../utils/scoreHelpers'

/**
 * Course statistics model with performance tracking
 * @class Course
 */
export class Course {
  constructor(data = {}) {
    // Basic course information
    this.name = data.name || ''
    this.rating = data.rating || 0
    this.slope = data.slope || 0
    
    // Round counts
    this.rounds18 = data.rounds18 || 0
    this.rounds9 = data.rounds9 || 0
    
    // Score totals for averaging
    this.totalScore18 = data.totalScore18 || 0
    this.totalScore9 = data.totalScore9 || 0
    
    // Best/worst tracking with Infinity defaults for Math.min/max
    this.bestScore18 = data.bestScore18 ?? Infinity
    this.worstScore18 = data.worstScore18 ?? -Infinity
    this.bestScore9 = data.bestScore9 ?? Infinity
    this.worstScore9 = data.worstScore9 ?? -Infinity
    
    // Arrays for detailed statistics (18-hole rounds only)
    this.scores18 = data.scores18 || []
    this.scores9 = data.scores9 || []
    this.differentials18 = data.differentials18 || []
    this.differentials9 = data.differentials9 || []
    
    // Par type performance arrays (18-hole rounds only)
    this.par3Averages = data.par3Averages || []
    this.par4Averages = data.par4Averages || []
    this.par5Averages = data.par5Averages || []
    
    // Scoring distribution arrays (18-hole rounds only)
    this.parPercentages = data.parPercentages || []
    this.bogeyPercentages = data.bogeyPercentages || []
    this.doublePlusPercentages = data.doublePlusPercentages || []
  }

  /**
   * Get total rounds played at this course
   * @returns {number} Total rounds (18 + 9 hole)
   */
  getTotalRounds() {
    return this.rounds18 + this.rounds9
  }

  /**
   * Get average score for 18-hole rounds
   * @returns {number|null} Average score or null if no rounds
   */
  getAverageScore18() {
    return this.rounds18 > 0 ? this.totalScore18 / this.rounds18 : null
  }

  /**
   * Get average score for 9-hole rounds
   * @returns {number|null} Average score or null if no rounds
   */
  getAverageScore9() {
    return this.rounds9 > 0 ? this.totalScore9 / this.rounds9 : null
  }

  /**
   * Get average differential for 18-hole rounds
   * @returns {number|null} Average differential or null if no data
   */
  getAverageDifferential18() {
    return calculateAverage(this.differentials18)
  }

  /**
   * Get average differential for 9-hole rounds
   * @returns {number|null} Average differential or null if no data
   */
  getAverageDifferential9() {
    return calculateAverage(this.differentials9)
  }

  /**
   * Get par type performance averages
   * @returns {Object} Object with avgPar3, avgPar4, avgPar5
   */
  getParTypePerformance() {
    return {
      avgPar3: calculateAverage(this.par3Averages) || 0,
      avgPar4: calculateAverage(this.par4Averages) || 0,
      avgPar5: calculateAverage(this.par5Averages) || 0
    }
  }

  /**
   * Get scoring distribution percentages
   * @returns {Object} Object with par%, bogey%, double+%
   */
  getScoringDistribution() {
    return {
      parPercent: calculateAverage(this.parPercentages) || 0,
      bogeyPercent: calculateAverage(this.bogeyPercentages) || 0,
      doublePlusPercent: calculateAverage(this.doublePlusPercentages) || 0
    }
  }

  /**
   * Get performance vs par for each par type
   * @returns {Object} Strokes over/under par for each type
   */
  getParTypeVsPar() {
    const perf = this.getParTypePerformance()
    return {
      par3VsPar: perf.avgPar3 - 3,
      par4VsPar: perf.avgPar4 - 4,
      par5VsPar: perf.avgPar5 - 5
    }
  }

  /**
   * Format best score for display
   * @param {boolean} is18Hole - Whether to get 18 or 9 hole best
   * @returns {string|number} Formatted score or '-' if no data
   */
  getFormattedBestScore(is18Hole = true) {
    const score = is18Hole ? this.bestScore18 : this.bestScore9
    return score === Infinity ? '-' : score
  }

  /**
   * Format worst score for display
   * @param {boolean} is18Hole - Whether to get 18 or 9 hole worst
   * @returns {string|number} Formatted score or '-' if no data
   */
  getFormattedWorstScore(is18Hole = true) {
    const score = is18Hole ? this.worstScore18 : this.worstScore9
    return score === -Infinity ? '-' : score
  }

  /**
   * Determine performance level based on average score
   * @returns {Object} Color and level for UI display
   */
  getPerformanceLevel() {
    const avg18 = this.getAverageScore18()
    if (!avg18) return { color: 'text-gray-400', level: 'no-data' }
    
    // Based on our existing thresholds
    if (avg18 < 105) return { color: 'text-green-400', level: 'excellent' }
    if (avg18 < 110) return { color: 'text-blue-400', level: 'good' }
    if (avg18 < 115) return { color: 'text-yellow-400', level: 'average' }
    return { color: 'text-red-400', level: 'needs-improvement' }
  }

  /**
   * Add a round to this course's statistics
   * Used during aggregation process
   * @param {Object} round - Round data with statistics
   */
  addRound(round) {
    const isComplete = round.number_of_holes === 18
    const isNineHole = round.number_of_holes === 9
    
    if (isComplete) {
      this.rounds18++
      this.totalScore18 += round.adjusted_gross_score
      this.bestScore18 = Math.min(this.bestScore18, round.adjusted_gross_score)
      this.worstScore18 = Math.max(this.worstScore18, round.adjusted_gross_score)
      this.scores18.push(round.adjusted_gross_score)
      this.differentials18.push(round.differential)
      
      // Add statistics if available
      if (round.statistics?.[0]) {
        const stats = round.statistics[0]
        if (stats.par3s_average) this.par3Averages.push(stats.par3s_average)
        if (stats.par4s_average) this.par4Averages.push(stats.par4s_average)
        if (stats.par5s_average) this.par5Averages.push(stats.par5s_average)
        if (stats.pars_percent !== null) this.parPercentages.push(stats.pars_percent)
        if (stats.bogeys_percent !== null) this.bogeyPercentages.push(stats.bogeys_percent)
        if (stats.double_bogeys_percent !== null && stats.triple_bogeys_or_worse_percent !== null) {
          this.doublePlusPercentages.push(
            stats.double_bogeys_percent + stats.triple_bogeys_or_worse_percent
          )
        }
      }
    } else if (isNineHole) {
      this.rounds9++
      this.totalScore9 += round.adjusted_gross_score
      this.bestScore9 = Math.min(this.bestScore9, round.adjusted_gross_score)
      this.worstScore9 = Math.max(this.worstScore9, round.adjusted_gross_score)
      this.scores9.push(round.adjusted_gross_score)
      this.differentials9.push(round.differential)
    }
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      name: this.name,
      rating: this.rating,
      slope: this.slope,
      totalRounds: this.getTotalRounds(),
      rounds18: this.rounds18,
      rounds9: this.rounds9,
      avgScore18: this.getAverageScore18(),
      avgScore9: this.getAverageScore9(),
      avgDifferential18: this.getAverageDifferential18(),
      avgDifferential9: this.getAverageDifferential9(),
      bestScore18: this.getFormattedBestScore(true),
      worstScore18: this.getFormattedWorstScore(true),
      bestScore9: this.getFormattedBestScore(false),
      worstScore9: this.getFormattedWorstScore(false),
      ...this.getParTypePerformance(),
      ...this.getScoringDistribution(),
      ...this.getParTypeVsPar()
    }
  }
}

/**
 * Factory function to create Course instances from grouped data
 * @param {Object} courseDataMap - Map of course names to arrays of rounds
 * @returns {Course[]} Array of Course instances
 */
export function createCoursesFromGroupedData(courseDataMap) {
  const courses = []
  
  for (const [courseName, rounds] of Object.entries(courseDataMap)) {
    const course = new Course({
      name: courseName,
      rating: rounds[0]?.course_rating || 0,
      slope: rounds[0]?.slope_rating || 0
    })
    
    // Add each round to the course
    rounds.forEach(round => course.addRound(round))
    
    courses.push(course)
  }
  
  // Sort by total rounds (most played first)
  return courses.sort((a, b) => b.getTotalRounds() - a.getTotalRounds())
}

/**
 * Factory function to create a single Course from rounds
 * @param {string} name - Course name
 * @param {Array} rounds - Array of rounds at this course
 * @returns {Course} Course instance
 */
export function createCourseFromRounds(name, rounds) {
  const course = new Course({
    name,
    rating: rounds[0]?.course_rating || 0,
    slope: rounds[0]?.slope_rating || 0
  })
  
  rounds.forEach(round => course.addRound(round))
  
  return course
}