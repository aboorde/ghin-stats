import React from 'react'

const StatCard = ({ 
  label, 
  value, 
  subValue, 
  icon, 
  color = 'green',
  trend,
  className = ''
}) => {
  const colorClasses = {
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    gold: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
  }

  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→'
  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'

  return (
    <div className={`
      relative overflow-hidden
      bg-gradient-to-br ${colorClasses[color]}
      border rounded-xl p-6
      backdrop-blur-sm
      transition-all duration-300
      hover:transform hover:scale-105
      ${className}
    `}>
      {/* Background pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
        <div className="w-24 h-24 rounded-full bg-current transform rotate-45" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${colorClasses[color].split(' ')[3]}`}>
                {value}
              </p>
              {trend !== undefined && (
                <span className={`text-sm font-medium ${trendColor}`}>
                  {trendIcon} {Math.abs(trend)}%
                </span>
              )}
            </div>
            {subValue && (
              <p className="text-sm text-gray-500 mt-1">{subValue}</p>
            )}
          </div>
          {icon && (
            <div className={`text-2xl ${colorClasses[color].split(' ')[3]} opacity-50`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatCard