import React, { useMemo } from 'react';
import { calculateDetailedStatistics, formatDetailedStatistics } from '../services/detailedStatsService';
import { MetricCard, SectionHeader } from './atoms';
import { MetricGrid, EmptyState } from './molecules';
import Card from './ui/Card';

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
    return <EmptyState message="No detailed statistics available" />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Detailed Analysis" 
        size="lg"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution Card */}
        <Card className="p-6">
          <SectionHeader title="Score Distribution" size="sm" />
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
        </Card>

        {/* Performance Trends Card */}
        <Card className="p-6">
          <SectionHeader title="Performance Trends" size="sm" />
          <div className="space-y-4">
            <MetricCard
              label="Recent 10 Rounds Avg"
              value={detailedStats.recentAverage}
              theme="gray"
              size="sm"
            />
            <MetricCard
              label="Improvement"
              value={detailedStats.improvement.display}
              theme={detailedStats.improvement.isImproving ? 'green' : 'red'}
              size="sm"
              icon={detailedStats.improvement.isImproving ? '📈' : '📉'}
            />
            <MetricCard
              label="Consistency"
              value={detailedStats.consistency.display}
              subValue={detailedStats.consistency.rating.description}
              theme={
                detailedStats.consistency.rating.color.includes('green') ? 'green' :
                detailedStats.consistency.rating.color.includes('yellow') ? 'yellow' :
                'red'
              }
              size="sm"
            />
          </div>
        </Card>

        {/* Par Type Performance Card */}
        <Card className="p-6">
          <SectionHeader title="Par Type Performance" size="sm" />
          <div className="space-y-4">
            <MetricCard
              label="Par 3 Average"
              value={detailedStats.parTypePerformance.par3.display}
              trend={detailedStats.parTypePerformance.par3.vsPar ? `${detailedStats.parTypePerformance.par3.vsPar} over par` : undefined}
              theme="gray"
              size="sm"
              icon="⛳"
            />
            <MetricCard
              label="Par 4 Average"
              value={detailedStats.parTypePerformance.par4.display}
              trend={detailedStats.parTypePerformance.par4.vsPar ? `${detailedStats.parTypePerformance.par4.vsPar} over par` : undefined}
              theme="gray"
              size="sm"
              icon="🏌️"
            />
            <MetricCard
              label="Par 5 Average"
              value={detailedStats.parTypePerformance.par5.display}
              trend={detailedStats.parTypePerformance.par5.vsPar ? `${detailedStats.parTypePerformance.par5.vsPar} over par` : undefined}
              theme="gray"
              size="sm"
              icon="🦅"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DetailedStats;