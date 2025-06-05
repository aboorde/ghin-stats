import React from 'react'
import MetricCard from '../atoms/MetricCard'
import MetricGrid from './MetricGrid'
import { countScoreTypes } from '../../utils/scoringUtils'

/**
 * ScoreTypeSummary - Display scoring distribution summary
 * 
 * @param {array} holeDetails - Array of hole detail objects
 * @param {boolean} showEagles - Whether to show eagles (if any)
 * @param {boolean} showDoubles - Whether to show doubles separately
 * @param {string} className - Additional CSS classes
 */
const ScoreTypeSummary = ({ 
  holeDetails,
  showEagles = true,
  showDoubles = false,
  className = ''
}) => {
  const counts = countScoreTypes(holeDetails)
  
  // Determine which metrics to show
  const metrics = []
  
  if (showEagles && counts.eagles > 0) {
    metrics.push({
      label: 'Eagles',
      value: counts.eagles,
      theme: 'purple',
      icon: '🦅'
    })
  }
  
  metrics.push(
    {
      label: 'Birdies',
      value: counts.birdies,
      theme: 'blue',
      icon: '🐦'
    },
    {
      label: 'Pars',
      value: counts.pars,
      theme: 'green',
      icon: '✓'
    },
    {
      label: 'Bogeys',
      value: counts.bogeys,
      theme: 'yellow',
      icon: '+'
    }
  )
  
  if (showDoubles) {
    metrics.push({
      label: 'Doubles',
      value: counts.doubles,
      theme: 'orange',
      icon: '++'
    })
    metrics.push({
      label: 'Triple+',
      value: counts.triplePlus,
      theme: 'red',
      icon: '+++'
    })
  } else {
    metrics.push({
      label: 'Double+',
      value: counts.doublePlus,
      theme: 'red',
      icon: '++'
    })
  }
  
  return (
    <div className={className}>
      <MetricGrid 
        columns={metrics.length} 
        responsive={{ 
          sm: 2, 
          md: metrics.length > 4 ? 3 : metrics.length,
          lg: metrics.length 
        }}
      >
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            label={metric.label}
            value={metric.value}
            theme={metric.theme}
            icon={metric.icon}
            className="transition-all duration-200 hover:scale-105"
          />
        ))}
      </MetricGrid>
    </div>
  )
}

export default ScoreTypeSummary