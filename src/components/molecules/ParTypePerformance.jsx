import React from 'react'
import MetricCard from '../atoms/MetricCard'
import MetricGrid from './MetricGrid'
import SectionHeader from '../atoms/SectionHeader'

/**
 * ParTypePerformance - Displays par 3/4/5 performance metrics
 * 
 * @param {number} avgPar3 - Average score on par 3s
 * @param {number} avgPar4 - Average score on par 4s
 * @param {number} avgPar5 - Average score on par 5s
 * @param {number} par3VsPar - Strokes over par for par 3s
 * @param {number} par4VsPar - Strokes over par for par 4s
 * @param {number} par5VsPar - Strokes over par for par 5s
 * @param {string} title - Section title
 * @param {string} roundType - Type of rounds (e.g., "18-hole rounds")
 */
const ParTypePerformance = ({ 
  avgPar3, 
  avgPar4, 
  avgPar5,
  par3VsPar,
  par4VsPar,
  par5VsPar,
  title = "Par Type Performance",
  roundType = "18-hole rounds"
}) => {
  const formatVsPar = (value) => {
    if (value === 0) return 'Even'
    return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
  }

  return (
    <div className="mb-6">
      <SectionHeader 
        title={title}
        subtitle={roundType}
      />
      <MetricGrid columns={3} responsive={{ sm: 1, md: 3 }}>
        <MetricCard
          label="Par 3 Average"
          value={avgPar3.toFixed(2)}
          trend={`${formatVsPar(par3VsPar)} vs par`}
          theme="gray"
          icon="⛳"
        />
        <MetricCard
          label="Par 4 Average"
          value={avgPar4.toFixed(2)}
          trend={`${formatVsPar(par4VsPar)} vs par`}
          theme="gray"
          icon="🏌️"
        />
        <MetricCard
          label="Par 5 Average"
          value={avgPar5.toFixed(2)}
          trend={`${formatVsPar(par5VsPar)} vs par`}
          theme="gray"
          icon="🦅"
        />
      </MetricGrid>
    </div>
  )
}

export default ParTypePerformance