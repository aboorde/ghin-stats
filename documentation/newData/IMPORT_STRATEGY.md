# Import Strategy and Duplicate Handling

## Overview

The import process is designed to handle repeated syncs gracefully. When users sync their data from the external API, they will typically receive their entire round history, including rounds that may have already been imported.

## Duplicate Prevention Strategy

### 1. Check Before Insert
Before attempting to insert any round, the import function:
```javascript
// Check if this round already exists for this user
const { data: existingRound } = await supabase
  .from('rounds')
  .select('id')
  .eq('id', round.id)
  .eq('user_id', userId)
  .single()

// Skip if round already exists
if (existingRound) {
  results.skipped++
  continue
}
```

### 2. User-Scoped Checks
The duplicate check includes both:
- `round.id` - The unique identifier from the external API
- `user_id` - The authenticated user's ID

This ensures that:
- Multiple users can import the same round ID (if they played together)
- Each user's data remains isolated
- No accidental cross-user data contamination

### 3. Skip, Don't Error
When a duplicate is found:
- The round is skipped (not an error)
- Processing continues with the next round
- A count of skipped rounds is maintained
- The user sees how many rounds were already imported

## Benefits

1. **Idempotent Operations**: Users can safely run import multiple times
2. **Incremental Updates**: Only new rounds are added to the database
3. **Performance**: Skipping existing rounds is faster than updating
4. **Clear Feedback**: Users see exactly what happened:
   - X new rounds imported
   - Y rounds already existed
   - Z rounds failed

## Import Flow

```
For each round in API response:
  1. Check if round exists for user
  2. If exists → Skip (increment skipped count)
  3. If new → Insert round, holes, and statistics
  4. If error → Log and continue (increment failed count)
```

## Example Messages

### First Import
```
"Import completed: 150 new rounds imported"
```

### Subsequent Import (with new rounds)
```
"Import completed: 5 new rounds imported, 145 already existed"
```

### Sync with No New Data
```
"Import completed: 0 new rounds imported, 150 already existed"
```

## Future Enhancements

While the current strategy works well for most use cases, potential enhancements could include:

1. **Update Detection**: Check if existing rounds have been edited
2. **Selective Updates**: Allow users to force-update specific rounds
3. **Batch Operations**: Use bulk inserts for better performance
4. **Progress Tracking**: Show real-time import progress for large datasets

## Implementation Notes

- The `PGRST116` error code from Supabase means "no rows returned" and is expected for new rounds
- All related data (holes, statistics) are only inserted for new rounds
- The import continues even if individual rounds fail, maximizing successful imports