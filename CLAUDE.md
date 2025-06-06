# Claude Context for ghin-stats Project
## Critical Rules - DO NOT VIOLATE
- Never try to make up data. Use the data from supabase. Use the data from supabase. Always and only use the data from supabase

- **NEVER create mock data or simplified components** unless explicitly told to do so

- **NEVER replace existing complex components with simplified versions** - always fix the actual problem

- **ALWAYS find and fix the root cause** of issues instead of creating workarounds

- When debugging issues, focus on fixing the existing implementation, not replacing it

- When something doesn't work, debug and fix it - don't start over with a simple version

**MANDATORY BEHAVIOR:**
1. **Acknowledge limitations**: Always state explicitly when files are too large to read completely. Never pretend to have read the entire file if you couldn't.
2. **Fix ONLY what is explicitly requested** - no additional "improvements" or optimizations without permission
3. **Never assume existing code needs improvement** - production code exists as-is for reasons that may not be immediately apparent
4. **Always explain WHY before suggesting changes** - provide clear reasoning for any proposed improvements

**ALLOWED:** 
- Suggesting improvements IF you explain the specific benefits and risks clearly
- Asking "I notice X, would it be beneficial to fix this because Y?"

1. **Evidence-based responses only**: Never claim arelationship without direct evidence from the code.
 
2. **Clear source tracking**: Always cite line numbers and file paths for any statements about code structure.
 
3. **Query limitations**: State what you were not able to check, and what searches might still be needed for complete confidence.
 
4. **Confidence levels**: Use explicit confidence indicators:
   - "Confirmed" (when directly observed in code)
   - "Likely" (when inferred from strong evidence)
   - "Possible" (when suggested by partial evidence)
   - "Unknown" (when no evidence was found)

# Pine Valley Golf Club Course Information

| Tee | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | Out | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | In | Tot |
|-----|---|---|---|---|---|---|---|---|---|-----|----|----|----|----|----|----|----|----|----|----|-----|
| **Yds** | 331 | 487 | 335 | 129 | 379 | 376 | 142 | 456 | 291 | 2926 | 447 | 356 | 191 | 358 | 466 | 388 | 330 | 168 | 367 | 3071 | 5997 |
| **Par** | 4 | 5 | 4 | 3 | 4 | 4 | 3 | 5 | 4 | 36 | 5 | 4 | 3 | 4 | 5 | 4 | 4 | 3 | 4 | 36 | 72 |
| **Hcp** | 11 | 17 | 3 | 13 | 1 | 7 | 15 | 5 | 9 | | 18 | 10 | 8 | 4 | 16 | 2 | 12 | 14 | 6 | | |


# Critical Database Information

### IMPORTANT: Database table confusion!
- The NEW database uses `rounds` table for golf rounds data  
- The OLD components still reference `scores` table (which doesn't exist)
- Use `round_statistics` table for statistics
- Use `round_id` as foreign key in related tables
- Use `hole_details` table for individual hole data

### Common Import Issues
If imports are not working but no errors show:
1. Check Supabase authentication - queries may hang if auth is invalid
2. Use `.maybeSingle()` instead of `.single()` to avoid errors when no rows found
3. Verify all required fields are mapped correctly
4. Ensure timestamps are included (created_at, updated_at)
5. Parse numeric values before inserting
6. Add detailed logging to trace where queries hang

## Linting and Type Checking
When code changes are complete, run:
- `npm run lint` - Check for code style issues
- `npm run typecheck` - Check for TypeScript errors (if applicable)

## Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode

## Key Project Patterns
1. All database operations use Supabase client from `src/lib/supabase.js`
2. Row Level Security (RLS) is enabled - all queries are scoped to user_id
3. Use existing atomic components from `src/components/atoms/` and molecules
4. Follow the pink/slate color scheme for consistency
5. Import data preserves all fields from external API

## Recent Issues Resolved
- Fixed import service to use correct table names (rounds, round_statistics)
- Added empty state for users with no rounds
- Cleaned up unused imports in Settings component
- IMPORTANT: The older codebase components still use 'scores' table, but new imports use 'rounds' table