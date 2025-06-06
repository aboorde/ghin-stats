/**
 * Course Model
 * 
 * Aggregates golf round data by course from database tables.
 * All data originates from DATABASE_STRUCTURE.md schema.
 * 
 * DATA SOURCES:
 * 
 * From 'rounds' table:
 *   - course_name: Name of the golf course (text)
 *   - course_rating: USGA course rating (numeric/decimal)  
 *   - slope_rating: Course slope rating (integer)
 *   - adjusted_gross_score: Score for the round (integer)
 *   - differential: Handicap differential (numeric/decimal)
 *   - number_of_holes: 18 or 9 (integer)
 *   - played_at: Date round was played (date)
 *   - tee_name: Name of tees played (text)
 *   - course_handicap: Course handicap for round (integer)
 * 
 * From 'round_statistics' table (joined via round_id):
 *   - par3s_average: Average score on par 3s (character varying -> number)
 *   - par4s_average: Average score on par 4s (character varying -> number)
 *   - par5s_average: Average score on par 5s (character varying -> number)
 *   - birdies_or_better_percent: Percentage (character varying -> number)
 *   - pars_percent: Percentage (character varying -> number)
 *   - bogeys_percent: Percentage (character varying -> number)
 *   - double_bogeys_percent: Percentage (character varying -> number)
 *   - triple_bogeys_or_worse_percent: Percentage (character varying -> number)
 * 
 * @module models/Course
 */

import { calculateAverage } from '../utils/scoreHelpers'

/**
 * Course - Aggregates round data for a specific golf course
 * @class Course
 */
export class Course {
  constructor(courseName) {
    // Basic course info (from rounds table)
    this.name = courseName
    this.rating = 0
    this.slope = 0
    
    // Round tracking
    this.rounds18 = 0
    this.rounds9 = 0
    
    // Score accumulation for averaging
    this.totalScore18 = 0
    this.totalScore9 = 0
    
    // Best/worst tracking
    this.bestScore18 = Infinity
    this.worstScore18 = -Infinity
    this.bestScore9 = Infinity
    this.worstScore9 = -Infinity
    
    // Arrays for calculating statistics
    this.scores18 = []
    this.scores9 = []
    this.differentials18 = []
    this.differentials9 = []
    
    // Par type performance (from round_statistics)
    this.par3Averages = []
    this.par4Averages = []
    this.par5Averages = []
    
    // Scoring distribution (from round_statistics)
    this.birdiePercentages = []
    this.parPercentages = []
    this.bogeyPercentages = []
    this.doubleBogeyPercentages = []
    this.tripleBogeyPercentages = []
  }

  /**
   * Parse string value from database to number
   * Database stores many numeric fields as character varying
   * 
   * @param {any} value - Value to parse
   * @param {boolean} isPercent - Whether to normalize percentage
   * @returns {number|null} Parsed number or null
   */
  static parseDbValue(value, isPercent = false) {
    if (value === null || value === undefined || value === '' || value === 'null') {
      return null
    }
    
    const cleanValue = String(value).replace('%', '').trim()
    const parsed = parseFloat(cleanValue)
    
    if (isNaN(parsed) || !isFinite(parsed)) {
      return null
    }
    
    // Convert decimal to percentage if needed (0.45 -> 45)
    if (isPercent && parsed > 0 && parsed < 1) {
      return parsed * 100
    }
    
    return parsed
  }

  /**
   * Add a round to this course's aggregation
   * Processes data from rounds table and optionally round_statistics
   * 
   * @param {Object} round - Round record from database with optional statistics
   */
  addRound(round) {
    // Validate required fields from rounds table
    if (!round || typeof round.adjusted_gross_score !== 'number') {
      return
    }

    // Set course info from first round
    if (this.rating === 0 && round.course_rating) {
      this.rating = parseFloat(round.course_rating) || 0
    }
    if (this.slope === 0 && round.slope_rating) {
      this.slope = parseInt(round.slope_rating) || 0
    }

    // Process by round type
    if (round.number_of_holes === 18) {
      this.rounds18++
      this.totalScore18 += round.adjusted_gross_score
      this.bestScore18 = Math.min(this.bestScore18, round.adjusted_gross_score)
      this.worstScore18 = Math.max(this.worstScore18, round.adjusted_gross_score)
      this.scores18.push(round.adjusted_gross_score)
      
      if (typeof round.differential === 'number') {
        this.differentials18.push(round.differential)
      }

      // Process statistics from round_statistics table (18-hole only)
      if (round.round_statistics?.[0]) {
        this.addStatistics(round.round_statistics[0])
      }
    } else if (round.number_of_holes === 9) {
      this.rounds9++
      this.totalScore9 += round.adjusted_gross_score
      this.bestScore9 = Math.min(this.bestScore9, round.adjusted_gross_score)
      this.worstScore9 = Math.max(this.worstScore9, round.adjusted_gross_score)
      this.scores9.push(round.adjusted_gross_score)
      
      if (typeof round.differential === 'number') {
        this.differentials9.push(round.differential)
      }
    }
  }

  /**
   * Add statistics from round_statistics table
   * All values are stored as character varying and need parsing
   * 
   * @param {Object} stats - Statistics record from round_statistics table
   */
  addStatistics(stats) {
    // Par averages
    const par3 = Course.parseDbValue(stats.par3s_average)
    const par4 = Course.parseDbValue(stats.par4s_average)
    const par5 = Course.parseDbValue(stats.par5s_average)
    
    if (par3 !== null && par3 > 0 && par3 <= 10) this.par3Averages.push(par3)
    if (par4 !== null && par4 > 0 && par4 <= 10) this.par4Averages.push(par4)
    if (par5 !== null && par5 > 0 && par5 <= 10) this.par5Averages.push(par5)
    
    // Scoring percentages
    const birdie = Course.parseDbValue(stats.birdies_or_better_percent, true)
    const par = Course.parseDbValue(stats.pars_percent, true)
    const bogey = Course.parseDbValue(stats.bogeys_percent, true)
    const double = Course.parseDbValue(stats.double_bogeys_percent, true)
    const triple = Course.parseDbValue(stats.triple_bogeys_or_worse_percent, true)
    
    if (birdie !== null && birdie >= 0 && birdie <= 100) {
      this.birdiePercentages.push(birdie)
    }
    if (par !== null && par >= 0 && par <= 100) {
      this.parPercentages.push(par)
    }
    if (bogey !== null && bogey >= 0 && bogey <= 100) {
      this.bogeyPercentages.push(bogey)
    }
    if (double !== null && double >= 0 && double <= 100) {
      this.doubleBogeyPercentages.push(double)
    }
    if (triple !== null && triple >= 0 && triple <= 100) {
      this.tripleBogeyPercentages.push(triple)
    }
  }

  /**
   * Get total rounds played
   * @returns {number} Total rounds
   */
  getTotalRounds() {
    return this.rounds18 + this.rounds9
  }

  /**
   * Get average score for 18-hole rounds
   * @returns {number|null} Average or null if no rounds
   */
  getAverageScore18() {
    return this.rounds18 > 0 ? this.totalScore18 / this.rounds18 : null
  }

  /**
   * Get average score for 9-hole rounds
   * @returns {number|null} Average or null if no rounds
   */
  getAverageScore9() {
    return this.rounds9 > 0 ? this.totalScore9 / this.rounds9 : null
  }

  /**
   * Get average differential for 18-hole rounds
   * @returns {number|null} Average or null if no data
   */
  getAverageDifferential18() {
    return calculateAverage(this.differentials18)
  }

  /**
   * Get average differential for 9-hole rounds
   * @returns {number|null} Average or null if no data
   */
  getAverageDifferential9() {
    return calculateAverage(this.differentials9)
  }

  /**
   * Get par type performance averages
   * @returns {Object} Averages for par 3/4/5
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
   * @returns {Object} Percentage breakdown by score type
   */
  getScoringDistribution() {
    const birdie = calculateAverage(this.birdiePercentages) || 0
    const par = calculateAverage(this.parPercentages) || 0
    const bogey = calculateAverage(this.bogeyPercentages) || 0
    const double = calculateAverage(this.doubleBogeyPercentages) || 0
    const triple = calculateAverage(this.tripleBogeyPercentages) || 0
    
    return {
      birdiePercent: birdie,
      parPercent: par,
      bogeyPercent: bogey,
      doubleBogeyPercent: double,
      tripleBogeyPercent: triple,
      doublePlusPercent: double + triple // Combined for display
    }
  }

  /**
   * Get performance vs par for each par type
   * @returns {Object} Strokes over/under par
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
   * Format best/worst scores for display
   * @param {boolean} is18Hole - Whether to get 18 or 9 hole
   * @returns {Object} Formatted scores
   */
  getFormattedScores(is18Hole = true) {
    if (is18Hole) {
      return {
        best: this.bestScore18 === Infinity ? '-' : this.bestScore18,
        worst: this.worstScore18 === -Infinity ? '-' : this.worstScore18
      }
    } else {
      return {
        best: this.bestScore9 === Infinity ? '-' : this.bestScore9,
        worst: this.worstScore9 === -Infinity ? '-' : this.worstScore9
      }
    }
  }

  /**
   * Convert to plain object for serialization
   * All values trace back to database fields
   * 
   * @returns {Object} Plain object with all statistics
   */
  toJSON() {
    const scores18 = this.getFormattedScores(true)
    const scores9 = this.getFormattedScores(false)
    
    return {
      // Basic info (from rounds table)
      name: this.name,
      rating: this.rating,
      slope: this.slope,
      
      // Round counts
      totalRounds: this.getTotalRounds(),
      rounds18: this.rounds18,
      rounds9: this.rounds9,
      
      // Scoring averages (from adjusted_gross_score)
      avgScore18: this.getAverageScore18(),
      avgScore9: this.getAverageScore9(),
      
      // Differentials (from differential)
      avgDifferential18: this.getAverageDifferential18(),
      avgDifferential9: this.getAverageDifferential9(),
      
      // Best/worst scores
      bestScore18: scores18.best,
      worstScore18: scores18.worst,
      bestScore9: scores9.best,
      worstScore9: scores9.worst,
      
      // Par performance (from round_statistics)
      ...this.getParTypePerformance(),
      
      // Scoring distribution (from round_statistics)
      ...this.getScoringDistribution(),
      
      // Performance vs par (calculated)
      ...this.getParTypeVsPar()
    }
  }
}

/**
 * Create Course instances from grouped round data
 * Used by aggregation services
 * 
 * @param {Object} courseDataMap - Map of course names to arrays of rounds
 * @returns {Course[]} Array of Course instances sorted by total rounds
 */
export function createCoursesFromGroupedData(courseDataMap) {
  const courses = []
  
  for (const [courseName, rounds] of Object.entries(courseDataMap)) {
    if (!Array.isArray(rounds) || rounds.length === 0) continue
    
    const course = new Course(courseName)
    
    // Add all rounds to the course
    rounds.forEach(round => course.addRound(round))
    
    courses.push(course)
  }
  
  // Sort by total rounds (most played first)
  return courses.sort((a, b) => b.getTotalRounds() - a.getTotalRounds())
}

/**
 * Create a single Course from rounds array
 * Alternative factory method
 * 
 * @param {string} name - Course name
 * @param {Array} rounds - Array of rounds at this course
 * @returns {Course} Course instance
 */
export function createCourseFromRounds(name, rounds) {
  const course = new Course(name)
  
  if (Array.isArray(rounds)) {
    rounds.forEach(round => course.addRound(round))
  }
  
  return course
}