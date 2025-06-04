/**
 * Golf-specific constants and rules
 */

// Standard par values
export const STANDARD_PAR = {
  NINE_HOLES: 36,
  EIGHTEEN_HOLES: 72
}

// Hole types
export const HOLE_TYPES = {
  PAR_3: 3,
  PAR_4: 4,
  PAR_5: 5
}

// Performance categories
export const PERFORMANCE_CATEGORIES = {
  EAGLE_OR_BETTER: 'eagle',
  BIRDIE: 'birdie',
  PAR: 'par',
  BOGEY: 'bogey',
  DOUBLE_BOGEY: 'double',
  TRIPLE_OR_WORSE: 'triple+'
}

// Score relative to par thresholds
export const SCORE_TO_PAR = {
  EAGLE: -2,
  BIRDIE: -1,
  PAR: 0,
  BOGEY: 1,
  DOUBLE: 2
}

// Handicap calculation rules (USGA/GHIN)
export const HANDICAP_RULES = {
  MIN_ROUNDS: 3,
  MAX_DIFFERENTIALS_USED: 8,
  ROUNDS_FOR_MAX_DIFFERENTIALS: 20,
  MULTIPLIER: 0.96,
  
  // Differential counts by number of rounds
  DIFFERENTIAL_COUNT: {
    3: 1,
    4: 1,
    5: 1,
    6: 2,
    7: 2,
    8: 2,
    9: 3,
    10: 3,
    11: 3,
    12: 4,
    13: 4,
    14: 4,
    15: 5,
    16: 5,
    17: 6,
    18: 6,
    19: 7,
    20: 8
  },
  
  // Adjustments for fewer rounds
  ADJUSTMENTS: {
    3: -2.0,
    4: -1.0,
    5: 0,
    6: -1.0
  }
}

// Chart colors
export const CHART_COLORS = {
  EAGLE: '#8b5cf6',    // Purple
  BIRDIE: '#3b82f6',   // Blue
  PAR: '#10b981',      // Green
  BOGEY: '#eab308',    // Yellow
  DOUBLE: '#f97316',   // Orange
  TRIPLE: '#ef4444',   // Red
  
  // Alternative set
  PRIMARY: '#10b981',   // Emerald
  SECONDARY: '#3b82f6', // Blue
  WARNING: '#f59e0b',   // Amber
  DANGER: '#ef4444',    // Red
  SUCCESS: '#10b981',   // Green
  INFO: '#06b6d4'       // Cyan
}

// Performance level colors
export const PERFORMANCE_COLORS = {
  EXCELLENT: 'text-green-400 font-bold',
  GOOD: 'text-yellow-400',
  AVERAGE: 'text-orange-400',
  POOR: 'text-red-400'
}

// Background colors for scores
export const SCORE_BG_COLORS = {
  EAGLE: 'bg-purple-600 text-white font-bold',
  BIRDIE: 'bg-blue-600 text-white font-bold',
  PAR: 'bg-green-600 text-white',
  BOGEY: 'bg-yellow-500 text-white',
  DOUBLE: 'bg-orange-500 text-white',
  TRIPLE: 'bg-red-600 text-white'
}

// Pine Valley specific data
export const PINE_VALLEY_DATA = {
  COURSE_ID: 14481,
  COURSE_NAME: 'Pine Valley CC',
  WHITE_TEES: {
    NAME: 'White Tees',
    RATING: 69.6,
    SLOPE: 129,
    TOTAL_YARDS: 5997
  },
  
  // Hole-specific data
  HOLES: {
    1: { par: 4, yards: 331, handicap: 11 },
    2: { par: 5, yards: 487, handicap: 17 },
    3: { par: 4, yards: 335, handicap: 3 },
    4: { par: 3, yards: 129, handicap: 13 },
    5: { par: 4, yards: 379, handicap: 1 },
    6: { par: 4, yards: 376, handicap: 7 },
    7: { par: 3, yards: 142, handicap: 15 },
    8: { par: 5, yards: 456, handicap: 5 },
    9: { par: 4, yards: 291, handicap: 9 },
    10: { par: 5, yards: 447, handicap: 18 },
    11: { par: 4, yards: 356, handicap: 10 },
    12: { par: 3, yards: 191, handicap: 8 },
    13: { par: 4, yards: 358, handicap: 4 },
    14: { par: 5, yards: 466, handicap: 16 },
    15: { par: 4, yards: 388, handicap: 2 },
    16: { par: 4, yards: 330, handicap: 12 },
    17: { par: 3, yards: 168, handicap: 14 },
    18: { par: 4, yards: 367, handicap: 6 }
  },
  
  // Par counts
  PAR_COUNTS: {
    PAR_3: 4,  // Holes: 4, 7, 12, 17
    PAR_4: 10, // Holes: 1, 3, 5, 6, 9, 11, 13, 15, 16, 18
    PAR_5: 4   // Holes: 2, 8, 10, 14
  }
}

// Default filter values
export const DEFAULT_FILTERS = {
  NUMBER_OF_HOLES: 18,
  SHOW_ONLY_COMPLETE: true,
  DATE_RANGE: 'all', // 'all', '30days', '90days', '1year'
  COURSE: 'all'
}