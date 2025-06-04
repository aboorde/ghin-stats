/**
 * Score model representing a golf round score
 */
export class Score {
  constructor(data = {}) {
    this.id = data.id
    this.golferId = data.golfer_id
    this.userId = data.user_id
    this.playedAt = data.played_at ? new Date(data.played_at) : null
    this.adjustedGrossScore = data.adjusted_gross_score
    this.differential = data.differential
    this.courseName = data.course_name
    this.teeName = data.tee_name
    this.courseRating = data.course_rating
    this.slopeRating = data.slope_rating
    this.numberOfHoles = data.number_of_holes || 18
    this.pcc = data.pcc || 0
    
    // Related data
    this.statistics = data.statistics || null
    this.holeDetails = data.hole_details || []
    this.adjustments = data.adjustments || []
  }
  
  /**
   * Get the performance level and color for this score
   */
  getPerformanceLevel() {
    if (this.numberOfHoles === 9) {
      if (this.adjustedGrossScore < 52) return { color: 'text-green-400 font-bold', level: 'excellent' }
      if (this.adjustedGrossScore < 55) return { color: 'text-yellow-400', level: 'good' }
      if (this.adjustedGrossScore < 57) return { color: 'text-orange-400', level: 'average' }
      return { color: 'text-red-400', level: 'poor' }
    }
    
    // 18 holes
    if (this.adjustedGrossScore < 105) return { color: 'text-green-400 font-bold', level: 'excellent' }
    if (this.adjustedGrossScore < 110) return { color: 'text-yellow-400', level: 'good' }
    if (this.adjustedGrossScore < 115) return { color: 'text-orange-400', level: 'average' }
    return { color: 'text-red-400', level: 'poor' }
  }
  
  /**
   * Get the color for the differential
   */
  getDifferentialColor() {
    if (this.differential < 35.0) return 'text-green-400'
    if (this.differential < 38.0) return 'text-yellow-400'
    if (this.differential < 40.0) return 'text-orange-400'
    return 'text-red-400'
  }
  
  /**
   * Get score relative to par
   */
  getScoreToPar() {
    const par = this.numberOfHoles === 9 ? 36 : 72
    return this.adjustedGrossScore - par
  }
  
  /**
   * Get formatted score to par string
   */
  getFormattedScoreToPar() {
    const toPar = this.getScoreToPar()
    if (toPar === 0) return 'E'
    if (toPar > 0) return `+${toPar}`
    return toPar.toString()
  }
  
  /**
   * Check if this is a complete round
   */
  isComplete() {
    return this.numberOfHoles === 18
  }
  
  /**
   * Get month/year key for grouping
   */
  getMonthYearKey() {
    if (!this.playedAt) return null
    const month = this.playedAt.getMonth() + 1
    const year = this.playedAt.getFullYear()
    return `${year}-${month.toString().padStart(2, '0')}`
  }
  
  /**
   * Get year for grouping
   */
  getYear() {
    return this.playedAt ? this.playedAt.getFullYear() : null
  }
}

/**
 * Create Score instances from array of raw data
 */
export const createScoresFromData = (dataArray = []) => {
  return dataArray.map(data => new Score(data))
}