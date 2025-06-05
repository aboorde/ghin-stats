import React from 'react'

/**
 * TotalCard - Display total score for a section (front nine, back nine, etc.)
 * 
 * @param {string} label - Label for the total (e.g., "Front Nine Total")
 * @param {number} value - The total value
 * @param {string} theme - Color theme: 'gray', 'green', 'blue'
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
const TotalCard = ({ 
  label, 
  value,
  theme = 'gray',
  size = 'md',
  className = ''
}) => {
  const themes = {
    gray: 'bg-gray-800 border-gray-700',
    green: 'bg-green-900/30 border-green-600/30',
    blue: 'bg-blue-900/30 border-blue-600/30'
  }
  
  const sizes = {
    sm: {
      padding: 'p-2',
      labelText: 'text-sm',
      valueText: 'text-lg'
    },
    md: {
      padding: 'p-3',
      labelText: 'text-base',
      valueText: 'text-xl'
    },
    lg: {
      padding: 'p-4',
      labelText: 'text-lg',
      valueText: 'text-2xl'
    }
  }
  
  const themeClass = themes[theme]
  const sizeConfig = sizes[size]
  
  return (
    <div className={`${sizeConfig.padding} ${themeClass} rounded-lg border ${className}`}>
      <div className="flex justify-between items-center">
        <span className={`${sizeConfig.labelText} font-medium text-gray-400`}>
          {label}
        </span>
        <span className={`${sizeConfig.valueText} font-bold text-gray-200`}>
          {value}
        </span>
      </div>
    </div>
  )
}

export default TotalCard