import React, { useMemo } from 'react';
import { calculateDetailedStatistics, formatDetailedStatistics } from '../services/detailedStatsService';

/**
 * DetailedStats Component
 * 
 * Displays comprehensive statistical analysis for golf performance.
 * Uses the detailedStatsService to calculate:
 * - Score distribution across ranges
 * - Recent improvement trends
 * - Consistency metrics
 * - Par type performance
 * 
 * @param {Array} scores - Array of score objects with statistics
 * @param {Object} summaryStats - Summary statistics object (legacy prop, not used)
 */
function DetailedStats({ scores, summaryStats }) {
  // Calculate all detailed statistics using our service
  const detailedStats = useMemo(() => {
    if (!scores || scores.length === 0) return null;
    
    // Calculate raw statistics
    const stats = calculateDetailedStatistics(scores);
    
    // Format for display
    return formatDetailedStatistics(stats);
  }, [scores]);

  // Don't render if no data available
  if (!detailedStats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-200">Detailed Analysis</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution Card */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Score Distribution</h4>
          <div className="space-y-3">
            {detailedStats.scoreDistribution.map((item) => (
              <div key={item.range} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.range}:</span>
                  <span className="text-gray-300">{item.count} rounds ({item.displayPercentage})</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trends Card */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Performance Trends</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Recent 10 Rounds Avg:</span>
              <span className="text-lg font-medium text-gray-200">{detailedStats.recentAverage}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Improvement:</span>
              <span className={`text-lg font-medium ${detailedStats.improvement.isImproving ? 'text-green-400' : 'text-red-400'}`}>
                {detailedStats.improvement.display}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Consistency:</span>
                <span className={`text-lg font-medium ${detailedStats.consistency.rating.color}`}>
                  {detailedStats.consistency.display}
                </span>
              </div>
              <div className="text-xs text-gray-500 text-right">
                {detailedStats.consistency.rating.description}
              </div>
            </div>
          </div>
        </div>

        {/* Par Type Performance Card */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Par Type Performance</h4>
          <div className="space-y-4">
            {/* Par 3 */}
            <div className="pb-3 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Par 3 Average:</span>
                <span className="text-lg font-medium text-gray-200">
                  {detailedStats.parTypePerformance.par3.display}
                </span>
              </div>
              {detailedStats.parTypePerformance.par3.vsPar && (
                <div className="text-xs text-gray-500 text-right mt-1">
                  {detailedStats.parTypePerformance.par3.vsPar} over par
                </div>
              )}
            </div>
            
            {/* Par 4 */}
            <div className="pb-3 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Par 4 Average:</span>
                <span className="text-lg font-medium text-gray-200">
                  {detailedStats.parTypePerformance.par4.display}
                </span>
              </div>
              {detailedStats.parTypePerformance.par4.vsPar && (
                <div className="text-xs text-gray-500 text-right mt-1">
                  {detailedStats.parTypePerformance.par4.vsPar} over par
                </div>
              )}
            </div>
            
            {/* Par 5 */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Par 5 Average:</span>
                <span className="text-lg font-medium text-gray-200">
                  {detailedStats.parTypePerformance.par5.display}
                </span>
              </div>
              {detailedStats.parTypePerformance.par5.vsPar && (
                <div className="text-xs text-gray-500 text-right mt-1">
                  {detailedStats.parTypePerformance.par5.vsPar} over par
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailedStats;