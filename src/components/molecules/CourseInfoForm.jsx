import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../atoms'

/**
 * CourseInfoForm - Form for entering basic round information
 * Mobile-optimized with course autocomplete and tee selection
 * 
 * @param {Object} data - Current form data
 * @param {function} onChange - Callback when form data changes
 * @param {function} onNext - Callback to proceed to next step
 */
const CourseInfoForm = ({ data = {}, onChange, onNext }) => {
  const [recentCourses, setRecentCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState(data.course_name || '')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Common tee options
  const teeOptions = [
    { value: 'Black', label: 'Black', color: 'bg-gray-900' },
    { value: 'Blue', label: 'Blue', color: 'bg-blue-600' },
    { value: 'White', label: 'White', color: 'bg-gray-100' },
    { value: 'Gold', label: 'Gold', color: 'bg-yellow-500' },
    { value: 'Red', label: 'Red', color: 'bg-red-600' },
    { value: 'Green', label: 'Green', color: 'bg-green-600' }
  ]

  // Fetch recent courses for suggestions
  useEffect(() => {
    const fetchRecentCourses = async () => {
      if (!supabase.auth.getUser()) return
      
      const { data: rounds } = await supabase
        .from('rounds')
        .select('course_name, course_rating, slope_rating, tee_name')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .order('played_at', { ascending: false })
        .limit(50)

      if (rounds) {
        // Get unique courses with their most recent ratings
        const courseMap = new Map()
        rounds.forEach(round => {
          if (!courseMap.has(round.course_name)) {
            courseMap.set(round.course_name, {
              name: round.course_name,
              rating: round.course_rating,
              slope: round.slope_rating,
              tee: round.tee_name
            })
          }
        })
        setRecentCourses(Array.from(courseMap.values()))
      }
    }

    fetchRecentCourses()
  }, [])

  const filteredCourses = recentCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCourseSelect = (course) => {
    setSearchTerm(course.name)
    onChange({
      ...data,
      course_name: course.name,
      course_rating: course.rating,
      slope_rating: course.slope,
      tee_name: course.tee || data.tee_name
    })
    setShowSuggestions(false)
  }

  const handleInputChange = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  const isValid = () => {
    return data.course_name && 
           data.played_at && 
           data.course_rating && 
           data.slope_rating &&
           data.tee_name
  }

  return (
    <div className="space-y-6">
      {/* Course Name with Autocomplete */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Course Name *
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            handleInputChange('course_name', e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                     focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20
                     transition-all duration-200"
          placeholder="Enter course name"
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && filteredCourses.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {filteredCourses.map((course, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleCourseSelect(course)}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors
                          border-b border-gray-700 last:border-0"
              >
                <div className="font-medium text-white">{course.name}</div>
                <div className="text-sm text-gray-400">
                  {course.tee} Tees • Rating: {course.rating} / Slope: {course.slope}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date Played */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Date Played *
        </label>
        <input
          type="date"
          value={data.played_at || ''}
          onChange={(e) => handleInputChange('played_at', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                     focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20
                     transition-all duration-200"
        />
      </div>

      {/* Tee Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tees Played *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {teeOptions.map((tee) => (
            <button
              key={tee.value}
              type="button"
              onClick={() => handleInputChange('tee_name', tee.value)}
              className={`
                py-3 px-4 rounded-lg font-medium transition-all duration-200
                ${data.tee_name === tee.value
                  ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900 transform scale-105'
                  : 'hover:scale-105'
                }
                focus:outline-none focus:ring-2 focus:ring-pink-500
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <div className={`w-4 h-4 rounded-full ${tee.color} border border-gray-600`}></div>
                <span className={data.tee_name === tee.value ? 'text-white' : 'text-gray-400'}>
                  {tee.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Course Rating and Slope */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Course Rating *
          </label>
          <input
            type="number"
            step="0.1"
            value={data.course_rating || ''}
            onChange={(e) => handleInputChange('course_rating', parseFloat(e.target.value))}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                       focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20
                       transition-all duration-200"
            placeholder="72.5"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Slope Rating *
          </label>
          <input
            type="number"
            value={data.slope_rating || ''}
            onChange={(e) => handleInputChange('slope_rating', parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white
                       focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20
                       transition-all duration-200"
            placeholder="137"
          />
        </div>
      </div>

      {/* Number of Holes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Holes
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleInputChange('number_of_holes', 18)}
            className={`
              py-3 rounded-lg font-medium transition-all duration-200
              ${data.number_of_holes === 18
                ? 'bg-pink-600 text-white ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
              focus:outline-none focus:ring-2 focus:ring-pink-500
            `}
          >
            18 Holes
          </button>
          <button
            type="button"
            onClick={() => handleInputChange('number_of_holes', 9)}
            className={`
              py-3 rounded-lg font-medium transition-all duration-200
              ${data.number_of_holes === 9
                ? 'bg-pink-600 text-white ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
              focus:outline-none focus:ring-2 focus:ring-pink-500
            `}
          >
            9 Holes
          </button>
        </div>
      </div>

      {/* Continue Button */}
      <Button
        onClick={onNext}
        disabled={!isValid()}
        className="w-full"
        variant="primary"
        size="lg"
      >
        Continue to Scorecard
      </Button>

      {/* Required Fields Note */}
      <p className="text-xs text-gray-500 text-center">
        * Required fields
      </p>
    </div>
  )
}

export default CourseInfoForm