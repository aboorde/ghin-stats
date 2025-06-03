import { useState, useEffect } from 'react';
import { 
  fetchScoresWithStats, 
  fetchSummaryStats, 
  fetchHoleAverages 
} from '../services/golfDataService';

/**
 * Custom hook to fetch and manage golf data
 * @returns {Object} Loading state, error, and data
 */
export function useGolfData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scores, setScores] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [holeAverages, setHoleAverages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [scoresData, summaryData, holeData] = await Promise.all([
          fetchScoresWithStats(),
          fetchSummaryStats(),
          fetchHoleAverages()
        ]);

        setScores(scoresData);
        setSummaryStats(summaryData);
        setHoleAverages(holeData);
      } catch (err) {
        console.error('Error fetching golf data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    loading,
    error,
    scores,
    summaryStats,
    holeAverages
  };
}