import { supabase } from '../lib/supabase';
import { normalizeCourseData } from '../utils/dataHelpers';

/**
 * Fetch all scores with statistics for a golfer
 * @param {number} golferId - The golfer ID
 * @returns {Promise<Array>} Array of scores with statistics
 */
export async function fetchScoresWithStats(golferId = 11384483) {
  const { data, error } = await supabase
    .from('scores')
    .select(`
      *,
      statistics (
        up_and_downs_total,
        par3s_average,
        par4s_average,
        par5s_average,
        pars_percent,
        birdies_or_better_percent,
        bogeys_percent,
        double_bogeys_percent,
        triple_bogeys_or_worse_percent
      )
    `)
    .eq('golfer_id', golferId)
    .eq('number_of_holes', 18)
    .order('played_at', { ascending: false });

  if (error) {
    console.error('Error fetching scores:', error);
    throw error;
  }

  return normalizeCourseData(data);
}

/**
 * Fetch all scores (both 18 and 9 hole) with statistics for a golfer
 * @param {number} golferId - The golfer ID
 * @returns {Promise<Array>} Array of scores with statistics
 */
export async function fetchAllScoresWithStats(golferId = 11384483) {
  const { data, error } = await supabase
    .from('scores')
    .select(`
      *,
      statistics (
        up_and_downs_total,
        par3s_average,
        par4s_average,
        par5s_average,
        pars_percent,
        birdies_or_better_percent,
        bogeys_percent,
        double_bogeys_percent,
        triple_bogeys_or_worse_percent
      )
    `)
    .eq('golfer_id', golferId)
    .order('played_at', { ascending: false });

  if (error) {
    console.error('Error fetching scores:', error);
    throw error;
  }

  return normalizeCourseData(data);
}

/**
 * Fetch hole-by-hole details for a specific score
 * @param {number} scoreId - The score ID
 * @returns {Promise<Array>} Array of hole details
 */
export async function fetchHoleDetails(scoreId) {
  const { data, error } = await supabase
    .from('hole_details')
    .select('*')
    .eq('score_id', scoreId)
    .order('hole_number', { ascending: true });

  if (error) {
    console.error('Error fetching hole details:', error);
    throw error;
  }

  return data;
}

/**
 * Get summary statistics for all rounds
 * @param {number} golferId - The golfer ID
 * @returns {Promise<Object>} Summary statistics
 */
export async function fetchSummaryStats(golferId = 11384483) {
  const { data: scores, error } = await supabase
    .from('scores')
    .select('adjusted_gross_score, differential, played_at')
    .eq('golfer_id', golferId)
    .eq('number_of_holes', 18);

  if (error) {
    console.error('Error fetching summary stats:', error);
    throw error;
  }

  if (!scores || scores.length === 0) {
    return null;
  }

  // Calculate summary statistics
  const totalRounds = scores.length;
  const avgScore = scores.reduce((sum, s) => sum + s.adjusted_gross_score, 0) / totalRounds;
  const avgDifferential = scores.reduce((sum, s) => sum + s.differential, 0) / totalRounds;
  const bestScore = Math.min(...scores.map(s => s.adjusted_gross_score));
  const worstScore = Math.max(...scores.map(s => s.adjusted_gross_score));
  const bestDifferential = Math.min(...scores.map(s => s.differential));
  const worstDifferential = Math.max(...scores.map(s => s.differential));

  // Get date range
  const dates = scores.map(s => new Date(s.played_at));
  const firstRound = new Date(Math.min(...dates));
  const lastRound = new Date(Math.max(...dates));

  return {
    totalRounds,
    avgScore: avgScore.toFixed(1),
    avgDifferential: avgDifferential.toFixed(1),
    bestScore,
    worstScore,
    bestDifferential: bestDifferential.toFixed(1),
    worstDifferential: worstDifferential.toFixed(1),
    firstRound: firstRound.toISOString().split('T')[0],
    lastRound: lastRound.toISOString().split('T')[0]
  };
}

/**
 * Get scoring average by hole
 * @param {number} golferId - The golfer ID
 * @returns {Promise<Array>} Array of hole averages
 */
export async function fetchHoleAverages(golferId = 11384483) {
  const { data: scores, error: scoresError } = await supabase
    .from('scores')
    .select('id')
    .eq('golfer_id', golferId)
    .eq('number_of_holes', 18);

  if (scoresError) {
    console.error('Error fetching scores for hole averages:', scoresError);
    throw scoresError;
  }

  const scoreIds = scores.map(s => s.id);

  const { data: holeDetails, error: detailsError } = await supabase
    .from('hole_details')
    .select('hole_number, par, adjusted_gross_score')
    .in('score_id', scoreIds);

  if (detailsError) {
    console.error('Error fetching hole details:', detailsError);
    throw detailsError;
  }

  // Calculate averages by hole
  const holeStats = {};
  holeDetails.forEach(detail => {
    if (!holeStats[detail.hole_number]) {
      holeStats[detail.hole_number] = {
        hole_number: detail.hole_number,
        par: detail.par,
        scores: [],
        total: 0,
        count: 0
      };
    }
    holeStats[detail.hole_number].scores.push(detail.adjusted_gross_score);
    holeStats[detail.hole_number].total += detail.adjusted_gross_score;
    holeStats[detail.hole_number].count += 1;
  });

  return Object.values(holeStats)
    .map(hole => ({
      hole_number: hole.hole_number,
      par: hole.par,
      avg_score: (hole.total / hole.count).toFixed(2),
      diff_to_par: ((hole.total / hole.count) - hole.par).toFixed(2),
      rounds_played: hole.count
    }))
    .sort((a, b) => a.hole_number - b.hole_number);
}