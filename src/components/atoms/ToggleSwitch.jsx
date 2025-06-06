import React from 'react'

/**
 * ToggleSwitch - Mobile-optimized toggle for boolean values
 * Used for Fairway Hit, GIR, etc.
 * 
 * @param {boolean} value - Current state
 * @param {function} onChange - Callback when toggled
 * @param {string} label - Label for the toggle
 * @param {string} onText - Text when on (default: "Yes")
 * @param {string} offText - Text when off (default: "No")
 * @param {string} onColor - Color class when on
 * @param {boolean} disabled - Whether toggle is disabled
 */
const ToggleSwitch = ({ 
  value, 
  onChange, 
  label,
  onText = "Yes",
  offText = "No",
  onColor = "bg-green-600",
  disabled = false 
}) => {
  return (
    <div className="flex flex-col items-center space-y-1">
      {label && (
        <label className="text-xs text-gray-400">{label}</label>
      )}
      <button
        type="button"
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`
          relative inline-flex items-center h-10 rounded-full w-20
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${value ? onColor : 'bg-gray-700'}
        `}
        role="switch"
        aria-checked={value}
        aria-label={label}
      >
        <span className={`
          inline-block w-8 h-8 transform transition-transform duration-300 ease-in-out
          bg-white rounded-full shadow-md
          ${value ? 'translate-x-11' : 'translate-x-1'}
        `} />
        <span className={`
          absolute inset-0 flex items-center justify-center text-xs font-medium
          ${value ? 'justify-start pl-2' : 'justify-end pr-2'}
        `}>
          <span className={value ? 'text-white' : 'text-gray-400'}>
            {value ? onText : offText}
          </span>
        </span>
      </button>
    </div>
  )
}

export default ToggleSwitch