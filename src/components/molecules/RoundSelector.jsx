import React from 'react'
import { format } from 'date-fns'

/**
 * RoundSelector - Dropdown for selecting golf rounds
 * 
 * @param {array} rounds - Array of round objects
 * @param {string} selectedRound - Currently selected round ID
 * @param {function} onRoundSelect - Round selection handler
 * @param {string} label - Label for the selector
 * @param {boolean} showCourse - Whether to show course name
 * @param {boolean} showScore - Whether to show score
 * @param {boolean} showHoles - Whether to show hole count
 * @param {string} className - Additional CSS classes
 */
const RoundSelector = ({ 
  rounds, 
  selectedRound, 
  onRoundSelect,
  label = "Select Round",
  showCourse = true,
  showScore = true,
  showHoles = true,
  className = ''
}) => {
  const formatRoundOption = (round) => {
    const parts = [
      format(new Date(round.played_at), 'MMM d, yyyy')
    ]
    
    if (showCourse && round.course_name) {
      parts.push(`- ${round.course_name}`)
    }
    
    if (showScore && round.adjusted_gross_score) {
      parts.push(`(${round.adjusted_gross_score})`)
    }
    
    if (showHoles && round.number_of_holes === 9) {
      parts.push('[9-hole]')
    }
    
    return parts.join(' ')
  }
  
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label}
      </label>
      <select
        value={selectedRound || ''}
        onChange={(e) => onRoundSelect(e.target.value)}
        className="w-full md:w-auto px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-600"
      >
        {rounds.map(round => (
          <option key={round.id} value={round.id} className="bg-gray-800">
            {formatRoundOption(round)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default RoundSelector