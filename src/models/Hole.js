/**
 * Hole Model
 * 
 * Represents a single hole's score and details from the 'hole_details' table.
 * All field names match the exact database column names from DATABASE_STRUCTURE.md
 * 
 * @module models/Hole
 */
export class Hole {
  constructor(data = {}) {
    // Primary key and foreign keys
    this.id = data.id
    this.round_id = data.round_id  // Foreign key to rounds table (not score_id)
    this.user_id = data.user_id
    
    // Hole information
    this.hole_number = data.hole_number
    this.par = data.par
    this.stroke_allocation = data.stroke_allocation
    
    // Scores
    this.adjusted_gross_score = data.adjusted_gross_score
    this.raw_score = data.raw_score || data.adjusted_gross_score
    this.most_likely_score = data.most_likely_score
    
    // Additional tracking
    this.putts = data.putts
    this.fairway_hit = data.fairway_hit
    this.gir_flag = data.gir_flag  // Green in regulation
    this.drive_accuracy = data.drive_accuracy
    this.approach_shot_accuracy = data.approach_shot_accuracy
    this.x_hole = data.x_hole
    
    // Timestamps
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }
  
  /**
   * Get score relative to par
   */
  getScoreToPar() {
    return this.adjusted_gross_score - this.par
  }
  
  /**
   * Get the performance level for this hole
   */
  getPerformanceLevel() {
    const toPar = this.getScoreToPar()
    
    if (toPar <= -2) return { name: 'eagle', color: 'bg-purple-600 text-white font-bold' }
    if (toPar === -1) return { name: 'birdie', color: 'bg-blue-600 text-white font-bold' }
    if (toPar === 0) return { name: 'par', color: 'bg-green-600 text-white' }
    if (toPar === 1) return { name: 'bogey', color: 'bg-yellow-500 text-white' }
    if (toPar === 2) return { name: 'double', color: 'bg-orange-500 text-white' }
    return { name: 'triple+', color: 'bg-red-600 text-white' }
  }
  
  /**
   * Get background color for score display
   */
  getScoreBackgroundColor() {
    const perf = this.getPerformanceLevel()
    return perf.color
  }
  
  /**
   * Check if this is a scoring hole (birdie or better)
   */
  isScoringHole() {
    return this.getScoreToPar() < 0
  }
  
  /**
   * Check if this is a big number (double bogey or worse)
   */
  isBigNumber() {
    return this.getScoreToPar() >= 2
  }
  
  /**
   * Get formatted score string
   */
  getFormattedScore() {
    const toPar = this.getScoreToPar()
    const perf = this.getPerformanceLevel()
    
    if (perf.name === 'eagle') return `${this.adjusted_gross_score} (Eagle)`
    if (perf.name === 'birdie') return `${this.adjusted_gross_score} (Birdie)`
    if (perf.name === 'par') return `${this.adjusted_gross_score} (Par)`
    if (perf.name === 'bogey') return `${this.adjusted_gross_score} (Bogey)`
    if (perf.name === 'double') return `${this.adjusted_gross_score} (Double)`
    return `${this.adjusted_gross_score} (+${toPar})`
  }
  
  /**
   * Check if this is a front nine hole
   */
  isFrontNine() {
    return this.hole_number <= 9
  }
  
  /**
   * Check if this is a back nine hole
   */
  isBackNine() {
    return this.hole_number > 9
  }
  
  /**
   * Check if fairway was hit (for driving holes)
   */
  didHitFairway() {
    return this.fairway_hit === true
  }
  
  /**
   * Check if green was hit in regulation
   */
  didHitGIR() {
    return this.gir_flag === true
  }
  
  /**
   * Check if this was an X-hole (picked up)
   */
  isXHole() {
    return this.x_hole === true
  }
  
  /**
   * Get putting performance
   */
  getPuttingPerformance() {
    if (!this.putts) return null
    
    // Standard putts for GIR
    const standardPutts = 2
    
    if (this.didHitGIR()) {
      if (this.putts < standardPutts) return 'one-putt'
      if (this.putts === standardPutts) return 'two-putt'
      return 'three-putt-plus'
    }
    
    // Not GIR - check for up and down
    if (this.getScoreToPar() <= 0 && this.putts === 1) {
      return 'up-and-down'
    }
    
    return null
  }
  
  /**
   * Convert to JSON-serializable object
   */
  toJSON() {
    return {
      id: this.id,
      round_id: this.round_id,
      hole_number: this.hole_number,
      par: this.par,
      adjusted_gross_score: this.adjusted_gross_score,
      raw_score: this.raw_score,
      stroke_allocation: this.stroke_allocation,
      putts: this.putts,
      fairway_hit: this.fairway_hit,
      gir_flag: this.gir_flag,
      x_hole: this.x_hole,
      score_to_par: this.getScoreToPar(),
      performance: this.getPerformanceLevel().name
    }
  }
}

/**
 * Create Hole instances from array of raw data
 * @param {Array} dataArray - Array of hole data from hole_details table
 * @returns {Hole[]} Array of Hole instances
 */
export const createHolesFromData = (dataArray = []) => {
  return dataArray.map(data => new Hole(data))
}

/**
 * Pine Valley specific hole data
 * Used for Pine Valley analysis feature
 */
export const PINE_VALLEY_HOLES = {
  1: { par: 4, yards: 331, handicap: 11 },
  2: { par: 5, yards: 487, handicap: 17 },
  3: { par: 4, yards: 335, handicap: 3 },
  4: { par: 3, yards: 129, handicap: 13 },
  5: { par: 4, yards: 379, handicap: 1 },
  6: { par: 4, yards: 376, handicap: 7 },
  7: { par: 3, yards: 142, handicap: 15 },
  8: { par: 5, yards: 456, handicap: 5 },
  9: { par: 4, yards: 291, handicap: 9 },
  10: { par: 5, yards: 447, handicap: 18 },
  11: { par: 4, yards: 356, handicap: 10 },
  12: { par: 3, yards: 191, handicap: 8 },
  13: { par: 4, yards: 358, handicap: 4 },
  14: { par: 5, yards: 466, handicap: 16 },
  15: { par: 4, yards: 388, handicap: 2 },
  16: { par: 4, yards: 330, handicap: 12 },
  17: { par: 3, yards: 168, handicap: 14 },
  18: { par: 4, yards: 367, handicap: 6 }
}