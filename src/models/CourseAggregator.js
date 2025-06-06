/**
 * CourseAggregator Model
 * 
 * Aggregates golf round data by course from database tables.
 * This class is responsible for grouping and calculating statistics
 * based on the database structure defined in DATABASE_STRUCTURE.md
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
 *   - net_score: Net score after handicap (integer)
 *   - course_handicap: Course handicap for round (integer)
 * 
 * From 'round_statistics' table (joined via round_id):
 *   - par3s_average: Average score on par 3s (character varying)
 *   - par4s_average: Average score on par 4s (character varying)
 *   - par5s_average: Average score on par 5s (character varying)
 *   - birdies_or_better_percent: Percentage as string
 *   - pars_percent: Percentage as string
 *   - bogeys_percent: Percentage as string
 *   - double_bogeys_percent: Percentage as string
 *   - triple_bogeys_or_worse_percent: Percentage as string
 *   - putts_total: Total putts (character varying)
 *   - fairway_hits_percent: Fairway accuracy (character varying)
 *   - gir_percent: Greens in regulation (character varying)
 * 
 * From 'hole_details' table (via round_id):
 *   - hole_number: Hole number 1-18 (integer)
 *   - par: Par for the hole (integer)
 *   - adjusted_gross_score: Score on the hole (integer)
 *   - putts: Number of putts (integer)
 *   - fairway_hit: Hit fairway (boolean)
 *   - gir_flag: Green in regulation (boolean)
 * 
 * @module models/CourseAggregator
 */

/**
 * CourseAggregator - Groups and aggregates round data by course
 * @class CourseAggregator
 */
export class CourseAggregator {
  constructor() {
    // Map to store aggregated data by course
    this.courseMap = new Map()
  }

  /**
   * Parse string value to number with validation
   * Handles database character varying fields
   * 
   * @param {any} value - Value to parse
   * @param {boolean} isPercent - Whether to normalize percentage
   * @returns {number|null} Parsed number or null
   */
  parseValue(value, isPercent = false) {
    if (value === null || value === undefined || value === '' || value === 'null') {
      return null
    }
    
    const cleanValue = String(value).replace('%', '').trim()
    const parsed = parseFloat(cleanValue)
    
    if (isNaN(parsed) || !isFinite(parsed)) {
      return null
    }
    
    // Normalize percentages to 0-100 range
    if (isPercent && parsed > 0 && parsed < 1) {
      return parsed * 100
    }
    
    return parsed
  }

  /**
   * Add rounds to the aggregator
   * @param {Array} rounds - Array of round records from database
   */
  addRounds(rounds) {
    if (!Array.isArray(rounds)) return

    rounds.forEach(round => this.addRound(round))
  }

  /**
   * Add a single round to aggregation
   * @param {Object} round - Round record from database
   */
  addRound(round) {
    if (!round || !round.course_name) return

    const courseName = round.course_name
    
    // Initialize course data if not exists
    if (!this.courseMap.has(courseName)) {
      this.courseMap.set(courseName, {
        // Basic course info from first round
        courseName: courseName,
        courseRating: round.course_rating,
        slopeRating: round.slope_rating,
        teeNames: new Set(),
        
        // Round collections by type
        rounds18: [],
        rounds9: [],
        
        // Statistics arrays for 18-hole rounds
        par3Averages: [],
        par4Averages: [],
        par5Averages: [],
        birdiePercentages: [],
        parPercentages: [],
        bogeyPercentages: [],
        doubleBogeyPercentages: [],
        tripleBogeyPercentages: [],
        
        // Additional statistics
        puttsTotals: [],
        fairwayHitPercentages: [],
        girPercentages: [],
        
        // Hole details for course
        holeDetails: new Map() // Map<holeNumber, Array<holeData>>
      })
    }

    const courseData = this.courseMap.get(courseName)
    
    // Track tee names
    if (round.tee_name) {
      courseData.teeNames.add(round.tee_name)
    }

    // Categorize by round type
    if (round.number_of_holes === 18) {
      courseData.rounds18.push({
        id: round.id,
        adjustedGrossScore: round.adjusted_gross_score,
        differential: round.differential,
        playedAt: round.played_at,
        netScore: round.net_score,
        courseHandicap: round.course_handicap
      })

      // Process statistics if available (18-hole rounds only)
      if (round.round_statistics?.[0]) {
        const stats = round.round_statistics[0]
        
        // Par averages
        const par3Avg = this.parseValue(stats.par3s_average)
        const par4Avg = this.parseValue(stats.par4s_average)
        const par5Avg = this.parseValue(stats.par5s_average)
        
        if (par3Avg !== null && par3Avg > 0 && par3Avg <= 10) {
          courseData.par3Averages.push(par3Avg)
        }
        if (par4Avg !== null && par4Avg > 0 && par4Avg <= 10) {
          courseData.par4Averages.push(par4Avg)
        }
        if (par5Avg !== null && par5Avg > 0 && par5Avg <= 10) {
          courseData.par5Averages.push(par5Avg)
        }
        
        // Scoring percentages
        const birdiePercent = this.parseValue(stats.birdies_or_better_percent, true)
        const parPercent = this.parseValue(stats.pars_percent, true)
        const bogeyPercent = this.parseValue(stats.bogeys_percent, true)
        const doubleBogeyPercent = this.parseValue(stats.double_bogeys_percent, true)
        const tripleBogeyPercent = this.parseValue(stats.triple_bogeys_or_worse_percent, true)
        
        if (birdiePercent !== null && birdiePercent >= 0 && birdiePercent <= 100) {
          courseData.birdiePercentages.push(birdiePercent)
        }
        if (parPercent !== null && parPercent >= 0 && parPercent <= 100) {
          courseData.parPercentages.push(parPercent)
        }
        if (bogeyPercent !== null && bogeyPercent >= 0 && bogeyPercent <= 100) {
          courseData.bogeyPercentages.push(bogeyPercent)
        }
        if (doubleBogeyPercent !== null && doubleBogeyPercent >= 0 && doubleBogeyPercent <= 100) {
          courseData.doubleBogeyPercentages.push(doubleBogeyPercent)
        }
        if (tripleBogeyPercent !== null && tripleBogeyPercent >= 0 && tripleBogeyPercent <= 100) {
          courseData.tripleBogeyPercentages.push(tripleBogeyPercent)
        }
        
        // Additional statistics
        const puttsTotal = this.parseValue(stats.putts_total)
        const fairwayHitPercent = this.parseValue(stats.fairway_hits_percent, true)
        const girPercent = this.parseValue(stats.gir_percent, true)
        
        if (puttsTotal !== null && puttsTotal > 0 && puttsTotal <= 72) {
          courseData.puttsTotals.push(puttsTotal)
        }
        if (fairwayHitPercent !== null && fairwayHitPercent >= 0 && fairwayHitPercent <= 100) {
          courseData.fairwayHitPercentages.push(fairwayHitPercent)
        }
        if (girPercent !== null && girPercent >= 0 && girPercent <= 100) {
          courseData.girPercentages.push(girPercent)
        }
      }
    } else if (round.number_of_holes === 9) {
      courseData.rounds9.push({
        id: round.id,
        adjustedGrossScore: round.adjusted_gross_score,
        differential: round.differential,
        playedAt: round.played_at,
        netScore: round.net_score,
        courseHandicap: round.course_handicap
      })
    }
  }

  /**
   * Add hole details for a course
   * @param {string} courseName - Name of the course
   * @param {Array} holeDetails - Array of hole detail records
   */
  addHoleDetails(courseName, holeDetails) {
    if (!this.courseMap.has(courseName) || !Array.isArray(holeDetails)) return

    const courseData = this.courseMap.get(courseName)
    
    holeDetails.forEach(hole => {
      const holeNumber = hole.hole_number
      if (!holeNumber) return

      if (!courseData.holeDetails.has(holeNumber)) {
        courseData.holeDetails.set(holeNumber, [])
      }

      courseData.holeDetails.get(holeNumber).push({
        roundId: hole.round_id,
        par: hole.par,
        adjustedGrossScore: hole.adjusted_gross_score,
        putts: hole.putts,
        fairwayHit: hole.fairway_hit,
        girFlag: hole.gir_flag
      })
    })
  }

  /**
   * Calculate average from array of numbers
   * @param {Array<number>} values - Array of numbers
   * @returns {number|null} Average or null if empty
   */
  calculateAverage(values) {
    if (!values || values.length === 0) return null
    const sum = values.reduce((a, b) => a + b, 0)
    return sum / values.length
  }

  /**
   * Get aggregated statistics for a specific course
   * @param {string} courseName - Name of the course
   * @returns {Object|null} Aggregated course statistics
   */
  getCourseStatistics(courseName) {
    if (!this.courseMap.has(courseName)) return null

    const data = this.courseMap.get(courseName)
    
    // Calculate basic statistics
    const rounds18Count = data.rounds18.length
    const rounds9Count = data.rounds9.length
    const totalRounds = rounds18Count + rounds9Count

    // 18-hole statistics
    const scores18 = data.rounds18.map(r => r.adjustedGrossScore)
    const differentials18 = data.rounds18.map(r => r.differential)
    const avgScore18 = this.calculateAverage(scores18)
    const avgDifferential18 = this.calculateAverage(differentials18)
    const bestScore18 = scores18.length > 0 ? Math.min(...scores18) : null
    const worstScore18 = scores18.length > 0 ? Math.max(...scores18) : null

    // 9-hole statistics
    const scores9 = data.rounds9.map(r => r.adjustedGrossScore)
    const differentials9 = data.rounds9.map(r => r.differential)
    const avgScore9 = this.calculateAverage(scores9)
    const avgDifferential9 = this.calculateAverage(differentials9)
    const bestScore9 = scores9.length > 0 ? Math.min(...scores9) : null
    const worstScore9 = scores9.length > 0 ? Math.max(...scores9) : null

    // Par type performance
    const avgPar3 = this.calculateAverage(data.par3Averages)
    const avgPar4 = this.calculateAverage(data.par4Averages)
    const avgPar5 = this.calculateAverage(data.par5Averages)

    // Scoring distribution
    const birdiePercent = this.calculateAverage(data.birdiePercentages)
    const parPercent = this.calculateAverage(data.parPercentages)
    const bogeyPercent = this.calculateAverage(data.bogeyPercentages)
    const doubleBogeyPercent = this.calculateAverage(data.doubleBogeyPercentages)
    const tripleBogeyPercent = this.calculateAverage(data.tripleBogeyPercentages)

    // Additional statistics
    const avgPutts = this.calculateAverage(data.puttsTotals)
    const avgFairwayHitPercent = this.calculateAverage(data.fairwayHitPercentages)
    const avgGirPercent = this.calculateAverage(data.girPercentages)

    // Hole averages
    const holeAverages = this.calculateHoleAverages(data.holeDetails)

    return {
      // Basic info
      courseName: data.courseName,
      courseRating: data.courseRating,
      slopeRating: data.slopeRating,
      teeNames: Array.from(data.teeNames),
      
      // Round counts
      totalRounds,
      rounds18: rounds18Count,
      rounds9: rounds9Count,
      
      // 18-hole statistics
      avgScore18,
      avgDifferential18,
      bestScore18,
      worstScore18,
      
      // 9-hole statistics
      avgScore9,
      avgDifferential9,
      bestScore9,
      worstScore9,
      
      // Par type performance
      avgPar3,
      avgPar4,
      avgPar5,
      par3VsPar: avgPar3 ? avgPar3 - 3 : null,
      par4VsPar: avgPar4 ? avgPar4 - 4 : null,
      par5VsPar: avgPar5 ? avgPar5 - 5 : null,
      
      // Scoring distribution
      birdiePercent,
      parPercent,
      bogeyPercent,
      doubleBogeyPercent,
      tripleBogeyPercent,
      doublePlusPercent: (doubleBogeyPercent || 0) + (tripleBogeyPercent || 0),
      
      // Additional statistics
      avgPutts,
      avgFairwayHitPercent,
      avgGirPercent,
      
      // Hole performance
      holeAverages,
      
      // Raw data for detailed analysis
      rounds18Data: data.rounds18,
      rounds9Data: data.rounds9
    }
  }

  /**
   * Calculate hole-by-hole averages
   * @param {Map} holeDetails - Map of hole numbers to hole data arrays
   * @returns {Array} Array of hole averages
   */
  calculateHoleAverages(holeDetails) {
    const averages = []
    
    for (let hole = 1; hole <= 18; hole++) {
      if (holeDetails.has(hole)) {
        const holeData = holeDetails.get(hole)
        const scores = holeData.map(h => h.adjustedGrossScore).filter(s => s !== null)
        const pars = holeData.map(h => h.par).filter(p => p !== null)
        
        if (scores.length > 0 && pars.length > 0) {
          const avgScore = this.calculateAverage(scores)
          const par = pars[0] // Par should be consistent for the hole
          
          averages.push({
            hole,
            par,
            avgScore,
            overUnderPar: avgScore - par,
            roundsPlayed: scores.length,
            bestScore: Math.min(...scores),
            worstScore: Math.max(...scores)
          })
        }
      }
    }
    
    return averages
  }

  /**
   * Get all aggregated courses
   * @returns {Array} Array of aggregated course statistics
   */
  getAllCourses() {
    const courses = []
    
    for (const [courseName] of this.courseMap) {
      const stats = this.getCourseStatistics(courseName)
      if (stats) {
        courses.push(stats)
      }
    }
    
    // Sort by total rounds (most played first)
    return courses.sort((a, b) => b.totalRounds - a.totalRounds)
  }

  /**
   * Clear all aggregated data
   */
  clear() {
    this.courseMap.clear()
  }

  /**
   * Get summary statistics across all courses
   * @returns {Object} Summary statistics
   */
  getSummary() {
    const allCourses = this.getAllCourses()
    
    return {
      totalCourses: allCourses.length,
      totalRounds: allCourses.reduce((sum, c) => sum + c.totalRounds, 0),
      total18HoleRounds: allCourses.reduce((sum, c) => sum + c.rounds18, 0),
      total9HoleRounds: allCourses.reduce((sum, c) => sum + c.rounds9, 0),
      mostPlayedCourse: allCourses[0] || null,
      leastPlayedCourse: allCourses[allCourses.length - 1] || null
    }
  }
}

/**
 * Factory function to create and populate a CourseAggregator
 * @param {Array} rounds - Array of round records from database
 * @param {Array} holeDetails - Optional array of hole details
 * @returns {CourseAggregator} Populated aggregator instance
 */
export function createCourseAggregator(rounds, holeDetails = null) {
  const aggregator = new CourseAggregator()
  
  // Add rounds
  aggregator.addRounds(rounds)
  
  // Add hole details if provided
  if (holeDetails && Array.isArray(holeDetails)) {
    // Group hole details by course
    const holeDetailsByCourse = {}
    
    holeDetails.forEach(detail => {
      // Need to match hole details to courses via round_id
      const round = rounds.find(r => r.id === detail.round_id)
      if (round && round.course_name) {
        if (!holeDetailsByCourse[round.course_name]) {
          holeDetailsByCourse[round.course_name] = []
        }
        holeDetailsByCourse[round.course_name].push(detail)
      }
    })
    
    // Add hole details for each course
    Object.entries(holeDetailsByCourse).forEach(([courseName, details]) => {
      aggregator.addHoleDetails(courseName, details)
    })
  }
  
  return aggregator
}