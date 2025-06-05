import React from 'react'
import HoleCard from '../atoms/HoleCard'
import TotalCard from '../atoms/TotalCard'
import SectionHeader from '../atoms/SectionHeader'

/**
 * NineHoleGrid - Display a grid of holes (for front nine, back nine, or 9-hole rounds)
 * 
 * @param {array} holes - Array of hole detail objects
 * @param {string} title - Section title (e.g., "Front Nine", "Back Nine")
 * @param {string} totalLabel - Label for the total card
 * @param {boolean} showTotal - Whether to show the total card
 * @param {string} gridCols - Grid columns configuration
 * @param {string} holeSize - Size for hole cards
 * @param {function} onHoleClick - Click handler for holes
 */
const NineHoleGrid = ({ 
  holes,
  title,
  totalLabel,
  showTotal = true,
  gridCols = 'grid-cols-2 sm:grid-cols-3',
  holeSize = 'md',
  onHoleClick
}) => {
  const total = holes.reduce((sum, hole) => sum + hole.adjusted_gross_score, 0)
  
  return (
    <div>
      {title && <SectionHeader title={title} size="sm" />}
      
      <div className={`grid ${gridCols} gap-2`}>
        {holes.map(hole => (
          <HoleCard
            key={hole.hole_number}
            holeNumber={hole.hole_number}
            par={hole.par}
            score={hole.adjusted_gross_score}
            size={holeSize}
            onClick={onHoleClick ? () => onHoleClick(hole) : undefined}
          />
        ))}
      </div>
      
      {showTotal && (
        <div className="mt-3">
          <TotalCard
            label={totalLabel || `${title} Total:`}
            value={total}
          />
        </div>
      )}
    </div>
  )
}

export default NineHoleGrid