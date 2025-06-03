// Data normalization helpers

/**
 * Normalize course names to handle variations
 * @param {string} courseName - The original course name
 * @returns {string} - The normalized course name
 */
export const normalizeCourseName = (courseName) => {
  // Normalize Pine Valley variations
  if (courseName && (
    courseName.includes('Pine Valley') || 
    courseName.toLowerCase().includes('pine valley')
  )) {
    return 'Pine Valley CC';
  }
  
  // Add other course normalizations here as needed
  
  return courseName || 'Unknown Course';
};

/**
 * Normalize course data in a dataset
 * @param {Array} data - Array of objects containing course_name field
 * @returns {Array} - Array with normalized course names
 */
export const normalizeCourseData = (data) => {
  if (!Array.isArray(data)) return data;
  
  return data.map(item => ({
    ...item,
    course_name: normalizeCourseName(item.course_name)
  }));
};