import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CourseInfoForm } from './molecules'
import { ScorecardEntry, RoundReview } from './organisms'
import { saveRound, validateRoundData } from '../services/roundEntryService'
import PageHeader from './ui/PageHeader'
import Card from './ui/Card'
import { Button } from './atoms'

/**
 * AddRound - Complete round entry flow
 * Mobile-optimized multi-step form for entering golf rounds
 * 
 * Steps:
 * 1. Course Selection - Basic round information
 * 2. Scorecard Entry - Hole-by-hole scoring
 * 3. Review & Submit - Summary and confirmation
 */
const AddRound = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [courseData, setCourseData] = useState({
    number_of_holes: 18,
    played_at: new Date().toISOString().split('T')[0]
  })
  const [holesData, setHolesData] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

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

    // Save round
    const result = await saveRound(data)
    
    if (result.success) {
      setSuccess(true)
      // Show success message briefly then redirect
      setTimeout(() => {
        navigate('/rounds')
      }, 2000)
    } else {
      setError(result.error)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      navigate(-1)
    }
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
          <h2 className="text-2xl font-bold text-white mb-2">Round Saved!</h2>
          <p className="text-gray-400">Your round has been successfully recorded.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
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
              title="Add New Round" 
              subtitle="Enter your scorecard details"
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
      <div className={currentStep === 1 ? 'p-4 max-w-lg mx-auto' : ''}>
        {currentStep === 1 && (
          <Card className="p-6">
            <CourseInfoForm
              data={courseData}
              onChange={setCourseData}
              onNext={handleCourseSubmit}
            />
          </Card>
        )}

        {currentStep === 2 && (
          <ScorecardEntry
            courseData={courseData}
            holesData={holesData}
            onChange={setHolesData}
            onComplete={handleScorecardComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <RoundReview
            courseData={courseData}
            holesData={holesData}
            onSubmit={handleSubmit}
            onEdit={handleBack}
          />
        )}
      </div>
    </div>
  )
}

export default AddRound