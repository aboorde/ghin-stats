import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CourseInfoForm } from './molecules'
import { ScorecardEntry, RoundReview } from './organisms'
import { fetchRoundForEdit, updateRound, validateRoundData } from '../services/roundEntryService'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'
import Loading from './ui/Loading'
import { Button } from './atoms'

/**
 * EditRound - Edit existing round flow
 * Reuses components from AddRound but pre-populates with existing data
 * 
 * Steps:
 * 1. Course Selection - Edit basic round information
 * 2. Scorecard Entry - Edit hole-by-hole scoring
 * 3. Review & Submit - Summary and confirmation
 */
const EditRound = () => {
  const { roundId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [courseData, setCourseData] = useState({})
  const [holesData, setHolesData] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Load existing round data
  useEffect(() => {
    loadRoundData()
  }, [roundId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadRoundData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchRoundForEdit(roundId)
      
      if (result.success) {
        const { round, holeDetails } = result.data
        
        // Set course data from round
        // Format the date for the date input (YYYY-MM-DD)
        const playedAtDate = round.played_at ? round.played_at.split('T')[0] : '';
        
        setCourseData({
          course_name: round.course_name,
          facility_name: round.facility_name,
          course_rating: round.course_rating,
          slope_rating: round.slope_rating,
          tee_name: round.tee_name,
          played_at: playedAtDate,
          number_of_holes: round.number_of_holes
        })
        
        // Set holes data
        setHolesData(holeDetails.map(hole => ({
          hole_number: hole.hole_number,
          par: hole.par,
          stroke_allocation: hole.stroke_allocation,
          adjusted_gross_score: hole.adjusted_gross_score,
          putts: hole.putts,
          fairway_hit: hole.fairway_hit,
          gir_flag: hole.gir_flag,
          drive_accuracy: hole.drive_accuracy
        })))
      } else {
        setError(result.error || 'Failed to load round')
      }
    } catch (err) {
      console.error('Error loading round:', err)
      setError('Failed to load round data')
    } finally {
      setLoading(false)
    }
  }

  const handleCourseSubmit = () => {
    setCurrentStep(2)
  }

  const handleScorecardComplete = () => {
    setCurrentStep(3)
  }

  const handleSubmit = async (data) => {
    setError(null)
    
    // Validate data
    const validation = validateRoundData(data.courseData, data.holesData)
    if (!validation.isValid) {
      setError(validation.errors.join(', '))
      return
    }

    // Update round
    const result = await updateRound(roundId, data)
    
    if (result.success) {
      setSuccess(true)
      // Show success message briefly then redirect
      setTimeout(() => {
        navigate('/manage-rounds')
      }, 2000)
    } else {
      setError(result.error)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      navigate('/manage-rounds')
    }
  }

  // Loading state
  if (loading) {
    return <Loading />
  }

  // Error loading round
  if (!courseData.course_name && !loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Round Not Found</h2>
          <p className="text-gray-400 mb-4">Unable to load the requested round.</p>
          <Button
            onClick={() => navigate('/manage-rounds')}
            variant="primary"
          >
            Back to Manage Rounds
          </Button>
        </Card>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Round Updated!</h2>
          <p className="text-gray-400">Your changes have been saved successfully.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className={currentStep === 2 ? "" : "min-h-screen bg-gray-900"}>
      {/* Header for step 1 only */}
      {currentStep === 1 && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center mb-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-white transition-colors mr-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <PageHeader 
              title="Edit Round" 
              subtitle={`${courseData.course_name} - ${courseData.played_at}`}
            />
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`h-2 w-16 rounded-full transition-colors ${
              currentStep >= 1 ? 'bg-pink-600' : 'bg-gray-700'
            }`} />
            <div className={`h-2 w-16 rounded-full transition-colors ${
              currentStep >= 2 ? 'bg-pink-600' : 'bg-gray-700'
            }`} />
            <div className={`h-2 w-16 rounded-full transition-colors ${
              currentStep >= 3 ? 'bg-pink-600' : 'bg-gray-700'
            }`} />
          </div>
          
          <div className="text-center text-sm text-gray-400">
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Course Info' :
              currentStep === 2 ? 'Scorecard' :
              'Review & Submit'
            }
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Step content */}
      {currentStep === 1 && (
        <div className="p-4 max-w-lg mx-auto">
          <Card className="p-6">
            <CourseInfoForm
              data={courseData}
              onChange={setCourseData}
              onNext={handleCourseSubmit}
            />
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <ScorecardEntry
          courseData={courseData}
          holesData={holesData}
          onChange={setHolesData}
          onComplete={handleScorecardComplete}
          onBack={handleBack}
          isEdit={true}
        />
      )}

      {currentStep === 3 && (
        <RoundReview
          courseData={courseData}
          holesData={holesData}
          onSubmit={handleSubmit}
          onEdit={handleBack}
          isEdit={true}
        />
      )}
    </div>
  )
}

export default EditRound