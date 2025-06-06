import React from 'react'
import { Button } from '../atoms'
import { getScoreColor } from '../../utils/theme'
import { format } from 'date-fns'

/**
 * RoundTableRow - Molecule component for displaying a round in table/card format
 * Responsive design that adapts from table row on desktop to card on mobile
 * 
 * @param {Object} round - Round data
 * @param {function} onDelete - Callback when delete is clicked
 * @param {boolean} isMobile - Whether to show mobile card layout
 */
const RoundTableRow = ({ round, onDelete, isMobile = false }) => {
  const scoreVsPar = round.adjusted_gross_score - (round.number_of_holes === 18 ? 72 : 36)
  
  if (isMobile) {
    // Mobile card layout
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-white text-lg">{round.course_name}</h3>
            <p className="text-sm text-gray-400">{round.tee_name} Tees</p>
          </div>
          <button
            onClick={() => onDelete(round)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            aria-label="Delete round"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Date:</span>
            <span className="ml-2 text-gray-300">{format(new Date(round.played_at), 'MMM d, yyyy')}</span>
          </div>
          <div>
            <span className="text-gray-500">Score:</span>
            <span className={`ml-2 font-semibold ${getScoreColor(round.adjusted_gross_score, round.number_of_holes * 4)}`}>
              {round.adjusted_gross_score}
            </span>
          </div>
          <div>
            <span className="text-gray-500">vs Par:</span>
            <span className={`ml-2 font-semibold ${
              scoreVsPar < 0 ? 'text-green-400' : 
              scoreVsPar === 0 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {scoreVsPar > 0 ? '+' : ''}{scoreVsPar}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Differential:</span>
            <span className="ml-2 text-gray-300">{round.differential.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {round.number_of_holes} holes • Rating: {round.course_rating}/{round.slope_rating}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            round.status === 'posted' 
              ? 'bg-green-900/30 text-green-400' 
              : 'bg-yellow-900/30 text-yellow-400'
          }`}>
            {round.status}
          </span>
        </div>
      </div>
    )
  }

  // Desktop table row layout
  return (
    <tr className="hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-300">{format(new Date(round.played_at), 'MMM d, yyyy')}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-white">{round.course_name}</div>
        <div className="text-xs text-gray-400">{round.tee_name} • {round.course_rating}/{round.slope_rating}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`text-sm font-semibold ${getScoreColor(round.adjusted_gross_score, round.number_of_holes * 4)}`}>
          {round.adjusted_gross_score}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`text-sm font-semibold ${
          scoreVsPar < 0 ? 'text-green-400' : 
          scoreVsPar === 0 ? 'text-yellow-400' : 
          'text-red-400'
        }`}>
          {scoreVsPar > 0 ? '+' : ''}{scoreVsPar}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className="text-sm text-gray-300">{round.differential.toFixed(1)}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className="text-sm text-gray-400">{round.number_of_holes}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          round.status === 'posted' 
            ? 'bg-green-900/30 text-green-400' 
            : 'bg-yellow-900/30 text-yellow-400'
        }`}>
          {round.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button
          onClick={() => onDelete(round)}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          aria-label="Delete round"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    </tr>
  )
}

export default RoundTableRow