import { supabase } from '../lib/supabase'

// Remove the console.log that runs at module load time
// as it might be causing issues

/**
 * Import golf rounds data from external API
 * @param {Array} rounds - Array of round objects from API
 * @param {string} userId - Current user's ID
 * @returns {Object} Import results
 */
export async function importGolfRounds(rounds, userId) {
  console.log('🚀 importGolfRounds called with:', {
    roundsCount: rounds?.length,
    userId,
    firstRound: rounds?.[0],
    roundsType: Array.isArray(rounds) ? 'array' : typeof rounds
  })
  
  // Check Supabase client in function context
  console.log('🔧 Checking Supabase client:', {
    hasSupabase: !!supabase,
    hasFrom: !!supabase?.from,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...'
  })

  const results = {
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: []
  }

  // Validate input
  if (!rounds || !Array.isArray(rounds)) {
    console.error('❌ Invalid rounds data:', rounds)
    throw new Error('Invalid rounds data: expected an array')
  }

  if (!userId) {
    console.error('❌ No user ID provided')
    throw new Error('User ID is required')
  }

  console.log(`📊 Starting import of ${rounds.length} rounds for user ${userId}`)
  
  console.log('🚀 Starting import process...')

  // Process each round
  for (let index = 0; index < rounds.length; index++) {
    const round = rounds[index]
    console.log(`\n🏌️ Processing round ${index + 1}/${rounds.length}:`, {
      id: round.id,
      course: round.course_name,
      date: round.played_at,
      score: round.adjusted_gross_score
    })
    try {
      // Skip checking for existing rounds due to timeout issues
      // Instead, we'll use upsert which will handle duplicates automatically
      console.log(`🔄 Preparing to upsert round ${round.id}...`)

      // Insert the new round
      console.log(`➕ Inserting round ${round.id} into rounds table...`)
      const insertData = {
        id: round.id,
        user_id: userId,
        golfer_id: round.golfer_id,
        played_at: round.played_at,
        adjusted_gross_score: round.adjusted_gross_score,
        differential: round.differential,
        course_name: round.course_name,
        tee_name: round.tee_name,
        course_rating: round.course_rating,
        slope_rating: round.slope_rating,
        number_of_holes: round.number_of_holes,
        course_id: round.course_id,
        tee_set_id: round.tee_set_id,
        score_type: round.score_type,
        posted_at: round.posted_at,
        net_score: round.net_score,
        unadjusted_differential: round.unadjusted_differential,
        facility_name: round.facility_name,
        front9_adjusted: round.front9_adjusted,
        back9_adjusted: round.back9_adjusted,
        is_tournament: round.is_tournament || false,
        is_penalty: round.is_penalty || false,
        exceptional: round.exceptional || false,
        pcc: round.pcc || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('📦 Insert data:', insertData)
      
      // Use upsert with just id as conflict target
      try {
        console.log('🔄 Attempting upsert...')
        
        const { data: upsertData, error: scoreError } = await supabase
          .from('rounds')
          .upsert(insertData, { 
            onConflict: 'id' // Just use id for conflict detection
          })
        
        if (scoreError) {
          console.error('❌ Error upserting round:', scoreError)
          // Check if it's a unique constraint error (duplicate)
          if (scoreError.code === '23505') {
            console.log('⏭️ Round already exists, skipping')
            results.skipped++
            continue
          }
          throw scoreError
        }
        
        console.log('✅ Round upserted successfully')
      } catch (upsertError) {
        console.error('❌ Upsert failed:', upsertError)
        results.failed++
        results.errors.push({
          roundId: round.id,
          courseName: round.course_name,
          playedAt: round.played_at,
          error: upsertError.message
        })
        continue
      }
      
      console.log('✅ Round inserted successfully!')

      // Insert hole details if they exist
      if (round.hole_details && round.hole_details.length > 0) {
        console.log(`🏌️ Inserting ${round.hole_details.length} hole details...`)
        try {
          const holeDetails = round.hole_details.map(hole => ({
            id: hole.id,
            round_id: round.id,
            user_id: userId,
            hole_number: hole.hole_number,
            par: hole.par,
            stroke_allocation: hole.stroke_allocation,
            adjusted_gross_score: hole.adjusted_gross_score,
            raw_score: hole.raw_score,
            putts: hole.putts,
            fairway_hit: hole.fairway_hit,
            gir_flag: hole.gir_flag,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))

          console.log('🕳️ First hole detail sample:', holeDetails[0])

          // Insert in batches to avoid large payload issues
          const batchSize = 20
          for (let i = 0; i < holeDetails.length; i += batchSize) {
            const batch = holeDetails.slice(i, i + batchSize)
            const { error: holesError } = await supabase
              .from('hole_details')
              .upsert(batch, { 
                onConflict: 'id',
                ignoreDuplicates: false,
                returning: 'minimal' // Reduce response size
              })

            if (holesError) {
              console.error(`❌ Error inserting hole details batch ${i/batchSize + 1}:`, holesError)
              throw holesError
            }
          }
          console.log('✅ All hole details inserted successfully!')
        } catch (holeError) {
          console.error('⚠️ Failed to insert hole details, continuing:', holeError.message)
          // Continue with import even if hole details fail
        }
      } else {
        console.log('ℹ️ No hole details to insert')
      }

      // Insert statistics if they exist
      if (round.statistics && round.statistics !== null) {
        console.log('📊 Inserting round statistics...')
        const statsData = {
          round_id: round.id,
          user_id: userId,
          putts_total: parseInt(round.statistics.putts_total) || null,
          one_putt_or_better_percent: parseFloat(round.statistics.one_putt_or_better_percent) || null,
          two_putt_percent: parseFloat(round.statistics.two_putt_percent) || null,
          three_putt_or_worse_percent: parseFloat(round.statistics.three_putt_or_worse_percent) || null,
          two_putt_or_better_percent: parseFloat(round.statistics.two_putt_or_better_percent) || null,
          up_and_downs_total: parseInt(round.statistics.up_and_downs_total) || null,
          par3s_average: parseFloat(round.statistics.par3s_average) || null,
          par4s_average: parseFloat(round.statistics.par4s_average) || null,
          par5s_average: parseFloat(round.statistics.par5s_average) || null,
          pars_percent: parseFloat(round.statistics.pars_percent) || null,
          birdies_or_better_percent: parseFloat(round.statistics.birdies_or_better_percent) || null,
          bogeys_percent: parseFloat(round.statistics.bogeys_percent) || null,
          double_bogeys_percent: parseFloat(round.statistics.double_bogeys_percent) || null,
          triple_bogeys_or_worse_percent: parseFloat(round.statistics.triple_bogeys_or_worse_percent) || null,
          fairway_hits_percent: parseFloat(round.statistics.fairway_hits_percent) || null,
          gir_percent: parseFloat(round.statistics.gir_percent) || null,
          missed_left_percent: parseFloat(round.statistics.missed_left_percent) || null,
          missed_right_percent: parseFloat(round.statistics.missed_right_percent) || null,
          missed_long_percent: parseFloat(round.statistics.missed_long_percent) || null,
          missed_short_percent: parseFloat(round.statistics.missed_short_percent) || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('📊 Statistics data:', statsData)
        
        const { error: statsError } = await supabase
          .from('round_statistics')
          .upsert(statsData, {
            onConflict: 'round_id,user_id',
            ignoreDuplicates: false,
            returning: 'minimal'
          })

        if (statsError) {
          console.error('❌ Error inserting statistics:', statsError)
          // Don't throw - continue with import even if stats fail
          console.error('⚠️ Failed to insert statistics, continuing')
        } else {
          console.log('✅ Statistics inserted successfully!')
        }
      } else {
        console.log('ℹ️ No statistics to insert')
      }

      results.successful++
      console.log(`✅ Round ${round.id} fully imported!`)
    } catch (error) {
      console.error(`❌ Failed to import round ${round.id}:`, error)
      console.error('Full error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      results.failed++
      results.errors.push({
        roundId: round.id,
        courseName: round.course_name,
        playedAt: round.played_at,
        error: error.message
      })
    }
  }

  console.log('\n📈 Import complete! Final results:', results)
  return results
}

/**
 * Validate that a round object has all required fields
 * @param {Object} round - Round object to validate
 * @returns {boolean} - True if valid, throws error if not
 */
export function validateRoundData(round) {
  const requiredFields = [
    'id', 'order_number', 'score_day_order', 'gender', 'status',
    'is_manual', 'number_of_holes', 'number_of_played_holes', 'golfer_id',
    'facility_name', 'adjusted_gross_score', 'played_at', 'course_id',
    'course_name', 'tee_name', 'tee_set_id', 'tee_set_side', 'differential',
    'unadjusted_differential', 'score_type', 'course_rating', 'slope_rating',
    'score_type_display_full', 'score_type_display_short', 'edited',
    'posted_at', 'used', 'revision', 'pcc', 'adjustments', 'exceptional',
    'is_recent', 'net_score_differential'
  ]

  for (const field of requiredFields) {
    if (round[field] === undefined) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  // Validate hole_details if present
  if (round.hole_details && round.hole_details.length > 0) {
    const holeRequiredFields = [
      'id', 'adjusted_gross_score', 'raw_score', 'hole_number', 'par',
      'stroke_allocation', 'x_hole'
    ]

    round.hole_details.forEach((hole, index) => {
      for (const field of holeRequiredFields) {
        if (hole[field] === undefined) {
          throw new Error(`Missing required field in hole ${index + 1}: ${field}`)
        }
      }
    })
  }

  // Validate statistics if present
  if (round.statistics) {
    const statsRequiredFields = [
      'putts_total', 'one_putt_or_better_percent', 'two_putt_percent',
      'three_putt_or_worse_percent', 'two_putt_or_better_percent',
      'up_and_downs_total', 'par3s_average', 'par4s_average', 'par5s_average',
      'pars_percent', 'birdies_or_better_percent', 'bogeys_percent',
      'double_bogeys_percent', 'triple_bogeys_or_worse_percent',
      'fairway_hits_percent', 'missed_left_percent', 'missed_right_percent',
      'missed_long_percent', 'missed_short_percent', 'gir_percent',
      'missed_left_approach_shot_accuracy_percent',
      'missed_right_approach_shot_accuracy_percent',
      'missed_long_approach_shot_accuracy_percent',
      'missed_short_approach_shot_accuracy_percent',
      'missed_general_approach_shot_accuracy_percent'
    ]

    for (const field of statsRequiredFields) {
      if (round.statistics[field] === undefined) {
        throw new Error(`Missing required field in statistics: ${field}`)
      }
    }
  }

  return true
}

/**
 * Get import summary for display
 * @param {Object} results - Import results object
 * @returns {Object} - Formatted summary for UI display
 */
export function formatImportSummary(results) {
  const total = results.successful + results.failed + results.skipped
  
  let message = `Import completed: ${results.successful} new rounds imported`
  if (results.skipped > 0) {
    message += `, ${results.skipped} already existed`
  }
  if (results.failed > 0) {
    message += `, ${results.failed} failed`
  }

  const type = results.failed === 0 ? 'success' : 'warning'
  
  let details = null
  if (results.errors.length > 0) {
    // Group errors by type for better display
    const errorSummary = results.errors.slice(0, 3).map(e => 
      `${e.courseName} (${e.playedAt}): ${e.error}`
    ).join('; ')
    
    details = results.errors.length > 3 
      ? `${errorSummary}... and ${results.errors.length - 3} more errors`
      : errorSummary
  }

  return {
    type,
    message,
    details,
    summary: {
      total,
      successful: results.successful,
      skipped: results.skipped,
      failed: results.failed
    }
  }
}