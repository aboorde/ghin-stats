import React from 'react'

/**
 * MetricGrid - Responsive grid layout for metric cards
 * 
 * @param {React.ReactNode} children - Metric cards
 * @param {number} columns - Number of columns (default: 4)
 * @param {string} gap - Gap size (default: 'gap-3')
 * @param {string} className - Additional CSS classes
 * @param {object} responsive - Responsive column config
 */
const MetricGrid = ({ 
  children, 
  columns = 4,
  gap = 'gap-3',
  className = '',
  responsive = {
    sm: 2,    // 2 columns on small screens
    md: 4,    // 4 columns on medium screens
    lg: null  // Use default columns on large screens
  }
}) => {
  const getGridCols = () => {
    const cols = []
    if (responsive.sm) cols.push(`grid-cols-${responsive.sm}`)
    if (responsive.md) cols.push(`md:grid-cols-${responsive.md}`)
    if (responsive.lg) cols.push(`lg:grid-cols-${responsive.lg || columns}`)
    else cols.push(`lg:grid-cols-${columns}`)
    return cols.join(' ')
  }

  // For Tailwind CSS class detection
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  return (
    <div className={`grid ${getGridCols()} ${gap} ${className}`}>
      {children}
    </div>
  )
}

export default MetricGrid