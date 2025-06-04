import { Score } from './Score'
import { createHolesFromData } from './Hole'

/**
 * Round model representing a complete golf round with all related data
 */
export class Round {
  constructor(scoreData = {}, holeDetails = []) {
    this.score = new Score(scoreData)
    this.holes = createHolesFromData(holeDetails)
    this.statistics = scoreData.statistics || null
  }
  
  /**
   * Get total score for front nine
   */
  getFrontNineScore() {
    return this.holes
      .filter(hole => hole.isFrontNine())
      .reduce((total, hole) => total + hole.adjustedGrossScore, 0)
  }
  
  /**
   * Get total score for back nine
   */
  getBackNineScore() {
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
    const counts = this.getPerformanceCounts()
    const totalHoles = this.holes.length
    
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
    return this.holes.length === this.score.numberOfHoles
  }
  
  /**
   * Get a summary object for display
   */
  getSummary() {
    return {
      date: this.score.playedAt,
      course: this.score.courseName,
      tees: this.score.teeName,
      score: this.score.adjustedGrossScore,
      differential: this.score.differential,
      toPar: this.score.getScoreToPar(),
      frontNine: this.getFrontNineScore(),
      backNine: this.getBackNineScore(),
      ...this.getPerformanceCounts()
    }
  }
}