# Claude Context for ghin-stats Project

## Critical Database Information

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