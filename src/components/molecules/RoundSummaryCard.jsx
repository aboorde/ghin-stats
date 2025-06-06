import React from 'react'
import { format } from 'date-fns'

/**
 * RoundSummaryCard - Display summary information for a selected round
 * 
 * @param {object} round - Round data object
 * @param {boolean} showDate - Whether to show the date
 * @param {boolean} gradient - Whether to use gradient styling
 * @param {string} className - Additional CSS classes
 */
const RoundSummaryCard = ({ 
  round,
  showDate = true,
  gradient = true,
  className = ''
}) => {
  if (!round) return null
  
  const containerClass = gradient 
    ? 'p-4 bg-gradient-to-r from-green-900/20 to-yellow-900/20 rounded-lg border border-gray-700'
    : 'p-4 bg-gray-800/50 rounded-lg border border-gray-700'
    
  const scoreClass = gradient
    ? 'text-2xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent'
    : 'text-2xl font-bold text-gray-200'
  
  return (
    <div className={`${containerClass} ${className}`}>
      <h3 className="font-semibold text-gray-200 mb-2">Round Summary</h3>
      <p className="text-gray-400">
        {round.course_name}
        {showDate && (
          <> • {format(new Date(round.played_at), 'MMMM d, yyyy')}</>
        )}
      </p>
      <p className={scoreClass}>
        Total Score: {round.adjusted_gross_score} ({round.number_of_holes} holes)
      </p>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {round.differential && (
          <p className="text-gray-400">
            <span className="text-gray-500">Differential:</span> <span className="font-medium text-pink-400">{round.differential}</span>
          </p>
        )}
        {round.net_score && (
          <p className="text-gray-400">
            <span className="text-gray-500">Net Score:</span> <span className="font-medium">{round.net_score}</span>
          </p>
        )}
        {round.course_rating && (
          <p className="text-gray-400">
            <span className="text-gray-500">Course Rating:</span> <span className="font-medium">{round.course_rating}</span>
          </p>
        )}
        {round.slope_rating && (
          <p className="text-gray-400">
            <span className="text-gray-500">Slope:</span> <span className="font-medium">{round.slope_rating}</span>
          </p>
        )}
        {round.tee_name && (
          <p className="text-gray-400">
            <span className="text-gray-500">Tees:</span> <span className="font-medium">{round.tee_name}</span>
          </p>
        )}
        {round.course_handicap !== null && round.course_handicap !== undefined && (
          <p className="text-gray-400">
            <span className="text-gray-500">Course Handicap:</span> <span className="font-medium">{round.course_handicap}</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default RoundSummaryCard