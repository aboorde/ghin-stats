import React from 'react'

/**
 * SectionHeader - Consistent section header styling
 * 
 * @param {string} title - Section title
 * @param {string} subtitle - Optional subtitle
 * @param {string} className - Additional CSS classes
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 */
const SectionHeader = ({ 
  title, 
  subtitle,
  className = '',
  size = 'md'
}) => {
  const sizes = {
    sm: {
      title: 'text-sm font-medium',
      subtitle: 'text-xs',
      margin: 'mb-2'
    },
    md: {
      title: 'text-base font-semibold',
      subtitle: 'text-sm',
      margin: 'mb-3'
    },
    lg: {
      title: 'text-lg font-semibold',
      subtitle: 'text-base',
      margin: 'mb-4'
    }
  }

  const sizeConfig = sizes[size]

  return (
    <div className={`${sizeConfig.margin} ${className}`}>
      <h3 className={`${sizeConfig.title} text-gray-300`}>{title}</h3>
      {subtitle && (
        <p className={`${sizeConfig.subtitle} text-gray-400 mt-1`}>{subtitle}</p>
      )}
    </div>
  )
}

export default SectionHeader