import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { normalizeCourseData } from '../utils/dataHelpers'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'
import Loading from './ui/Loading'
import { RoundSelector, RoundSummaryCard } from './molecules'
import { HoleByHoleScorecard } from './organisms'

const HoleByHoleView = ({ userId }) => {
  const [selectedRound, setSelectedRound] = useState(null)
  const [rounds, setRounds] = useState([])
  const [holeDetails, setHoleDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingHoles, setLoadingHoles] = useState(false)
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
        .from('rounds')
        .select(`
          id, 
          played_at, 
          course_name, 
          adjusted_gross_score, 
          number_of_holes,
          differential,
          course_rating,
          slope_rating,
          tee_name,
          course_handicap,
          net_score
        `)
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

  const fetchHoleDetails = async (roundId) => {
    try {
      setLoadingHoles(true)
      setHoleDetails([]) // Clear previous hole details
      
      const { data, error } = await supabase
        .from('hole_details')
        .select('*')
        .eq('round_id', roundId)
        .order('hole_number', { ascending: true })

      if (error) throw error
      setHoleDetails(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingHoles(false)
    }
  }


  const selectedRoundData = rounds.find(r => String(r.id) === String(selectedRound))

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
        <RoundSelector
          rounds={rounds}
          selectedRound={selectedRound}
          onRoundSelect={setSelectedRound}
          className="mb-6"
        />

        {selectedRoundData && (
          <RoundSummaryCard
            round={selectedRoundData}
            className="mb-6"
          />
        )}

        {loadingHoles ? (
          <div className="flex justify-center items-center py-8">
            <Loading message="Loading hole details..." />
          </div>
        ) : (
          <HoleByHoleScorecard
            holeDetails={holeDetails}
            numberOfHoles={selectedRoundData?.number_of_holes}
          />
        )}
      </Card>
    </div>
  )
}

export default HoleByHoleView