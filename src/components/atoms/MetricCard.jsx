import React from 'react'

/**
 * MetricCard - Reusable component for displaying a single metric
 * 
 * @param {string} label - The metric label
 * @param {string|number} value - The main value to display
 * @param {string} subValue - Optional secondary value or description
 * @param {string} theme - Color theme: 'blue', 'green', 'purple', 'orange', 'red', 'yellow', 'gray'
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {string} icon - Optional emoji or icon
 * @param {string} trend - Optional trend value (e.g., "+2.5 vs par")
 * @param {string} className - Additional CSS classes
 */
const MetricCard = ({ 
  label, 
  value, 
  subValue, 
  theme = 'gray',
  size = 'md',
  icon,
  trend,
  className = ''
}) => {
  const themes = {
    blue: 'bg-blue-900/30 border-blue-600/30 text-blue-400',
    green: 'bg-green-900/30 border-green-600/30 text-green-400',
    purple: 'bg-purple-900/30 border-purple-600/30 text-purple-400',
    orange: 'bg-orange-900/30 border-orange-600/30 text-orange-400',
    red: 'bg-red-900/30 border-red-600/30 text-red-400',
    yellow: 'bg-yellow-900/30 border-yellow-600/30 text-yellow-400',
    gray: 'bg-gray-800/50 border-gray-700 text-gray-200'
  }

  const sizes = {
    sm: {
      padding: 'p-2',
      labelText: 'text-xs',
      valueText: 'text-lg',
      subText: 'text-xs',
      iconText: 'text-sm'
    },
    md: {
      padding: 'p-3',
      labelText: 'text-xs',
      valueText: 'text-2xl',
      subText: 'text-xs',
      iconText: 'text-lg'
    },
    lg: {
      padding: 'p-4',
      labelText: 'text-sm',
      valueText: 'text-3xl',
      subText: 'text-sm',
      iconText: 'text-2xl'
    }
  }

  const sizeConfig = sizes[size]
  const themeClass = themes[theme]

  return (
    <div className={`${themeClass} ${sizeConfig.padding} rounded-lg border ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`${sizeConfig.labelText} text-gray-400`}>{label}</div>
          <div className={`${sizeConfig.valueText} font-bold`}>
            {value}
          </div>
          {(subValue || trend) && (
            <div className={`${sizeConfig.subText} text-gray-500 mt-1`}>
              {subValue}
              {trend && <div className="mt-0.5">{trend}</div>}
            </div>
          )}
        </div>
        {icon && (
          <div className={`${sizeConfig.iconText} ml-2 opacity-50`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default MetricCard