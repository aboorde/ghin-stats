/**
 * Score Model (Legacy Compatibility)
 * 
 * This model is DEPRECATED. The database uses 'rounds' table, not 'scores'.
 * This file exists only for backward compatibility.
 * New code should use Round model directly.
 * 
 * @deprecated Use Round model instead
 * @module models/Score
 */

import { Round } from './Round'

/**
 * Score class - deprecated alias for Round
 * @deprecated Use Round class instead
 */
export class Score extends Round {
  constructor(data = {}) {
    // Map old Score property names to Round property names
    const mappedData = {
      ...data,
      // Map camelCase to snake_case for backward compatibility
      golfer_id: data.golfer_id || data.golferId,
      user_id: data.user_id || data.userId,
      played_at: data.played_at || data.playedAt,
      adjusted_gross_score: data.adjusted_gross_score || data.adjustedGrossScore,
      course_name: data.course_name || data.courseName,
      tee_name: data.tee_name || data.teeName,
      course_rating: data.course_rating || data.courseRating,
      slope_rating: data.slope_rating || data.slopeRating,
      number_of_holes: data.number_of_holes || data.numberOfHoles || 18,
      hole_details: data.hole_details || data.holeDetails || []
    }
    
    super(mappedData)
    
    // Add legacy property aliases for backward compatibility
    Object.defineProperty(this, 'golferId', { get: () => this.golfer_id })
    Object.defineProperty(this, 'userId', { get: () => this.user_id })
    Object.defineProperty(this, 'playedAt', { get: () => this.played_at })
    Object.defineProperty(this, 'adjustedGrossScore', { get: () => this.adjusted_gross_score })
    Object.defineProperty(this, 'courseName', { get: () => this.course_name })
    Object.defineProperty(this, 'teeName', { get: () => this.tee_name })
    Object.defineProperty(this, 'courseRating', { get: () => this.course_rating })
    Object.defineProperty(this, 'slopeRating', { get: () => this.slope_rating })
    Object.defineProperty(this, 'numberOfHoles', { get: () => this.number_of_holes })
    Object.defineProperty(this, 'holeDetails', { get: () => this.hole_details })
    Object.defineProperty(this, 'statistics', { get: () => this.round_statistics })
  }
  
  /**
   * Legacy method - Get month/year key for grouping
   * @deprecated Use Round methods instead
   */
  getMonthYearKey() {
    if (!this.played_at) return null
    const date = new Date(this.played_at)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${year}-${month.toString().padStart(2, '0')}`
  }
  
  /**
   * Legacy method - Get year for grouping
   * @deprecated Use Round methods instead
   */
  getYear() {
    return this.played_at ? new Date(this.played_at).getFullYear() : null
  }
  
  /**
   * Legacy method - Check if this is a complete round
   * @deprecated Use Round methods instead
   */
  isComplete() {
    return this.number_of_holes === 18
  }
  
  /**
   * Legacy method - Get formatted score to par string
   * @deprecated Use Round methods instead
   */
  getFormattedScoreToPar() {
    const toPar = this.getScoreToPar()
    if (toPar === 0) return 'E'
    if (toPar > 0) return `+${toPar}`
    return toPar.toString()
  }
  
  /**
   * Legacy method - Get the performance level and color for this score
   * @deprecated Use Round methods instead
   */
  getPerformanceLevel() {
    if (this.number_of_holes === 9) {
      if (this.adjusted_gross_score < 52) return { color: 'text-green-400 font-bold', level: 'excellent' }
      if (this.adjusted_gross_score < 55) return { color: 'text-yellow-400', level: 'good' }
      if (this.adjusted_gross_score < 57) return { color: 'text-orange-400', level: 'average' }
      return { color: 'text-red-400', level: 'poor' }
    }
    
    // 18 holes
    if (this.adjusted_gross_score < 105) return { color: 'text-green-400 font-bold', level: 'excellent' }
    if (this.adjusted_gross_score < 110) return { color: 'text-yellow-400', level: 'good' }
    if (this.adjusted_gross_score < 115) return { color: 'text-orange-400', level: 'average' }
    return { color: 'text-red-400', level: 'poor' }
  }
  
  /**
   * Legacy method - Get the color for the differential
   * @deprecated Use Round methods instead
   */
  getDifferentialColor() {
    if (this.differential < 35.0) return 'text-green-400'
    if (this.differential < 38.0) return 'text-yellow-400'
    if (this.differential < 40.0) return 'text-orange-400'
    return 'text-red-400'
  }
}

/**
 * Create Score instances from array of raw data
 * @deprecated Use createRoundsFromData instead
 */
export const createScoresFromData = (dataArray = []) => {
  console.warn('createScoresFromData is deprecated. Use createRoundsFromData from Round model instead.')
  return dataArray.map(data => new Score(data))
}