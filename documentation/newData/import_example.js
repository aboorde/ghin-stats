// Example function to import golf data into Supabase
// This would be called from handleImportData in Settings.jsx

import { supabase } from '../lib/supabase'

/**
 * Import golf rounds data from external API
 * @param {Array} rounds - Array of round objects from API
 * @param {string} userId - Current user's ID
 * @returns {Object} Import results
 */
export async function importGolfRounds(rounds, userId) {
  const results = {
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: []
  }

  // Process each round
  for (const round of rounds) {
    try {
      // First check if this round already exists for this user
      const { data: existingRound, error: checkError } = await supabase
        .from('rounds')
        .select('id')
        .eq('id', round.id)
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected for new rounds
        throw checkError
      }

      // Skip if round already exists
      if (existingRound) {
        results.skipped++
        continue
      }

      // Insert the new round
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .insert({
          id: round.id,
          user_id: userId,
          order_number: round.order_number,
          score_day_order: round.score_day_order,
          gender: round.gender,
          status: round.status,
          is_manual: round.is_manual,
          number_of_holes: round.number_of_holes,
          number_of_played_holes: round.number_of_played_holes,
          golfer_id: round.golfer_id,
          facility_name: round.facility_name,
          course_id: round.course_id,
          course_name: round.course_name,
          front9_course_name: round.front9_course_name,
          back9_course_name: round.back9_course_name,
          adjusted_gross_score: round.adjusted_gross_score,
          front9_adjusted: round.front9_adjusted,
          back9_adjusted: round.back9_adjusted,
          course_rating: round.course_rating,
          slope_rating: round.slope_rating,
          front9_course_rating: round.front9_course_rating,
          back9_course_rating: round.back9_course_rating,
          front9_slope_rating: round.front9_slope_rating,
          back9_slope_rating: round.back9_slope_rating,
          tee_name: round.tee_name,
          tee_set_id: round.tee_set_id,
          tee_set_side: round.tee_set_side,
          front9_tee_name: round.front9_tee_name,
          back9_tee_name: round.back9_tee_name,
          differential: round.differential,
          unadjusted_differential: round.unadjusted_differential,
          scaled_up_differential: round.scaled_up_differential,
          adjusted_scaled_up_differential: round.adjusted_scaled_up_differential,
          net_score: round.net_score,
          net_score_differential: round.net_score_differential,
          course_handicap: round.course_handicap,
          score_type: round.score_type,
          score_type_display_full: round.score_type_display_full,
          score_type_display_short: round.score_type_display_short,
          penalty: round.penalty,
          penalty_type: round.penalty_type,
          penalty_method: round.penalty_method,
          played_at: round.played_at,
          posted_at: round.posted_at,
          posted_on_home_course: round.posted_on_home_course,
          season_start_date_at: round.season_start_date_at,
          season_end_date_at: round.season_end_date_at,
          course_display_value: round.course_display_value,
          ghin_course_name_display: round.ghin_course_name_display,
          edited: round.edited,
          used: round.used,
          revision: round.revision,
          exceptional: round.exceptional,
          is_recent: round.is_recent,
          short_course: round.short_course,
          challenge_available: round.challenge_available,
          parent_id: round.parent_id,
          revision_group_id: round.revision_group_id,
          rating_id: round.rating_id,
          pcc: round.pcc,
          adjustments: round.adjustments,
          message_club_authorized: round.message_club_authorized
        })
        .select()
        .single()

      if (roundError) throw roundError

      // Insert hole details if they exist
      if (round.hole_details && round.hole_details.length > 0) {
        const holeDetails = round.hole_details.map(hole => ({
          id: hole.id,
          round_id: round.id,
          user_id: userId,
          hole_number: hole.hole_number,
          par: hole.par,
          stroke_allocation: hole.stroke_allocation,
          adjusted_gross_score: hole.adjusted_gross_score,
          raw_score: hole.raw_score,
          most_likely_score: hole.most_likely_score,
          putts: hole.putts,
          fairway_hit: hole.fairway_hit,
          gir_flag: hole.gir_flag,
          drive_accuracy: hole.drive_accuracy,
          approach_shot_accuracy: hole.approach_shot_accuracy,
          x_hole: hole.x_hole
        }))

        const { error: holesError } = await supabase
          .from('hole_details')
          .insert(holeDetails)

        if (holesError) throw holesError
      }

      // Insert statistics if they exist
      if (round.statistics) {
        const { error: statsError } = await supabase
          .from('round_statistics')
          .insert({
            round_id: round.id,
            user_id: userId,
            putts_total: round.statistics.putts_total,
            one_putt_or_better_percent: round.statistics.one_putt_or_better_percent,
            two_putt_percent: round.statistics.two_putt_percent,
            three_putt_or_worse_percent: round.statistics.three_putt_or_worse_percent,
            two_putt_or_better_percent: round.statistics.two_putt_or_better_percent,
            up_and_downs_total: round.statistics.up_and_downs_total,
            par3s_average: round.statistics.par3s_average,
            par4s_average: round.statistics.par4s_average,
            par5s_average: round.statistics.par5s_average,
            pars_percent: round.statistics.pars_percent,
            birdies_or_better_percent: round.statistics.birdies_or_better_percent,
            bogeys_percent: round.statistics.bogeys_percent,
            double_bogeys_percent: round.statistics.double_bogeys_percent,
            triple_bogeys_or_worse_percent: round.statistics.triple_bogeys_or_worse_percent,
            fairway_hits_percent: round.statistics.fairway_hits_percent,
            missed_left_percent: round.statistics.missed_left_percent,
            missed_right_percent: round.statistics.missed_right_percent,
            missed_long_percent: round.statistics.missed_long_percent,
            missed_short_percent: round.statistics.missed_short_percent,
            gir_percent: round.statistics.gir_percent,
            missed_left_approach_shot_accuracy_percent: round.statistics.missed_left_approach_shot_accuracy_percent,
            missed_right_approach_shot_accuracy_percent: round.statistics.missed_right_approach_shot_accuracy_percent,
            missed_long_approach_shot_accuracy_percent: round.statistics.missed_long_approach_shot_accuracy_percent,
            missed_short_approach_shot_accuracy_percent: round.statistics.missed_short_approach_shot_accuracy_percent,
            missed_general_approach_shot_accuracy_percent: round.statistics.missed_general_approach_shot_accuracy_percent,
            last_stats_update_date: round.statistics.last_stats_update_date,
            last_stats_update_type: round.statistics.last_stats_update_type
          })

        if (statsError) throw statsError
      }

      results.successful++
    } catch (error) {
      console.error(`Failed to import round ${round.id}:`, error)
      results.failed++
      results.errors.push({
        roundId: round.id,
        error: error.message
      })
    }
  }

  return results
}

// Example usage in Settings.jsx handleImportData:
/*
const data = await response.json()

// TODO: Replace this with actual import
const importResults = await importGolfRounds(data.scores || data, user.id)

let message = `Import completed: ${importResults.successful} new rounds imported`
if (importResults.skipped > 0) {
  message += `, ${importResults.skipped} already existed`
}
if (importResults.failed > 0) {
  message += `, ${importResults.failed} failed`
}

setImportMessage({ 
  type: importResults.failed === 0 ? 'success' : 'warning', 
  text: message,
  details: importResults.errors.length > 0 ? `Errors: ${importResults.errors.map(e => e.error).join(', ')}` : null
})
*/