import React from 'react'
import MetricCard from '../atoms/MetricCard'
import MetricGrid from '../molecules/MetricGrid'
import ParTypePerformance from '../molecules/ParTypePerformance'
import ScoringDistribution from '../molecules/ScoringDistribution'
import EmptyState from '../molecules/EmptyState'
import HolePerformanceChart from '../HolePerformanceChart'

/**
 * CourseStatistics - Complete statistics panel for a selected course
 * 
 * @param {object} courseData - Course statistics data
 * @param {array} holeAverages - Hole by hole averages for chart
 * @param {boolean} showHoleChart - Whether to show hole performance chart
 */
const CourseStatistics = ({ 
  courseData, 
  holeAverages = [],
  showHoleChart = true
}) => {
  if (!courseData) {
    return (
      <EmptyState 
        message="No course selected"
        submessage="Select a course from the list to view statistics"
      />
    )
  }

  const hasDetailedStats = courseData.avgPar3 > 0
  const hasScoringDistribution = courseData.parPercent > 0 || courseData.bogeyPercent > 0 || courseData.doublePlusPercent > 0

  return (
    <>
      <h3 className="font-semibold mb-3 text-gray-300">{courseData.name} Details</h3>
      
      {/* Summary Metrics */}
      <MetricGrid columns={4} className="mb-6">
        <MetricCard
          label="Total Rounds"
          value={courseData.totalRounds}
          subValue={`${courseData.rounds18} × 18-hole${courseData.rounds9 > 0 ? `, ${courseData.rounds9} × 9-hole` : ''}`}
          theme="blue"
          icon="🏌️"
        />
        <MetricCard
          label="Avg Score (18)"
          value={courseData.avgScore18 ? courseData.avgScore18.toFixed(1) : '-'}
          subValue={courseData.rounds9 > 0 ? `9-hole: ${courseData.avgScore9.toFixed(1)}` : undefined}
          theme="green"
          icon="📊"
        />
        <MetricCard
          label="Best Score"
          value={courseData.bestScore18}
          subValue={courseData.rounds9 > 0 && courseData.bestScore9 !== '-' ? `9-hole: ${courseData.bestScore9}` : undefined}
          theme="purple"
          icon="🏆"
        />
        <MetricCard
          label="Worst Score"
          value={courseData.worstScore18}
          subValue={courseData.rounds9 > 0 && courseData.worstScore9 !== '-' ? `9-hole: ${courseData.worstScore9}` : undefined}
          theme="orange"
          icon="📈"
        />
      </MetricGrid>

      {/* Par Type Performance */}
      {courseData.rounds18 > 0 && hasDetailedStats && (
        <ParTypePerformance
          avgPar3={courseData.avgPar3}
          avgPar4={courseData.avgPar4}
          avgPar5={courseData.avgPar5}
          par3VsPar={courseData.par3VsPar}
          par4VsPar={courseData.par4VsPar}
          par5VsPar={courseData.par5VsPar}
        />
      )}

      {/* Scoring Distribution */}
      {courseData.rounds18 > 0 && hasScoringDistribution && (
        <ScoringDistribution
          parPercent={courseData.parPercent}
          bogeyPercent={courseData.bogeyPercent}
          doublePlusPercent={courseData.doublePlusPercent}
          birdiePercent={courseData.birdiePercent}
        />
      )}

      {/* No Detailed Stats Message */}
      {courseData.rounds18 > 0 && !hasDetailedStats && (
        <EmptyState
          message="Detailed statistics not available for this course."
          submessage="Only total score was entered for these rounds."
          className="mb-6"
        />
      )}

      {/* Hole by Hole Performance Chart */}
      {showHoleChart && holeAverages.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 text-gray-300">Hole by Hole Performance</h4>
          <HolePerformanceChart data={holeAverages} />
        </div>
      )}
    </>
  )
}

export default CourseStatistics