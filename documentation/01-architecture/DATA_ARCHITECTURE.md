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

## Service Layer Architecture

### Models
Located in `/src/models/`:
- `Course.js` - Course aggregation logic
- `Hole.js` - Hole performance calculations
- `Round.js` - Round-level operations
- `Score.js` - Score processing and validation
- `Year.js` - Yearly statistics

### Services
Located in `/src/services/`:
- `golfDataService.js` - Main data fetching service
- `aggregationService.js` - Generic aggregation utilities
- `detailedStatsService.js` - Detailed statistics calculations
- `statisticsService.js` - Statistical computations
- `yearAnalysisService.js` - Year-specific analysis

### Utilities
Located in `/src/utils/`:
- `chartDataHelpers.js` - Chart data preparation
- `dataHelpers.js` - General data utilities
- `dateHelpers.js` - Date formatting and parsing
- `handicapCalculator.js` - GHIN handicap calculations
- `scoreHelpers.js` - Score-related utilities
- `scoringUtils.js` - Scoring calculations and styling
- `theme.js` - Chart and UI theming

## Data Transformation Pipeline

1. **Fetch**: Raw data from Supabase
2. **Validate**: Check data integrity
3. **Transform**: Apply models for business logic
4. **Aggregate**: Calculate statistics
5. **Format**: Prepare for UI/charts
6. **Render**: Display in components

## Caching Strategy
Currently no caching implemented. Future considerations:
- Browser localStorage for offline support
- React Query for server state management
- Service Worker for PWA capabilities

## Security Considerations
- Row Level Security (RLS) enforced at database
- User authentication required for data access
- No sensitive data stored client-side
- API keys in environment variables

## Future Architecture Improvements
1. Implement global state management (Context/Redux)
2. Add data caching layer
3. Create custom hooks for common patterns
4. Implement error boundaries
5. Add performance monitoring
6. Consider server-side rendering for SEO