import React from 'react'

/**
 * DriveAccuracyInput - Visual drive accuracy selector
 * Mobile-optimized with visual representation of fairway/miss directions
 * 
 * @param {string} value - Current value: 'fairway', 'left', 'right', 'short', 'long'
 * @param {function} onChange - Callback when value changes
 * @param {boolean} disabled - Whether input is disabled
 * @param {boolean} isPar3 - Whether this is a par 3 (no drive)
 */
const DriveAccuracyInput = ({ value, onChange, disabled = false, isPar3 = false }) => {
  if (isPar3) {
    return (
      <div className="flex flex-col items-center space-y-1">
        <label className="text-xs text-gray-400">Drive</label>
        <div className="text-xs text-gray-600 italic">N/A - Par 3</div>
      </div>
    )
  }

  const options = [
    { 
      id: 'left', 
      label: 'L',
      fullLabel: 'Left',
      icon: '←',
      color: 'bg-orange-600'
    },
    { 
      id: 'fairway', 
      label: 'FW',
      fullLabel: 'Fairway',
      icon: '✓',
      color: 'bg-green-600'
    },
    { 
      id: 'right', 
      label: 'R',
      fullLabel: 'Right',
      icon: '→',
      color: 'bg-orange-600'
    }
  ]

  return (
    <div className="flex flex-col items-center space-y-2">
      <label className="text-xs text-gray-400">Drive</label>
      
      {/* Visual fairway representation */}
      <div className="relative w-32 h-20">
        {/* Fairway visual */}
        <div className="absolute inset-x-8 inset-y-0 bg-green-900/30 rounded-lg border border-green-800"></div>
        
        {/* Rough areas */}
        <div className="absolute left-0 inset-y-0 w-8 bg-green-950/30 rounded-l-lg border-l border-t border-b border-green-900"></div>
        <div className="absolute right-0 inset-y-0 w-8 bg-green-950/30 rounded-r-lg border-r border-t border-b border-green-900"></div>
        
        {/* Selection buttons */}
        <div className="absolute inset-0 flex items-center justify-between">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              disabled={disabled}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                text-xs font-bold transition-all duration-200 transform
                ${value === option.id 
                  ? `${option.color} text-white scale-110 shadow-lg` 
                  : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                ${option.id === 'fairway' ? 'z-10' : ''}
              `}
              title={option.fullLabel}
            >
              {option.icon}
            </button>
          ))}
        </div>
      </div>
      
      {/* Text label */}
      {value && (
        <div className="text-xs font-medium text-gray-400">
          {options.find(o => o.id === value)?.fullLabel}
        </div>
      )}
    </div>
  )
}

export default DriveAccuracyInput