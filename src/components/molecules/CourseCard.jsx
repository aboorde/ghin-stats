import React from 'react'
import SelectableButton from '../atoms/SelectableButton'

/**
 * CourseCard - Individual course item in the course list
 * 
 * @param {object} course - Course data object
 * @param {boolean} isSelected - Whether this course is selected
 * @param {function} onClick - Click handler
 * @param {boolean} showDetails - Whether to show detailed stats
 */
const CourseCard = ({ 
  course, 
  isSelected, 
  onClick,
  showDetails = true
}) => {
  return (
    <SelectableButton isSelected={isSelected} onClick={onClick}>
      <div className="font-medium text-gray-200">{course.name}</div>
      <div className="text-sm text-gray-400">
        {course.totalRounds} rounds total
      </div>
      {showDetails && (
        <>
          <div className="text-xs text-gray-500">
            18-hole: {course.rounds18} ({course.avgScore18 ? course.avgScore18.toFixed(1) : '-'})
            {course.rounds9 > 0 && ` • 9-hole: ${course.rounds9} (${course.avgScore9.toFixed(1)})`}
          </div>
          <div className="text-xs text-gray-500">
            Rating: {course.rating} / Slope: {course.slope}
          </div>
        </>
      )}
    </SelectableButton>
  )
}

export default CourseCard