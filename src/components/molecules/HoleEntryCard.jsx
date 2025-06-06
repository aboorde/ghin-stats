import React from 'react'
import { ScoreInput, PuttsInput, ToggleSwitch, DriveAccuracyInput } from '../atoms'

/**
 * HoleEntryCard - Molecule component for entering data for a single hole
 * Combines all atomic inputs into a cohesive, mobile-optimized card
 * 
 * @param {Object} hole - Hole data including number, par, etc.
 * @param {Object} data - Current hole data (score, putts, etc.)
 * @param {function} onChange - Callback when any field changes
 * @param {boolean} expanded - Whether to show advanced fields
 * @param {function} onToggleExpanded - Callback to toggle expanded state
 */
const HoleEntryCard = ({ 
  hole, 
  data = {}, 
  onChange,
  expanded = false,
  onToggleExpanded,
  isActive = false
}) => {
  const handleFieldChange = (field, value) => {
    onChange(hole.hole_number, { ...data, [field]: value })
  }

  const isPar3 = hole.par === 3
  
  // Calculate if score is complete (has minimum required data)
  const isComplete = data.adjusted_gross_score > 0
  const hasAdvancedData = data.putts > 0 || data.fairway_hit !== undefined || data.gir_flag !== undefined

  return (
    <div className={`
      rounded-xl transition-all duration-300 transform
      ${isActive 
        ? 'bg-gray-800 border-2 border-pink-500 shadow-2xl shadow-pink-600/20 scale-[1.02]' 
        : 'bg-gray-900 border-2 border-gray-700'
      }
      ${isComplete ? 'ring-2 ring-green-600/20' : ''}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Hole</div>
              <div className="text-2xl font-bold text-white">{hole.hole_number}</div>
            </div>
            <div className="h-12 w-px bg-gray-700"></div>
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Par</div>
              <div className="text-2xl font-bold text-yellow-400">{hole.par}</div>
            </div>
            {hole.stroke_allocation && (
              <>
                <div className="h-12 w-px bg-gray-700"></div>
                <div className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">HCP</div>
                  <div className="text-lg font-medium text-gray-400">{hole.stroke_allocation}</div>
                </div>
              </>
            )}
          </div>
          
          {/* Expand/Collapse button */}
          <button
            type="button"
            onClick={onToggleExpanded}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${hasAdvancedData ? 'text-pink-400' : 'text-gray-500'}
              hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500
            `}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            <svg 
              className={`w-5 h-5 transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Score Entry */}
      <div className="p-6">
        <ScoreInput
          value={data.adjusted_gross_score || 0}
          onChange={(value) => handleFieldChange('adjusted_gross_score', value)}
          par={hole.par}
          label="Score"
        />
      </div>

      {/* Advanced Fields */}
      {expanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-gray-700 pt-6">
          {/* Putts */}
          <PuttsInput
            value={data.putts || 0}
            onChange={(value) => handleFieldChange('putts', value)}
          />

          {/* Drive Accuracy (not for par 3s) */}
          <DriveAccuracyInput
            value={data.drive_accuracy}
            onChange={(value) => handleFieldChange('drive_accuracy', value)}
            isPar3={isPar3}
          />

          {/* Fairway Hit Toggle (not for par 3s) */}
          {!isPar3 && (
            <ToggleSwitch
              value={data.fairway_hit || false}
              onChange={(value) => handleFieldChange('fairway_hit', value)}
              label="Fairway Hit"
              onColor="bg-green-600"
            />
          )}

          {/* Green in Regulation */}
          <ToggleSwitch
            value={data.gir_flag || false}
            onChange={(value) => handleFieldChange('gir_flag', value)}
            label="Green in Regulation"
            onColor="bg-green-600"
          />

          {/* Quick Stats */}
          {data.adjusted_gross_score > 0 && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Hole Summary</div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Score: </span>
                  <span className={`font-medium ${
                    data.adjusted_gross_score < hole.par ? 'text-green-400' :
                    data.adjusted_gross_score === hole.par ? 'text-yellow-400' :
                    'text-orange-400'
                  }`}>
                    {data.adjusted_gross_score}
                  </span>
                </div>
                {data.putts > 0 && (
                  <div>
                    <span className="text-gray-500">Putts: </span>
                    <span className="font-medium text-gray-300">{data.putts}</span>
                  </div>
                )}
                {data.fairway_hit !== undefined && !isPar3 && (
                  <div>
                    <span className="text-gray-500">FW: </span>
                    <span className={`font-medium ${data.fairway_hit ? 'text-green-400' : 'text-gray-400'}`}>
                      {data.fairway_hit ? '✓' : '✗'}
                    </span>
                  </div>
                )}
                {data.gir_flag !== undefined && (
                  <div>
                    <span className="text-gray-500">GIR: </span>
                    <span className={`font-medium ${data.gir_flag ? 'text-green-400' : 'text-gray-400'}`}>
                      {data.gir_flag ? '✓' : '✗'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HoleEntryCard