import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, RadarChart, Cell, ReferenceLine,
  ComposedChart, Area
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import PageHeader from './ui/PageHeader';
import Card from './ui/Card';
import Loading from './ui/Loading';
import { chartTheme } from '../utils/theme';
import { calculateHandicapIndex, getHandicapTrend, getHandicapDetails } from '../utils/handicapCalculator';

// Pine Valley Course Data from CLAUDE.md
const PINE_VALLEY_HOLES = [
  { hole: 1, yards: 331, par: 4, handicap: 11 },
  { hole: 2, yards: 487, par: 5, handicap: 17 },
  { hole: 3, yards: 335, par: 4, handicap: 3 },
  { hole: 4, yards: 129, par: 3, handicap: 13 },
  { hole: 5, yards: 379, par: 4, handicap: 1 },
  { hole: 6, yards: 376, par: 4, handicap: 7 },
  { hole: 7, yards: 142, par: 3, handicap: 15 },
  { hole: 8, yards: 456, par: 5, handicap: 5 },
  { hole: 9, yards: 291, par: 4, handicap: 9 },
  { hole: 10, yards: 447, par: 5, handicap: 18 },
  { hole: 11, yards: 356, par: 4, handicap: 10 },
  { hole: 12, yards: 191, par: 3, handicap: 8 },
  { hole: 13, yards: 358, par: 4, handicap: 4 },
  { hole: 14, yards: 466, par: 5, handicap: 16 },
  { hole: 15, yards: 388, par: 4, handicap: 2 },
  { hole: 16, yards: 330, par: 4, handicap: 12 },
  { hole: 17, yards: 168, par: 3, handicap: 14 },
  { hole: 18, yards: 367, par: 4, handicap: 6 }
];

const PINE_VALLEY_STATS = {
  totalYards: 5997,
  totalPar: 72,
  courseRating: 69.6,
  slopeRating: 129,
  frontNineYards: 2926,
  backNineYards: 3071,
  par3Holes: [4, 7, 12, 17],
  par4Holes: [1, 3, 5, 6, 9, 11, 13, 15, 16, 18],
  par5Holes: [2, 8, 10, 14]
};

// Custom tooltip for hole details
const HoleTooltip = ({ active, payload }) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 p-2 sm:p-3 rounded shadow-lg border border-gray-700 text-xs sm:text-sm">
        <p className="text-white font-semibold">Hole {data.hole}</p>
        <p className="text-gray-300">Par {data.par} • {data.yards} yards</p>
        <p className="text-gray-300">Handicap: {data.handicap}</p>
        <p className="text-blue-400">Avg Score: {data.avgScore?.toFixed(2)}</p>
        <p className="text-purple-400">Score vs Par: {data.scoreVsPar > 0 ? '+' : ''}{data.scoreVsPar?.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

// Custom shape for difficulty correlation with meaningful colors and sizing
const DifficultyDot = (props) => {
  const { cx, cy, payload } = props;
  
  // Color by par type
  let color;
  if (payload.par === 3) color = '#ef4444'; // Red for par 3s
  else if (payload.par === 4) color = '#3b82f6'; // Blue for par 4s
  else color = '#10b981'; // Green for par 5s
  
  // Size based on how much the hole deviates from expected difficulty
  const expectedScoreVsPar = (19 - payload.handicap) * 0.1; // Rough expectation: harder holes (lower handicap) should be ~0.1-0.2 strokes harder per handicap point
  const deviation = Math.abs(payload.scoreVsPar - expectedScoreVsPar);
  const radius = 4 + (deviation * 8); // Base size 4, grows with deviation
  
  // Opacity based on sample size (more rounds = more confident)
  const opacity = Math.min(0.9, 0.3 + (payload.totalRounds / 50));
  
  return (
    <g>
      <circle 
        cx={cx} 
        cy={cy} 
        r={radius}
        fill={color}
        fillOpacity={opacity}
        stroke="#fff" 
        strokeWidth={2}
      />
      {/* Add hole number label for outliers */}
      {deviation > 0.5 && (
        <text 
          x={cx} 
          y={cy} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill="#fff" 
          fontSize="10" 
          fontWeight="bold"
        >
          {payload.hole}
        </text>
      )}
    </g>
  );
};

export default function PineValleyAnalysis({ userId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [holeStats, setHoleStats] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [yearComparison, setYearComparison] = useState([]);
  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [parPerformance, setParPerformance] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [hoveredHole, setHoveredHole] = useState(null);
  const [handicapDetails, setHandicapDetails] = useState(null);
  const [handicapTrend, setHandicapTrend] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, [selectedTimeRange, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Base query for Pine Valley rounds
      let query = supabase
        .from('rounds')
        .select(`
          *,
          round_statistics(*),
          hole_details(*)
        `)
        .eq('course_name', 'Pine Valley CC')
        .eq('number_of_holes', 18);

      // Filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      // Apply time range filter
      if (selectedTimeRange !== 'all') {
        const now = new Date();
        let startDate;
        switch (selectedTimeRange) {
          case '3months':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          case '6months':
            startDate = new Date(now.setMonth(now.getMonth() - 6));
            break;
          case '1year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }
        if (startDate) {
          query = query.gte('played_at', startDate.toISOString().split('T')[0]);
        }
      }

      const { data: roundsData, error: roundsError } = await query
        .order('played_at', { ascending: false });

      if (roundsError) throw roundsError;

      setRounds(roundsData || []);

      // Process hole statistics
      const holeStatsMap = new Map();
      roundsData?.forEach(round => {
        round.hole_details?.forEach(hole => {
          if (!holeStatsMap.has(hole.hole_number)) {
            holeStatsMap.set(hole.hole_number, {
              scores: [],
              pars: 0,
              birdies: 0,
              bogeys: 0,
              doubleBogeys: 0,
              triplePlus: 0
            });
          }
          const stats = holeStatsMap.get(hole.hole_number);
          stats.scores.push(hole.adjusted_gross_score);
          
          const diff = hole.adjusted_gross_score - hole.par;
          if (diff <= -1) stats.birdies++;
          else if (diff === 0) stats.pars++;
          else if (diff === 1) stats.bogeys++;
          else if (diff === 2) stats.doubleBogeys++;
          else stats.triplePlus++;
        });
      });

      // Calculate hole statistics with Pine Valley data
      const processedHoleStats = PINE_VALLEY_HOLES.map(holeInfo => {
        const stats = holeStatsMap.get(holeInfo.hole);
        if (!stats || stats.scores.length === 0) {
          return { ...holeInfo, avgScore: holeInfo.par, scoreVsPar: 0 };
        }
        
        const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
        const scoreVsPar = avgScore - holeInfo.par;
        
        // Calculate expected difficulty based on handicap (lower handicap = harder hole)
        const expectedDifficulty = (19 - holeInfo.handicap) / 18;
        
        return {
          ...holeInfo,
          avgScore,
          scoreVsPar,
          expectedDifficulty,
          totalRounds: stats.scores.length,
          birdieRate: (stats.birdies / stats.scores.length * 100),
          parRate: (stats.pars / stats.scores.length * 100),
          bogeyRate: (stats.bogeys / stats.scores.length * 100),
          doubleBogeyRate: (stats.doubleBogeys / stats.scores.length * 100),
          triplePlusRate: (stats.triplePlus / stats.scores.length * 100),
          difficulty: scoreVsPar // Actual difficulty based on scoring
        };
      });

      setHoleStats(processedHoleStats);

      // Process monthly trends
      if (roundsData && roundsData.length > 0) {
        const firstRound = new Date(roundsData[roundsData.length - 1].played_at);
        const lastRound = new Date(roundsData[0].played_at);
        const months = eachMonthOfInterval({ start: firstRound, end: lastRound });
        
        const monthlyData = months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const monthRounds = roundsData.filter(round => {
            const roundDate = new Date(round.played_at);
            return roundDate >= monthStart && roundDate <= monthEnd;
          });
          
          if (monthRounds.length === 0) {
            return {
              month: format(month, 'MMM yyyy'),
              avgScore: null,
              avgDifferential: null,
              rounds: 0
            };
          }
          
          const avgScore = monthRounds.reduce((sum, r) => sum + r.adjusted_gross_score, 0) / monthRounds.length;
          const avgDifferential = monthRounds.reduce((sum, r) => sum + r.differential, 0) / monthRounds.length;
          
          return {
            month: format(month, 'MMM yyyy'),
            avgScore: avgScore,
            avgDifferential: avgDifferential,
            rounds: monthRounds.length,
            bestScore: Math.min(...monthRounds.map(r => r.adjusted_gross_score)),
            worstScore: Math.max(...monthRounds.map(r => r.adjusted_gross_score))
          };
        }).filter(m => m.rounds > 0);
        
        setMonthlyTrends(monthlyData);
      }

      // Process year comparison
      const yearMap = new Map();
      roundsData?.forEach(round => {
        const year = new Date(round.played_at).getFullYear();
        if (!yearMap.has(year)) {
          yearMap.set(year, {
            scores: [],
            differentials: [],
            statistics: []
          });
        }
        const yearData = yearMap.get(year);
        yearData.scores.push(round.adjusted_gross_score);
        yearData.differentials.push(round.differential);
        if (round.statistics && round.statistics.length > 0) {
          yearData.statistics.push(round.statistics[0]);
        }
      });

      const yearComparisonData = Array.from(yearMap.entries()).map(([year, data]) => {
        const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        const avgDifferential = data.differentials.reduce((a, b) => a + b, 0) / data.differentials.length;
        
        // Calculate average statistics
        let avgPar3 = 0, avgPar4 = 0, avgPar5 = 0, avgPars = 0;
        if (data.statistics.length > 0) {
          avgPar3 = data.statistics.reduce((sum, s) => sum + (s.par3s_average || 0), 0) / data.statistics.length;
          avgPar4 = data.statistics.reduce((sum, s) => sum + (s.par4s_average || 0), 0) / data.statistics.length;
          avgPar5 = data.statistics.reduce((sum, s) => sum + (s.par5s_average || 0), 0) / data.statistics.length;
          avgPars = data.statistics.reduce((sum, s) => sum + (s.pars_percent || 0), 0) / data.statistics.length;
        }
        
        return {
          year,
          rounds: data.scores.length,
          avgScore,
          avgDifferential,
          bestScore: Math.min(...data.scores),
          worstScore: Math.max(...data.scores),
          avgPar3Score: avgPar3,
          avgPar4Score: avgPar4,
          avgPar5Score: avgPar5,
          parPercentage: avgPars * 100
        };
      }).sort((a, b) => a.year - b.year);

      setYearComparison(yearComparisonData);

      // Process score distribution
      const scoreFrequency = new Map();
      roundsData?.forEach(round => {
        const score = round.adjusted_gross_score;
        scoreFrequency.set(score, (scoreFrequency.get(score) || 0) + 1);
      });

      const distributionData = Array.from(scoreFrequency.entries())
        .map(([score, count]) => ({ score, count }))
        .sort((a, b) => a.score - b.score);

      setScoreDistribution(distributionData);

      // Process par performance by hole type
      const parTypeStats = {
        3: { scores: [], label: 'Par 3s' },
        4: { scores: [], label: 'Par 4s' },
        5: { scores: [], label: 'Par 5s' }
      };

      processedHoleStats.forEach(hole => {
        if (hole.avgScore > 0) {
          parTypeStats[hole.par].scores.push(hole.scoreVsPar);
        }
      });

      const parPerformanceData = Object.entries(parTypeStats).map(([, data]) => ({
        parType: data.label,
        avgOverPar: data.scores.length > 0 
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length 
          : 0,
        holes: data.scores.length
      }));

      setParPerformance(parPerformanceData);

      // Calculate Handicap Index
      const details = getHandicapDetails(roundsData || []);
      setHandicapDetails(details);

      // Calculate handicap trend
      const trend = getHandicapTrend(roundsData || []);
      setHandicapTrend(trend);

    } catch (err) {
      console.error('Error fetching Pine Valley data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <div className="text-red-400 bg-red-900/20 border border-red-600/30 rounded-lg p-3 sm:p-4 inline-block text-sm sm:text-base">
          Error: {error}
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalRounds = rounds.length;
  const avgScore = totalRounds > 0 ? rounds.reduce((sum, r) => sum + r.adjusted_gross_score, 0) / totalRounds : 0;
  const bestScore = totalRounds > 0 ? Math.min(...rounds.map(r => r.adjusted_gross_score)) : 0;
  // const worstScore = Math.max(...rounds.map(r => r.adjusted_gross_score));

  // Find hardest and easiest holes
  const sortedByDifficulty = [...holeStats].sort((a, b) => b.scoreVsPar - a.scoreVsPar);
  const hardestHoles = sortedByDifficulty.slice(0, 3);
  const easiestHoles = sortedByDifficulty.slice(-3).reverse();


  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader 
        title="Pine Valley Analysis" 
        subtitle="Comprehensive performance analysis at Pine Valley CC"
      />

      {/* Time Range Selector */}
      <div className="flex justify-end mb-4">
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="w-full sm:w-auto bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Time</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Rounds</h3>
          <p className="text-2xl sm:text-3xl font-bold text-white">{totalRounds}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">at Pine Valley CC</p>
        </Card>
        
        <Card className="p-4 sm:p-6">
          <h3 className="text-gray-400 text-sm mb-2">Average Score</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-400">{avgScore.toFixed(1)}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {(avgScore - PINE_VALLEY_STATS.totalPar).toFixed(1)} over par
          </p>
        </Card>
        
        <Card className="p-4 sm:p-6">
          <h3 className="text-gray-400 text-sm mb-2">Best Score</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-400">{bestScore}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            +{bestScore - PINE_VALLEY_STATS.totalPar} ({format(new Date(rounds.find(r => r.adjusted_gross_score === bestScore)?.played_at), 'MMM d, yyyy')})
          </p>
        </Card>
        
        <Card className="p-4 sm:p-6">
          <h3 className="text-gray-400 text-sm mb-2">Handicap Index</h3>
          <p className="text-2xl sm:text-3xl font-bold text-purple-400">
            {handicapDetails?.handicapIndex !== null ? handicapDetails.handicapIndex.toFixed(1) : 'N/A'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {handicapDetails?.message || 'Insufficient rounds'}
          </p>
        </Card>
      </div>

      {/* Hole-by-Hole Performance */}
      <Card className="p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Hole-by-Hole Performance</h2>
        <div className="h-56 sm:h-72 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={holeStats} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis 
                dataKey="hole" 
                stroke={chartTheme.text}
                tick={{ fill: chartTheme.text, fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                stroke={chartTheme.text}
                tick={{ fill: chartTheme.text, fontSize: 12 }}
                label={{ value: 'Average Score', angle: -90, position: 'insideLeft', fill: chartTheme.text, fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke={chartTheme.text}
                tick={{ fill: chartTheme.text, fontSize: 12 }}
                label={{ value: 'Score vs Par', angle: 90, position: 'insideRight', fill: chartTheme.text, fontSize: 12 }}
              />
              <Tooltip content={<HoleTooltip />} />
              <Legend />
              <ReferenceLine yAxisId="right" y={0} stroke="#666" strokeDasharray="3 3" />
              
              <Bar 
                yAxisId="left"
                dataKey="avgScore" 
                fill="#3b82f6" 
                name="Average Score"
                onMouseEnter={(data) => setHoveredHole(data.hole)}
                onMouseLeave={() => setHoveredHole(null)}
              >
                {holeStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={hoveredHole === entry.hole ? '#60a5fa' : '#3b82f6'} 
                  />
                ))}
              </Bar>
              
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="scoreVsPar" 
                stroke="#ec4899" 
                strokeWidth={3}
                dot={{ fill: '#ec4899', r: 6 }}
                name="Score vs Par"
              />
              
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="par"
                fill="#10b981"
                fillOpacity={0.2}
                stroke="#10b981"
                strokeWidth={2}
                name="Par"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Hole Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 sm:mt-6">
          <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
            <h3 className="text-red-400 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Hardest Holes</h3>
            {hardestHoles.map(hole => (
              <div key={hole.hole} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-700 last:border-0">
                <span className="text-gray-300 text-xs sm:text-sm">
                  Hole {hole.hole} (Par {hole.par}, Hdcp {hole.handicap})
                </span>
                <span className="text-red-400 font-semibold text-xs sm:text-sm">
                  +{hole.scoreVsPar.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
            <h3 className="text-green-400 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Easiest Holes</h3>
            {easiestHoles.map(hole => (
              <div key={hole.hole} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-700 last:border-0">
                <span className="text-gray-300 text-xs sm:text-sm">
                  Hole {hole.hole} (Par {hole.par}, Hdcp {hole.handicap})
                </span>
                <span className="text-green-400 font-semibold text-xs sm:text-sm">
                  +{hole.scoreVsPar.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Difficulty vs Handicap Analysis */}
      <Card className="p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-6">Difficulty vs Handicap Correlation</h2>
        <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">
          Analyzing how your performance on each hole compares to its handicap rating. Larger circles indicate holes that play significantly different than their handicap suggests.
        </p>
        <div className="h-48 sm:h-56 md:h-64 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis 
                dataKey="handicap" 
                stroke={chartTheme.text}
                tick={{ fill: chartTheme.text, fontSize: 12 }}
                label={{ value: 'Hole Handicap (1=hardest, 18=easiest)', position: 'insideBottom', offset: -5, fill: chartTheme.text, fontSize: 12 }}
                domain={[0, 19]}
                ticks={[1, 3, 5, 7, 9, 11, 13, 15, 17]}
              />
              <YAxis 
                dataKey="scoreVsPar"
                stroke={chartTheme.text}
                tick={{ fill: chartTheme.text, fontSize: 12 }}
                label={{ value: 'Average Score vs Par', angle: -90, position: 'insideLeft', fill: chartTheme.text, fontSize: 12 }}
              />
              <Tooltip content={<HoleTooltip />} />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              {/* Add trend line showing expected difficulty */}
              <ReferenceLine 
                stroke="#666" 
                strokeDasharray="8 4"
                segment={[
                  { x: 1, y: 1.8 },
                  { x: 18, y: 0.2 }
                ]}
              />
              <Scatter 
                name="Holes" 
                data={holeStats} 
                fill="#8884d8"
                shape={<DifficultyDot />}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 sm:mt-4 space-y-2">
          {/* Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-400">Par 3</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-gray-400">Par 4</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-400">Par 5</span>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500">
            Circle size indicates deviation from expected difficulty • Numbered holes are significant outliers
          </div>
          {/* Insights */}
          <div className="mt-4 bg-gray-900 rounded-lg p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Key Insights:</h3>
            <ul className="space-y-1 text-xs text-gray-400">
              {holeStats.filter(h => {
                const expectedScoreVsPar = (19 - h.handicap) * 0.1;
                const deviation = Math.abs(h.scoreVsPar - expectedScoreVsPar);
                return deviation > 0.5;
              }).map(h => {
                const expectedScoreVsPar = (19 - h.handicap) * 0.1;
                const isHarder = h.scoreVsPar > expectedScoreVsPar;
                return (
                  <li key={h.hole}>
                    • Hole {h.hole} (Hdcp {h.handicap}, Par {h.par}): Playing {isHarder ? 'harder' : 'easier'} than expected 
                    ({h.scoreVsPar > 0 ? '+' : ''}{h.scoreVsPar.toFixed(2)} vs expected {expectedScoreVsPar > 0 ? '+' : ''}{expectedScoreVsPar.toFixed(2)})
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Card>

      {/* Monthly Trends */}
      {monthlyTrends.length > 0 && (
        <Card className="p-3 sm:p-4 md:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Monthly Performance Trends</h2>
          <div className="h-56 sm:h-72 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrends} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis 
                  dataKey="month" 
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text, angle: -45, textAnchor: 'end', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text, fontSize: 12 }}
                  label={{ value: 'Average Score', angle: -90, position: 'insideLeft', fill: chartTheme.text, fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke={chartTheme.text}
                  tick={{ fill: chartTheme.text, fontSize: 12 }}
                  label={{ value: 'Rounds Played', angle: 90, position: 'insideRight', fill: chartTheme.text, fontSize: 12 }}
                />
                <Tooltip {...chartTheme.tooltipStyle} />
                <Legend />
                <Bar 
                  yAxisId="right"
                  dataKey="rounds" 
                  fill="#6366f1" 
                  fillOpacity={0.6}
                  name="Rounds Played"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 6 }}
                  name="Average Score"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="bestScore" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Best Score"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Year-over-Year Comparison */}
      {yearComparison.length > 0 && (
        <Card className="p-3 sm:p-4 md:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Year-over-Year Performance</h2>
          <div className="h-48 sm:h-56 md:h-64 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={yearComparison}>
                <PolarGrid stroke={chartTheme.grid} />
                <PolarAngleAxis dataKey="year" stroke={chartTheme.text} />
                <PolarRadiusAxis stroke={chartTheme.text} />
                <Radar 
                  name="Average Score" 
                  dataKey="avgScore" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6} 
                />
                <Radar 
                  name="Best Score" 
                  dataKey="bestScore" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.4} 
                />
                <Legend />
                <Tooltip {...chartTheme.tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Year Stats Table */}
          <div className="mt-4 sm:mt-6 overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-max sm:min-w-0">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3 sm:px-4 text-gray-400">Year</th>
                    <th className="text-right py-2 px-3 sm:px-4 text-gray-400">Rounds</th>
                    <th className="text-right py-2 px-3 sm:px-4 text-gray-400">Avg Score</th>
                    <th className="text-right py-2 px-3 sm:px-4 text-gray-400">Best</th>
                    <th className="text-right py-2 px-3 sm:px-4 text-gray-400">Worst</th>
                    <th className="text-right py-2 px-3 sm:px-4 text-gray-400">Par %</th>
                  </tr>
                </thead>
                <tbody>
                  {yearComparison.map(year => (
                    <tr key={year.year} className="border-b border-gray-700">
                      <td className="py-2 px-3 sm:px-4 text-white font-semibold">{year.year}</td>
                      <td className="py-2 px-3 sm:px-4 text-right text-gray-300">{year.rounds}</td>
                      <td className="py-2 px-3 sm:px-4 text-right text-blue-400">{year.avgScore.toFixed(1)}</td>
                      <td className="py-2 px-3 sm:px-4 text-right text-green-400">{year.bestScore}</td>
                      <td className="py-2 px-3 sm:px-4 text-right text-red-400">{year.worstScore}</td>
                      <td className="py-2 px-3 sm:px-4 text-right text-purple-400">{year.parPercentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Score Distribution */}
      <Card className="p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Score Distribution</h2>
        <div className="h-48 sm:h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDistribution} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis 
                dataKey="score" 
                stroke={chartTheme.text}
                tick={{ fill: chartTheme.text, fontSize: 12 }}
              />
              <YAxis 
                stroke={chartTheme.text}
                tick={{ fill: chartTheme.text, fontSize: 12 }}
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: chartTheme.text, fontSize: 12 }}
              />
              <Tooltip {...chartTheme.tooltipStyle} />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Par Type Performance */}
      <Card className="p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Performance by Par Type</h2>
        <div className="h-48 sm:h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={parPerformance} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis 
                dataKey="parType" 
                stroke={chartTheme.text}
                tick={{ fill: chartTheme.text, fontSize: 12 }}
              />
              <YAxis 
                stroke={chartTheme.text}
                tick={{ fill: chartTheme.text, fontSize: 12 }}
                label={{ value: 'Average Score Over Par', angle: -90, position: 'insideLeft', fill: chartTheme.text, fontSize: 12 }}
              />
              <Tooltip {...chartTheme.tooltipStyle} />
              <Bar dataKey="avgOverPar">
                <Cell fill="#ef4444" /> {/* Par 3s */}
                <Cell fill="#f59e0b" /> {/* Par 4s */}
                <Cell fill="#10b981" /> {/* Par 5s */}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Handicap Details */}
      {handicapDetails && handicapDetails.handicapIndex !== null && (
        <Card className="p-3 sm:p-4 md:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Handicap Index Details</h2>
          
          {/* Handicap Trend Chart */}
          {handicapTrend.length > 0 && (
            <div className="mb-6">
              <h3 className="text-gray-400 text-sm mb-3">Handicap Index Trend</h3>
              <div className="h-48 sm:h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={handicapTrend} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                    <XAxis 
                      dataKey="date" 
                      stroke={chartTheme.text}
                      tick={{ fill: chartTheme.text, fontSize: 12 }}
                      tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                    />
                    <YAxis 
                      stroke={chartTheme.text}
                      tick={{ fill: chartTheme.text, fontSize: 12 }}
                      label={{ value: 'Handicap Index', angle: -90, position: 'insideLeft', fill: chartTheme.text, fontSize: 12 }}
                    />
                    <Tooltip 
                      {...chartTheme.tooltipStyle}
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                      formatter={(value) => value.toFixed(1)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="handicapIndex" 
                      stroke="#a855f7" 
                      strokeWidth={3}
                      dot={{ fill: '#a855f7', r: 4 }}
                      name="Handicap Index"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Calculation Details */}
          <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
            <h3 className="text-purple-400 font-semibold mb-3 text-sm sm:text-base">Calculation Details</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Rounds Available:</span>
                <span className="text-white font-semibold">{handicapDetails.totalRounds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Differentials Used:</span>
                <span className="text-white font-semibold">{handicapDetails.numDifferentials}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average of Best Differentials:</span>
                <span className="text-white font-semibold">{handicapDetails.averageDifferential.toFixed(1)}</span>
              </div>
              {handicapDetails.adjustment !== 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Adjustment Applied:</span>
                  <span className="text-white font-semibold">{handicapDetails.adjustment}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">96% Factor Applied:</span>
                <span className="text-white font-semibold">Yes</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span className="text-gray-400">Handicap Index:</span>
                <span className="text-purple-400 font-bold text-lg">{handicapDetails.handicapIndex.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          {/* Rounds Used in Calculation */}
          <div className="mt-4">
            <h3 className="text-gray-400 text-sm mb-3">Rounds Used in Calculation</h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-max sm:min-w-0">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 sm:px-4 text-gray-400">Date</th>
                      <th className="text-right py-2 px-3 sm:px-4 text-gray-400">Score</th>
                      <th className="text-right py-2 px-3 sm:px-4 text-gray-400">Differential</th>
                    </tr>
                  </thead>
                  <tbody>
                    {handicapDetails.roundsUsed.map((round, idx) => (
                      <tr key={idx} className="border-b border-gray-700">
                        <td className="py-2 px-3 sm:px-4 text-white">{format(new Date(round.played_at), 'MMM d, yyyy')}</td>
                        <td className="py-2 px-3 sm:px-4 text-right text-gray-300">{round.adjusted_gross_score}</td>
                        <td className="py-2 px-3 sm:px-4 text-right text-purple-400 font-semibold">{round.differential.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Strategic Insights */}
      <Card className="p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Strategic Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
            <h3 className="text-blue-400 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Scoring Opportunities</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-300 text-xs sm:text-sm">
              <li>• Hole {easiestHoles[0]?.hole} offers the best scoring opportunity</li>
              <li>• Par 5s are played {parPerformance.find(p => p.parType === 'Par 5s')?.avgOverPar.toFixed(2)} over par on average</li>
              <li>• Focus on holes with high handicap ratings for stroke improvement</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
            <h3 className="text-red-400 font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Areas for Improvement</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-300 text-xs sm:text-sm">
              <li>• Hole {hardestHoles[0]?.hole} is the most challenging ({hardestHoles[0]?.scoreVsPar.toFixed(2)} over par)</li>
              <li>• Par 3s are played {parPerformance.find(p => p.parType === 'Par 3s')?.avgOverPar.toFixed(2)} over par on average</li>
              <li>• Consider course management on low handicap holes</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}