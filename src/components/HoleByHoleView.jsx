import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { normalizeCourseData } from '../utils/dataHelpers'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'
import Loading from './ui/Loading'

const HoleByHoleView = ({ userId }) => {
  const [selectedRound, setSelectedRound] = useState(null)
  const [rounds, setRounds] = useState([])
  const [holeDetails, setHoleDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRounds()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedRound) {
      fetchHoleDetails(selectedRound)
    }
  }, [selectedRound])

  const fetchRounds = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('scores')
        .select('id, played_at, course_name, adjusted_gross_score, number_of_holes')
        .order('played_at', { ascending: false })

      // Filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      // Normalize course names
      const normalizedData = normalizeCourseData(data || [])
      setRounds(normalizedData)
      if (normalizedData && normalizedData.length > 0) {
        setSelectedRound(normalizedData[0].id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchHoleDetails = async (scoreId) => {
    try {
      const { data, error } = await supabase
        .from('hole_details')
        .select('*')
        .eq('score_id', scoreId)
        .order('hole_number', { ascending: true })

      if (error) throw error
      setHoleDetails(data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const calculateScoreToPar = (score, par) => {
    const diff = score - par
    if (diff === 0) return { text: 'Par', color: 'text-green-400' }
    if (diff === 1) return { text: 'Bogey', color: 'text-yellow-400' }
    if (diff === 2) return { text: 'Double', color: 'text-orange-400' }
    if (diff >= 3) return { text: `+${diff}`, color: 'text-red-400' }
    if (diff === -1) return { text: 'Birdie', color: 'text-blue-400' }
    if (diff <= -2) return { text: `${diff}`, color: 'text-purple-400' }
  }

  const getScoreBackgroundColor = (score, par) => {
    const diff = score - par
    if (diff === 0) return 'bg-green-900/30 border-green-600/50'
    if (diff === 1) return 'bg-yellow-900/30 border-yellow-600/50'
    if (diff === 2) return 'bg-orange-900/30 border-orange-600/50'
    if (diff >= 3) return 'bg-red-900/30 border-red-600/50'
    if (diff === -1) return 'bg-blue-900/30 border-blue-600/50'
    if (diff <= -2) return 'bg-purple-900/30 border-purple-600/50'
  }

  const selectedRoundData = rounds.find(r => r.id === selectedRound)

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 bg-red-900/20 border border-red-600/30 rounded-lg p-4 inline-block">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Hole by Hole Analysis"
        subtitle="Detailed scorecard view for each round"
      />
      
      <Card>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Select Round
          </label>
          <select
            value={selectedRound || ''}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="w-full md:w-auto px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-600"
          >
            {rounds.map(round => (
              <option key={round.id} value={round.id} className="bg-gray-800">
                {format(new Date(round.played_at), 'MMM d, yyyy')} - {round.course_name} ({round.adjusted_gross_score}) {round.number_of_holes === 9 ? '[9-hole]' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedRoundData && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-900/20 to-yellow-900/20 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-gray-200 mb-2">Round Summary</h3>
            <p className="text-gray-400">
              {selectedRoundData.course_name} • {format(new Date(selectedRoundData.played_at), 'MMMM d, yyyy')}
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
              Total Score: {selectedRoundData.adjusted_gross_score} ({selectedRoundData.number_of_holes} holes)
            </p>
          </div>
        )}

        {selectedRoundData?.number_of_holes === 9 ? (
          // Layout for 9-hole rounds
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-300">Nine Holes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {holeDetails.map(hole => {
                  const scoreToPar = calculateScoreToPar(hole.adjusted_gross_score, hole.par)
                  return (
                    <div
                      key={hole.hole_number}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${getScoreBackgroundColor(hole.adjusted_gross_score, hole.par)}`}
                    >
                      <div className="text-xs sm:text-sm font-medium text-gray-400">
                        Hole {hole.hole_number}
                      </div>
                      <div className="text-xs text-gray-500">Par {hole.par}</div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-100">
                        {hole.adjusted_gross_score}
                      </div>
                      <div className={`text-xs sm:text-sm font-medium ${scoreToPar.color}`}>
                        {scoreToPar.text}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-400">Total:</span>
                  <span className="font-bold text-xl text-gray-200">
                    {holeDetails.reduce((sum, hole) => sum + hole.adjusted_gross_score, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Layout for 18-hole rounds
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-300">Front Nine</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {holeDetails.slice(0, 9).map(hole => {
                  const scoreToPar = calculateScoreToPar(hole.adjusted_gross_score, hole.par)
                  return (
                    <div
                      key={hole.hole_number}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${getScoreBackgroundColor(hole.adjusted_gross_score, hole.par)}`}
                    >
                      <div className="text-xs sm:text-sm font-medium text-gray-400">
                        Hole {hole.hole_number}
                      </div>
                      <div className="text-xs text-gray-500">Par {hole.par}</div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-100">
                        {hole.adjusted_gross_score}
                      </div>
                      <div className={`text-xs sm:text-sm font-medium ${scoreToPar.color}`}>
                        {scoreToPar.text}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-400">Front Nine Total:</span>
                  <span className="font-bold text-xl text-gray-200">
                    {holeDetails.slice(0, 9).reduce((sum, hole) => sum + hole.adjusted_gross_score, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-gray-300">Back Nine</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {holeDetails.slice(9, 18).map(hole => {
                  const scoreToPar = calculateScoreToPar(hole.adjusted_gross_score, hole.par)
                  return (
                    <div
                      key={hole.hole_number}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${getScoreBackgroundColor(hole.adjusted_gross_score, hole.par)}`}
                    >
                      <div className="text-xs sm:text-sm font-medium text-gray-400">
                        Hole {hole.hole_number}
                      </div>
                      <div className="text-xs text-gray-500">Par {hole.par}</div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-100">
                        {hole.adjusted_gross_score}
                      </div>
                      <div className={`text-xs sm:text-sm font-medium ${scoreToPar.color}`}>
                        {scoreToPar.text}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-400">Back Nine Total:</span>
                  <span className="font-bold text-xl text-gray-200">
                    {holeDetails.slice(9, 18).reduce((sum, hole) => sum + hole.adjusted_gross_score, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-900/30 p-4 rounded-lg text-center border border-blue-600/30 transition-all duration-200 hover:bg-blue-900/40">
            <div className="text-sm text-gray-400">Birdies</div>
            <div className="text-2xl font-bold text-blue-400">
              {holeDetails.filter(h => h.adjusted_gross_score - h.par === -1).length}
            </div>
          </div>
          <div className="bg-green-900/30 p-4 rounded-lg text-center border border-green-600/30 transition-all duration-200 hover:bg-green-900/40">
            <div className="text-sm text-gray-400">Pars</div>
            <div className="text-2xl font-bold text-green-400">
              {holeDetails.filter(h => h.adjusted_gross_score === h.par).length}
            </div>
          </div>
          <div className="bg-yellow-900/30 p-4 rounded-lg text-center border border-yellow-600/30 transition-all duration-200 hover:bg-yellow-900/40">
            <div className="text-sm text-gray-400">Bogeys</div>
            <div className="text-2xl font-bold text-yellow-400">
              {holeDetails.filter(h => h.adjusted_gross_score - h.par === 1).length}
            </div>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg text-center border border-red-600/30 transition-all duration-200 hover:bg-red-900/40">
            <div className="text-sm text-gray-400">Double+</div>
            <div className="text-2xl font-bold text-red-400">
              {holeDetails.filter(h => h.adjusted_gross_score - h.par >= 2).length}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default HoleByHoleView