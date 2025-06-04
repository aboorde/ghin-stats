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

# Pine Valley Golf Club Course Information

| Tee | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | Out | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | In | Tot |
|-----|---|---|---|---|---|---|---|---|---|-----|----|----|----|----|----|----|----|----|----|----|-----|
| **Yds** | 331 | 487 | 335 | 129 | 379 | 376 | 142 | 456 | 291 | 2926 | 447 | 356 | 191 | 358 | 466 | 388 | 330 | 168 | 367 | 3071 | 5997 |
| **Par** | 4 | 5 | 4 | 3 | 4 | 4 | 3 | 5 | 4 | 36 | 5 | 4 | 3 | 4 | 5 | 4 | 4 | 3 | 4 | 36 | 72 |
| **Hcp** | 11 | 17 | 3 | 13 | 1 | 7 | 15 | 5 | 9 | | 18 | 10 | 8 | 4 | 16 | 2 | 12 | 14 | 6 | | |


# Golf Database Schema Documentation

This database contains golf scoring data from 2022-2025 stored in Supabase. All data is for golfer_id `11384483` playing the majority of his rounds at Pine Valley CC on White Tees (course_id: 14481, course_rating: 69.6, slope_rating: 129).

## Database Connection
- **Supabase URL**: in env
- **Public API Key**: in env
- **Database**: PostgreSQL via Supabase

## Table Structure

### `scores` (Main scoring table)
Primary table containing round-level golf data.

**Key Fields:**
- `id` (BIGINT) - Unique score identifier 
- `golfer_id` (BIGINT) - Always 11384483
- `played_at` (DATE) - Round date (YYYY-MM-DD format)
- `adjusted_gross_score` (INTEGER) - Final score (range: 101-116 in sample data)
- `differential` (DECIMAL) - Handicap differential (range: 27.5-40.6)
- `course_name` (VARCHAR) - Always "Pine Valley CC"
- `tee_name` (VARCHAR) - Always "White Tees"
- `course_rating` (DECIMAL) - Always 69.6
- `slope_rating` (INTEGER) - Always 129

**Data Types & Ranges:**
- Scores typically range from low 100s to mid 110s
- Differentials range from high 20s to low 40s
- Dates span 2022-2025
- All boolean fields are true/false
- `pcc` (Playing Conditions Calculation) can be negative, 0, or positive

### `hole_details` (Hole-by-hole scoring)
Detailed scoring for each of the 18 holes per round.

**Key Fields:**
- `score_id` (BIGINT) - References scores.id
- `hole_number` (INTEGER) - 1-18
- `par` (INTEGER) - Hole par (3, 4, or 5)
- `adjusted_gross_score` (INTEGER) - Score on hole (typically 3-8)
- `raw_score` (INTEGER) - Actual score before adjustments
- `stroke_allocation` (INTEGER) - Handicap stroke order (1-18)

**Hole Information:**
- Par 3 holes: 4, 7, 12, 17
- Par 4 holes: 1, 3, 5, 6, 9, 11, 13, 15, 16, 18
- Par 5 holes: 2, 8, 10, 14
- Total par: 72

### `statistics` (Round statistics)
Performance metrics calculated for each round.

**Key Fields:**
- `score_id` (BIGINT) - References scores.id
- `up_and_downs_total` (INTEGER) - Short game saves (0-3 range)
- `par3s_average` (DECIMAL) - Average score on par 3s (4.0-5.5)
- `par4s_average` (DECIMAL) - Average score on par 4s (5.7-6.6)
- `par5s_average` (DECIMAL) - Average score on par 5s (6.0-7.5)
- `pars_percent` (DECIMAL) - Percentage of holes made at par (0.0-0.17)
- `birdies_or_better_percent` (DECIMAL) - Always 0.0 in data
- `bogeys_percent` (DECIMAL) - Percentage bogeys (0.11-0.39)
- `double_bogeys_percent` (DECIMAL) - Percentage double bogeys (0.17-0.56)
- `triple_bogeys_or_worse_percent` (DECIMAL) - Percentage triple+ (0.22-0.5)
- `fairway_hits_percent` (DECIMAL) - Always 0.0 (no fairway data tracked)

### `adjustments` (Score adjustments)
Applied adjustments to scores (e.g., PCC adjustments).

**Key Fields:**
- `score_id` (BIGINT) - References scores.id
- `type` (VARCHAR) - Adjustment type (e.g., "pcc")
- `value` (DECIMAL) - Adjustment value
- `display` (VARCHAR) - Human-readable adjustment

## Sample Queries

### Get all rounds with basic stats
```sql
SELECT 
    s.played_at,
    s.adjusted_gross_score,
    s.differential,
    st.par3s_average,
    st.par4s_average,
    st.par5s_average,
    st.pars_percent
FROM scores s
LEFT JOIN statistics st ON s.id = st.score_id
ORDER BY s.played_at DESC;
```

### Get hole-by-hole performance for a specific round
```sql
SELECT 
    hd.hole_number,
    hd.par,
    hd.adjusted_gross_score,
    hd.stroke_allocation
FROM hole_details hd
WHERE hd.score_id = 831450405
ORDER BY hd.hole_number;
```

### Calculate scoring averages by hole
```sql
SELECT 
    hd.hole_number,
    hd.par,
    AVG(hd.adjusted_gross_score) as avg_score,
    COUNT(*) as rounds_played
FROM hole_details hd
GROUP BY hd.hole_number, hd.par
ORDER BY hd.hole_number;
```

### Get best and worst rounds
```sql
SELECT 
    played_at,
    adjusted_gross_score,
    differential
FROM scores
ORDER BY adjusted_gross_score ASC
LIMIT 5; -- Best rounds

SELECT 
    played_at,
    adjusted_gross_score,
    differential
FROM scores
ORDER BY adjusted_gross_score DESC
LIMIT 5; -- Worst rounds
```

## Analysis Ideas

### Performance Trends
- Track score improvement over time
- Analyze seasonal patterns
- Compare performance by year

### Hole Analysis
- Identify most difficult holes (highest average scores)
- Find scoring opportunities (easiest holes)
- Analyze par 3/4/5 performance separately

### Statistical Analysis
- Handicap progression
- Consistency metrics (standard deviation of scores)
- Success rates (par percentage, bogey avoidance)

## Notes for Claude
- This golfer plays exclusively at Pine Valley CC on White Tees
- Scores range from 80s-110s, indicating a higher handicap player
- Limited short game statistics (up and downs tracked)
- No putting, fairway, or green-in-regulation data available
- All data uses adjusted gross scores (accounting for maximum hole scores)
- PCC adjustments occasionally applied to account for playing conditions

## Data Quality
- Complete hole-by-hole data for all rounds
- Consistent course and tee information
- Proper handicap differential calculations
- Missing: putting stats, fairway hits, greens in regulation

# Data Architecture and Design

## Project Overview
This is a React-based Single Page Application for visualizing golf statistics data stored in Supabase. The application provides four main views for analyzing golf performance: Round by Round, Hole by Hole, Course Summary, and Year by Year analysis.

## Technology Stack
- **Frontend**: React 19.1.0 with functional components and hooks
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.8 with utility-first approach
- **Database**: Supabase (PostgreSQL)
- **Data Visualization**: Recharts 2.15.3
- **Date Handling**: date-fns 4.1.0
- **Deployment**: GitHub Pages

## Data Flow Architecture

```
Supabase Database (PostgreSQL)
    ↓
supabase.js (Client Configuration)
    ↓
golfDataService.js (Service Layer)
    ↓
React Components (Direct queries or useGolfData hook)
    ↓
UI Rendering with Recharts
```

## Component Architecture

```
App.jsx (Navigation Controller)
├── RoundByRoundView
│   └── ScoreTrendChart (Reusable chart component)
├── HoleByHoleView (Detailed scorecard view)
├── CourseByCourseSummary
│   └── HolePerformanceChart
└── YearByYearAnalysis (Multiple chart types)
```

## Key Design Patterns

### 1. Component-Centric Data Fetching
Each view component independently manages its data lifecycle:
- Direct Supabase queries in useEffect hooks
- Local state management for loading, error, and data states
- No global state management (intentionally simple)

### 2. Filtering Pattern
All components filter for complete rounds (18 holes):
```javascript
.eq('number_of_holes', 18)
```

### 3. Styling Convention
- Tailwind utility classes for all styling
- Color coding for performance indicators:
  - Green: Good (pars, low scores)
  - Yellow/Orange: Average (bogeys)
  - Red: Poor (double bogeys+)
  - Blue/Purple: Informational

### 4. Data Aggregation
Components perform client-side aggregation:
- Averaging scores by hole/course/year
- Calculating statistics from raw round data
- Grouping data for visualization

## Database Query Patterns

### Basic Round Query
```javascript
supabase
  .from('scores')
  .select('*')
  .eq('number_of_holes', 18)
  .order('played_at', { ascending: false })
```

### Query with Related Data
```javascript
supabase
  .from('scores')
  .select(`
    *,
    statistics(*),
    hole_details(*)
  `)
  .eq('number_of_holes', 18)
```

### Hole Details for Specific Round
```javascript
supabase
  .from('hole_details')
  .select('*')
  .eq('score_id', scoreId)
  .order('hole_number')
```

## State Management Pattern
Each component follows this pattern:
```javascript
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
const [filters, setFilters] = useState(defaultFilters)
```

## Error Handling
- Try-catch blocks in async functions
- Error state displayed to user
- No error boundaries implemented

## Performance Considerations
- Data fetched on component mount only
- No caching between view switches
- Responsive charts using ResponsiveContainer
- Minimal re-renders through proper state updates

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