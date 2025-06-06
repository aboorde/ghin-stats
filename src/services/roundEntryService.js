/**
 * Round Entry Service
 * 
 * Service for saving golf rounds to Supabase database.
 * Handles creation of rounds, hole_details, and round_statistics.
 * 
 * Data flow:
 * 1. Create round record in 'rounds' table
 * 2. Create hole_details records for each hole
 * 3. Create round_statistics record with calculated stats
 */

import { supabase } from '../lib/supabase'

/**
 * Save a complete round with hole details and statistics
 * @param {Object} params - Round data
 * @param {Object} params.courseData - Course information
 * @param {Array} params.holesData - Array of hole data
 * @param {Object} params.statistics - Calculated statistics
 * @returns {Object} Result with success status and round ID
 */
export const saveRound = async ({ courseData, holesData, statistics }) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Start a transaction-like operation
    // Note: Supabase doesn't have true transactions in the client SDK, 
    // so we'll handle errors and cleanup manually

    // 1. Create the round record
    const roundData = {
      user_id: user.id,
      course_name: courseData.course_name,
      facility_name: courseData.facility_name || courseData.course_name,
      course_rating: courseData.course_rating,
      slope_rating: courseData.slope_rating,
      tee_name: courseData.tee_name,
      played_at: courseData.played_at,
      number_of_holes: courseData.number_of_holes || 18,
      number_of_played_holes: courseData.number_of_holes || 18,
      adjusted_gross_score: statistics.totalScore,
      differential: statistics.differential,
      
      // Front/Back 9 scores
      front9_adjusted: statistics.front9Score,
      back9_adjusted: statistics.back9Score,
      
      // Additional fields
      is_manual: true, // This is a manually entered round
      status: 'posted',
      score_type: 'adjusted_gross',
      used: true,
      posted_at: new Date().toISOString()
    }

    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert(roundData)
      .select()
      .single()

    if (roundError) {
      console.error('Error creating round:', roundError)
      throw new Error('Failed to create round')
    }

    // 2. Create hole details
    const holeDetails = holesData.map(hole => ({
      round_id: round.id,
      user_id: user.id,
      hole_number: hole.hole_number,
      par: hole.par,
      stroke_allocation: hole.stroke_allocation || hole.hole_number,
      adjusted_gross_score: hole.adjusted_gross_score,
      raw_score: hole.adjusted_gross_score, // Same as adjusted for manual entry
      putts: hole.putts || 0,
      fairway_hit: hole.fairway_hit || false,
      gir_flag: hole.gir_flag || false,
      drive_accuracy: hole.drive_accuracy || null
    }))

    const { error: holeError } = await supabase
      .from('hole_details')
      .insert(holeDetails)

    if (holeError) {
      console.error('Error creating hole details:', holeError)
      // Try to clean up the round
      await supabase.from('rounds').delete().eq('id', round.id)
      throw new Error('Failed to create hole details')
    }

    // 3. Create round statistics
    const roundStats = {
      round_id: round.id,
      user_id: user.id,
      
      // Putting stats
      putts_total: statistics.totalPutts.toString(),
      one_putt_or_better_percent: ((statistics.onePutts / statistics.totalHoles) * 100).toFixed(2),
      three_putt_or_worse_percent: ((statistics.threePutts / statistics.totalHoles) * 100).toFixed(2),
      
      // Par averages
      par3s_average: statistics.par3Avg.toFixed(2),
      par4s_average: statistics.par4Avg.toFixed(2),
      par5s_average: statistics.par5Avg.toFixed(2),
      
      // Scoring percentages (stored as decimals, e.g., 0.11 = 11%)
      pars_percent: (statistics.pars / statistics.totalHoles).toFixed(2),
      birdies_or_better_percent: ((statistics.eagles + statistics.birdies) / statistics.totalHoles).toFixed(2),
      bogeys_percent: (statistics.bogeys / statistics.totalHoles).toFixed(2),
      double_bogeys_percent: (statistics.doubleBogeys / statistics.totalHoles).toFixed(2),
      triple_bogeys_or_worse_percent: (statistics.triplePlus / statistics.totalHoles).toFixed(2),
      
      // Fairways and greens
      fairway_hits_percent: statistics.possibleFairways > 0 
        ? ((statistics.fairwaysHit / statistics.possibleFairways) * 100).toFixed(2)
        : '0',
      gir_percent: ((statistics.greensHit / statistics.totalHoles) * 100).toFixed(2),
      
      // Update metadata
      last_stats_update_date: new Date().toISOString(),
      last_stats_update_type: 'manual_entry'
    }

    const { error: statsError } = await supabase
      .from('round_statistics')
      .insert(roundStats)

    if (statsError) {
      console.error('Error creating round statistics:', statsError)
      // Note: We don't delete the round here as it's still valid without stats
    }

    return {
      success: true,
      roundId: round.id,
      message: 'Round saved successfully'
    }

  } catch (error) {
    console.error('Error saving round:', error)
    return {
      success: false,
      error: error.message || 'Failed to save round'
    }
  }
}

/**
 * Get recent courses for autocomplete
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of courses to return
 * @returns {Array} Array of unique courses with ratings
 */
export const getRecentCourses = async (userId, limit = 20) => {
  try {
    const { data: rounds, error } = await supabase
      .from('rounds')
      .select('course_name, course_rating, slope_rating, tee_name')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit * 2) // Get more to ensure uniqueness

    if (error) throw error

    // Get unique courses with their most recent ratings
    const courseMap = new Map()
    rounds.forEach(round => {
      const key = `${round.course_name}-${round.tee_name}`
      if (!courseMap.has(key)) {
        courseMap.set(key, {
          name: round.course_name,
          rating: round.course_rating,
          slope: round.slope_rating,
          tee: round.tee_name
        })
      }
    })

    return Array.from(courseMap.values()).slice(0, limit)
  } catch (error) {
    console.error('Error fetching recent courses:', error)
    return []
  }
}

/**
 * Validate round data before submission
 * @param {Object} courseData - Course information
 * @param {Array} holesData - Array of hole data
 * @returns {Object} Validation result
 */
export const validateRoundData = (courseData, holesData) => {
  const errors = []

  // Validate course data
  if (!courseData.course_name) errors.push('Course name is required')
  if (!courseData.played_at) errors.push('Date played is required')
  if (!courseData.course_rating) errors.push('Course rating is required')
  if (!courseData.slope_rating) errors.push('Slope rating is required')
  if (!courseData.tee_name) errors.push('Tee selection is required')

  // Validate holes data
  if (!holesData || holesData.length === 0) {
    errors.push('No hole data provided')
  } else {
    const incompleteHoles = holesData.filter(h => !h.adjusted_gross_score || h.adjusted_gross_score === 0)
    if (incompleteHoles.length > 0) {
      errors.push(`Holes ${incompleteHoles.map(h => h.hole_number).join(', ')} are missing scores`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Delete a round and all its related data
 * @param {string} roundId - The ID of the round to delete
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const deleteRound = async (roundId) => {
  try {
    // First delete related data (in case cascade is not set up)
    // Delete hole_details
    await supabase
      .from('hole_details')
      .delete()
      .eq('round_id', roundId)

    // Delete round_statistics
    await supabase
      .from('round_statistics')
      .delete()
      .eq('round_id', roundId)

    // Delete the round itself
    const { error } = await supabase
      .from('rounds')
      .delete()
      .eq('id', roundId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting round:', error)
    return { success: false, error: error.message }
  }
}