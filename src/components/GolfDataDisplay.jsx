import React from 'react';
import { useGolfData } from '../hooks/useGolfData';
import { format } from 'date-fns';
import ScoreTrendChart from './ScoreTrendChart';
import HolePerformanceChart from './HolePerformanceChart';
import DetailedStats from './DetailedStats';

/**
 * Component to display golf data in a table format
 */
function GolfDataDisplay() {
  const { loading, error, scores, summaryStats, holeAverages } = useGolfData();

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading golf data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  if (!scores || scores.length === 0) {
    return (
      <div className="no-data-container">
        <p>No golf data found.</p>
      </div>
    );
  }

  return (
    <div className="golf-data-display">
      <h2>Golf Rounds Data</h2>
      
      {summaryStats && (
        <div className="summary-stats">
          <h3>Summary Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Rounds:</span>
              <span className="stat-value">{summaryStats.totalRounds}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Score:</span>
              <span className="stat-value">{summaryStats.avgScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Best Score:</span>
              <span className="stat-value">{summaryStats.bestScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Worst Score:</span>
              <span className="stat-value">{summaryStats.worstScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Date Range:</span>
              <span className="stat-value">
                {format(new Date(summaryStats.firstRound), 'MMM d, yyyy')} - 
                {format(new Date(summaryStats.lastRound), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      )}

      <DetailedStats scores={scores} summaryStats={summaryStats} />

      <div className="charts-section">
        <ScoreTrendChart scores={scores} />
        <HolePerformanceChart holeAverages={holeAverages} />
      </div>

      <div className="scores-table-container">
        <h3>Recent Rounds</h3>
        <table className="scores-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Tees</th>
              <th>Score</th>
              <th>Differential</th>
              <th>Par 3 Avg</th>
              <th>Par 4 Avg</th>
              <th>Par 5 Avg</th>
            </tr>
          </thead>
          <tbody>
            {scores.slice(0, 20).map((score) => (
              <tr key={score.id}>
                <td>{format(new Date(score.played_at), 'MMM d, yyyy')}</td>
                <td>{score.course_name}</td>
                <td>{score.tee_name}</td>
                <td>{score.adjusted_gross_score}</td>
                <td>{score.differential.toFixed(1)}</td>
                <td>{score.statistics?.[0]?.par3s_average?.toFixed(1) || '-'}</td>
                <td>{score.statistics?.[0]?.par4s_average?.toFixed(1) || '-'}</td>
                <td>{score.statistics?.[0]?.par5s_average?.toFixed(1) || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GolfDataDisplay;