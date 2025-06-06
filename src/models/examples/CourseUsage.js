/**
 * Course Model Usage Example
 * 
 * Demonstrates how to use the Course model with database data
 * from Supabase queries as defined in DATABASE_STRUCTURE.md
 */

import { supabase } from '../../lib/supabase'
import { Course, createCoursesFromGroupedData } from '../Course'

/**
 * Example 1: Fetch and aggregate course data for a user
 */
export async function getCourseStatisticsForUser(userId) {
  // Fetch rounds with statistics from database
  const { data: rounds, error } = await supabase
    .from('rounds')
    .select(`
      *,
      round_statistics(*)
    `)
    .eq('user_id', userId)
    .order('played_at', { ascending: false })

  if (error) throw error

  // Group rounds by course name
  const courseGroups = {}
  rounds.forEach(round => {
    const courseName = round.course_name
    if (!courseGroups[courseName]) {
      courseGroups[courseName] = []
    }
    courseGroups[courseName].push(round)
  })

  // Create Course models from grouped data
  const courses = createCoursesFromGroupedData(courseGroups)

  // Convert to JSON for component usage
  return courses.map(course => course.toJSON())
}

/**
 * Example 2: Get statistics for a specific course
 */
export async function getSingleCourseStatistics(userId, courseName) {
  // Fetch rounds for specific course
  const { data: rounds, error } = await supabase
    .from('rounds')
    .select(`
      *,
      round_statistics(*)
    `)
    .eq('user_id', userId)
    .eq('course_name', courseName)

  if (error) throw error

  // Create Course model
  const course = new Course(courseName)
  
  // Add all rounds
  rounds.forEach(round => course.addRound(round))

  // Return aggregated statistics
  return course.toJSON()
}

/**
 * Example 3: Using Course model output in a component
 * 
 * The toJSON() method returns an object with these properties:
 * {
 *   // Basic info
 *   name: "Pine Valley Golf Club",
 *   rating: 74.5,
 *   slope: 155,
 *   
 *   // Round counts
 *   totalRounds: 25,
 *   rounds18: 20,
 *   rounds9: 5,
 *   
 *   // Scoring averages
 *   avgScore18: 85.5,
 *   avgScore9: 42.3,
 *   
 *   // Differentials
 *   avgDifferential18: 11.2,
 *   avgDifferential9: 10.8,
 *   
 *   // Best/worst
 *   bestScore18: 78,
 *   worstScore18: 95,
 *   bestScore9: 38,
 *   worstScore9: 48,
 *   
 *   // Par performance (from round_statistics)
 *   avgPar3: 3.4,
 *   avgPar4: 4.6,
 *   avgPar5: 5.2,
 *   
 *   // Scoring distribution (from round_statistics)
 *   birdiePercent: 5.5,
 *   parPercent: 44.4,
 *   bogeyPercent: 38.9,
 *   doubleBogeyPercent: 8.3,
 *   tripleBogeyPercent: 2.8,
 *   doublePlusPercent: 11.1,  // double + triple combined
 *   
 *   // vs Par
 *   par3VsPar: 0.4,
 *   par4VsPar: 0.6,
 *   par5VsPar: 0.2
 * }
 */

/**
 * Example 4: Manual aggregation for testing
 */
export function createTestCourse() {
  const course = new Course("Test Golf Club")
  
  // Add some test rounds
  course.addRound({
    course_rating: 72.5,
    slope_rating: 130,
    number_of_holes: 18,
    adjusted_gross_score: 85,
    differential: 11.5,
    round_statistics: [{
      par3s_average: "3.5",
      par4s_average: "4.8", 
      par5s_average: "5.3",
      birdies_or_better_percent: "5.56",
      pars_percent: "44.44",
      bogeys_percent: "38.89",
      double_bogeys_percent: "8.33",
      triple_bogeys_or_worse_percent: "2.78"
    }]
  })
  
  course.addRound({
    course_rating: 72.5,
    slope_rating: 130,
    number_of_holes: 18,
    adjusted_gross_score: 82,
    differential: 10.2,
    round_statistics: [{
      par3s_average: "3.3",
      par4s_average: "4.6",
      par5s_average: "5.1",
      birdies_or_better_percent: "11.11",
      pars_percent: "50.00",
      bogeys_percent: "33.33",
      double_bogeys_percent: "5.56",
      triple_bogeys_or_worse_percent: "0"
    }]
  })
  
  return course.toJSON()
}