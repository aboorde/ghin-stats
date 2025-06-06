import { supabase } from '../lib/supabase'

const BATCH_SIZE = {
  ROUNDS: 50,      // Upsert 50 rounds at once
  HOLES: 900,      // Upsert 900 hole details at once  
  STATS: 50        // Upsert 50 statistics at once
}

/**
 * Convert value to proper numeric type
 * @param {*} value - Value to convert
 * @returns {number|null} - Converted numeric value or null
 */
function toNumeric(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'boolean') return value ? 1 : 0
  const num = parseFloat(value)
  return isNaN(num) ? null : num
}

/**
 * Convert value to boolean
 * @param {*} value - Value to convert
 * @returns {boolean} - Converted boolean value
 */
function toBoolean(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return !!value
}

/**
 * Import golf rounds data with optimized batching
 * @param {Array} rounds - Array of round objects from API
 * @param {string} userId - Current user's ID
 * @returns {Object} Import results
 */
export async function importGolfRoundsBatched(rounds, userId) {
  console.log('🚀 Batched import called with:', {
    roundsCount: rounds?.length,
    userId
  })
  
  const results = {
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: []
  }

  // Validate input
  if (!rounds || !Array.isArray(rounds)) {
    throw new Error('Invalid rounds data: expected an array')
  }

  if (!userId) {
    throw new Error('User ID is required')
  }

  console.log(`📊 Starting batched import of ${rounds.length} rounds for user ${userId}`)
  
  try {
    // Step 1: Prepare all data
    console.log('📦 Preparing data for batch operations...')
    const allRounds = []
    const allHoleDetails = []
    const allStatistics = []
    const roundIdSet = new Set() // Track rounds to insert
    
    for (const round of rounds) {
      // Track this round ID
      roundIdSet.add(round.id)
      
      // Prepare round data with proper type conversions
      const roundData = {
        id: round.id,
        user_id: userId,
        golfer_id: round.golfer_id,
        played_at: round.played_at,
        adjusted_gross_score: toNumeric(round.adjusted_gross_score),
        differential: toNumeric(round.differential),
        course_name: round.course_name,
        tee_name: round.tee_name,
        course_rating: toNumeric(round.course_rating),
        slope_rating: toNumeric(round.slope_rating),
        number_of_holes: toNumeric(round.number_of_holes),
        course_id: round.course_id,
        tee_set_id: round.tee_set_id,
        score_type: round.score_type,
        posted_at: round.posted_at,
        net_score: toNumeric(round.net_score),
        unadjusted_differential: toNumeric(round.unadjusted_differential),
        facility_name: round.facility_name,
        front9_adjusted: toNumeric(round.front9_adjusted),
        back9_adjusted: toNumeric(round.back9_adjusted),
        exceptional: toBoolean(round.exceptional),
        pcc: toNumeric(round.pcc) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order_number: toNumeric(round.order_number),
        score_day_order: toNumeric(round.score_day_order),
        gender: round.gender,
        status: round.status,
        is_manual: toBoolean(round.is_manual),
        number_of_played_holes: toNumeric(round.number_of_played_holes),
        front9_course_name: round.front9_course_name,
        back9_course_name: round.back9_course_name,
        front9_course_rating: toNumeric(round.front9_course_rating),
        back9_course_rating: toNumeric(round.back9_course_rating),
        front9_slope_rating: toNumeric(round.front9_slope_rating),
        back9_slope_rating: toNumeric(round.back9_slope_rating),
        tee_set_side: round.tee_set_side,
        front9_tee_name: round.front9_tee_name,
        back9_tee_name: round.back9_tee_name,
        scaled_up_differential: toNumeric(round.scaled_up_differential),
        adjusted_scaled_up_differential: toNumeric(round.adjusted_scaled_up_differential),
        net_score_differential: toNumeric(round.net_score_differential),
        course_handicap: toNumeric(round.course_handicap),
        score_type_display_full: round.score_type_display_full,
        score_type_display_short: round.score_type_display_short,
        penalty: toNumeric(round.penalty),
        penalty_type: round.penalty_type,
        penalty_method: round.penalty_method,
        posted_on_home_course: toBoolean(round.posted_on_home_course),
        season_start_date_at: round.season_start_date_at,
        season_end_date_at: round.season_end_date_at,
        course_display_value: round.course_display_value,
        ghin_course_name_display: round.ghin_course_name_display,
        edited: toBoolean(round.edited),
        used: toBoolean(round.used),
        revision: toNumeric(round.revision),
        is_recent: toBoolean(round.is_recent),
        short_course: toBoolean(round.short_course),
        challenge_available: toBoolean(round.challenge_available),
        parent_id: round.parent_id,
        adjustments: round.adjustments,
        message_club_authorized: toBoolean(round.message_club_authorized)
      }
      allRounds.push(roundData)
      
      // Prepare hole details (will be inserted after rounds)
      if (round.hole_details && round.hole_details.length > 0) {
        const holeDetails = round.hole_details.map(hole => ({
          id: hole.id,
          round_id: round.id,
          user_id: userId,
          hole_number: toNumeric(hole.hole_number),
          par: toNumeric(hole.par),
          stroke_allocation: toNumeric(hole.stroke_allocation),
          adjusted_gross_score: toNumeric(hole.adjusted_gross_score),
          raw_score: toNumeric(hole.raw_score),
          putts: toNumeric(hole.putts),
          fairway_hit: hole.fairway_hit,
          gir_flag: toBoolean(hole.gir_flag),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        allHoleDetails.push(...holeDetails)
      }
      
      // Prepare statistics (will be inserted after rounds)
      if (round.statistics && round.statistics !== null) {
        const statsData = {
          round_id: round.id,
          user_id: userId,
          putts_total: toNumeric(round.statistics.putts_total),
          one_putt_or_better_percent: toNumeric(round.statistics.one_putt_or_better_percent),
          two_putt_percent: toNumeric(round.statistics.two_putt_percent),
          three_putt_or_worse_percent: toNumeric(round.statistics.three_putt_or_worse_percent),
          two_putt_or_better_percent: toNumeric(round.statistics.two_putt_or_better_percent),
          up_and_downs_total: toNumeric(round.statistics.up_and_downs_total),
          par3s_average: toNumeric(round.statistics.par3s_average),
          par4s_average: toNumeric(round.statistics.par4s_average),
          par5s_average: toNumeric(round.statistics.par5s_average),
          pars_percent: toNumeric(round.statistics.pars_percent),
          birdies_or_better_percent: toNumeric(round.statistics.birdies_or_better_percent),
          bogeys_percent: toNumeric(round.statistics.bogeys_percent),
          double_bogeys_percent: toNumeric(round.statistics.double_bogeys_percent),
          triple_bogeys_or_worse_percent: toNumeric(round.statistics.triple_bogeys_or_worse_percent),
          fairway_hits_percent: toNumeric(round.statistics.fairway_hits_percent),
          missed_left_percent: toNumeric(round.statistics.missed_left_percent),
          missed_right_percent: toNumeric(round.statistics.missed_right_percent),
          missed_long_percent: toNumeric(round.statistics.missed_long_percent),
          missed_short_percent: toNumeric(round.statistics.missed_short_percent),
          gir_percent: toNumeric(round.statistics.gir_percent),
          missed_left_approach_shot_accuracy_percent: toNumeric(round.statistics.missed_left_approach_shot_accuracy_percent),
          missed_right_approach_shot_accuracy_percent: toNumeric(round.statistics.missed_right_approach_shot_accuracy_percent),
          missed_long_approach_shot_accuracy_percent: toNumeric(round.statistics.missed_long_approach_shot_accuracy_percent),
          missed_short_approach_shot_accuracy_percent: toNumeric(round.statistics.missed_short_approach_shot_accuracy_percent),
          missed_general_approach_shot_accuracy_percent: toNumeric(round.statistics.missed_general_approach_shot_accuracy_percent),
          last_stats_update_date: round.statistics.last_stats_update_date,
          last_stats_update_type: round.statistics.last_stats_update_type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        allStatistics.push(statsData)
      }
    }
    
    console.log('📊 Data prepared:', {
      rounds: allRounds.length,
      holeDetails: allHoleDetails.length,
      statistics: allStatistics.length
    })
    
    // Step 2: Batch upsert rounds FIRST (critical for foreign key constraints)
    console.log('🔄 Batch upserting rounds...')
    const roundResults = await batchUpsert(
      'rounds',
      allRounds,
      BATCH_SIZE.ROUNDS,
      'id'
    )
    results.successful += roundResults.successful
    results.failed += roundResults.failed
    results.errors.push(...roundResults.errors)
    
    // Only continue if at least some rounds were inserted
    if (roundResults.successful === 0 && roundResults.skipped === 0) {
      console.error('❌ No rounds were successfully inserted, skipping related data')
      return results
    }
    
    // Step 3: Now insert hole details and statistics (after rounds exist)
    const promises = []
    
    if (allHoleDetails.length > 0) {
      console.log('🏌️ Batch upserting hole details...')
      // Use round_id + hole_number as conflict target for hole details
      promises.push(
        batchUpsert(
          'hole_details',
          allHoleDetails,
          BATCH_SIZE.HOLES,
          'round_id,hole_number', // This is the unique constraint
          true // ignoreDuplicates = true
        )
      )
    }
    
    if (allStatistics.length > 0) {
      console.log('📊 Batch upserting statistics...')
      // Only insert statistics for rounds that were successfully inserted
      promises.push(
        batchUpsert(
          'round_statistics',
          allStatistics,
          BATCH_SIZE.STATS,
          'round_id,user_id'
        )
      )
    }
    
    // Wait for hole details and statistics to complete
    const parallelResults = await Promise.all(promises)
    
    // Log any errors from parallel operations
    parallelResults.forEach(result => {
      if (result.errors.length > 0) {
        console.error('⚠️ Batch operation had errors:', result.errors)
      }
    })
    
  } catch (error) {
    console.error('❌ Batch import failed:', error)
    results.errors.push({
      error: error.message,
      type: 'batch_error'
    })
  }
  
  console.log('\n📈 Batch import complete! Final results:', results)
  return results
}

/**
 * Batch upsert helper function
 * @param {string} table - Table name
 * @param {Array} data - Array of records to upsert
 * @param {number} batchSize - Size of each batch
 * @param {string} conflictColumns - Columns for conflict detection
 * @param {boolean} ignoreDuplicates - Whether to ignore duplicates (default: false)
 * @returns {Object} Results of the batch operation
 */
async function batchUpsert(table, data, batchSize, conflictColumns, ignoreDuplicates = false) {
  const results = {
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: []
  }
  
  const totalBatches = Math.ceil(data.length / batchSize)
  console.log(`📦 Processing ${data.length} records in ${totalBatches} batches of ${batchSize}`)
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1
    
    try {
      console.log(`  🔄 Batch ${batchNumber}/${totalBatches} (${batch.length} records)`)
      
      const { data: upsertData, error } = await supabase
        .from(table)
        .upsert(batch, {
          onConflict: conflictColumns,
          ignoreDuplicates: ignoreDuplicates,
          returning: 'minimal' // Reduce response size
        })
        .throwOnError()
      
      if (error) {
        // Check if it's a duplicate key error
        if (error.code === '23505') {
          if (ignoreDuplicates) {
            // When ignoring duplicates, we can't know exactly how many were skipped vs inserted
            // but we'll count them as successful since the operation completed
            console.log(`  ⏭️ Batch ${batchNumber} processed (some may have been skipped)`)
            results.successful += batch.length
          } else {
            console.log(`  ⏭️ Batch ${batchNumber} contains existing records`)
            results.skipped += batch.length
          }
        } else {
          console.error(`  ❌ Batch ${batchNumber} failed:`, error)
          results.failed += batch.length
          results.errors.push({
            batch: batchNumber,
            error: error.message,
            code: error.code,
            details: error.details
          })
        }
      } else {
        results.successful += batch.length
        console.log(`  ✅ Batch ${batchNumber} completed`)
      }
      
    } catch (error) {
      console.error(`  ❌ Batch ${batchNumber} error:`, error)
      results.failed += batch.length
      results.errors.push({
        batch: batchNumber,
        error: error.message
      })
    }
  }
  
  console.log(`✅ ${table} batch operation complete:`, {
    successful: results.successful,
    failed: results.failed,
    skipped: results.skipped
  })
  
  return results
}


/**
 * Get import summary for display (reuse existing function)
 */
export { formatImportSummary } from './importService'