/**
 * Public Profile Service
 * 
 * Handles fetching data for public profiles that anonymous users can view.
 * Respects user privacy settings (display_scores, display_statistics, display_handicap)
 */

import { supabase } from '../lib/supabase'

/**
 * Get public profile data for a user
 * @param {string} userId - The user ID to fetch
 * @returns {Object} User profile data with privacy settings applied
 */
export const getPublicProfile = async (userId) => {
  try {
    // First, check if the user exists and has a public profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('profile_visibility', 'public')
      .single()

    if (userError || !user) {
      return { error: 'Profile not found or not public' }
    }

    // Build the response based on privacy settings
    const publicData = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      home_course_name: user.home_course_name,
      profile_visibility: user.profile_visibility
    }

    // Only include handicap if user allows it
    if (user.display_handicap) {
      publicData.handicap_index = user.handicap_index
    }

    return { data: publicData, error: null }
  } catch (error) {
    console.error('Error fetching public profile:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get rounds count for a public profile
 * @param {string} userId - The user ID
 * @returns {Object} Count of rounds or error
 */
export const getPublicProfileRoundsCount = async (userId) => {
  try {
    // First verify the user has a public profile with display_scores enabled
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('profile_visibility, display_scores')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return { count: 0, error: 'User not found' }
    }

    if (user.profile_visibility !== 'public' || !user.display_scores) {
      return { count: 0, error: 'Scores are private' }
    }

    // Now count the rounds
    const { count, error } = await supabase
      .from('rounds')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return { count: count || 0, error }
  } catch (error) {
    console.error('Error counting rounds:', error)
    return { count: 0, error: error.message }
  }
}

/**
 * Get public rounds data for a user
 * @param {string} userId - The user ID
 * @param {number} limit - Maximum number of rounds to return
 * @param {number} offset - Offset for pagination
 * @returns {Object} Rounds data or error
 */
export const getPublicProfileRounds = async (userId, limit = 20, offset = 0) => {
  try {
    // First verify the user has a public profile with display_scores enabled
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('profile_visibility, display_scores, display_statistics')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return { data: [], error: 'User not found' }
    }

    if (user.profile_visibility !== 'public' || !user.display_scores) {
      return { data: [], error: 'Scores are private' }
    }

    // Build the query based on what the user allows
    let query = supabase
      .from('rounds')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // If user allows statistics, include round_statistics
    if (user.display_statistics) {
      query = supabase
        .from('rounds')
        .select(`
          *,
          round_statistics(*)
        `)
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .range(offset, offset + limit - 1)
    }

    const { data, error } = await query

    return { data: data || [], error }
  } catch (error) {
    console.error('Error fetching public rounds:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Get public statistics for a user
 * @param {string} userId - The user ID
 * @returns {Object} Statistics data or error
 */
export const getPublicProfileStatistics = async (userId) => {
  try {
    // First verify the user has a public profile with display_statistics enabled
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('profile_visibility, display_statistics, display_scores')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return { data: null, error: 'User not found' }
    }

    if (user.profile_visibility !== 'public' || !user.display_statistics) {
      return { data: null, error: 'Statistics are private' }
    }

    // Get all rounds with statistics for aggregation
    const { data: rounds, error } = await supabase
      .from('rounds')
      .select(`
        *,
        round_statistics(*)
      `)
      .eq('user_id', userId)
      .eq('number_of_holes', 18)
      .order('played_at', { ascending: false })

    if (error) {
      return { data: null, error }
    }

    // Calculate aggregate statistics
    const stats = calculateAggregateStats(rounds)
    return { data: stats, error: null }
  } catch (error) {
    console.error('Error fetching public statistics:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Calculate aggregate statistics from rounds
 * @param {Array} rounds - Array of rounds with statistics
 * @returns {Object} Aggregated statistics
 */
const calculateAggregateStats = (rounds) => {
  if (!rounds || rounds.length === 0) {
    return {
      totalRounds: 0,
      avgScore: null,
      avgDifferential: null,
      bestScore: null,
      worstScore: null
    }
  }

  const scores = rounds.map(r => r.adjusted_gross_score).filter(s => s != null)
  const differentials = rounds.map(r => parseFloat(r.differential)).filter(d => !isNaN(d))

  return {
    totalRounds: rounds.length,
    avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
    avgDifferential: differentials.length > 0 ? differentials.reduce((a, b) => a + b, 0) / differentials.length : null,
    bestScore: scores.length > 0 ? Math.min(...scores) : null,
    worstScore: scores.length > 0 ? Math.max(...scores) : null,
    roundsLast30Days: rounds.filter(r => {
      const playedDate = new Date(r.played_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return playedDate >= thirtyDaysAgo
    }).length
  }
}