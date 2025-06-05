import React, { useMemo } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine, Cell 
} from 'recharts'
import { chartTheme } from '../../utils/theme'
import EmptyState from './EmptyState'

/**
 * MonthlyPerformanceChart - Enhanced monthly performance visualization
 * 
 * @param {array} monthlyData - Array of monthly performance data
 * @param {number} yearAverage - Average score for the year
 * @param {string} className - Additional CSS classes
 */
const MonthlyPerformanceChart = ({ monthlyData, yearAverage, className = '' }) => {
  // Prepare complete monthly data with all 12 months
  const completeMonthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Create a map of existing data
    const dataMap = new Map()
    monthlyData.forEach(item => {
      dataMap.set(item.month, item)
    })
    
    // Fill in all months, including those with no rounds
    return months.map(month => {
      const existing = dataMap.get(month)
      if (existing) {
        return {
          ...existing,
          avgScore: parseFloat(existing.avgScore),
          hasData: true
        }
      }
      return {
        month,
        avgScore: null,
        rounds: 0,
        hasData: false
      }
    })
  }, [monthlyData])

  // Calculate dynamic Y-axis domain
  const yDomain = useMemo(() => {
    const scores = monthlyData
      .map(d => parseFloat(d.avgScore))
      .filter(score => !isNaN(score) && score > 0)
    
    if (scores.length === 0) return [95, 115]
    
    const minScore = Math.min(...scores)
    const maxScore = Math.max(...scores)
    const padding = 5
    
    // Round to nearest 5
    const minDomain = Math.floor((minScore - padding) / 5) * 5
    const maxDomain = Math.ceil((maxScore + padding) / 5) * 5
    
    return [minDomain, maxDomain]
  }, [monthlyData])

  // Custom tooltip to show more info
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      if (!data.hasData) {
        return (
          <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
            <p className="text-sm font-medium text-gray-200">{label}</p>
            <p className="text-xs text-gray-400">No rounds played</p>
          </div>
        )
      }
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
          <p className="text-sm font-medium text-gray-200">{label}</p>
          <p className="text-sm text-green-400">
            Avg: {data.avgScore.toFixed(1)}
          </p>
          <p className="text-xs text-gray-400">
            {data.rounds} round{data.rounds !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom bar shape to handle no data
  const CustomBar = (props) => {
    const { fill, x, y, width, height, payload } = props
    
    if (!payload.hasData) {
      // Show a dashed outline for months with no data
      return (
        <g>
          <rect
            x={x}
            y={yDomain[0]}
            width={width}
            height={0}
            fill="none"
            stroke="#374151"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text
            x={x + width / 2}
            y={y + height / 2}
            fill="#6b7280"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
          >
            -
          </text>
        </g>
      )
    }
    
    return <rect x={x} y={y} width={width} height={height} fill={fill} />
  }

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <EmptyState
        message="No monthly data available"
        submessage="Play some rounds to see monthly trends"
        icon="📅"
      />
    )
  }

  return (
    <div className={className}>
      <div className="h-48 sm:h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={completeMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: chartTheme.textColor, fontSize: 12 }}
              stroke={chartTheme.gridColor}
            />
            <YAxis 
              domain={yDomain}
              tick={{ fill: chartTheme.textColor }}
              stroke={chartTheme.gridColor}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            {yearAverage && (
              <ReferenceLine 
                y={yearAverage} 
                stroke="#f59e0b" 
                strokeDasharray="8 4"
                label={{
                  value: `Year Avg: ${yearAverage.toFixed(1)}`,
                  position: "right",
                  fill: "#f59e0b",
                  fontSize: 12
                }}
              />
            )}
            <Bar 
              dataKey="avgScore" 
              shape={<CustomBar />}
            >
              {completeMonthlyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    !entry.hasData ? 'transparent' :
                    entry.avgScore < yearAverage ? '#10b981' : // Green if better than average
                    entry.avgScore === yearAverage ? '#f59e0b' : // Orange if equal
                    '#ef4444' // Red if worse
                  } 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-400">Better than year avg</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-400">Worse than year avg</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-gray-600 border-dashed rounded"></div>
          <span className="text-gray-400">No rounds played</span>
        </div>
      </div>
    </div>
  )
}

export default MonthlyPerformanceChart