import React from 'react'
import { calculateScoreToPar, getScoreBackgroundColor } from '../../utils/scoringUtils'

/**
 * HoleCard - Display individual hole score information
 * 
 * @param {number} holeNumber - Hole number (1-18)
 * @param {number} par - Par for the hole
 * @param {number} score - Player's score
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} showLabel - Whether to show score label (Birdie, Par, etc.)
 * @param {function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 */
const HoleCard = ({ 
  holeNumber, 
  par, 
  score,
  size = 'md',
  showLabel = true,
  onClick,
  className = ''
}) => {
  const scoreToPar = calculateScoreToPar(score, par)
  const backgroundClasses = getScoreBackgroundColor(score, par)
  
  const sizes = {
    sm: {
      padding: 'p-2',
      holeText: 'text-xs',
      parText: 'text-xs',
      scoreText: 'text-lg',
      labelText: 'text-xs'
    },
    md: {
      padding: 'p-2 sm:p-3',
      holeText: 'text-xs sm:text-sm',
      parText: 'text-xs',
      scoreText: 'text-xl sm:text-2xl',
      labelText: 'text-xs sm:text-sm'
    },
    lg: {
      padding: 'p-3 sm:p-4',
      holeText: 'text-sm sm:text-base',
      parText: 'text-sm',
      scoreText: 'text-2xl sm:text-3xl',
      labelText: 'text-sm sm:text-base'
    }
  }
  
  const sizeConfig = sizes[size]
  
  return (
    <div
      onClick={onClick}
      className={`
        ${sizeConfig.padding} 
        rounded-lg border-2 
        transition-all duration-200 
        hover:scale-105 
        ${backgroundClasses}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className={`${sizeConfig.holeText} font-medium text-gray-400`}>
        Hole {holeNumber}
      </div>
      <div className={`${sizeConfig.parText} text-gray-500`}>
        Par {par}
      </div>
      <div className={`${sizeConfig.scoreText} font-bold text-gray-100`}>
        {score}
      </div>
      {showLabel && (
        <div className={`${sizeConfig.labelText} font-medium ${scoreToPar.color}`}>
          {scoreToPar.text}
        </div>
      )}
    </div>
  )
}

export default HoleCard