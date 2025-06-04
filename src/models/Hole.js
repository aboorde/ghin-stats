/**
 * Hole model representing a single hole's score and details
 */
export class Hole {
  constructor(data = {}) {
    this.id = data.id
    this.scoreId = data.score_id
    this.userId = data.user_id
    this.holeNumber = data.hole_number
    this.par = data.par
    this.adjustedGrossScore = data.adjusted_gross_score
    this.rawScore = data.raw_score || data.adjusted_gross_score
    this.strokeAllocation = data.stroke_allocation
  }
  
  /**
   * Get score relative to par
   */
  getScoreToPar() {
    return this.adjustedGrossScore - this.par
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
    
    if (perf.name === 'eagle') return `${this.adjustedGrossScore} (Eagle)`
    if (perf.name === 'birdie') return `${this.adjustedGrossScore} (Birdie)`
    if (perf.name === 'par') return `${this.adjustedGrossScore} (Par)`
    if (perf.name === 'bogey') return `${this.adjustedGrossScore} (Bogey)`
    if (perf.name === 'double') return `${this.adjustedGrossScore} (Double)`
    return `${this.adjustedGrossScore} (+${toPar})`
  }
  
  /**
   * Check if this is a front nine hole
   */
  isFrontNine() {
    return this.holeNumber <= 9
  }
  
  /**
   * Check if this is a back nine hole
   */
  isBackNine() {
    return this.holeNumber > 9
  }
}

/**
 * Create Hole instances from array of raw data
 */
export const createHolesFromData = (dataArray = []) => {
  return dataArray.map(data => new Hole(data))
}

/**
 * Pine Valley specific hole data
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