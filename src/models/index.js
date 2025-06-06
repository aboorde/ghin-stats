/**
 * Models Index
 * 
 * Central export point for all data models.
 * These models represent and transform data from the database
 * as defined in DATABASE_STRUCTURE.md
 * 
 * @module models
 */

// Core data models
export { Course, createCoursesFromGroupedData, createCourseFromRounds } from './Course'
export { CourseAggregator, createCourseAggregator } from './CourseAggregator'
export { Hole } from './Hole'
export { Round } from './Round'
export { Score } from './Score'
export { Year } from './Year'