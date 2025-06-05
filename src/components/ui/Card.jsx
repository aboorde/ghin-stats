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
    default: 'bg-slate-900/80 border-pink-900/20',
    elevated: 'bg-slate-900/90 shadow-xl shadow-pink-900/10 border-pink-900/30',
    accent: 'bg-gradient-to-br from-slate-900 to-pink-950/20 border-pink-800/40',
  }

  const baseClasses = `
    rounded-xl border backdrop-blur-sm
    transition-all duration-300 p-4
    ${variants[variant]}
    ${glow ? 'shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30' : ''}
    ${onClick ? 'cursor-pointer hover:border-pink-700/50 hover:transform hover:scale-[1.02]' : ''}
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