/**
 * Handicap Index Calculator
 * 
 * The USGA Handicap Index is calculated using the following steps:
 * 1. Use the lowest handicap differentials from recent rounds
 * 2. Average these differentials
 * 3. Multiply by 0.96 (96%)
 * 
 * Number of differentials used based on rounds available:
 * 3 rounds: lowest 1 differential - 2.0
 * 4 rounds: lowest 1 differential - 1.0
 * 5 rounds: lowest 1 differential
 * 6 rounds: lowest 2 differentials - 1.0
 * 7-8 rounds: lowest 2 differentials
 * 9-11 rounds: lowest 3 differentials
 * 12-14 rounds: lowest 4 differentials
 * 15-16 rounds: lowest 5 differentials
 * 17-18 rounds: lowest 6 differentials
 * 19 rounds: lowest 7 differentials
 * 20+ rounds: lowest 8 differentials
 */

export const calculateHandicapIndex = (rounds) => {
  // Filter to only include valid rounds with differentials
  const validRounds = rounds.filter(round => 
    round.differential !== null && 
    round.differential !== undefined &&
    round.number_of_holes === 18
  );

  // Need at least 3 rounds to calculate handicap
  if (validRounds.length < 3) {
    return null;
  }

  // Sort rounds by differential (lowest first)
  const sortedRounds = [...validRounds].sort((a, b) => a.differential - b.differential);

  let numDifferentials;
  let adjustment = 0;

  // Determine how many differentials to use based on number of rounds
  const roundCount = validRounds.length;
  
  if (roundCount === 3) {
    numDifferentials = 1;
    adjustment = -2.0;
  } else if (roundCount === 4) {
    numDifferentials = 1;
    adjustment = -1.0;
  } else if (roundCount === 5) {
    numDifferentials = 1;
    adjustment = 0;
  } else if (roundCount === 6) {
    numDifferentials = 2;
    adjustment = -1.0;
  } else if (roundCount >= 7 && roundCount <= 8) {
    numDifferentials = 2;
    adjustment = 0;
  } else if (roundCount >= 9 && roundCount <= 11) {
    numDifferentials = 3;
    adjustment = 0;
  } else if (roundCount >= 12 && roundCount <= 14) {
    numDifferentials = 4;
    adjustment = 0;
  } else if (roundCount >= 15 && roundCount <= 16) {
    numDifferentials = 5;
    adjustment = 0;
  } else if (roundCount >= 17 && roundCount <= 18) {
    numDifferentials = 6;
    adjustment = 0;
  } else if (roundCount === 19) {
    numDifferentials = 7;
    adjustment = 0;
  } else { // 20 or more rounds
    numDifferentials = 8;
    adjustment = 0;
  }

  // Get the lowest differentials
  const lowestDifferentials = sortedRounds
    .slice(0, numDifferentials)
    .map(round => round.differential);

  // Calculate average of lowest differentials
  const averageDifferential = lowestDifferentials.reduce((sum, diff) => sum + diff, 0) / lowestDifferentials.length;

  // Apply adjustment and multiply by 0.96
  const handicapIndex = (averageDifferential + adjustment) * 0.96;

  // Round to 1 decimal place and ensure non-negative
  return Math.max(0, Math.round(handicapIndex * 10) / 10);
};

/**
 * Get handicap trend data for charting
 * Calculates rolling handicap index over time
 */
export const getHandicapTrend = (rounds, windowSize = 20) => {
  // Sort rounds by date (oldest first)
  const sortedRounds = [...rounds].sort((a, b) => 
    new Date(a.played_at) - new Date(b.played_at)
  );

  const trendData = [];
  
  // Calculate handicap for each point where we have enough rounds
  for (let i = 2; i < sortedRounds.length; i++) {
    // Get the most recent rounds up to this point (max windowSize)
    const startIndex = Math.max(0, i - windowSize + 1);
    const recentRounds = sortedRounds.slice(startIndex, i + 1);
    
    const handicapIndex = calculateHandicapIndex(recentRounds);
    
    if (handicapIndex !== null) {
      trendData.push({
        date: sortedRounds[i].played_at,
        handicapIndex: handicapIndex,
        roundsUsed: recentRounds.length
      });
    }
  }

  return trendData;
};

/**
 * Get detailed handicap calculation info
 * Returns the rounds used and calculation details
 */
export const getHandicapDetails = (rounds) => {
  const validRounds = rounds.filter(round => 
    round.differential !== null && 
    round.differential !== undefined &&
    round.number_of_holes === 18
  );

  if (validRounds.length < 3) {
    return {
      handicapIndex: null,
      message: `Need at least 3 rounds to calculate handicap. Currently have ${validRounds.length} valid rounds.`,
      roundsUsed: [],
      totalRounds: validRounds.length
    };
  }

  const sortedRounds = [...validRounds].sort((a, b) => a.differential - b.differential);
  const roundCount = validRounds.length;
  
  let numDifferentials;
  let adjustment = 0;
  
  if (roundCount === 3) {
    numDifferentials = 1;
    adjustment = -2.0;
  } else if (roundCount === 4) {
    numDifferentials = 1;
    adjustment = -1.0;
  } else if (roundCount === 5) {
    numDifferentials = 1;
    adjustment = 0;
  } else if (roundCount === 6) {
    numDifferentials = 2;
    adjustment = -1.0;
  } else if (roundCount >= 7 && roundCount <= 8) {
    numDifferentials = 2;
    adjustment = 0;
  } else if (roundCount >= 9 && roundCount <= 11) {
    numDifferentials = 3;
    adjustment = 0;
  } else if (roundCount >= 12 && roundCount <= 14) {
    numDifferentials = 4;
    adjustment = 0;
  } else if (roundCount >= 15 && roundCount <= 16) {
    numDifferentials = 5;
    adjustment = 0;
  } else if (roundCount >= 17 && roundCount <= 18) {
    numDifferentials = 6;
    adjustment = 0;
  } else if (roundCount === 19) {
    numDifferentials = 7;
    adjustment = 0;
  } else {
    numDifferentials = 8;
    adjustment = 0;
  }

  const roundsUsed = sortedRounds.slice(0, numDifferentials);
  const averageDifferential = roundsUsed.reduce((sum, r) => sum + r.differential, 0) / roundsUsed.length;
  const handicapIndex = Math.max(0, Math.round((averageDifferential + adjustment) * 0.96 * 10) / 10);

  return {
    handicapIndex,
    roundsUsed,
    totalRounds: roundCount,
    numDifferentials,
    adjustment,
    averageDifferential,
    message: `Using lowest ${numDifferentials} of ${roundCount} rounds${adjustment !== 0 ? ` with ${adjustment} adjustment` : ''}`
  };
};