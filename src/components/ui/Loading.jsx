import React from 'react'

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* Golf ball animation */}
        <div className="w-16 h-16 bg-white rounded-full shadow-lg animate-bounce">
          <div className="absolute inset-2 bg-gray-100 rounded-full" />
          <div className="absolute top-2 left-2 w-2 h-2 bg-gray-300 rounded-full" />
          <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-gray-300 rounded-full" />
        </div>
        
        {/* Green glow effect */}
        <div className="absolute inset-0 animate-ping">
          <div className="w-16 h-16 bg-green-500 rounded-full opacity-20" />
        </div>
      </div>
      
      <p className="mt-6 text-gray-400 text-lg animate-pulse">{message}</p>
    </div>
  )
}

export default Loading