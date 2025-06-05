# API Patterns and Supabase Queries

## Overview
This document outlines all the Supabase query patterns used throughout the application, providing a reference for consistent data fetching.

## Authentication
The application uses Supabase's anonymous authentication (public anon key). No user authentication is implemented as all data belongs to a single golfer (ID: 11384483).

## Common Query Patterns

### 1. Basic Score Fetching
```javascript
// Get all scores
const { data, error } = await supabase
  .from('scores')
  .select('*')
  .eq('number_of_holes', 18)
  .order('played_at', { ascending: false })

// Get scores with statistics
const { data, error } = await supabase
  .from('scores')
  .select(`
    *,
    statistics(*)
  `)
  .eq('number_of_holes', 18)
```

### 2. Filtering Patterns

#### Date Range Filter
```javascript
let query = supabase
  .from('scores')
  .select('*')
  .eq('number_of_holes', 18)

if (startDate) {
  query = query.gte('played_at', startDate)
}
if (endDate) {
  query = query.lte('played_at', endDate)
}
```

#### Score Range Filter
```javascript
if (minScore) {
  query = query.gte('adjusted_gross_score', minScore)
}
if (maxScore) {
  query = query.lte('adjusted_gross_score', maxScore)
}
```

### 3. Hole Details Queries

#### Get Hole Details for a Round
```javascript
const { data, error } = await supabase
  .from('hole_details')
  .select('*')
  .eq('score_id', scoreId)
  .order('hole_number')
```

#### Get Hole Averages for a Course
```javascript
// First get score IDs for the course
const { data: scoreData } = await supabase
  .from('scores')
  .select('id')
  .eq('course_name', courseName)
  .eq('number_of_holes', 18)

const scoreIds = scoreData.map(s => s.id)

// Then get hole details
const { data: holeData } = await supabase
  .from('hole_details')
  .select('hole_number, par, adjusted_gross_score')
  .in('score_id', scoreIds)
```

### 4. Aggregation Patterns (Client-Side)

Since Supabase doesn't support complex aggregations in queries, we perform them client-side:

#### Calculate Course Statistics
```javascript
const courseStats = {}
data?.forEach(round => {
  const course = round.course_name
  if (!courseStats[course]) {
    courseStats[course] = {
      name: course,
      rounds: 0,
      totalScore: 0,
      scores: [],
      // ... other fields
    }
  }
  
  courseStats[course].rounds++
  courseStats[course].totalScore += round.adjusted_gross_score
  courseStats[course].scores.push(round.adjusted_gross_score)
})

// Convert to array with averages
const courseArray = Object.values(courseStats).map(course => ({
  ...course,
  avgScore: course.totalScore / course.rounds
}))
```

#### Calculate Yearly Statistics
```javascript
const yearStats = {}
data?.forEach(round => {
  const year = new Date(round.played_at).getFullYear()
  if (!yearStats[year]) {
    yearStats[year] = {
      year,
      rounds: 0,
      scores: [],
      monthlyScores: {},
      // ... other fields
    }
  }
  
  yearStats[year].rounds++
  yearStats[year].scores.push(round.adjusted_gross_score)
})
```

### 5. Relationship Queries

#### Scores with Statistics
```javascript
const { data, error } = await supabase
  .from('scores')
  .select(`
    id,
    played_at,
    adjusted_gross_score,
    differential,
    course_name,
    statistics (
      par3s_average,
      par4s_average,
      par5s_average,
      pars_percent,
      bogeys_percent,
      double_bogeys_percent,
      triple_bogeys_or_worse_percent
    )
  `)
  .eq('number_of_holes', 18)
```

## Error Handling Pattern

All queries follow this error handling pattern:

```javascript
try {
  setLoading(true)
  
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
  
  if (error) throw error
  
  setData(data)
} catch (err) {
  setError(err.message)
  console.error('Error fetching data:', err)
} finally {
  setLoading(false)
}
```

## Performance Considerations

### 1. Query Optimization
- Always filter by `number_of_holes = 18` to exclude partial rounds
- Use `select()` to specify only needed columns
- Order results at the database level when possible

### 2. Batching Related Queries
When fetching hole details for multiple rounds:
```javascript
// Inefficient: N queries
for (const score of scores) {
  const { data } = await supabase
    .from('hole_details')
    .select('*')
    .eq('score_id', score.id)
}

// Efficient: 1 query
const scoreIds = scores.map(s => s.id)
const { data } = await supabase
  .from('hole_details')
  .select('*')
  .in('score_id', scoreIds)
```

### 3. Caching Strategies
Currently not implemented, but could add:
- React Query for automatic caching
- Local storage for course/hole data
- Memoization for expensive calculations

## Common Gotchas

1. **Array Relationships**: Supabase returns arrays for one-to-many relationships
   ```javascript
   // statistics is an array even though it's 1:1
   round.statistics[0].par3s_average
   ```

2. **Date Formatting**: Dates come as ISO strings
   ```javascript
   const date = new Date(round.played_at)
   ```

3. **Null Handling**: Some statistics fields can be null
   ```javascript
   const parPercent = stats.pars_percent || 0
   ```

4. **Type Coercion**: Numeric fields may need parsing
   ```javascript
   const score = parseInt(round.adjusted_gross_score)
   ```

## Adding New Queries

When adding new data fetching:

1. Check if similar query exists in `golfDataService.js`
2. Follow the error handling pattern
3. Include the 18-hole filter
4. Consider performance impact
5. Update this documentation

## Migration Considerations

If moving away from direct Supabase queries:

1. All queries are centralized in components and service layer
2. No complex stored procedures or views
3. Authentication is minimal (anon key only)
4. Could easily adapt to REST API or GraphQL