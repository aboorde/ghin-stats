import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { prepareScoreTrendData } from '../utils/chartDataHelpers';
import { formatDate, formatShortDate } from '../utils/dateHelpers';

/**
 * Component to display score trends over time
 * @param {Array} data - Array of score objects
 */
function ScoreTrendChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Use helper to prepare and sort data
    const prepared = prepareScoreTrendData(data);
    return prepared.map(item => ({
      ...item,
      formattedDate: formatShortDate(item.date)
    }));
  }, [data]);

  if (chartData.length === 0) {
    return <div className="text-gray-400 text-center py-8">No data available for chart</div>;
  }

  // Calculate moving average
  const movingAverage = (data, windowSize = 5) => {
    return data.map((item, index) => {
      const start = Math.max(0, index - windowSize + 1);
      const subset = data.slice(start, index + 1);
      const avg = subset.reduce((sum, d) => sum + d.score, 0) / subset.length;
      return {
        ...item,
        movingAvg: parseFloat(avg.toFixed(1))
      };
    });
  };

  const dataWithMA = movingAverage(chartData);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm font-medium">{formatDate(data.date)}</p>
          <p className="text-green-400 font-bold">Score: {data.score}</p>
          <p className="text-blue-400">Differential: {data.differential.toFixed(1)}</p>
          {data.movingAvg && (
            <p className="text-yellow-400">5-Round Avg: {data.movingAvg}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart 
        data={dataWithMA}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="formattedDate" 
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          interval="preserveStartEnd"
          stroke="#4b5563"
        />
        <YAxis 
          domain={['dataMin - 5', 'dataMax + 5']}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          stroke="#4b5563"
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }}
        />
        <Legend 
          wrapperStyle={{ color: '#e5e7eb' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#10b981" 
          strokeWidth={3}
          dot={{ r: 4, fill: '#10b981' }}
          activeDot={{ r: 6, fill: '#fbbf24' }}
          name="Score"
        />
        <Line 
          type="monotone" 
          dataKey="movingAvg" 
          stroke="#fbbf24" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="5-Round Average"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default ScoreTrendChart;