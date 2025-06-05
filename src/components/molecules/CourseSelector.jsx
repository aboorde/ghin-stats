import React from 'react'
import ScrollableList from '../atoms/ScrollableList'
import CourseCard from './CourseCard'

/**
 * CourseSelector - Handles course selection for both mobile and desktop
 * 
 * @param {array} courses - Array of course objects
 * @param {string} selectedCourse - Currently selected course name
 * @param {function} onCourseSelect - Course selection handler
 * @param {boolean} showMobile - Show mobile selector
 * @param {boolean} showDesktop - Show desktop selector
 */
const CourseSelector = ({ 
  courses, 
  selectedCourse, 
  onCourseSelect,
  showMobile = true,
  showDesktop = true
}) => {
  return (
    <>
      {/* Mobile Course Selector */}
      {showMobile && (
        <div className="block lg:hidden mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourse || ''}
            onChange={(e) => onCourseSelect(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
          >
            {courses.map(course => (
              <option key={course.name} value={course.name}>
                {course.name} ({course.totalRounds} rounds)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Desktop Course List */}
      {showDesktop && (
        <div className="hidden lg:block">
          <h3 className="font-semibold mb-3 text-gray-300">All Courses</h3>
          <ScrollableList>
            <div className="space-y-2">
              {courses.map(course => (
                <CourseCard
                  key={course.name}
                  course={course}
                  isSelected={selectedCourse === course.name}
                  onClick={() => onCourseSelect(course.name)}
                />
              ))}
            </div>
          </ScrollableList>
        </div>
      )}
    </>
  )
}

export default CourseSelector