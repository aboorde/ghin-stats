import React from 'react'

/**
 * ScoreInput - Atomic component for entering golf scores
 * Mobile-optimized with large touch targets and visual feedback
 * 
 * @param {number} value - Current score value
 * @param {function} onChange - Callback when value changes
 * @param {number} par - Par for the hole (affects color)
 * @param {number} min - Minimum allowed value (default: 1)
 * @param {number} max - Maximum allowed value (default: 15)
 * @param {string} label - Accessible label
 * @param {boolean} disabled - Whether input is disabled
 */
const ScoreInput = ({ 
  value, 
  onChange, 
  par, 
  min = 1, 
  max = 15, 
  label,
  disabled = false,
  className = ''
}) => {
  const getScoreColor = (score) => {
    if (!score || !par) return 'text-gray-400'
    const diff = score - par
    if (diff < -1) return 'text-purple-400' // Eagle or better
    if (diff === -1) return 'text-green-400' // Birdie
    if (diff === 0) return 'text-yellow-400' // Par
    if (diff === 1) return 'text-orange-400' // Bogey
    if (diff === 2) return 'text-red-400' // Double
    return 'text-rose-600' // Triple+
  }

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1)
    }
  }

  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1)
    }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <label className="text-xs text-gray-400 mb-1">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={`
            w-10 h-10 rounded-lg font-bold text-lg
            transition-all duration-200 transform
            ${disabled || value <= min 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:scale-95'
            }
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900
          `}
          aria-label="Decrease score"
        >
          −
        </button>
        
        <div className={`
          w-16 h-16 rounded-xl flex items-center justify-center
          bg-gray-800 border-2 border-gray-700
          text-2xl font-bold transition-all duration-200
          ${getScoreColor(value)}
          ${disabled ? 'opacity-50' : ''}
        `}>
          {value || '−'}
        </div>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={`
            w-10 h-10 rounded-lg font-bold text-lg
            transition-all duration-200 transform
            ${disabled || value >= max 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:scale-95'
            }
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900
          `}
          aria-label="Increase score"
        >
          +
        </button>
      </div>
      
      {/* Visual indicator of score vs par */}
      {value && par && (
        <div className="text-xs mt-1 font-medium">
          {value === par && 'Par'}
          {value < par && `−${par - value}`}
          {value > par && `+${value - par}`}
        </div>
      )}
    </div>
  )
}

export default ScoreInput