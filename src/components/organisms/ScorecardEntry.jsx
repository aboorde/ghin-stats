import React, { useState, useEffect, useRef } from 'react'
import { HoleEntryCard } from '../molecules'
import { Button } from '../atoms'
import { getScoreColor } from '../../utils/theme'

/**
 * ScorecardEntry - Full scorecard organism for hole-by-hole entry
 * Mobile-optimized with swipe navigation and progress tracking
 * 
 * @param {Object} courseData - Basic course/round information
 * @param {Array} holesData - Current hole data
 * @param {function} onChange - Callback when hole data changes
 * @param {function} onComplete - Callback when scorecard is complete
 * @param {function} onBack - Callback to go back to course info
 */
const ScorecardEntry = ({ 
  courseData, 
  holesData = [], 
  onChange, 
  onComplete,
  onBack 
}) => {
  const [currentHole, setCurrentHole] = useState(1)
  const [expandedHoles, setExpandedHoles] = useState(new Set())
  const [viewMode, setViewMode] = useState('single') // 'single', 'grid', or 'scorecard'
  const [editingCell, setEditingCell] = useState(null) // For scorecard view editing
  const containerRef = useRef(null)

  // Initialize holes data if empty
  useEffect(() => {
    if (holesData.length === 0) {
      const defaultHoles = []
      const numHoles = courseData.number_of_holes || 18
      
      // Standard par configuration for 18 holes
      const standardPars = [4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5]
      
      for (let i = 1; i <= numHoles; i++) {
        defaultHoles.push({
          hole_number: i,
          par: standardPars[i - 1] || 4,
          stroke_allocation: i, // Default stroke index
          adjusted_gross_score: 0,
          putts: 0,
          fairway_hit: false,
          gir_flag: false,
          drive_accuracy: null
        })
      }
      
      onChange(defaultHoles)
    }
  }, [courseData.number_of_holes, holesData.length, onChange])

  const handleHoleChange = (holeNumber, data) => {
    const updatedHoles = [...holesData]
    const holeIndex = updatedHoles.findIndex(h => h.hole_number === holeNumber)
    if (holeIndex !== -1) {
      updatedHoles[holeIndex] = { ...updatedHoles[holeIndex], ...data }
      onChange(updatedHoles)
    }
  }

  const toggleExpanded = (holeNumber) => {
    const newExpanded = new Set(expandedHoles)
    if (newExpanded.has(holeNumber)) {
      newExpanded.delete(holeNumber)
    } else {
      newExpanded.add(holeNumber)
    }
    setExpandedHoles(newExpanded)
  }

  const navigateHole = (direction) => {
    const numHoles = courseData.number_of_holes || 18
    if (direction === 'next' && currentHole < numHoles) {
      setCurrentHole(currentHole + 1)
    } else if (direction === 'prev' && currentHole > 1) {
      setCurrentHole(currentHole - 1)
    }
  }

  // Calculate statistics
  const calculateStats = () => {
    const completedHoles = holesData.filter(h => h.adjusted_gross_score > 0)
    const totalScore = completedHoles.reduce((sum, h) => sum + h.adjusted_gross_score, 0)
    const totalPar = completedHoles.reduce((sum, h) => sum + h.par, 0)
    const totalPutts = completedHoles.reduce((sum, h) => sum + (h.putts || 0), 0)
    const fairwaysHit = holesData.filter(h => h.par > 3 && h.fairway_hit).length
    const possibleFairways = holesData.filter(h => h.par > 3).length
    const greensHit = holesData.filter(h => h.gir_flag).length
    
    return {
      holesCompleted: completedHoles.length,
      totalScore,
      overUnder: totalScore - totalPar,
      totalPutts,
      fairwaysHit,
      possibleFairways,
      greensHit,
      totalHoles: holesData.length
    }
  }

  const stats = calculateStats()
  const isComplete = stats.holesCompleted === (courseData.number_of_holes || 18)

  // Touch handling for swipe navigation
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe && viewMode === 'single') {
      navigateHole('next')
    }
    if (isRightSwipe && viewMode === 'single') {
      navigateHole('prev')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">{courseData.course_name}</h2>
            <p className="text-sm text-gray-400">{courseData.played_at}</p>
          </div>
          
          <button
            onClick={() => {
              if (viewMode === 'single') setViewMode('grid')
              else if (viewMode === 'grid') setViewMode('scorecard')
              else setViewMode('single')
            }}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title={`Switch to ${viewMode === 'single' ? 'grid' : viewMode === 'grid' ? 'scorecard' : 'single'} view`}
          >
            {viewMode === 'single' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ) : viewMode === 'grid' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-pink-600 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(stats.holesCompleted / stats.totalHoles) * 100}%` }}
          />
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-500">Score: </span>
              <span className={`font-bold ${stats.totalScore > 0 ? getScoreColor(stats.totalScore, stats.totalHoles * 4) : 'text-gray-400'}`}>
                {stats.totalScore > 0 ? stats.totalScore : '−'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">vs Par: </span>
              <span className={`font-bold ${
                stats.overUnder < 0 ? 'text-green-400' : 
                stats.overUnder === 0 ? 'text-yellow-400' : 
                'text-red-400'
              }`}>
                {stats.overUnder > 0 ? '+' : ''}{stats.overUnder || 'E'}
              </span>
            </div>
          </div>
          <div className="text-gray-400">
            {stats.holesCompleted}/{stats.totalHoles} holes
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="p-4"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {viewMode === 'single' ? (
          /* Single Hole View */
          <div className="max-w-lg mx-auto">
            {/* Hole Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateHole('prev')}
                disabled={currentHole === 1}
                className={`p-3 rounded-lg ${
                  currentHole === 1 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex gap-1">
                {[...Array(Math.min(9, stats.totalHoles))].map((_, i) => {
                  const holeNum = viewMode === 'single' 
                    ? (currentHole > 9 ? i + 10 : i + 1)
                    : i + 1
                  const hole = holesData.find(h => h.hole_number === holeNum)
                  const isCompleted = hole?.adjusted_gross_score > 0
                  
                  return (
                    <button
                      key={holeNum}
                      onClick={() => setCurrentHole(holeNum)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                        currentHole === holeNum
                          ? 'bg-pink-600 text-white scale-110'
                          : isCompleted
                          ? 'bg-green-600/20 text-green-400 border border-green-600/50'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {holeNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => navigateHole('next')}
                disabled={currentHole === stats.totalHoles}
                className={`p-3 rounded-lg ${
                  currentHole === stats.totalHoles 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Current Hole Card */}
            {holesData[currentHole - 1] && (
              <HoleEntryCard
                hole={holesData[currentHole - 1]}
                data={holesData[currentHole - 1]}
                onChange={handleHoleChange}
                expanded={expandedHoles.has(currentHole)}
                onToggleExpanded={() => toggleExpanded(currentHole)}
                isActive={true}
              />
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {holesData.map((hole) => (
              <HoleEntryCard
                key={hole.hole_number}
                hole={hole}
                data={hole}
                onChange={handleHoleChange}
                expanded={expandedHoles.has(hole.hole_number)}
                onToggleExpanded={() => toggleExpanded(hole.hole_number)}
                isActive={false}
              />
            ))}
          </div>
        ) : (
          /* Traditional Scorecard View */
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="bg-gray-800 rounded-xl min-w-[768px] shadow-xl">
              {/* Scorecard Header */}
              <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 p-4 rounded-t-xl border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{courseData.course_name}</h3>
                    <p className="text-sm text-gray-400">{courseData.tee_name} Tees • {courseData.played_at}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Rating/Slope</p>
                    <p className="text-lg font-bold text-white">{courseData.course_rating} / {courseData.slope_rating}</p>
                  </div>
                </div>
              </div>

              {/* Scorecard Table */}
              <div className="p-4">
                {/* Front 9 */}
                <div className="mb-6">
                  <div className="grid grid-cols-12 gap-0 text-xs">
                    {/* Headers */}
                    <div className="col-span-1 font-semibold text-gray-400 p-2 bg-gray-900 rounded-tl-lg">HOLE</div>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <div key={`h${num}`} className="col-span-1 font-semibold text-white text-center p-2 bg-gray-900 border-l border-gray-700">
                        {num}
                      </div>
                    ))}
                    <div className="col-span-1 font-semibold text-white text-center p-2 bg-gray-900 border-l border-gray-700">OUT</div>
                    <div className="col-span-1 font-semibold text-gray-400 p-2 bg-gray-900 rounded-tr-lg border-l border-gray-700">HCP</div>

                    {/* Par Row */}
                    <div className="col-span-1 font-medium text-yellow-400 p-2 bg-gray-900/50">PAR</div>
                    {holesData.slice(0, 9).map((hole) => (
                      <div key={`p${hole.hole_number}`} className="col-span-1 text-yellow-400 text-center p-2 bg-gray-900/50 border-l border-gray-700">
                        {hole.par}
                      </div>
                    ))}
                    <div className="col-span-1 text-yellow-400 font-semibold text-center p-2 bg-gray-900/50 border-l border-gray-700">
                      {holesData.slice(0, 9).reduce((sum, h) => sum + h.par, 0)}
                    </div>
                    <div className="col-span-1 p-2 bg-gray-900/50 border-l border-gray-700"></div>

                    {/* Score Row */}
                    <div className="col-span-1 font-medium text-gray-300 p-2">SCORE</div>
                    {holesData.slice(0, 9).map((hole) => (
                      <div key={`s${hole.hole_number}`} className="col-span-1 text-center p-0 border-l border-gray-700">
                        {editingCell === `score-${hole.hole_number}` ? (
                          <input
                            type="number"
                            value={hole.adjusted_gross_score || ''}
                            onChange={(e) => handleHoleChange(hole.hole_number, { adjusted_gross_score: parseInt(e.target.value) || 0 })}
                            onBlur={() => setEditingCell(null)}
                            className="w-full h-full p-2 bg-gray-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingCell(`score-${hole.hole_number}`)}
                            className={`w-full p-2 hover:bg-gray-700 transition-colors ${
                              hole.adjusted_gross_score ? getScoreColor(hole.adjusted_gross_score, hole.par) : 'text-gray-500'
                            }`}
                          >
                            {hole.adjusted_gross_score || '−'}
                          </button>
                        )}
                      </div>
                    ))}
                    <div className={`col-span-1 font-semibold text-center p-2 border-l border-gray-700 ${
                      stats.totalScore > 0 ? getScoreColor(
                        holesData.slice(0, 9).reduce((sum, h) => sum + h.adjusted_gross_score, 0),
                        holesData.slice(0, 9).reduce((sum, h) => sum + h.par, 0)
                      ) : 'text-gray-400'
                    }`}>
                      {holesData.slice(0, 9).reduce((sum, h) => sum + h.adjusted_gross_score, 0) || '−'}
                    </div>
                    <div className="col-span-1 p-2 border-l border-gray-700"></div>

                    {/* Putts Row */}
                    <div className="col-span-1 font-medium text-gray-500 p-2 bg-gray-900/30">PUTTS</div>
                    {holesData.slice(0, 9).map((hole) => (
                      <div key={`pt${hole.hole_number}`} className="col-span-1 text-center p-0 bg-gray-900/30 border-l border-gray-700">
                        {editingCell === `putts-${hole.hole_number}` ? (
                          <input
                            type="number"
                            value={hole.putts || ''}
                            onChange={(e) => handleHoleChange(hole.hole_number, { putts: parseInt(e.target.value) || 0 })}
                            onBlur={() => setEditingCell(null)}
                            className="w-full h-full p-2 bg-gray-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingCell(`putts-${hole.hole_number}`)}
                            className="w-full p-2 text-gray-400 hover:bg-gray-700 transition-colors"
                          >
                            {hole.putts || ''}
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="col-span-1 text-gray-400 text-center p-2 bg-gray-900/30 border-l border-gray-700">
                      {holesData.slice(0, 9).reduce((sum, h) => sum + (h.putts || 0), 0) || ''}
                    </div>
                    <div className="col-span-1 p-2 bg-gray-900/30 border-l border-gray-700"></div>

                    {/* FIR Row (Fairways in Regulation) */}
                    <div className="col-span-1 font-medium text-gray-500 p-2">FIR</div>
                    {holesData.slice(0, 9).map((hole) => (
                      <div key={`fir${hole.hole_number}`} className="col-span-1 text-center p-0 border-l border-gray-700">
                        {hole.par > 3 ? (
                          <button
                            onClick={() => handleHoleChange(hole.hole_number, { fairway_hit: !hole.fairway_hit })}
                            className={`w-full p-2 hover:bg-gray-700 transition-colors ${
                              hole.fairway_hit ? 'text-green-400' : 'text-gray-500'
                            }`}
                          >
                            {hole.fairway_hit ? '✓' : '−'}
                          </button>
                        ) : (
                          <div className="w-full p-2 text-gray-700">−</div>
                        )}
                      </div>
                    ))}
                    <div className="col-span-1 text-green-400 text-center p-2 border-l border-gray-700 font-medium">
                      {holesData.slice(0, 9).filter(h => h.par > 3 && h.fairway_hit).length}/{holesData.slice(0, 9).filter(h => h.par > 3).length}
                    </div>
                    <div className="col-span-1 p-2 border-l border-gray-700"></div>

                    {/* GIR Row (Greens in Regulation) */}
                    <div className="col-span-1 font-medium text-gray-500 p-2 bg-gray-900/30 rounded-bl-lg">GIR</div>
                    {holesData.slice(0, 9).map((hole) => (
                      <div key={`gir${hole.hole_number}`} className="col-span-1 text-center p-0 bg-gray-900/30 border-l border-gray-700">
                        <button
                          onClick={() => handleHoleChange(hole.hole_number, { gir_flag: !hole.gir_flag })}
                          className={`w-full p-2 hover:bg-gray-700 transition-colors ${
                            hole.gir_flag ? 'text-green-400' : 'text-gray-500'
                          }`}
                        >
                          {hole.gir_flag ? '✓' : '−'}
                        </button>
                      </div>
                    ))}
                    <div className="col-span-1 text-green-400 text-center p-2 bg-gray-900/30 border-l border-gray-700 font-medium">
                      {holesData.slice(0, 9).filter(h => h.gir_flag).length}/9
                    </div>
                    <div className="col-span-1 p-2 bg-gray-900/30 rounded-br-lg border-l border-gray-700"></div>
                  </div>
                </div>

                {/* Back 9 (if 18 holes) */}
                {holesData.length > 9 && (
                  <div>
                    <div className="grid grid-cols-12 gap-0 text-xs">
                      {/* Headers */}
                      <div className="col-span-1 font-semibold text-gray-400 p-2 bg-gray-900 rounded-tl-lg">HOLE</div>
                      {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(num => (
                        <div key={`h${num}`} className="col-span-1 font-semibold text-white text-center p-2 bg-gray-900 border-l border-gray-700">
                          {num}
                        </div>
                      ))}
                      <div className="col-span-1 font-semibold text-white text-center p-2 bg-gray-900 border-l border-gray-700">IN</div>
                      <div className="col-span-1 font-semibold text-white text-center p-2 bg-gray-900 rounded-tr-lg border-l border-gray-700">TOT</div>

                      {/* Par Row */}
                      <div className="col-span-1 font-medium text-yellow-400 p-2 bg-gray-900/50">PAR</div>
                      {holesData.slice(9, 18).map((hole) => (
                        <div key={`p${hole.hole_number}`} className="col-span-1 text-yellow-400 text-center p-2 bg-gray-900/50 border-l border-gray-700">
                          {hole.par}
                        </div>
                      ))}
                      <div className="col-span-1 text-yellow-400 font-semibold text-center p-2 bg-gray-900/50 border-l border-gray-700">
                        {holesData.slice(9, 18).reduce((sum, h) => sum + h.par, 0)}
                      </div>
                      <div className="col-span-1 text-yellow-400 font-bold text-center p-2 bg-gray-900/50 border-l border-gray-700">
                        {holesData.reduce((sum, h) => sum + h.par, 0)}
                      </div>

                      {/* Score Row */}
                      <div className="col-span-1 font-medium text-gray-300 p-2">SCORE</div>
                      {holesData.slice(9, 18).map((hole) => (
                        <div key={`s${hole.hole_number}`} className="col-span-1 text-center p-0 border-l border-gray-700">
                          {editingCell === `score-${hole.hole_number}` ? (
                            <input
                              type="number"
                              value={hole.adjusted_gross_score || ''}
                              onChange={(e) => handleHoleChange(hole.hole_number, { adjusted_gross_score: parseInt(e.target.value) || 0 })}
                              onBlur={() => setEditingCell(null)}
                              className="w-full h-full p-2 bg-gray-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
                              autoFocus
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCell(`score-${hole.hole_number}`)}
                              className={`w-full p-2 hover:bg-gray-700 transition-colors ${
                                hole.adjusted_gross_score ? getScoreColor(hole.adjusted_gross_score, hole.par) : 'text-gray-500'
                              }`}
                            >
                              {hole.adjusted_gross_score || '−'}
                            </button>
                          )}
                        </div>
                      ))}
                      <div className={`col-span-1 font-semibold text-center p-2 border-l border-gray-700 ${
                        stats.totalScore > 0 ? getScoreColor(
                          holesData.slice(9, 18).reduce((sum, h) => sum + h.adjusted_gross_score, 0),
                          holesData.slice(9, 18).reduce((sum, h) => sum + h.par, 0)
                        ) : 'text-gray-400'
                      }`}>
                        {holesData.slice(9, 18).reduce((sum, h) => sum + h.adjusted_gross_score, 0) || '−'}
                      </div>
                      <div className={`col-span-1 font-bold text-center p-2 border-l border-gray-700 ${
                        stats.totalScore > 0 ? getScoreColor(stats.totalScore, stats.totalHoles * 4) : 'text-gray-400'
                      }`}>
                        {stats.totalScore || '−'}
                      </div>

                      {/* Putts Row */}
                      <div className="col-span-1 font-medium text-gray-500 p-2 bg-gray-900/30">PUTTS</div>
                      {holesData.slice(9, 18).map((hole) => (
                        <div key={`pt${hole.hole_number}`} className="col-span-1 text-center p-0 bg-gray-900/30 border-l border-gray-700">
                          {editingCell === `putts-${hole.hole_number}` ? (
                            <input
                              type="number"
                              value={hole.putts || ''}
                              onChange={(e) => handleHoleChange(hole.hole_number, { putts: parseInt(e.target.value) || 0 })}
                              onBlur={() => setEditingCell(null)}
                              className="w-full h-full p-2 bg-gray-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
                              autoFocus
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCell(`putts-${hole.hole_number}`)}
                              className="w-full p-2 text-gray-400 hover:bg-gray-700 transition-colors"
                            >
                              {hole.putts || ''}
                            </button>
                          )}
                        </div>
                      ))}
                      <div className="col-span-1 text-gray-400 text-center p-2 bg-gray-900/30 border-l border-gray-700">
                        {holesData.slice(9, 18).reduce((sum, h) => sum + (h.putts || 0), 0) || ''}
                      </div>
                      <div className="col-span-1 text-gray-400 font-semibold text-center p-2 bg-gray-900/30 border-l border-gray-700">
                        {stats.totalPutts || ''}
                      </div>

                      {/* FIR Row (Fairways in Regulation) */}
                      <div className="col-span-1 font-medium text-gray-500 p-2">FIR</div>
                      {holesData.slice(9, 18).map((hole) => (
                        <div key={`fir${hole.hole_number}`} className="col-span-1 text-center p-0 border-l border-gray-700">
                          {hole.par > 3 ? (
                            <button
                              onClick={() => handleHoleChange(hole.hole_number, { fairway_hit: !hole.fairway_hit })}
                              className={`w-full p-2 hover:bg-gray-700 transition-colors ${
                                hole.fairway_hit ? 'text-green-400' : 'text-gray-500'
                              }`}
                            >
                              {hole.fairway_hit ? '✓' : '−'}
                            </button>
                          ) : (
                            <div className="w-full p-2 text-gray-700">−</div>
                          )}
                        </div>
                      ))}
                      <div className="col-span-1 text-green-400 text-center p-2 border-l border-gray-700 font-medium">
                        {holesData.slice(9, 18).filter(h => h.par > 3 && h.fairway_hit).length}/{holesData.slice(9, 18).filter(h => h.par > 3).length}
                      </div>
                      <div className="col-span-1 text-green-400 font-bold text-center p-2 border-l border-gray-700">
                        {stats.fairwaysHit}/{stats.possibleFairways}
                      </div>

                      {/* GIR Row (Greens in Regulation) */}
                      <div className="col-span-1 font-medium text-gray-500 p-2 bg-gray-900/30 rounded-bl-lg">GIR</div>
                      {holesData.slice(9, 18).map((hole) => (
                        <div key={`gir${hole.hole_number}`} className="col-span-1 text-center p-0 bg-gray-900/30 border-l border-gray-700">
                          <button
                            onClick={() => handleHoleChange(hole.hole_number, { gir_flag: !hole.gir_flag })}
                            className={`w-full p-2 hover:bg-gray-700 transition-colors ${
                              hole.gir_flag ? 'text-green-400' : 'text-gray-500'
                            }`}
                          >
                            {hole.gir_flag ? '✓' : '−'}
                          </button>
                        </div>
                      ))}
                      <div className="col-span-1 text-green-400 text-center p-2 bg-gray-900/30 border-l border-gray-700 font-medium">
                        {holesData.slice(9, 18).filter(h => h.gir_flag).length}/9
                      </div>
                      <div className="col-span-1 text-green-400 font-bold text-center p-2 bg-gray-900/30 rounded-br-lg border-l border-gray-700">
                        {stats.greensHit}/{stats.totalHoles}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Statistics */}
                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Score: </span>
                      <span className={`font-bold ${stats.totalScore > 0 ? getScoreColor(stats.totalScore, stats.totalHoles * 4) : 'text-gray-400'}`}>
                        {stats.totalScore || '−'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">vs Par: </span>
                      <span className={`font-bold ${
                        stats.overUnder < 0 ? 'text-green-400' : 
                        stats.overUnder === 0 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {stats.overUnder > 0 ? '+' : ''}{stats.overUnder || 'E'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Putts: </span>
                      <span className="font-bold text-white">{stats.totalPutts || '−'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Complete: </span>
                      <span className="font-bold text-white">{stats.holesCompleted}/{stats.totalHoles}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">FIR: </span>
                      <span className="font-bold text-green-400">
                        {stats.possibleFairways > 0 
                          ? `${Math.round((stats.fairwaysHit / stats.possibleFairways) * 100)}%`
                          : '−'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">GIR: </span>
                      <span className="font-bold text-green-400">
                        {stats.totalHoles > 0 
                          ? `${Math.round((stats.greensHit / stats.totalHoles) * 100)}%`
                          : '−'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="max-w-lg mx-auto">
          {isComplete ? (
            <Button
              onClick={onComplete}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Review & Submit Round
            </Button>
          ) : (
            <div className="text-center text-gray-400">
              Complete all holes to submit your round
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScorecardEntry