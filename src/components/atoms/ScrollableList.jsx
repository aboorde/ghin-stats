import React from 'react'

/**
 * ScrollableList - Reusable scrollable container with consistent styling
 * 
 * @param {React.ReactNode} children - List content
 * @param {string} maxHeight - Maximum height (default: 'max-h-96')
 * @param {string} className - Additional CSS classes
 * @param {boolean} showScrollbar - Whether to show scrollbar (default: true)
 */
const ScrollableList = ({ 
  children, 
  maxHeight = 'max-h-96',
  className = '',
  showScrollbar = true
}) => {
  const scrollbarClass = showScrollbar ? '' : 'scrollbar-hide'
  
  return (
    <div className={`${maxHeight} overflow-y-auto ${scrollbarClass} ${className}`}>
      {children}
    </div>
  )
}

export default ScrollableList