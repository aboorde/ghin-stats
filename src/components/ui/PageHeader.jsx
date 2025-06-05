import React from 'react'

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-300 text-lg">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
      <div className="mt-6 h-px bg-gradient-to-r from-pink-600/50 via-yellow-600/50 to-transparent" />
    </div>
  )
}

export default PageHeader