import React from 'react'
import MetricCard from '../atoms/MetricCard'
import MetricGrid from '../molecules/MetricGrid'
import ParTypePerformance from '../molecules/ParTypePerformance'
import ScoringDistribution from '../molecules/ScoringDistribution'
import EmptyState from '../molecules/EmptyState'
import HolePerformanceChart from '../HolePerformanceChart'
import SectionHeader from '../atoms/SectionHeader'

/**
 * CourseStatistics - Comprehensive statistics panel for a selected course
 * 
 * All data originates from database tables as defined in DATABASE_STRUCTURE.md:
 * - rounds table: course_name, course_rating, slope_rating, adjusted_gross_score, differential, number_of_holes
 * - round_statistics table: par3s_average, par4s_average, par5s_average, birdies_or_better_percent, 
 *                          pars_percent, bogeys_percent, double_bogeys_percent, triple_bogeys_or_worse_percent
 * - hole_details table: hole_number, par, adjusted_gross_score (via holeAverages)
 * 
 * @param {object} courseData - Aggregated course statistics from Course model
 * @param {array} holeAverages - Hole by hole averages from hole_details aggregation
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
  console.log("WAT courseData", courseData)

  // Data validation helpers
  const hasAnyRounds = courseData.totalRounds > 0
  const has18HoleRounds = courseData.rounds18 > 0
  const has9HoleRounds = courseData.rounds9 > 0
  
  // Check if we have detailed statistics data
  // These come from round_statistics table (par averages and scoring percentages)
  const hasParTypeData = courseData.avgPar3 > 0 || courseData.avgPar4 > 0 || courseData.avgPar5 > 0
  const hasScoringDistribution = (
    courseData.birdiePercent > 0 || 
    courseData.parPercent > 0 || 
    courseData.bogeyPercent > 0 || 
    courseData.doublePlusPercent > 0
  )
  const hasAnyStatistics = hasParTypeData || hasScoringDistribution
  
  // Format helpers
  const formatScore = (value) => {
    if (value === null || value === undefined || value === '-') return '-'
    return typeof value === 'number' ? value.toFixed(1) : value
  }
  
  const formatDifferential = (value) => {
    if (value === null || value === undefined) return '-'
    return value.toFixed(1)
  }

  // Build sub-values for metric cards
  const getScoreSubValue = () => {
    const parts = []
    if (has18HoleRounds) {
      parts.push(`18-hole: ${courseData.rounds18}`)
    }
    if (has9HoleRounds) {
      parts.push(`9-hole: ${courseData.rounds9}`)
    }
    return parts.join(', ') || undefined
  }
  
  const getDifferentialSubValue = () => {
    if (has9HoleRounds && courseData.avgDifferential9) {
      return `9-hole: ${formatDifferential(courseData.avgDifferential9)}`
    }
    return undefined
  }

  return (
    <>
      {/* Course Header with Rating/Slope */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-300">{courseData.name}</h3>
        <p className="text-sm text-gray-400">
          Rating: {courseData.rating} / Slope: {courseData.slope}
        </p>
      </div>
      
      {/* Basic Round Statistics - Always shown if any rounds exist */}
      {hasAnyRounds && (
        <>
          <SectionHeader 
            title="Round Summary"
            subtitle={`Based on ${courseData.totalRounds} round${courseData.totalRounds !== 1 ? 's' : ''}`}
          />
          
          <MetricGrid columns={4} className="mb-6">
            <MetricCard
              label="Total Rounds"
              value={courseData.totalRounds}
              subValue={getScoreSubValue()}
              theme="blue"
              icon="🏌️"
            />
            
            {has18HoleRounds && (
              <MetricCard
                label="Avg Score"
                value={formatScore(courseData.avgScore18)}
                subValue={has9HoleRounds ? `9-hole: ${formatScore(courseData.avgScore9)}` : undefined}
                theme="green"
                icon="📊"
              />
            )}
            
            {has18HoleRounds && (
              <MetricCard
                label="Avg Differential"
                value={formatDifferential(courseData.avgDifferential18)}
                subValue={getDifferentialSubValue()}
                theme="purple"
                icon="📈"
              />
            )}
            
            {!has18HoleRounds && has9HoleRounds && (
              <>
                <MetricCard
                  label="Avg Score (9)"
                  value={formatScore(courseData.avgScore9)}
                  theme="green"
                  icon="📊"
                />
                <MetricCard
                  label="Avg Diff (9)"
                  value={formatDifferential(courseData.avgDifferential9)}
                  theme="purple"
                  icon="📈"
                />
              </>
            )}
          </MetricGrid>
          
          {/* Best/Worst Scores - Only for rounds with scores */}
          {(has18HoleRounds || has9HoleRounds) && (
            <MetricGrid columns={2} className="mb-6">
              {has18HoleRounds && courseData.bestScore18 !== '-' && (
                <MetricCard
                  label="Best Score (18)"
                  value={courseData.bestScore18}
                  subValue={courseData.worstScore18 !== '-' ? `Worst: ${courseData.worstScore18}` : undefined}
                  theme="green"
                  icon="🏆"
                />
              )}
              
              {has9HoleRounds && courseData.bestScore9 !== '-' && (
                <MetricCard
                  label="Best Score (9)"
                  value={courseData.bestScore9}
                  subValue={courseData.worstScore9 !== '-' ? `Worst: ${courseData.worstScore9}` : undefined}
                  theme="green"
                  icon="🏆"
                />
              )}
            </MetricGrid>
          )}
        </>
      )}

      {/* Par Type Performance - Only shown if statistics exist */}
      {has18HoleRounds && hasParTypeData && (
        <>
          <SectionHeader 
            title="Par Type Performance"
            subtitle="Average scores by par (18-hole rounds)"
          />
          <ParTypePerformance
            avgPar3={courseData.avgPar3}
            avgPar4={courseData.avgPar4}
            avgPar5={courseData.avgPar5}
            par3VsPar={courseData.par3VsPar}
            par4VsPar={courseData.par4VsPar}
            par5VsPar={courseData.par5VsPar}
          />
        </>
      )}

      {/* Scoring Distribution - Only shown if statistics exist */}
      {has18HoleRounds && hasScoringDistribution && (
        <>
          <SectionHeader 
            title="Scoring Distribution"
            subtitle="Percentage of holes by score type (18-hole rounds)"
          />
          <ScoringDistribution
            birdiePercent={courseData.birdiePercent}
            parPercent={courseData.parPercent}
            bogeyPercent={courseData.bogeyPercent}
            doublePlusPercent={courseData.doublePlusPercent}
          />
        </>
      )}

      {/* No Detailed Stats Message - Only for 18-hole rounds without statistics */}
      {has18HoleRounds && !hasAnyStatistics && (
        <EmptyState
          message="Detailed statistics not available"
          submessage="Statistics data was not recorded for rounds at this course"
          className="mb-6"
        />
      )}
      
      {/* No 18-hole rounds message */}
      {!has18HoleRounds && hasAnyRounds && (
        <EmptyState
          message="No 18-hole rounds recorded"
          submessage="Detailed statistics are only available for 18-hole rounds"
          className="mb-6"
        />
      )}

      {/* Hole by Hole Performance Chart - Only if hole data exists */}
      {showHoleChart && holeAverages.length > 0 && (
        <div className="mt-6">
          <SectionHeader 
            title="Hole by Hole Performance"
            subtitle="Average score vs par by hole"
          />
          <HolePerformanceChart data={holeAverages} />
        </div>
      )}
    </>
  )
}

export default CourseStatistics