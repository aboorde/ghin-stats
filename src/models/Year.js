/**
 * Year Model
 * 
 * Client-side aggregation model for yearly golf statistics.
 * This model does NOT correspond to a database table - it's created
 * by aggregating data from the 'rounds' and 'round_statistics' tables.
 * 
 * Tracks rounds, scores, differentials, monthly trends, course breakdown,
 * par type performance, and scoring distribution for a specific year.
 * 
 * @module models/Year
 */

import { calculateAverage } from '../utils/scoreHelpers'

export class Year {
  constructor(data = {}) {
    // Basic year information
    this.year = data.year || new Date().getFullYear()
    this.rounds = data.rounds || 0
    
    // Score tracking arrays
    this.scores = data.scores || []
    this.differentials = data.differentials || []
    
    // Monthly performance tracking
    // Structure: { 0: [scores], 1: [scores], ... 11: [scores] }
    this.monthlyScores = data.monthlyScores || {}
    
    // Course breakdown tracking
    // Structure: { "Course Name": count }
    this.courseBreakdown = data.courseBreakdown || {}
    
    // Par type performance arrays
    this.par3Averages = data.par3Averages || []
    this.par4Averages = data.par4Averages || []
    this.par5Averages = data.par5Averages || []
    
    // Scoring distribution tracking
    this.scoringDistribution = {
      pars: data.scoringDistribution?.pars || 0,
      bogeys: data.scoringDistribution?.bogeys || 0,
      doublePlus: data.scoringDistribution?.doublePlus || 0
    }
  }

  /**
   * Safe parse function to convert database strings to numbers
   * @param {any} value - Value to parse
   * @returns {number|null} Parsed number or null
   */
  safeParse(value) {
    if (value === null || value === undefined || value === '') return null
    const parsed = parseFloat(value)
    return isNaN(parsed) ? null : parsed
  }

  /**
   * Add a round to this year's statistics
   * @param {Object} round - The round data from the 'rounds' table with optional 'round_statistics'
   */
  addRound(round) {
    // Only count 18-hole rounds for statistics
    // If number_of_holes is not specified, assume it's an 18-hole round
    if (round.number_of_holes !== undefined && round.number_of_holes !== 18) return
    
    this.rounds++
    this.scores.push(round.adjusted_gross_score)
    this.differentials.push(parseFloat(round.differential) || 0)
    
    // Track monthly scores
    const month = new Date(round.played_at).getMonth()
    if (!this.monthlyScores[month]) {
      this.monthlyScores[month] = []
    }
    this.monthlyScores[month].push(round.adjusted_gross_score)
    
    // Track course breakdown
    const courseName = round.course_name
    if (!this.courseBreakdown[courseName]) {
      this.courseBreakdown[courseName] = 0
    }
    this.courseBreakdown[courseName]++
    
    // Track par type performance and scoring distribution
    // Statistics come from the round_statistics table via join
    if (round.round_statistics) {
      const stats = round.round_statistics
      
      // Parse par averages (stored as strings in database)
      const par3Avg = this.safeParse(stats.par3s_average)
      const par4Avg = this.safeParse(stats.par4s_average)
      const par5Avg = this.safeParse(stats.par5s_average)
      
      if (par3Avg && par3Avg > 0) this.par3Averages.push(par3Avg)
      if (par4Avg && par4Avg > 0) this.par4Averages.push(par4Avg)
      if (par5Avg && par5Avg > 0) this.par5Averages.push(par5Avg)
      
      // Parse scoring percentages (stored as strings in database)
      const parsPercent = this.safeParse(stats.pars_percent)
      const bogeysPercent = this.safeParse(stats.bogeys_percent)
      const doublesPercent = this.safeParse(stats.double_bogeys_percent)
      const triplesPercent = this.safeParse(stats.triple_bogeys_or_worse_percent)
      
      // Convert percentages to approximate hole counts
      // Note: percentages are already in decimal form (e.g., 0.11 = 11%)
      const holesPerRound = 18
      if (parsPercent !== null) {
        this.scoringDistribution.pars += Math.round(parsPercent * holesPerRound)
      }
      if (bogeysPercent !== null) {
        this.scoringDistribution.bogeys += Math.round(bogeysPercent * holesPerRound)
      }
      if (doublesPercent !== null && triplesPercent !== null) {
        this.scoringDistribution.doublePlus += Math.round(
          (doublesPercent + triplesPercent) * holesPerRound
        )
      }
    }
  }

  /**
   * Get average score for the year
   * @returns {number|null} Average score or null if no rounds
   */
  getAverageScore() {
    return calculateAverage(this.scores)
  }

  /**
   * Get best (lowest) score for the year
   * @returns {number|null} Best score or null if no rounds
   */
  getBestScore() {
    return this.scores.length > 0 ? Math.min(...this.scores) : null
  }

  /**
   * Get worst (highest) score for the year
   * @returns {number|null} Worst score or null if no rounds
   */
  getWorstScore() {
    return this.scores.length > 0 ? Math.max(...this.scores) : null
  }

  /**
   * Get average differential for the year
   * @returns {number|null} Average differential or null if no rounds
   */
  getAverageDifferential() {
    return calculateAverage(this.differentials)
  }

  /**
   * Get par type performance averages
   * @returns {Object} Object with avgPar3, avgPar4, avgPar5
   */
  getParTypeAverages() {
    return {
      avgPar3: calculateAverage(this.par3Averages) || 0,
      avgPar4: calculateAverage(this.par4Averages) || 0,
      avgPar5: calculateAverage(this.par5Averages) || 0
    }
  }

  /**
   * Get monthly data formatted for charts
   * @returns {Array} Array of monthly data objects sorted by month
   */
  getMonthlyChartData() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return Object.entries(this.monthlyScores)
      .map(([month, scores]) => ({
        month: monthNames[parseInt(month)],
        avgScore: calculateAverage(scores),
        rounds: scores.length
      }))
      .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month))
  }

  /**
   * Get course breakdown sorted by most played
   * @returns {Array} Array of course objects sorted by round count
   */
  getCourseBreakdown() {
    return Object.entries(this.courseBreakdown)
      .map(([course, rounds]) => ({ course, rounds }))
      .sort((a, b) => b.rounds - a.rounds)
  }

  /**
   * Get scoring distribution data for pie charts
   * @returns {Array} Array of scoring distribution objects with colors
   */
  getScoringDistributionData() {
    const total = this.scoringDistribution.pars + 
                  this.scoringDistribution.bogeys + 
                  this.scoringDistribution.doublePlus

    if (total === 0) return []

    return [
      { 
        name: 'Pars', 
        value: this.scoringDistribution.pars, 
        color: '#10b981' // Green
      },
      { 
        name: 'Bogeys', 
        value: this.scoringDistribution.bogeys, 
        color: '#f59e0b' // Orange
      },
      { 
        name: 'Double+', 
        value: this.scoringDistribution.doublePlus, 
        color: '#ef4444' // Red
      }
    ]
  }

  /**
   * Convert to plain object for JSON serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    const parTypeAverages = this.getParTypeAverages()
    
    return {
      year: this.year,
      rounds: this.rounds,
      avgScore: this.getAverageScore(),
      bestScore: this.getBestScore(),
      worstScore: this.getWorstScore(),
      avgDifferential: this.getAverageDifferential(),
      avgPar3: parTypeAverages.avgPar3,
      avgPar4: parTypeAverages.avgPar4,
      avgPar5: parTypeAverages.avgPar5,
      monthlyData: this.getMonthlyChartData(),
      courseBreakdown: this.getCourseBreakdown(),
      scoringDistribution: this.scoringDistribution,
      scoringDistributionData: this.getScoringDistributionData()
    }
  }

  /**
   * Create Year instance from grouped round data
   * @param {number} year - The year
   * @param {Array} rounds - Array of round data from the database (with round_statistics)
   * @returns {Year} New Year instance
   */
  static fromRounds(year, rounds) {
    const yearInstance = new Year({ year })
    
    rounds.forEach(round => {
      yearInstance.addRound(round)
    })
    
    return yearInstance
  }
}