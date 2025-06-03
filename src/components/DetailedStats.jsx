import React, { useMemo } from 'react';

/**
 * Component to display detailed statistics and insights
 * @param {Array} scores - Array of score objects
 * @param {Object} summaryStats - Summary statistics object
 */
function DetailedStats({ scores, summaryStats }) {
  const additionalStats = useMemo(() => {
    if (!scores || scores.length === 0) return null;

    // Calculate scoring distribution
    const scoreRanges = {
      '< 90': 0,
      '90-94': 0,
      '95-99': 0,
      '100+': 0
    };

    scores.forEach(score => {
      const s = score.adjusted_gross_score;
      if (s < 90) scoreRanges['< 90']++;
      else if (s <= 94) scoreRanges['90-94']++;
      else if (s <= 99) scoreRanges['95-99']++;
      else scoreRanges['100+']++;
    });

    // Calculate improvement over time
    const recentScores = scores.slice(0, 10);
    const olderScores = scores.slice(-10);
    const recentAvg = recentScores.reduce((sum, s) => sum + s.adjusted_gross_score, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((sum, s) => sum + s.adjusted_gross_score, 0) / olderScores.length;
    const improvement = olderAvg - recentAvg;

    // Calculate consistency (standard deviation)
    const mean = scores.reduce((sum, s) => sum + s.adjusted_gross_score, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s.adjusted_gross_score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Calculate par performance averages
    const parStats = scores
      .filter(s => s.statistics && s.statistics[0])
      .map(s => s.statistics[0]);
    
    const avgPar3 = parStats.length > 0 
      ? (parStats.reduce((sum, stat) => sum + (stat.par3s_average || 0), 0) / parStats.length).toFixed(2)
      : 'N/A';
    
    const avgPar4 = parStats.length > 0
      ? (parStats.reduce((sum, stat) => sum + (stat.par4s_average || 0), 0) / parStats.length).toFixed(2)
      : 'N/A';
    
    const avgPar5 = parStats.length > 0
      ? (parStats.reduce((sum, stat) => sum + (stat.par5s_average || 0), 0) / parStats.length).toFixed(2)
      : 'N/A';

    return {
      scoreRanges,
      improvement: improvement.toFixed(1),
      recentAvg: recentAvg.toFixed(1),
      consistency: stdDev.toFixed(1),
      avgPar3,
      avgPar4,
      avgPar5
    };
  }, [scores]);

  if (!summaryStats || !additionalStats) {
    return null;
  }

  return (
    <div className="detailed-stats">
      <h3>Detailed Analysis</h3>
      
      <div className="stats-row">
        <div className="stat-card">
          <h4>Score Distribution</h4>
          <div className="distribution-list">
            {Object.entries(additionalStats.scoreRanges).map(([range, count]) => (
              <div key={range} className="distribution-item">
                <span className="range-label">{range}:</span>
                <span className="range-count">{count} rounds</span>
                <div className="range-bar">
                  <div 
                    className="range-fill" 
                    style={{ width: `${(count / scores.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <h4>Performance Trends</h4>
          <div className="trend-stats">
            <div className="trend-item">
              <span className="trend-label">Recent 10 Rounds Avg:</span>
              <span className="trend-value">{additionalStats.recentAvg}</span>
            </div>
            <div className="trend-item">
              <span className="trend-label">Improvement:</span>
              <span className={`trend-value ${additionalStats.improvement > 0 ? 'positive' : 'negative'}`}>
                {additionalStats.improvement > 0 ? '-' : '+'}{Math.abs(additionalStats.improvement)} strokes
              </span>
            </div>
            <div className="trend-item">
              <span className="trend-label">Consistency (Std Dev):</span>
              <span className="trend-value">±{additionalStats.consistency}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h4>Par Type Performance</h4>
          <div className="par-stats">
            <div className="par-item">
              <span className="par-label">Par 3 Average:</span>
              <span className="par-value">{additionalStats.avgPar3}</span>
              <span className="par-diff">({additionalStats.avgPar3 !== 'N/A' ? (additionalStats.avgPar3 - 3).toFixed(2) : 'N/A'} over par)</span>
            </div>
            <div className="par-item">
              <span className="par-label">Par 4 Average:</span>
              <span className="par-value">{additionalStats.avgPar4}</span>
              <span className="par-diff">({additionalStats.avgPar4 !== 'N/A' ? (additionalStats.avgPar4 - 4).toFixed(2) : 'N/A'} over par)</span>
            </div>
            <div className="par-item">
              <span className="par-label">Par 5 Average:</span>
              <span className="par-value">{additionalStats.avgPar5}</span>
              <span className="par-diff">({additionalStats.avgPar5 !== 'N/A' ? (additionalStats.avgPar5 - 5).toFixed(2) : 'N/A'} over par)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailedStats;