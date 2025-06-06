# Import Data Format

## Overview
The golf data import system is designed to handle simplified data structures from external APIs that may not include all the detailed information available in the full database schema.

## Simplified Data Structure
The import service can handle data with the following minimal structure:

```json
{
  "scores": [
    {
      "id": 1070919059,
      "golfer_id": 11018250,
      "played_at": "2025-05-23",
      "course_name": "Devils Ridge GC",
      "adjusted_gross_score": 88,
      "differential": 18.2,
      "hole_details": [],        // Can be empty array
      "statistics": null,        // Can be null
      // Other optional fields...
    }
  ]
}
```

## Required Fields
The following fields are required for a successful import:
- `id` - Unique identifier for the round
- `golfer_id` - Golfer's ID
- `played_at` - Date the round was played
- `adjusted_gross_score` - Total score for the round
- `course_name` - Name of the golf course

## Optional Fields
All other fields are optional and will be handled gracefully:
- `hole_details` - Array of hole-by-hole scores (can be empty)
- `statistics` - Round statistics object (can be null)
- `front9_adjusted` / `back9_adjusted` - 9-hole scores
- `course_rating` / `slope_rating` - Course difficulty metrics
- `tee_name` - Tee box played from
- `differential` - Handicap differential
- And many more...

## Data Handling

### Missing Hole Details
When `hole_details` is an empty array or missing:
- The round will still be imported successfully
- Hole-by-hole views will show "No hole details available"
- Round summaries and statistics based on total scores will still work

### Missing Statistics
When `statistics` is null or missing:
- The round will still be imported successfully
- Statistical views will calculate basic stats from available data
- Advanced statistics requiring detailed data will show as unavailable

### Default Values
The import service applies sensible defaults:
- Boolean fields default to `false`
- Numeric fields default to `0` or `null` where appropriate
- Arrays default to empty `[]`
- Objects default to empty `{}`

## UI Behavior

### Components Handle Missing Data
All UI components are designed to handle missing data gracefully:

1. **RoundByRoundView**
   - Shows rounds with available data
   - Calculates statistics from total scores when detailed stats are missing

2. **HoleByHoleView**
   - Shows "No hole details available" when hole data is missing
   - Still displays round summary information

3. **DetailedStats**
   - Shows "N/A" or appropriate messages for missing statistics
   - Calculates what it can from available data

4. **CourseByCourseSummary**
   - Groups rounds by course using available course name data
   - Shows basic scoring statistics even without detailed hole data

## Import Process

### Batch Processing
The import service uses optimized batch processing:
1. Rounds are imported first (up to 50 at a time)
2. Hole details are imported if available (up to 900 at a time)
3. Statistics are imported if available (up to 50 at a time)

### Error Handling
- If rounds fail to import, the process stops
- If hole details or statistics fail, the rounds are still preserved
- Duplicate data is handled gracefully with upsert operations

## Best Practices

### When Importing Data
1. Always ensure required fields are present
2. Don't worry about missing optional fields
3. The system will handle partial data gracefully

### For Developers
1. Always check for data existence before using it
2. Provide sensible defaults in models
3. Show appropriate empty states in UI components
4. Use optional chaining (`?.`) when accessing nested data

## Example Import Call

```javascript
import { importGolfRoundsBatched } from './services/importServiceBatchedFixed'

// Data can have minimal structure
const minimalData = {
  scores: [
    {
      id: 123,
      golfer_id: 456,
      played_at: "2024-01-01",
      adjusted_gross_score: 85,
      course_name: "Sample Golf Club",
      // No hole_details, no statistics - that's OK!
    }
  ]
}

const results = await importGolfRoundsBatched(minimalData.scores, userId)
console.log(`Imported ${results.successful} rounds successfully`)
```

## Database Considerations
The database schema allows null values for most fields, supporting this flexible import approach. Only a few fields have NOT NULL constraints, and these align with our required fields list above.