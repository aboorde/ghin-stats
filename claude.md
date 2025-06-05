# Claude Instructions and Lessons Learned

## Critical Rules - DO NOT VIOLATE
- Never try to make up data. Use the data from supabase. Use the data from supabase. Always and only use the data from supabase
- **NEVER create mock data or simplified components** unless explicitly told to do so
- **NEVER replace existing complex components with simplified versions** - always fix the actual problem
- **ALWAYS find and fix the root cause** of issues instead of creating workarounds
- When debugging issues, focus on fixing the existing implementation, not replacing it
- When something doesn't work, debug and fix it - don't start over with a simple version

## TypeScript and Linting
- ALWAYS add explicit types to all function parameters, variables, and return types
- Fix all linter and TypeScript errors immediately - don't leave them for the user to fix
- When making changes to multiple files, check each one for type errors

## Mandatory Behavior
1. **Acknowledge limitations**: Always state explicitly when files are too large to read completely. Never pretend to have read the entire file if you couldn't.
2. **Fix ONLY what is explicitly requested** - no additional "improvements" or optimizations without permission
3. **Never assume existing code needs improvement** - production code exists as-is for reasons that may not be immediately apparent
4. **Always explain WHY before suggesting changes** - provide clear reasoning for any proposed improvements

## Evidence-Based Responses
1. **Evidence-based responses only**: Never claim a relationship without direct evidence from the code.
2. **Clear source tracking**: Always cite line numbers and file paths for any statements about code structure.
3. **Query limitations**: State what you were not able to check, and what searches might still be needed for complete confidence.
4. **Confidence levels**: Use explicit confidence indicators:
   - "Confirmed" (when directly observed in code)
   - "Likely" (when inferred from strong evidence)
   - "Possible" (when suggested by partial evidence)
   - "Unknown" (when no evidence was found)

## Common Pitfalls and Lessons Learned

### 1. Component Design Mistakes
- **DON'T**: Create mega-components with 500+ lines. Split into smaller, focused components
- **DON'T**: Mix presentation and data logic. Use container/presentational pattern
- **DON'T**: Hardcode responsive breakpoints. Use Tailwind's responsive utilities
- **LEARNED**: Mobile-first means designing for mobile FIRST, not as an afterthought

### 2. Data Fetching Anti-Patterns
- **DON'T**: Fetch all data then filter client-side. Use Supabase queries efficiently
- **DON'T**: Make multiple sequential API calls. Use Supabase's relational queries
- **DON'T**: Forget to handle loading/error states. Users need feedback
- **LEARNED**: Empty data arrays crash `.map()` - always use optional chaining or defaults

### 3. State Management Traps
- **DON'T**: Store derived data in state. Calculate it from source data
- **DON'T**: Mutate state directly. Always create new objects/arrays
- **DON'T**: Use indexes as keys in dynamic lists. Use stable IDs
- **LEARNED**: React batches state updates - don't rely on immediate state changes

### 4. Performance Killers
- **DON'T**: Render 1000+ DOM nodes. Implement pagination or virtualization
- **DON'T**: Use inline function definitions in render. They create new references
- **DON'T**: Import entire libraries. Use tree-shaking: `import { specific } from 'library'`
- **LEARNED**: Recharts ResponsiveContainer needs explicit height, not percentages

### 5. Styling Gotchas
- **DON'T**: Mix CSS approaches. Stick to Tailwind utilities
- **DON'T**: Use fixed heights/widths. Use responsive units
- **DON'T**: Forget hover states need touch alternatives on mobile
- **LEARNED**: `overflow-x-auto` needs `min-width` on child table for mobile scroll

### 6. Chart-Specific Issues
- **DON'T**: Use fixed domains without checking data ranges
- **DON'T**: Forget to handle empty datasets in charts
- **DON'T**: Use too many data points on mobile (performance)
- **LEARNED**: Recharts tooltips need explicit styling for dark themes

### 7. Mobile Responsiveness Failures
- **DON'T**: Test only on desktop with DevTools. Use real devices
- **DON'T**: Make touch targets < 44px. Fingers aren't precise
- **DON'T**: Show desktop tables on mobile. Use cards or simplified views
- **LEARNED**: iOS Safari has different scrolling behavior than Chrome

### 8. Token Optimization Tips
- **BE CONCISE**: Don't repeat file paths, use relative references
- **BATCH OPERATIONS**: Read/edit multiple files in single tool calls
- **USE GREP FIRST**: Search before reading entire files
- **AVOID**: Reading huge files without offset/limit
- **LEARNED**: One comprehensive edit beats multiple small edits

### 9. Supabase Specific
- **DON'T**: Chain `.eq()` for same column. Use `.in()` for multiple values
- **DON'T**: Forget `.single()` for single row queries
- **DON'T**: Ignore RLS in production. Security matters
- **LEARNED**: Supabase returns `null` for empty results, not empty array

### 10. Quick Wins Checklist
```javascript
// Always destructure with defaults
const { data = [], error } = await supabase.from('scores').select()

// Always handle all states
if (loading) return <Loading />
if (error) return <Error message={error} />
if (!data.length) return <Empty />

// Always use semantic HTML
<button> not <div onClick>
<nav> not <div className="navigation">

// Always provide fallbacks
score?.toFixed(1) ?? '-'
array?.length || 0
```

## New Lessons Learned (January 2025)

### 11. Session Management
- **DON'T**: Assume sessions will persist indefinitely
- **DO**: Implement proactive token refresh
- **DO**: Show visual session status indicators
- **LEARNED**: Monitor session health on window focus events

### 12. Async Data Loading in Components
- **DON'T**: Update dependent state without clearing old data first
- **DO**: Add separate loading states for different data fetches
- **DO**: Clear stale data when selections change
- **LEARNED**: Timing mismatches between UI state and data state cause weird rendering

### 13. Component Reusability
- **DON'T**: Create one-off components for similar patterns
- **DO**: Follow atomic design principles (atoms → molecules → organisms)
- **DO**: Create prop-driven variations instead of duplicating components
- **LEARNED**: Composition over customization leads to better maintainability

### 14. Chart Data Handling
- **DON'T**: Assume all months/periods will have data
- **DO**: Fill in missing periods with null/zero values
- **DO**: Use dynamic axis scaling based on actual data ranges
- **LEARNED**: Fixed chart scales (like [100, 120]) don't work for all users

### 15. Type Coercion in Comparisons
- **DON'T**: Assume IDs from selects match database types
- **DO**: Convert to strings for comparison when mixing sources
- **LEARNED**: `select.value` returns strings, database IDs might be numbers

## React Component Errors - ALWAYS CHECK FOR NULL AND UNDEFINED
**Problem**: `Cannot read properties of undefined (reading 'toFixed')`
**Wrong**:
```javascript
{profile.handicap_index !== null && (
  <span>{profile.handicap_index.toFixed(1)}</span>
)}
```
**Correct**:
```javascript
{profile.handicap_index !== null && profile.handicap_index !== undefined && (
  <span>{profile.handicap_index.toFixed(1)}</span>
)}
```
**Better**: Calculate on the fly if missing:
```javascript
const [handicapIndex, setHandicapIndex] = useState(null)
// In useEffect: calculate if not stored
if (!profileData.handicap_index) {
  const calculatedIndex = calculateHandicapIndex(scores)
  setHandicapIndex(calculatedIndex)
}
```

## Authentication Flow Best Practices
- **AuthContext Pattern**: Centralize auth state management
- **Protected Routes**: Use wrapper components for auth checking
- **Loading States**: ALWAYS show loading while checking auth
- **Profile Privacy**: Check visibility before showing data

## Database & Migrations

### Supabase Migration Best Practices
- **ALWAYS use IF NOT EXISTS**: Makes migrations idempotent
- **Transaction wrapping**: Use BEGIN/COMMIT for atomicity
- **Rollback functions**: Create inverse operations
- **Track migrations**: Use migration_history table

### Foreign Key Constraints with Existing Data
**Problem**: Can't add FKs when orphaned data exists
**Solution**:
```sql
-- Use DEFERRABLE constraints
ALTER TABLE scores
ADD CONSTRAINT fk_scores_user
FOREIGN KEY (user_id) REFERENCES users(id)
DEFERRABLE INITIALLY DEFERRED;
```

### RLS Performance Optimization
**NEVER** use complex joins in RLS policies!
**Wrong**:
```sql
CREATE POLICY "user_scores" ON scores
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.golfer_id = scores.golfer_id));
```
**Correct**:
```sql
-- Add user_id directly to tables
CREATE POLICY "user_scores" ON scores
USING (user_id = auth.uid());
```
**Always add indexes**:
```sql
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_user_golfer ON scores(user_id, golfer_id);
```

## Deployment & Build Issues

### GitHub Pages Environment Protection
**Problem**: Official GitHub Action fails with environment protection
**Solution**: Use custom deployment:
```yaml
- uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

### Tailwind CSS v4 Breaking Change
**Wrong** (PostCSS config):
```javascript
plugins: { tailwindcss: {}, autoprefixer: {} }
```
**Correct**:
```javascript
plugins: { '@tailwindcss/postcss': {}, autoprefixer: {} }
```

## Frontend Patterns

### Component Data Fetching with userId
**Pattern**: Pass userId to all view components
```javascript
// In Profile.jsx
<RoundByRoundView userId={userId} />

// In component
const RoundByRoundView = ({ userId }) => {
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId) // Filter by user
    }
  }, [userId]) // Don't forget dependency!
}
```

### Loading States Are Critical
**Always handle 3 states**:
```javascript
if (loading) return <Loading />
if (error) return <Error message={error} />
if (!data?.length) return <Empty />
// Then render data
```

## Golf Handicap Calculation

### Edge Cases for Round Counts
**Remember**: Different rules for different counts!
```javascript
switch(roundCount) {
  case 3: numDifferentials = 1; adjustment = -2.0; break;
  case 4: numDifferentials = 1; adjustment = -1.0; break;
  case 5: numDifferentials = 1; adjustment = 0; break;
  case 6: numDifferentials = 2; adjustment = -1.0; break;
  // ... up to 20+
}
// ALWAYS apply 0.96 multiplier at the end!
const handicapIndex = (avgDifferential + adjustment) * 0.96;
```

## Security Reminders

### Environment Variables
- NEVER commit .env files
- ALWAYS validate they exist before using
- Use VITE_ prefix for client-side vars in Vite

### Data Privacy
- Default to private profiles
- Check visibility before showing data
- Use display preferences (show/hide scores)
- Implement proper audit logging

## Quick Debugging Checklist

1. **Component not updating?**
   - Check useEffect dependencies
   - Verify state is actually changing
   - Look for missing await on async calls

2. **Supabase query returning null?**
   - Check RLS policies
   - Verify user is authenticated
   - Use .single() for single row queries

3. **Build failing?**
   - Check for TypeScript errors
   - Verify all imports exist
   - Look for circular dependencies

4. **Deployment failing?**
   - Use deploy-simple.yml workflow
   - Check environment variables
   - Verify base path in vite.config.js

## Important Instruction Reminders
- Do what has been asked; nothing more, nothing less.
- NEVER create files unless they're absolutely necessary for achieving your goal.
- ALWAYS prefer editing an existing file to creating a new one.
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
- ALWAYS check for null AND undefined before calling methods on objects.
- ALWAYS use proper error handling with try-catch in async functions.
- ALWAYS add proper indexes when filtering by columns in queries.
- Reference /documentation folder for project-specific documentation and patterns.