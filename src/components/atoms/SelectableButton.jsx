import React from 'react'

/**
 * SelectableButton - Button that shows selected state
 * 
 * @param {boolean} isSelected - Whether the button is selected
 * @param {function} onClick - Click handler
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 * @param {string} selectedClass - Classes when selected
 * @param {string} unselectedClass - Classes when not selected
 */
const SelectableButton = ({ 
  isSelected, 
  onClick, 
  children,
  className = '',
  selectedClass = 'bg-gradient-to-r from-green-900/40 to-yellow-900/40 border-green-600/50 border-2',
  unselectedClass = 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700'
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
        isSelected ? selectedClass : unselectedClass
      } ${className}`}
    >
      {children}
    </button>
  )
}

export default SelectableButton