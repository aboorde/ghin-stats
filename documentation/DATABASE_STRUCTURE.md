# Database Structure Documentation

## IMPORTANT: Current Production Tables

The actual database uses the following table names and structure:

### 1. `rounds` table
Primary table for golf rounds. Key fields include:
- `id` - Unique identifier from external API
- `user_id` - Foreign key to users table
- `golfer_id` - External golfer ID
- `played_at` - Date the round was played
- `adjusted_gross_score` - Final adjusted score
- `differential` - Handicap differential
- `course_name` - Name of the golf course
- `tee_name` - Which tees were played
- `course_rating` - Course difficulty rating
- `slope_rating` - Course slope rating
- `number_of_holes` - 9 or 18 holes
- And more...

### 2. `hole_details` table
Stores individual hole scores. Key fields:
- `id` - Unique identifier
- `round_id` - Foreign key to rounds table
- `user_id` - Foreign key to users table
- `hole_number` - Hole number (1-18)
- `par` - Par for the hole
- `adjusted_gross_score` - Score on this hole
- `raw_score` - Original score before adjustments
- `putts` - Number of putts
- `fairway_hit` - Whether fairway was hit
- `gir_flag` - Green in regulation flag

### 3. `round_statistics` table
Stores round statistics. Key fields:
- `round_id` - Foreign key to rounds table
- `user_id` - Foreign key to users table
- `putts_total` - Total putts for the round
- Various percentage fields for putting, scoring, accuracy, etc.

### 4. `users` table
User profiles and settings

### 5. `adjustments` table
Stores PCC and other scoring adjustments

## Common Mistakes to Avoid

1. **DO NOT** confuse with older codebase that uses `scores` table - the new structure uses `rounds`
2. **DO NOT** confuse with older codebase that uses `statistics` table - the new structure uses `round_statistics`
3. Always use `round_id` as the foreign key for related tables
4. **DO NOT** assume table structure from older code - always check actual database

## Import Service Considerations

When importing data from external APIs:
- Map external fields to the existing database structure
- Use `rounds` table as the primary table
- Use `round_id` as the foreign key for related tables
- Include `created_at` and `updated_at` timestamps
- Parse numeric fields (parseInt/parseFloat) before inserting
- Handle null values appropriately

## Debugging Import Issues

If imports are not working:
1. Check console for errors - Supabase errors are descriptive
2. Verify table names match actual database
3. Ensure all required fields are included
4. Check foreign key relationships
5. Verify Row Level Security (RLS) policies allow inserts

## Example Import Code

```javascript
// Correct table names
const { data, error } = await supabase
  .from('rounds')
  .insert({
    id: round.id,
    user_id: userId,
    // ... other fields
  })

// Related tables use round_id
const { error: statsError } = await supabase
  .from('round_statistics')
  .insert({
    round_id: round.id,
    user_id: userId,
    // ... other fields
  })
```