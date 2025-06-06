import React, { useEffect } from 'react'

/**
 * Modal - Atomic component for modal dialogs
 * Mobile-optimized with backdrop and animation
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Callback when modal should close
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {ReactNode} footer - Modal footer (typically buttons)
 * @param {string} size - Modal size: 'sm', 'md', 'lg' (default: 'md')
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md' 
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          className={`
            relative transform overflow-hidden rounded-xl bg-gray-800 
            text-left shadow-xl transition-all w-full
            ${sizeClasses[size]}
          `}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gray-900 px-4 py-4 sm:px-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-4 sm:px-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="bg-gray-900 px-4 py-3 sm:px-6 border-t border-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal