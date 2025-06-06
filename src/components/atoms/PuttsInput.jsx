import React from 'react'

/**
 * PuttsInput - Specialized input for number of putts
 * Optimized for mobile with preset common values
 * 
 * @param {number} value - Current putts value
 * @param {function} onChange - Callback when value changes
 * @param {boolean} disabled - Whether input is disabled
 */
const PuttsInput = ({ value, onChange, disabled = false }) => {
  const commonPutts = [0, 1, 2, 3, 4]
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <label className="text-xs text-gray-400">Putts</label>
      <div className="flex gap-1">
        {commonPutts.map((putts) => (
          <button
            key={putts}
            type="button"
            onClick={() => onChange(putts)}
            disabled={disabled}
            className={`
              w-10 h-10 rounded-lg font-medium text-sm
              transition-all duration-200 transform
              ${value === putts 
                ? 'bg-pink-600 text-white scale-105 shadow-lg shadow-pink-600/20' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
              focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900
            `}
          >
            {putts}
          </button>
        ))}
        
        {/* Custom input for 5+ putts */}
        {value > 4 && (
          <div className="w-10 h-10 rounded-lg bg-pink-600 text-white flex items-center justify-center font-medium text-sm">
            {value}
          </div>
        )}
      </div>
      
      {/* Add buttons for 5+ putts */}
      {value >= 4 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            disabled={disabled || value <= 0}
            className="text-gray-400 hover:text-gray-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            disabled={disabled}
            className="text-gray-400 hover:text-gray-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default PuttsInput