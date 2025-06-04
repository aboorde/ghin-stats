/**
 * Script to migrate Jonathan Mims data from JSON to Supabase
 * 
 * This script reads the 2025-MIMS.json file and inserts the data
 * into the appropriate Supabase tables.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // You'll need service role key for this

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// User details
const USER_ID = 'bd3590f2-6b72-41a7-81af-c22e06faa565'
const USER_EMAIL = 'jonathanmims1994@gmail.com'
const USER_NAME = 'Jonathan Mims'
const GOLFER_ID = 12708113

async function migrateData() {
  try {
    console.log('Starting migration for Jonathan Mims...')
    
    // Read JSON file
    const jsonPath = path.join(__dirname, '..', '2025-MIMS.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    
    console.log(`Found ${jsonData.scores.length} scores to migrate`)
    
    // 1. Insert or update user
    console.log('Creating/updating user profile...')
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: USER_ID,
        email: USER_EMAIL,
        full_name: USER_NAME,
        golfer_id: GOLFER_ID,
        profile_visibility: 'private',
        display_handicap: true,
        display_scores: false,
        preferred_tees: 'white',
        measurement_system: 'imperial',
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
    
    if (userError) {
      console.error('Error creating user:', userError)
      throw userError
    }
    
    // 2. Process scores
    console.log('Processing scores...')
    let successfulScores = 0
    let failedScores = 0
    
    for (const score of jsonData.scores) {
      // Only process 18-hole rounds
      if (score.number_of_holes !== 18) {
        console.log(`Skipping ${score.number_of_holes}-hole round`)
        continue
      }
      
      try {
        // Insert score
        const { error: scoreError } = await supabase
          .from('scores')
          .upsert({
            id: score.id,
            golfer_id: score.golfer_id,
            user_id: USER_ID,
            played_at: score.played_at,
            adjusted_gross_score: score.adjusted_gross_score,
            differential: score.differential,
            course_name: score.course_name,
            tee_name: score.tee_name,
            course_rating: score.course_rating,
            slope_rating: score.slope_rating,
            number_of_holes: score.number_of_holes,
            course_id: score.course_id,
            tee_set_id: score.tee_set_id,
            score_type: score.score_type,
            posted_at: score.posted_at,
            net_score: score.net_score,
            unadjusted_differential: score.unadjusted_differential,
            facility_name: score.facility_name,
            front9_adjusted: score.front9_adjusted,
            back9_adjusted: score.back9_adjusted,
            is_tournament: score.is_tournament || false,
            is_penalty: score.is_penalty || false,
            exceptional: score.exceptional || false,
            pcc: score.pcc || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
        
        if (scoreError) {
          console.error(`Error inserting score ${score.id}:`, scoreError)
          failedScores++
          continue
        }
        
        // Insert hole details if available
        if (score.hole_details && score.hole_details.length > 0) {
          const holeDetails = score.hole_details.map(hole => ({
            id: hole.id,
            score_id: score.id,
            user_id: USER_ID,
            hole_number: hole.hole_number,
            par: hole.par,
            adjusted_gross_score: hole.adjusted_gross_score,
            raw_score: hole.raw_score,
            stroke_allocation: hole.stroke_allocation,
            putts: hole.putts,
            fairway_hit: hole.fairway_hit,
            gir_flag: hole.gir_flag,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
          
          const { error: holeError } = await supabase
            .from('hole_details')
            .upsert(holeDetails, {
              onConflict: 'id'
            })
          
          if (holeError) {
            console.error(`Error inserting hole details for score ${score.id}:`, holeError)
          }
        }
        
        // Insert statistics if available
        if (score.statistics && score.statistics !== null) {
          const { error: statsError } = await supabase
            .from('statistics')
            .upsert({
              score_id: score.id,
              user_id: USER_ID,
              putts_total: parseInt(score.statistics.putts_total) || null,
              one_putt_or_better_percent: parseFloat(score.statistics.one_putt_or_better_percent) || null,
              two_putt_percent: parseFloat(score.statistics.two_putt_percent) || null,
              three_putt_or_worse_percent: parseFloat(score.statistics.three_putt_or_worse_percent) || null,
              two_putt_or_better_percent: parseFloat(score.statistics.two_putt_or_better_percent) || null,
              up_and_downs_total: parseInt(score.statistics.up_and_downs_total) || null,
              par3s_average: parseFloat(score.statistics.par3s_average) || null,
              par4s_average: parseFloat(score.statistics.par4s_average) || null,
              par5s_average: parseFloat(score.statistics.par5s_average) || null,
              pars_percent: parseFloat(score.statistics.pars_percent) || null,
              birdies_or_better_percent: parseFloat(score.statistics.birdies_or_better_percent) || null,
              bogeys_percent: parseFloat(score.statistics.bogeys_percent) || null,
              double_bogeys_percent: parseFloat(score.statistics.double_bogeys_percent) || null,
              triple_bogeys_or_worse_percent: parseFloat(score.statistics.triple_bogeys_or_worse_percent) || null,
              fairway_hits_percent: parseFloat(score.statistics.fairway_hits_percent) || null,
              gir_percent: parseFloat(score.statistics.gir_percent) || null,
              missed_left_percent: parseFloat(score.statistics.missed_left_percent) || null,
              missed_right_percent: parseFloat(score.statistics.missed_right_percent) || null,
              missed_long_percent: parseFloat(score.statistics.missed_long_percent) || null,
              missed_short_percent: parseFloat(score.statistics.missed_short_percent) || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'score_id'
            })
          
          if (statsError) {
            console.error(`Error inserting statistics for score ${score.id}:`, statsError)
          }
        }
        
        // Insert PCC adjustment if applicable
        if (score.pcc && score.pcc !== 0) {
          const { error: adjError } = await supabase
            .from('adjustments')
            .insert({
              score_id: score.id,
              user_id: USER_ID,
              type: 'pcc',
              value: score.pcc,
              display: score.pcc > 0 ? `PCC +${score.pcc}` : `PCC ${score.pcc}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          if (adjError && !adjError.message.includes('duplicate')) {
            console.error(`Error inserting PCC adjustment for score ${score.id}:`, adjError)
          }
        }
        
        successfulScores++
        
        if (successfulScores % 10 === 0) {
          console.log(`Progress: ${successfulScores} scores migrated...`)
        }
        
      } catch (error) {
        console.error(`Failed to process score ${score.id}:`, error)
        failedScores++
      }
    }
    
    console.log('\n=== Migration Complete ===')
    console.log(`Successfully migrated: ${successfulScores} scores`)
    console.log(`Failed: ${failedScores} scores`)
    console.log(`Skipped non-18 hole rounds: ${jsonData.scores.filter(s => s.number_of_holes !== 18).length}`)
    
    // Calculate and update handicap index
    console.log('\nCalculating handicap index...')
    const { data: allScores } = await supabase
      .from('scores')
      .select('differential')
      .eq('user_id', USER_ID)
      .eq('number_of_holes', 18)
      .order('played_at', { ascending: false })
      .limit(20)
    
    if (allScores && allScores.length >= 3) {
      // This is a simplified calculation - you should use the proper handicap calculation
      const handicapIndex = calculateSimpleHandicap(allScores.map(s => s.differential))
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          handicap_index: handicapIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', USER_ID)
      
      if (updateError) {
        console.error('Error updating handicap index:', updateError)
      } else {
        console.log(`Handicap index updated: ${handicapIndex}`)
      }
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Simple handicap calculation (not the full GHIN algorithm)
function calculateSimpleHandicap(differentials) {
  if (differentials.length < 3) return null
  
  // Sort and take best differentials based on count
  const sorted = [...differentials].sort((a, b) => a - b)
  let numToUse = 1
  
  if (differentials.length >= 20) numToUse = 8
  else if (differentials.length >= 19) numToUse = 7
  else if (differentials.length >= 17) numToUse = 6
  else if (differentials.length >= 15) numToUse = 5
  else if (differentials.length >= 13) numToUse = 4
  else if (differentials.length >= 11) numToUse = 3
  else if (differentials.length >= 9) numToUse = 2
  else if (differentials.length >= 7) numToUse = 1
  
  const usedDifferentials = sorted.slice(0, numToUse)
  const average = usedDifferentials.reduce((sum, d) => sum + d, 0) / numToUse
  
  // Apply 96% multiplier
  return Math.floor(average * 0.96 * 10) / 10
}

// Run migration
migrateData()
  .then(() => {
    console.log('\nMigration completed successfully!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\nMigration failed:', error)
    process.exit(1)
  })