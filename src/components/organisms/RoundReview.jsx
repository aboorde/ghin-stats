import React, { useState } from 'react'
import { Button } from '../atoms'
import { calculateHandicapDifferential } from '../../utils/handicapCalculator'
import { getScoreColor } from '../../utils/theme'

/**
 * RoundReview - Review and submit component for completed rounds
 * Shows summary statistics and allows final review before submission
 * 
 * @param {Object} courseData - Course information
 * @param {Array} holesData - Completed hole data
 * @param {function} onSubmit - Callback to submit the round
 * @param {function} onEdit - Callback to go back and edit
 * @param {boolean} isEdit - Whether this is an edit operation
 */
const RoundReview = ({ courseData, holesData, onSubmit, onEdit, isEdit = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate all statistics
  const calculateStats = () => {
    const front9 = holesData.slice(0, 9)
    const back9 = holesData.slice(9, 18)
    
    const stats = {
      // Overall scores
      totalScore: holesData.reduce((sum, h) => sum + h.adjusted_gross_score, 0),
      totalPar: holesData.reduce((sum, h) => sum + h.par, 0),
      front9Score: front9.reduce((sum, h) => sum + h.adjusted_gross_score, 0),
      front9Par: front9.reduce((sum, h) => sum + h.par, 0),
      back9Score: back9.reduce((sum, h) => sum + h.adjusted_gross_score, 0),
      back9Par: back9.reduce((sum, h) => sum + h.par, 0),
      
      // Putting stats
      totalPutts: holesData.reduce((sum, h) => sum + (h.putts || 0), 0),
      onePutts: holesData.filter(h => h.putts === 1).length,
      threePutts: holesData.filter(h => h.putts >= 3).length,
      
      // Scoring distribution
      eagles: holesData.filter(h => h.adjusted_gross_score <= h.par - 2).length,
      birdies: holesData.filter(h => h.adjusted_gross_score === h.par - 1).length,
      pars: holesData.filter(h => h.adjusted_gross_score === h.par).length,
      bogeys: holesData.filter(h => h.adjusted_gross_score === h.par + 1).length,
      doubleBogeys: holesData.filter(h => h.adjusted_gross_score === h.par + 2).length,
      triplePlus: holesData.filter(h => h.adjusted_gross_score >= h.par + 3).length,
      
      // Fairways & Greens
      fairwaysHit: holesData.filter(h => h.par > 3 && h.fairway_hit).length,
      possibleFairways: holesData.filter(h => h.par > 3).length,
      greensHit: holesData.filter(h => h.gir_flag).length,
      totalHoles: holesData.length,
      
      // Par performance
      par3Avg: holesData.filter(h => h.par === 3).reduce((sum, h, _, arr) => 
        sum + h.adjusted_gross_score / arr.length, 0),
      par4Avg: holesData.filter(h => h.par === 4).reduce((sum, h, _, arr) => 
        sum + h.adjusted_gross_score / arr.length, 0),
      par5Avg: holesData.filter(h => h.par === 5).reduce((sum, h, _, arr) => 
        sum + h.adjusted_gross_score / arr.length, 0)
    }
    
    // Calculate differential
    stats.differential = calculateHandicapDifferential(
      stats.totalScore,
      courseData.course_rating,
      courseData.slope_rating
    )
    
    stats.overUnder = stats.totalScore - stats.totalPar
    stats.puttsPerHole = (stats.totalPutts / stats.totalHoles).toFixed(1)
    stats.puttsPerGIR = stats.greensHit > 0 
      ? (holesData.filter(h => h.gir_flag).reduce((sum, h) => sum + (h.putts || 0), 0) / stats.greensHit).toFixed(1)
      : 'N/A'
    
    return stats
  }

  const stats = calculateStats()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        courseData,
        holesData,
        statistics: stats
      })
    } catch (error) {
      console.error('Error submitting round:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onEdit}
          className="mb-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h1 className="text-2xl font-bold text-white mb-2">{isEdit ? 'Review Changes' : 'Round Review'}</h1>
        <p className="text-gray-400">
          {courseData.course_name} • {courseData.played_at}
        </p>
      </div>

      {/* Main Score Summary */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="text-center mb-4">
          <div className="text-5xl font-bold mb-2">
            <span className={getScoreColor(stats.totalScore, stats.totalPar)}>
              {stats.totalScore}
            </span>
          </div>
          <div className="text-lg text-gray-400">
            {stats.overUnder > 0 ? '+' : ''}{stats.overUnder} 
            <span className="text-sm ml-2">({stats.differential.toFixed(1)} diff)</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Front 9</div>
            <div className="text-xl font-bold text-white">{stats.front9Score}</div>
            <div className="text-sm text-gray-400">
              {stats.front9Score - stats.front9Par > 0 ? '+' : ''}
              {stats.front9Score - stats.front9Par}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Back 9</div>
            <div className="text-xl font-bold text-white">{stats.back9Score}</div>
            <div className="text-sm text-gray-400">
              {stats.back9Score - stats.back9Par > 0 ? '+' : ''}
              {stats.back9Score - stats.back9Par}
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Distribution */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Scoring Distribution</h3>
        <div className="grid grid-cols-3 gap-3">
          {stats.eagles > 0 && (
            <div className="text-center p-3 bg-purple-900/20 rounded-lg border border-purple-700">
              <div className="text-2xl font-bold text-purple-400">{stats.eagles}</div>
              <div className="text-xs text-gray-400">Eagle{stats.eagles > 1 ? 's' : ''}</div>
            </div>
          )}
          <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-700">
            <div className="text-2xl font-bold text-green-400">{stats.birdies}</div>
            <div className="text-xs text-gray-400">Birdie{stats.birdies !== 1 ? 's' : ''}</div>
          </div>
          <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-700">
            <div className="text-2xl font-bold text-yellow-400">{stats.pars}</div>
            <div className="text-xs text-gray-400">Par{stats.pars !== 1 ? 's' : ''}</div>
          </div>
          <div className="text-center p-3 bg-orange-900/20 rounded-lg border border-orange-700">
            <div className="text-2xl font-bold text-orange-400">{stats.bogeys}</div>
            <div className="text-xs text-gray-400">Bogey{stats.bogeys !== 1 ? 's' : ''}</div>
          </div>
          <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-700">
            <div className="text-2xl font-bold text-red-400">{stats.doubleBogeys}</div>
            <div className="text-xs text-gray-400">Double{stats.doubleBogeys !== 1 ? 's' : ''}</div>
          </div>
          {stats.triplePlus > 0 && (
            <div className="text-center p-3 bg-rose-900/20 rounded-lg border border-rose-700">
              <div className="text-2xl font-bold text-rose-400">{stats.triplePlus}</div>
              <div className="text-xs text-gray-400">Triple+</div>
            </div>
          )}
        </div>
      </div>

      {/* Key Statistics */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Key Statistics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Putts</span>
            <span className="font-medium text-white">{stats.totalPutts}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Putts per Hole</span>
            <span className="font-medium text-white">{stats.puttsPerHole}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Putts per GIR</span>
            <span className="font-medium text-white">{stats.puttsPerGIR}</span>
          </div>
          <div className="h-px bg-gray-700"></div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Fairways Hit</span>
            <span className="font-medium text-white">
              {stats.fairwaysHit}/{stats.possibleFairways} 
              <span className="text-sm text-gray-500 ml-1">
                ({((stats.fairwaysHit / stats.possibleFairways) * 100).toFixed(0)}%)
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Greens in Regulation</span>
            <span className="font-medium text-white">
              {stats.greensHit}/{stats.totalHoles} 
              <span className="text-sm text-gray-500 ml-1">
                ({((stats.greensHit / stats.totalHoles) * 100).toFixed(0)}%)
              </span>
            </span>
          </div>
          <div className="h-px bg-gray-700"></div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Par 3 Average</span>
            <span className="font-medium text-white">{stats.par3Avg.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Par 4 Average</span>
            <span className="font-medium text-white">{stats.par4Avg.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Par 5 Average</span>
            <span className="font-medium text-white">{stats.par5Avg.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Hole-by-Hole Summary */}
      <div className="bg-gray-800 rounded-xl p-6 mb-20">
        <h3 className="text-lg font-semibold text-white mb-4">Hole-by-Hole</h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-9 gap-2 min-w-max">
            {/* Headers */}
            <div className="text-xs text-gray-500 font-medium">Hole</div>
            {[...Array(9)].map((_, i) => (
              <div key={i} className="text-xs text-gray-500 font-medium text-center">
                {i + 1}
              </div>
            ))}
            
            {/* Front 9 Par */}
            <div className="text-xs text-gray-400">Par</div>
            {holesData.slice(0, 9).map((hole) => (
              <div key={hole.hole_number} className="text-xs text-gray-400 text-center">
                {hole.par}
              </div>
            ))}
            
            {/* Front 9 Score */}
            <div className="text-xs text-gray-400">Score</div>
            {holesData.slice(0, 9).map((hole) => (
              <div 
                key={hole.hole_number} 
                className={`text-sm font-medium text-center ${
                  getScoreColor(hole.adjusted_gross_score, hole.par)
                }`}
              >
                {hole.adjusted_gross_score}
              </div>
            ))}
            
            {/* Back 9 if 18 holes */}
            {holesData.length > 9 && (
              <>
                <div className="col-span-10 h-px bg-gray-700 my-2"></div>
                
                <div className="text-xs text-gray-500 font-medium">Hole</div>
                {[...Array(9)].map((_, i) => (
                  <div key={i + 10} className="text-xs text-gray-500 font-medium text-center">
                    {i + 10}
                  </div>
                ))}
                
                <div className="text-xs text-gray-400">Par</div>
                {holesData.slice(9, 18).map((hole) => (
                  <div key={hole.hole_number} className="text-xs text-gray-400 text-center">
                    {hole.par}
                  </div>
                ))}
                
                <div className="text-xs text-gray-400">Score</div>
                {holesData.slice(9, 18).map((hole) => (
                  <div 
                    key={hole.hole_number} 
                    className={`text-sm font-medium text-center ${
                      getScoreColor(hole.adjusted_gross_score, hole.par)
                    }`}
                  >
                    {hole.adjusted_gross_score}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Submit Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="max-w-lg mx-auto grid grid-cols-2 gap-4">
          <Button
            onClick={onEdit}
            variant="secondary"
            size="large"
            disabled={isSubmitting}
          >
            Edit Round
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEdit ? 'Updating...' : 'Submitting...') : (isEdit ? 'Update Round' : 'Submit Round')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RoundReview