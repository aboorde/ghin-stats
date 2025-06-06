import { createHolesFromData } from './Hole'

/**
 * Round Model
 * 
 * Represents a golf round from the 'rounds' table in the database.
 * Handles relationships with round_statistics and hole_details tables.
 * All field names match the exact database column names from DATABASE_STRUCTURE.md
 * 
 * @module models/Round
 */
export class Round {
  constructor(data = {}) {
    // Primary key
    this.id = data.id
    
    // User and round identification
    this.user_id = data.user_id
    this.order_number = data.order_number
    this.score_day_order = data.score_day_order
    this.golfer_id = data.golfer_id
    
    // Player info
    this.gender = data.gender
    
    // Round metadata
    this.status = data.status
    this.is_manual = data.is_manual || false
    this.number_of_holes = data.number_of_holes
    this.number_of_played_holes = data.number_of_played_holes
    
    // Course information
    this.facility_name = data.facility_name
    this.course_id = data.course_id
    this.course_name = data.course_name
    this.front9_course_name = data.front9_course_name
    this.back9_course_name = data.back9_course_name
    this.course_display_value = data.course_display_value
    this.ghin_course_name_display = data.ghin_course_name_display
    
    // Scores
    this.adjusted_gross_score = data.adjusted_gross_score
    this.front9_adjusted = data.front9_adjusted
    this.back9_adjusted = data.back9_adjusted
    this.net_score = data.net_score
    
    // Ratings
    this.course_rating = parseFloat(data.course_rating) || 0
    this.slope_rating = parseInt(data.slope_rating) || 0
    this.front9_course_rating = parseFloat(data.front9_course_rating) || 0
    this.back9_course_rating = parseFloat(data.back9_course_rating) || 0
    this.front9_slope_rating = parseFloat(data.front9_slope_rating) || 0
    this.back9_slope_rating = parseFloat(data.back9_slope_rating) || 0
    
    // Tee information
    this.tee_name = data.tee_name
    this.tee_set_id = data.tee_set_id
    this.tee_set_side = data.tee_set_side
    this.front9_tee_name = data.front9_tee_name
    this.back9_tee_name = data.back9_tee_name
    
    // Differentials
    this.differential = parseFloat(data.differential) || 0
    this.unadjusted_differential = parseFloat(data.unadjusted_differential) || 0
    this.scaled_up_differential = parseFloat(data.scaled_up_differential) || 0
    this.adjusted_scaled_up_differential = parseFloat(data.adjusted_scaled_up_differential) || 0
    this.net_score_differential = parseFloat(data.net_score_differential) || 0
    
    // Handicap
    this.course_handicap = data.course_handicap
    
    // Score type
    this.score_type = data.score_type
    this.score_type_display_full = data.score_type_display_full
    this.score_type_display_short = data.score_type_display_short
    
    // Penalties
    this.penalty = parseFloat(data.penalty) || 0
    this.penalty_type = data.penalty_type
    this.penalty_method = data.penalty_method
    
    // Dates
    this.played_at = data.played_at
    this.posted_at = data.posted_at
    this.season_start_date_at = data.season_start_date_at
    this.season_end_date_at = data.season_end_date_at
    
    // Boolean flags
    this.posted_on_home_course = data.posted_on_home_course || false
    this.edited = data.edited || false
    this.used = data.used || false
    this.revision = data.revision || false
    this.exceptional = data.exceptional || false
    this.is_recent = data.is_recent || false
    this.short_course = data.short_course || false
    this.challenge_available = data.challenge_available || false
    
    // Other fields
    this.parent_id = data.parent_id
    this.pcc = parseFloat(data.pcc) || 0
    this.adjustments = data.adjustments || {}
    this.message_club_authorized = data.message_club_authorized
    
    // Timestamps
    this.created_at = data.created_at
    this.updated_at = data.updated_at
    
    // Related data (from joins)
    this.round_statistics = data.round_statistics || []
    this.hole_details = data.hole_details || []
    
    // Create Hole model instances if hole_details provided
    this.holes = createHolesFromData(this.hole_details)
  }
  
  /**
   * Get the primary statistics object
   * @returns {Object|null} Statistics from round_statistics table
   */
  getStatistics() {
    return this.round_statistics?.[0] || null
  }
  
  /**
   * Safe parse function for string statistics
   * @param {string} value - String value from database
   * @returns {number|null} Parsed number or null
   */
  safeParse(value) {
    if (!value) return null
    const parsed = parseFloat(value)
    return isNaN(parsed) ? null : parsed
  }
  
  /**
   * Get total score for front nine
   */
  getFrontNineScore() {
    if (this.front9_adjusted) return this.front9_adjusted
    
    return this.holes
      .filter(hole => hole.isFrontNine())
      .reduce((total, hole) => total + hole.adjustedGrossScore, 0)
  }
  
  /**
   * Get total score for back nine
   */
  getBackNineScore() {
    if (this.back9_adjusted) return this.back9_adjusted
    
    return this.holes
      .filter(hole => hole.isBackNine())
      .reduce((total, hole) => total + hole.adjustedGrossScore, 0)
  }
  
  /**
   * Get par for front nine
   */
  getFrontNinePar() {
    return this.holes
      .filter(hole => hole.isFrontNine())
      .reduce((total, hole) => total + hole.par, 0)
  }
  
  /**
   * Get par for back nine
   */
  getBackNinePar() {
    return this.holes
      .filter(hole => hole.isBackNine())
      .reduce((total, hole) => total + hole.par, 0)
  }
  
  /**
   * Get total par for the round
   */
  getTotalPar() {
    if (this.number_of_holes === 9) return 36
    if (this.number_of_holes === 18) return 72
    return this.holes.reduce((total, hole) => total + hole.par, 0)
  }
  
  /**
   * Get score relative to par
   */
  getScoreToPar() {
    return this.adjusted_gross_score - this.getTotalPar()
  }
  
  /**
   * Count holes by performance type
   */
  getPerformanceCounts() {
    const counts = {
      eagles: 0,
      birdies: 0,
      pars: 0,
      bogeys: 0,
      doubles: 0,
      triples: 0
    }
    
    this.holes.forEach(hole => {
      const toPar = hole.getScoreToPar()
      if (toPar <= -2) counts.eagles++
      else if (toPar === -1) counts.birdies++
      else if (toPar === 0) counts.pars++
      else if (toPar === 1) counts.bogeys++
      else if (toPar === 2) counts.doubles++
      else counts.triples++
    })
    
    return counts
  }
  
  /**
   * Get scoring distribution percentages
   */
  getScoringDistribution() {
    const stats = this.getStatistics()
    if (stats) {
      // Use database statistics if available
      return {
        eaglesPercent: 0, // Not in database
        birdiesPercent: this.safeParse(stats.birdies_or_better_percent) || 0,
        parsPercent: this.safeParse(stats.pars_percent) || 0,
        bogeysPercent: this.safeParse(stats.bogeys_percent) || 0,
        doublesPercent: this.safeParse(stats.double_bogeys_percent) || 0,
        triplesPercent: this.safeParse(stats.triple_bogeys_or_worse_percent) || 0
      }
    }
    
    // Calculate from hole data if no statistics
    const counts = this.getPerformanceCounts()
    const totalHoles = this.holes.length || this.number_of_holes
    
    if (totalHoles === 0) {
      return {
        eaglesPercent: 0,
        birdiesPercent: 0,
        parsPercent: 0,
        bogeysPercent: 0,
        doublesPercent: 0,
        triplesPercent: 0
      }
    }
    
    return {
      eaglesPercent: (counts.eagles / totalHoles) * 100,
      birdiesPercent: (counts.birdies / totalHoles) * 100,
      parsPercent: (counts.pars / totalHoles) * 100,
      bogeysPercent: (counts.bogeys / totalHoles) * 100,
      doublesPercent: (counts.doubles / totalHoles) * 100,
      triplesPercent: (counts.triples / totalHoles) * 100
    }
  }
  
  /**
   * Get average score by par type
   */
  getAveragesByParType() {
    const stats = this.getStatistics()
    if (stats) {
      // Use database statistics if available
      return {
        par3Average: this.safeParse(stats.par3s_average),
        par4Average: this.safeParse(stats.par4s_average),
        par5Average: this.safeParse(stats.par5s_average)
      }
    }
    
    // Calculate from hole data if no statistics
    const par3s = this.holes.filter(h => h.par === 3)
    const par4s = this.holes.filter(h => h.par === 4)
    const par5s = this.holes.filter(h => h.par === 5)
    
    const avgPar3 = par3s.length > 0 
      ? par3s.reduce((sum, h) => sum + h.adjustedGrossScore, 0) / par3s.length 
      : null
      
    const avgPar4 = par4s.length > 0 
      ? par4s.reduce((sum, h) => sum + h.adjustedGrossScore, 0) / par4s.length 
      : null
      
    const avgPar5 = par5s.length > 0 
      ? par5s.reduce((sum, h) => sum + h.adjustedGrossScore, 0) / par5s.length 
      : null
    
    return {
      par3Average: avgPar3,
      par4Average: avgPar4,
      par5Average: avgPar5
    }
  }
  
  /**
   * Get holes sorted by performance (best to worst)
   */
  getHolesByPerformance() {
    return [...this.holes].sort((a, b) => {
      const aScore = a.getScoreToPar()
      const bScore = b.getScoreToPar()
      return aScore - bScore
    })
  }
  
  /**
   * Get best holes (birdies and better)
   */
  getBestHoles() {
    return this.holes.filter(hole => hole.isScoringHole())
  }
  
  /**
   * Get worst holes (double bogey and worse)
   */
  getWorstHoles() {
    return this.holes.filter(hole => hole.isBigNumber())
  }
  
  /**
   * Check if all hole data is available
   */
  hasCompleteHoleData() {
    return this.holes.length === this.number_of_holes
  }
  
  /**
   * Check if this is a tournament round
   */
  isTournamentRound() {
    return this.score_type === 'T'
  }
  
  /**
   * Check if this is a home course round
   */
  isHomeCourse() {
    return this.posted_on_home_course
  }
  
  /**
   * Check if this is used for handicap calculation
   */
  isUsedForHandicap() {
    return this.used
  }
  
  /**
   * Get formatted date string
   */
  getFormattedDate() {
    if (!this.played_at) return ''
    return new Date(this.played_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  /**
   * Get a summary object for display
   */
  getSummary() {
    return {
      id: this.id,
      date: this.played_at,
      course: this.course_name,
      tees: this.tee_name,
      score: this.adjusted_gross_score,
      differential: this.differential,
      toPar: this.getScoreToPar(),
      frontNine: this.getFrontNineScore(),
      backNine: this.getBackNineScore(),
      courseRating: this.course_rating,
      slopeRating: this.slope_rating,
      scoreType: this.score_type,
      used: this.used,
      exceptional: this.exceptional,
      ...this.getPerformanceCounts()
    }
  }
  
  /**
   * Convert to JSON-serializable object
   */
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      golfer_id: this.golfer_id,
      course_name: this.course_name,
      facility_name: this.facility_name,
      played_at: this.played_at,
      adjusted_gross_score: this.adjusted_gross_score,
      differential: this.differential,
      number_of_holes: this.number_of_holes,
      course_rating: this.course_rating,
      slope_rating: this.slope_rating,
      tee_name: this.tee_name,
      score_type: this.score_type,
      used: this.used,
      exceptional: this.exceptional,
      statistics: this.getStatistics(),
      hasHoleData: this.holes.length > 0
    }
  }
}

/**
 * Factory function to create Round instances from database data
 * @param {Object} roundData - Data from rounds table
 * @param {Array} holeDetails - Optional hole_details data
 * @returns {Round} Round instance
 */
export function createRoundFromData(roundData, holeDetails = []) {
  return new Round({
    ...roundData,
    hole_details: holeDetails
  })
}

/**
 * Factory function to create multiple Round instances
 * @param {Array} roundsData - Array of round data from database
 * @returns {Round[]} Array of Round instances
 */
export function createRoundsFromData(roundsData) {
  return roundsData.map(data => createRoundFromData(data))
}