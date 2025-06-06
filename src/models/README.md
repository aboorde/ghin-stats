# Golf Stats Data Models

This directory contains the data models that map to the Supabase database tables.

## Database Tables → Model Mapping

### Core Tables (Direct Mapping)

1. **`rounds` table → `Round.js`**
   - Primary table for golf round data
   - Contains all score and round metadata
   - All field names match database column names exactly

2. **`hole_details` table → `Hole.js`**
   - Contains hole-by-hole scoring details
   - Foreign key: `round_id` (references `rounds.id`)
   - All field names match database column names exactly

3. **`round_statistics` table → (accessed via Round model)**
   - Contains aggregated statistics for each round
   - Foreign key: `round_id` (references `rounds.id`)
   - Data is accessed through `Round.round_statistics` property
   - **Important**: All statistics are stored as strings in the database and must be parsed

### Client-Side Aggregation Models (No Direct Table)

1. **`Course.js`** (Recommended)
   - Simple, focused aggregation model for single course statistics
   - Groups rounds by `course_name` from the `rounds` table
   - Handles string-to-number conversions for `round_statistics` fields
   - Provides essential statistics: averages, best/worst, par performance, scoring distribution
   - Clean API with clear data lineage from database

2. **`CourseAggregator.js`** (Advanced)
   - Comprehensive aggregation class for multiple courses
   - Includes all features of Course.js plus:
     - Multi-course management in single instance
     - Hole-by-hole analysis from `hole_details` table
     - Additional statistics (putts, fairway hits, GIR)
   - Use when you need advanced features or hole details

3. **`Year.js`**
   - Aggregates rounds by year
   - Created by grouping `rounds` table data by year from `played_at`
   - Handles string-to-number conversion for statistics

### Legacy/Compatibility

1. **`Score.js`**
   - **DEPRECATED**: No `scores` table exists
   - Exists only for backward compatibility
   - Extends `Round` model with property aliases

## Key Relationships

```
rounds (1) ─────┬──── (1) round_statistics
                │
                └──── (many) hole_details
```

## Important Notes

1. **String Statistics**: The `round_statistics` table stores all numeric values as `character varying` (strings). Models must parse these values before use.

2. **Foreign Keys**: 
   - `hole_details.round_id` → `rounds.id`
   - `round_statistics.round_id` → `rounds.id`

3. **User Context**: All tables include `user_id` for data access control

4. **Data Flow**:
   - Components fetch data from Supabase with joins
   - Raw data is passed to model constructors
   - Models handle data transformation and provide methods

## Example Usage

```javascript
// Fetch rounds with statistics
const { data } = await supabase
  .from('rounds')
  .select(`
    *,
    round_statistics(*),
    hole_details(*)
  `)
  .eq('user_id', userId)

// Create model instances
const rounds = data.map(roundData => new Round(roundData))

// Aggregate by course
const courseMap = {}
rounds.forEach(round => {
  if (!courseMap[round.course_name]) {
    courseMap[round.course_name] = []
  }
  courseMap[round.course_name].push(round)
})

const courses = Object.entries(courseMap).map(([name, rounds]) => 
  Course.fromRounds(name, rounds)
)
```