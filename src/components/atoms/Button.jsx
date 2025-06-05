import React from 'react'
import PropTypes from 'prop-types'

/**
 * Button - Primary UI component for user interaction
 * 
 * A flexible button component that supports multiple variants,
 * sizes, and states while maintaining Scratch Pad's unique
 * dark mode aesthetic.
 */
const Button = ({ 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  children,
  className = '',
  ...props
}) => {
  // Variant styles
  const variants = {
    primary: `
      bg-gradient-to-br from-pink-500 to-pink-700 
      text-white font-medium 
      shadow-lg shadow-pink-500/25 
      hover:shadow-xl hover:shadow-pink-500/40 
      hover:from-pink-400 hover:to-pink-600
      focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900
      disabled:from-gray-700 disabled:to-gray-800 disabled:shadow-none
    `,
    secondary: `
      bg-slate-800/80 
      text-pink-400 font-medium 
      border border-pink-900/30 
      hover:bg-pink-900/30 hover:border-pink-700/50 
      hover:text-pink-300
      focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900
      disabled:bg-slate-800/40 disabled:text-gray-500 disabled:border-gray-700
    `,
    ghost: `
      bg-transparent 
      text-gray-400 
      hover:text-pink-400 hover:bg-pink-900/20
      focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900
      disabled:text-gray-600 disabled:hover:bg-transparent
    `,
    danger: `
      bg-gradient-to-br from-red-600 to-red-800 
      text-white font-medium 
      shadow-lg shadow-red-500/25 
      hover:shadow-xl hover:shadow-red-500/40 
      hover:from-red-500 hover:to-red-700
      focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900
      disabled:from-gray-700 disabled:to-gray-800 disabled:shadow-none
    `,
    success: `
      bg-gradient-to-br from-green-600 to-green-800 
      text-white font-medium 
      shadow-lg shadow-green-500/25 
      hover:shadow-xl hover:shadow-green-500/40 
      hover:from-green-500 hover:to-green-700
      focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900
      disabled:from-gray-700 disabled:to-gray-800 disabled:shadow-none
    `
  }

  // Size styles
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  }

  // Build class names
  const buttonClasses = [
    'inline-flex items-center justify-center',
    'rounded-lg',
    'transition-all duration-200',
    'font-medium',
    'cursor-pointer',
    'select-none',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    (disabled || loading) && 'cursor-not-allowed opacity-60',
    className
  ].filter(Boolean).join(' ')

  // Loading spinner component
  const Spinner = () => (
    <svg 
      className="animate-spin h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  // Render icon with proper spacing
  const renderIcon = () => {
    if (loading) return <Spinner />
    if (!icon) return null
    return <span className="flex-shrink-0">{icon}</span>
  }

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {(icon || loading) && iconPosition === 'left' && (
        <span className="mr-2">{renderIcon()}</span>
      )}
      
      <span className="truncate">{children}</span>
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{renderIcon()}</span>
      )}
    </button>
  )
}

Button.propTypes = {
  /** Button variant style */
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'success']),
  /** Button size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Loading state */
  loading: PropTypes.bool,
  /** Icon element */
  icon: PropTypes.node,
  /** Icon position */
  iconPosition: PropTypes.oneOf(['left', 'right']),
  /** Full width button */
  fullWidth: PropTypes.bool,
  /** Click handler */
  onClick: PropTypes.func,
  /** Button content */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string
}

export default Button