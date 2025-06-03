import React from 'react'

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  glow = false,
  onClick,
  ...props 
}) => {
  const variants = {
    default: 'bg-gray-900 border-gray-800',
    elevated: 'bg-gray-900 shadow-xl border-gray-700',
    accent: 'bg-gradient-to-br from-gray-900 to-gray-800 border-green-900',
  }

  const baseClasses = `
    rounded-xl border backdrop-blur-sm
    transition-all duration-300 p-4
    ${variants[variant]}
    ${glow ? 'shadow-lg shadow-green-500/10 hover:shadow-green-500/20' : ''}
    ${onClick ? 'cursor-pointer hover:border-green-700 hover:transform hover:scale-[1.02]' : ''}
  `

  return (
    <div 
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card