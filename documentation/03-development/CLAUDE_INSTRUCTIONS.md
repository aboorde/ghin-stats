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

## Reference Documentation

For detailed technical documentation, please refer to:

- **[DATABASE_SCHEMA.md](../01-architecture/DATABASE_SCHEMA.md)** - Complete database schema including Pine Valley course information
- **[DATA_ARCHITECTURE.md](../01-architecture/DATA_ARCHITECTURE.md)** - Data flow and architectural patterns
- **[API_PATTERNS.md](../01-architecture/API_PATTERNS.md)** - Supabase query patterns and examples
- **[COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)** - Atomic design component library


# Architecture Guidelines for Future Development

## Code Quality Standards

### 1. Component Structure
- **Keep components focused**: Each component should have a single, clear responsibility
- **Extract reusable logic**: Common patterns (data fetching, calculations) should be in custom hooks
- **Maintain consistent file organization**: Components in `/components`, utilities in `/utils`, services in `/services`

### 2. Data Management Best Practices
- **Never modify raw data**: Always work with copies when transforming data
- **Validate data at boundaries**: Check data integrity when fetching from Supabase
- **Handle edge cases**: Empty arrays, null values, missing fields should be gracefully handled
- **Use TypeScript**: Gradually migrate to TypeScript for better type safety

### 3. Mobile-First Development
- **Always test on mobile**: Use browser dev tools to test all breakpoints
- **Touch targets minimum 44px**: Ensure all interactive elements are finger-friendly
- **Reduce information density**: Show less data on mobile, use progressive disclosure
- **Performance on mobile**: Minimize bundle size, lazy load heavy components

### 4. Testing Strategy
```javascript
// Example test structure to implement
describe('RoundByRoundView', () => {
  it('should display rounds in correct order')
  it('should filter by course correctly')
  it('should handle empty data gracefully')
  it('should show loading state')
  it('should display error messages')
})
```

## Performance Optimization Roadmap

### 1. Data Caching Layer
Implement a caching strategy to avoid refetching data:
```javascript
// Example: Simple cache implementation
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const getCachedData = async (key, fetcher) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const data = await fetcher()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}
```

### 2. Virtual Scrolling
For large datasets (100+ rounds), implement virtual scrolling:
- Use `react-window` or `react-virtualized`
- Only render visible rows in tables
- Significantly improves performance with large datasets

### 3. Code Splitting
Implement route-based code splitting:
```javascript
// Lazy load heavy components
const PineValleyAnalysis = lazy(() => import('./components/PineValleyAnalysis'))
```

### 4. Image Optimization
- Use WebP format for any future images
- Implement responsive images with srcset
- Lazy load images below the fold

## Security Considerations

### 1. Environment Variables
- **Never commit .env files**: Always use .env.example as template
- **Validate environment variables**: Check they exist before using
- **Use server-side proxy**: For production, proxy Supabase calls through your server

### 2. Data Access
- **Row Level Security (RLS)**: Enable RLS in Supabase for production
- **API Rate Limiting**: Implement rate limiting for API calls
- **Input Validation**: Always validate user inputs before queries

### 3. Authentication (Future)
```javascript
// Example auth pattern for future implementation
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

## Accessibility (A11Y) Requirements

### 1. Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Use `<button>` for actions, `<a>` for navigation
- Label all form inputs properly

### 2. ARIA Labels
```jsx
// Add ARIA labels for screen readers
<button aria-label="Filter rounds by course">
  <FilterIcon />
</button>
```

### 3. Keyboard Navigation
- All interactive elements must be keyboard accessible
- Implement focus trapping for modals
- Visible focus indicators (already handled by Tailwind focus: classes)

### 4. Color Contrast
- Maintain WCAG AA compliance (4.5:1 for normal text)
- Don't rely solely on color to convey information
- Current dark theme needs contrast verification

## Future Feature Recommendations

### 1. Advanced Analytics
- **Strokes Gained Analysis**: Compare performance to handicap baseline
- **Weather Integration**: Correlate scores with weather conditions
- **Goal Setting**: Allow users to set and track improvement goals
- **Practice Tracking**: Log practice sessions and correlate with performance

### 2. Data Export/Import
- **CSV Export**: Allow users to export their data
- **Backup/Restore**: Implement data backup functionality
- **Multi-format Import**: Support various golf app data formats

### 3. Social Features
- **Round Sharing**: Share specific rounds or achievements
- **Leaderboards**: Compare with friends (privacy-first)
- **Comments**: Add notes to rounds for context

### 4. Enhanced Visualizations
- **Heat Maps**: Show performance patterns on course layouts
- **3D Charts**: Interactive 3D visualizations for complex data
- **Animation**: Smooth transitions between data states
- **Custom Dashboards**: Let users create their own dashboard layouts

## Development Workflow

### 1. Branch Strategy
```bash
main (production)
├── develop (staging)
    ├── feature/add-weather-data
    ├── feature/export-csv
    └── fix/mobile-chart-overflow
```

### 2. Commit Convention
Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test additions/changes
- `chore:` Build process/auxiliary tool changes

### 3. Code Review Checklist
- [ ] Mobile responsive tested
- [ ] Loading and error states handled
- [ ] No console errors or warnings
- [ ] Accessibility requirements met
- [ ] Performance impact considered
- [ ] Documentation updated

## Monitoring and Analytics

### 1. Error Tracking
Implement error boundary and tracking:
```javascript
// Integrate with service like Sentry
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo)
  }
}
```

### 2. Performance Monitoring
- Track component render times
- Monitor API response times
- Track bundle size over time
- Set up alerts for performance regressions

### 3. User Analytics
- Track feature usage (privacy-conscious)
- Monitor user flows
- A/B test new features
- Collect feedback systematically

## Deployment Checklist

### Before Each Release:
1. [ ] Run full test suite
2. [ ] Check mobile responsiveness
3. [ ] Verify environment variables
4. [ ] Update version number
5. [ ] Update changelog
6. [ ] Check bundle size
7. [ ] Test error scenarios
8. [ ] Verify accessibility
9. [ ] Update documentation
10. [ ] Create release notes

## Technical Debt to Address

### High Priority
1. **Add TypeScript**: Gradually migrate components for type safety
2. **Implement Testing**: Start with critical business logic
3. **Add Error Boundaries**: Prevent entire app crashes
4. **Optimize Bundle Size**: Implement code splitting

### Medium Priority
1. **Extract Custom Hooks**: Reuse data fetching logic
2. **Implement Caching**: Reduce API calls
3. **Add Loading Skeletons**: Better perceived performance
4. **Standardize Error Handling**: Consistent error UX

### Low Priority
1. **Add Animations**: Smooth transitions
2. **Implement Theming**: Support light/dark mode toggle
3. **Add Offline Support**: PWA capabilities
4. **Optimize Images**: If/when images are added

Remember: Always prioritize user experience, data accuracy, and performance. The golfer's data is sacred - never compromise its integrity.

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

# Recent Work and Lessons Learned (December 4, 2024)

## Major Implementations

### 1. GHIN Handicap Calculation
- Created `src/utils/handicapCalculator.js` with proper USGA/GHIN rules
- Implements differential selection based on round count (3-20+ rounds)
- Applies adjustments for 3-6 rounds and 0.96 multiplier
- Added handicap trend chart and detailed calculation display

### 2. User Management System
- Created comprehensive user tables (users, user_sessions, subscriptions)
- Links to existing scores via golfer_id
- Full subscription management with Stripe integration
- Privacy controls and user preferences

### 3. Row Level Security (RLS)
- Enabled RLS on all 8 tables
- Created 35 security policies
- Implemented data ownership based on golfer_id
- Added privacy controls for public profiles

## Critical Pitfalls to Avoid

### 1. GitHub Pages Deployment
**Problem**: Environment protection rules block deployment
**Solution**: Use `deploy-simple.yml` workflow instead of GitHub's official method
```yaml
# Use peaceiris/actions-gh-pages@v3 for direct branch deployment
# Avoids environment protection issues
```

### 2. Tailwind CSS v4 Configuration
**Problem**: Old plugin format deprecated
**Wrong**: `plugins: { tailwindcss: {}, autoprefixer: {} }`
**Correct**: `plugins: { '@tailwindcss/postcss': {}, autoprefixer: {} }`

### 3. RLS Performance
**Problem**: Complex joins in RLS policies impact performance
**Solution**: 
- Use EXISTS instead of IN subqueries
- Denormalize user_id to related tables
- Create proper indexes on all foreign keys

### 4. Supabase Migrations
**Problem**: Can't add foreign keys with existing orphaned data
**Solution**:
- Use DEFERRABLE INITIALLY DEFERRED constraints
- Create separate migration for data linking
- Always use IF NOT EXISTS for idempotency

### 5. GHIN Calculation Edge Cases
**Problem**: Different rules for different round counts
**Solution**: Comprehensive switch statement handling all cases
```javascript
if (roundCount === 3) { numDifferentials = 1; adjustment = -2.0; }
// ... etc for all cases up to 20+
```

## Database Schema Updates

### New Tables
- `users` - User profiles linked to auth.users
- `user_sessions` - Session tracking
- `subscriptions` - Payment management
- `audit_logs` - Security audit trail

### Updated Tables (pending migration)
- `scores` - Add user_id column
- `hole_details` - Add user_id column  
- `statistics` - Add user_id column
- `adjustments` - Add user_id column

### Security Functions
- `has_premium_access()` - Check subscription
- `user_owns_score()` - Verify ownership
- `score_is_public()` - Privacy check
- `get_current_user_golfer_id()` - User helper

## Files Created Today
1. `.github/workflows/deploy-simple.yml` - Fixed deployment
2. `src/utils/handicapCalculator.js` - GHIN calculation
3. `user_management_migration.sql` - User tables
4. `link_existing_data_migration.sql` - FK relationships (not applied)
5. `rls_policies_migration.sql` - Security policies
6. `RLS_DOCUMENTATION.md` - Security documentation
7. `TODAY_WORK_SUMMARY.md` - Comprehensive summary

## Next Steps Required
1. Create auth users in Supabase
2. Run secure_data_migration.sql (replaces link_existing_data_migration.sql)
3. Handle any orphaned data using admin functions
4. Update frontend for authentication
5. Test RLS with authenticated requests

## Secure Data Migration System (December 4, 2024)

### New Migration Architecture
Created a comprehensive migration system with:

1. **secure_data_migration.sql** - Main migration with:
   - Migration tracking and history
   - Orphaned data management
   - Rollback capabilities
   - Enhanced RLS policies with better performance
   - Automated verification functions

2. **orphaned_data_admin.sql** - Admin tools including:
   - Detailed views for orphaned data
   - Bulk assignment functions
   - User creation with auto-assignment
   - Recovery functions for orphaned scores
   - Reporting and monitoring tools

3. **MIGRATION_GUIDE.md** - Complete documentation
4. **test_migration.sql** - Testing script for safe validation

### Key Features
- **Atomicity**: Full transaction support with rollback
- **Orphan Handling**: Tracks and manages data without matching users
- **Audit Trail**: Complete history of all migrations
- **Performance**: Optimized indexes for RLS queries
- **Admin Tools**: Comprehensive functions for data management

### Migration Functions
- `migrate_golf_data_ownership()` - Main migration function
- `rollback_data_migration(migration_id)` - Safe rollback
- `verify_data_migration()` - Integrity checks
- `bulk_assign_golfer_data()` - Assign all data for a golfer
- `recover_orphaned_score()` - Recover individual scores
- `create_user_for_orphaned_golfer()` - Create user and assign data

### RLS Improvements
- Simplified policies using user_id directly (not joins)
- Added composite indexes for common queries
- Partial indexes for public profile filtering
- Service role bypass for admin operations

# Critical Lessons Learned (December 2024)

## AUTHENTICATION & USER MANAGEMENT

### React Component Errors - ALWAYS CHECK FOR NULL AND UNDEFINED
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

### Authentication Flow Best Practices
- **AuthContext Pattern**: Centralize auth state management
- **Protected Routes**: Use wrapper components for auth checking
- **Loading States**: ALWAYS show loading while checking auth
- **Profile Privacy**: Check visibility before showing data

### User Data Migration Order Matters!
1. Create auth users FIRST
2. Create user profiles in public.users
3. THEN run data ownership migration
4. Verify with rollback capability

## DATABASE & MIGRATIONS

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

## DEPLOYMENT & BUILD ISSUES

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

## FRONTEND PATTERNS

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

## GHIN HANDICAP CALCULATION

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

### Auto-Update Handicap on New Scores
**Use database triggers**:
```sql
CREATE TRIGGER update_handicap_on_score_insert
AFTER INSERT ON scores
FOR EACH ROW
EXECUTE FUNCTION update_user_handicap_index();
```

## SECURITY REMINDERS

### Environment Variables
- NEVER commit .env files
- ALWAYS validate they exist before using
- Use VITE_ prefix for client-side vars in Vite

### Data Privacy
- Default to private profiles
- Check visibility before showing data
- Use display preferences (show/hide scores)
- Implement proper audit logging

## QUICK DEBUGGING CHECKLIST

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

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
ALWAYS check for null AND undefined before calling methods on objects.
ALWAYS use proper error handling with try-catch in async functions.
ALWAYS add proper indexes when filtering by columns in queries.