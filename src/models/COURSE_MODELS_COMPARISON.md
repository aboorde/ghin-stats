# Course Models Comparison

This project includes two course aggregation models. Here's when to use each:

## Course.js

**Purpose**: Simple, focused aggregation of rounds for a single course

**Best for**:
- CourseByCourseSummary component
- Basic course statistics display
- When you need scoring averages and distributions
- Clean, straightforward API

**Key Features**:
- Lightweight and focused
- Clear data lineage from database
- Handles string-to-number parsing
- Provides essential statistics

**Example Usage**:
```javascript
const course = new Course("Pine Valley")
rounds.forEach(round => course.addRound(round))
const stats = course.toJSON()
```

## CourseAggregator.js

**Purpose**: Comprehensive multi-course aggregation with advanced features

**Best for**:
- Managing multiple courses at once
- Hole-by-hole analysis
- Advanced statistics (putts, fairway hits, GIR)
- When you need all available data

**Key Features**:
- Handles multiple courses in one instance
- Includes hole details processing
- Additional statistics tracking
- More comprehensive data structure

**Example Usage**:
```javascript
const aggregator = new CourseAggregator()
aggregator.addRounds(allRounds)
aggregator.addHoleDetails(courseName, holeDetails)
const stats = aggregator.getCourseStatistics(courseName)
```

## Recommendation

For most use cases, **Course.js** is recommended because:

1. **Simpler API** - Easier to understand and use
2. **Focused scope** - Does one thing well
3. **Cleaner data flow** - Clear mapping from database to output
4. **Less overhead** - Only tracks essential statistics

Use **CourseAggregator.js** when you need:
- Multi-course management in a single instance
- Hole-by-hole performance data
- Advanced statistics beyond the basics

## Data Source Reference

Both models use the same database tables:

### From `rounds` table:
- course_name, course_rating, slope_rating
- adjusted_gross_score, differential
- number_of_holes, played_at

### From `round_statistics` table:
- par3s_average, par4s_average, par5s_average
- Scoring percentages (birdies, pars, bogeys, etc.)

### From `hole_details` table (CourseAggregator only):
- hole_number, par, adjusted_gross_score
- putts, fairway_hit, gir_flag