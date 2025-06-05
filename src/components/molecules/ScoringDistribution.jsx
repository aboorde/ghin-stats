import React from 'react'
import MetricCard from '../atoms/MetricCard'
import MetricGrid from './MetricGrid'
import SectionHeader from '../atoms/SectionHeader'

/**
 * ScoringDistribution - Displays scoring distribution (pars, bogeys, etc.)
 * 
 * @param {number} parPercent - Percentage of pars (0-1)
 * @param {number} bogeyPercent - Percentage of bogeys (0-1)
 * @param {number} doublePlusPercent - Percentage of double bogeys or worse (0-1)
 * @param {number} birdiePercent - Percentage of birdies (0-1)
 * @param {string} title - Section title
 * @param {string} roundType - Type of rounds
 */
const ScoringDistribution = ({ 
  parPercent, 
  bogeyPercent, 
  doublePlusPercent,
  birdiePercent = 0,
  title = "Scoring Distribution",
  roundType = "18-hole rounds"
}) => {
  const formatPercent = (value) => `${(value * 100).toFixed(1)}%`

  return (
    <div className="mb-6">
      <SectionHeader 
        title={title}
        subtitle={roundType}
      />
      <MetricGrid columns={birdiePercent > 0 ? 4 : 3} responsive={{ sm: 2, md: birdiePercent > 0 ? 4 : 3 }}>
        {birdiePercent > 0 && (
          <MetricCard
            label="Birdies"
            value={formatPercent(birdiePercent)}
            theme="blue"
            icon="🦅"
          />
        )}
        <MetricCard
          label="Pars"
          value={formatPercent(parPercent)}
          theme="green"
          icon="✓"
        />
        <MetricCard
          label="Bogeys"
          value={formatPercent(bogeyPercent)}
          theme="yellow"
          icon="+"
        />
        <MetricCard
          label="Double+"
          value={formatPercent(doublePlusPercent)}
          theme="red"
          icon="++"
        />
      </MetricGrid>
    </div>
  )
}

export default ScoringDistribution