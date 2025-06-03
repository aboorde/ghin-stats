import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { chartTheme } from '../utils/theme';

/**
 * Component to display average performance by hole
 * @param {Array} holeAverages - Array of hole average objects
 */
function HolePerformanceChart({ holeAverages }) {
  if (!holeAverages || holeAverages.length === 0) {
    return <div className="text-center text-gray-400 py-4">No hole average data available</div>;
  }


  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-200">Hole {label}</p>
          <p className="text-sm text-gray-400">Par: {data.par}</p>
          <p className="text-sm text-gray-400">Avg Score: {data.avgScore}</p>
          <p className="text-sm text-gray-400">Over Par: {data.overUnderPar > 0 ? '+' : ''}{data.overUnderPar.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  // Color function based on performance relative to par
  const getBarColor = (overUnderPar) => {
    const diff = parseFloat(overUnderPar);
    if (diff <= 0.5) return '#10b981'; // Green for good performance
    if (diff <= 1.0) return '#fbbf24'; // Yellow for average
    if (diff <= 1.5) return '#f59e0b'; // Orange for poor
    return '#ef4444'; // Red for very poor
  };

  return (
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={holeAverages}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
          <XAxis 
            dataKey="hole" 
            tick={{ fontSize: 12, fill: chartTheme.textColor }}
            label={{ value: 'Hole Number', position: 'insideBottom', offset: -5, fill: chartTheme.textColor }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: chartTheme.textColor }}
            label={{ value: 'Strokes Over Par', angle: -90, position: 'insideLeft', fill: chartTheme.textColor }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: chartTheme.textColor }} />
          <Bar 
            dataKey="overUnderPar" 
            name="Average Over Par"
          >
            {holeAverages.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.overUnderPar)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></span>
          <span className="text-sm text-gray-400">≤ 0.5 over par</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></span>
          <span className="text-sm text-gray-400">0.5 - 1.0 over par</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></span>
          <span className="text-sm text-gray-400">1.0 - 1.5 over par</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></span>
          <span className="text-sm text-gray-400">&gt; 1.5 over par</span>
        </div>
      </div>
    </div>
  );
}

export default HolePerformanceChart;