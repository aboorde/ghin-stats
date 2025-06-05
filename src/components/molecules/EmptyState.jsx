import React from 'react'

/**
 * EmptyState - Displays message when no data is available
 * 
 * @param {string} message - Main message
 * @param {string} submessage - Additional details
 * @param {string} icon - Optional emoji/icon
 * @param {string} className - Additional CSS classes
 */
const EmptyState = ({ 
  message, 
  submessage,
  icon = '📊',
  className = ''
}) => {
  return (
    <div className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 ${className}`}>
      <div className="text-center">
        <div className="text-2xl mb-2 opacity-50">{icon}</div>
        <p className="text-sm text-gray-400">
          {message}
          {submessage && (
            <>
              <br />
              <span className="text-xs">{submessage}</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default EmptyState