/**
 * Scoring utility functions for golf score calculations and styling
 */

/**
 * Calculate score relative to par with label and color
 * @param {number} score - The actual score
 * @param {number} par - The hole par
 * @returns {object} - { text, color, diff }
 */
export const calculateScoreToPar = (score, par) => {
  const diff = score - par
  
  if (diff === 0) return { text: 'Par', color: 'text-green-400', diff }
  if (diff === 1) return { text: 'Bogey', color: 'text-yellow-400', diff }
  if (diff === 2) return { text: 'Double', color: 'text-orange-400', diff }
  if (diff >= 3) return { text: `+${diff}`, color: 'text-red-400', diff }
  if (diff === -1) return { text: 'Birdie', color: 'text-blue-400', diff }
  if (diff === -2) return { text: 'Eagle', color: 'text-purple-400', diff }
  if (diff <= -3) return { text: `${diff}`, color: 'text-purple-400', diff }
}

/**
 * Get background color classes based on score relative to par
 * @param {number} score - The actual score
 * @param {number} par - The hole par
 * @returns {string} - Tailwind classes for background and border
 */
export const getScoreBackgroundColor = (score, par) => {
  const diff = score - par
  
  if (diff === 0) return 'bg-green-900/30 border-green-600/50'
  if (diff === 1) return 'bg-yellow-900/30 border-yellow-600/50'
  if (diff === 2) return 'bg-orange-900/30 border-orange-600/50'
  if (diff >= 3) return 'bg-red-900/30 border-red-600/50'
  if (diff === -1) return 'bg-blue-900/30 border-blue-600/50'
  if (diff <= -2) return 'bg-purple-900/30 border-purple-600/50'
}

/**
 * Get theme color based on score performance
 * @param {number} diff - Score difference from par
 * @returns {string} - Theme color name
 */
export const getScoreTheme = (diff) => {
  if (diff === 0) return 'green'
  if (diff === 1) return 'yellow'
  if (diff === 2) return 'orange'
  if (diff >= 3) return 'red'
  if (diff === -1) return 'blue'
  if (diff <= -2) return 'purple'
  return 'gray'
}

/**
 * Count scores by type
 * @param {array} holeDetails - Array of hole detail objects
 * @returns {object} - Counts of each score type
 */
export const countScoreTypes = (holeDetails) => {
  return {
    eagles: holeDetails.filter(h => h.adjusted_gross_score - h.par <= -2).length,
    birdies: holeDetails.filter(h => h.adjusted_gross_score - h.par === -1).length,
    pars: holeDetails.filter(h => h.adjusted_gross_score === h.par).length,
    bogeys: holeDetails.filter(h => h.adjusted_gross_score - h.par === 1).length,
    doubles: holeDetails.filter(h => h.adjusted_gross_score - h.par === 2).length,
    triplePlus: holeDetails.filter(h => h.adjusted_gross_score - h.par >= 3).length,
    doublePlus: holeDetails.filter(h => h.adjusted_gross_score - h.par >= 2).length
  }
}