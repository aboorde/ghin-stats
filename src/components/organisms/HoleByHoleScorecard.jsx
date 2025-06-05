import React from 'react'
import { NineHoleGrid, ScoreTypeSummary, EmptyState } from '../molecules'

/**
 * HoleByHoleScorecard - Complete scorecard display for a round
 * 
 * @param {array} holeDetails - Array of hole detail objects
 * @param {number} numberOfHoles - Number of holes in the round (9 or 18)
 * @param {function} onHoleClick - Optional click handler for holes
 * @param {boolean} showScoreSummary - Whether to show score type summary
 * @param {string} className - Additional CSS classes
 */
const HoleByHoleScorecard = ({ 
  holeDetails,
  numberOfHoles,
  onHoleClick,
  showScoreSummary = true,
  className = ''
}) => {
  if (!holeDetails || holeDetails.length === 0) {
    return (
      <EmptyState
        message="No hole details available"
        submessage="Select a round to view the scorecard"
        icon="⛳"
      />
    )
  }
  
  // Validate that we have the correct number of holes
  const expectedHoles = numberOfHoles || holeDetails.length
  const actualHoles = holeDetails.length
  
  // If there's a mismatch, show a warning
  if (expectedHoles !== actualHoles) {
    return (
      <EmptyState
        message={`Data mismatch: Expected ${expectedHoles} holes but found ${actualHoles}`}
        submessage="Please try selecting the round again"
        icon="⚠️"
      />
    )
  }
  
  const is18Holes = expectedHoles === 18
  
  return (
    <div className={`space-y-6 ${className}`}>
      {is18Holes ? (
        // 18-hole layout with front and back nine
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NineHoleGrid
            holes={holeDetails.slice(0, 9)}
            title="Front Nine"
            totalLabel="Front Nine Total:"
            onHoleClick={onHoleClick}
          />
          <NineHoleGrid
            holes={holeDetails.slice(9, 18)}
            title="Back Nine"
            totalLabel="Back Nine Total:"
            onHoleClick={onHoleClick}
          />
        </div>
      ) : (
        // 9-hole layout
        <div className="grid grid-cols-1 gap-6">
          <NineHoleGrid
            holes={holeDetails}
            title="Nine Holes"
            totalLabel="Total:"
            onHoleClick={onHoleClick}
          />
        </div>
      )}
      
      {showScoreSummary && (
        <ScoreTypeSummary
          holeDetails={holeDetails}
          className="mt-6"
        />
      )}
    </div>
  )
}

export default HoleByHoleScorecard