# Component Guide for ghin-stats

## Overview
This guide provides detailed information about each React component in the golf statistics dashboard application.

## Main Components

### App.jsx
**Purpose**: Main application container and navigation controller
**Key Features**:
- Tab-based navigation between four main views
- Sticky header with application title
- Footer with last update timestamp
- State management for active view

**State**:
```javascript
const [activeView, setActiveView] = useState('round')
```

**Navigation Items**:
- Round by Round
- Hole by Hole  
- Course Summary
- Year by Year

---

### RoundByRoundView.jsx
**Purpose**: Display all golf rounds in a sortable, filterable table
**Location**: `/src/components/RoundByRoundView.jsx`

**Features**:
- Date range filtering
- Score range filtering
- Sortable by date (ascending/descending)
- Score trend chart integration
- Detailed statistics per round

**Key States**:
- `rounds`: Array of round data
- `filteredRounds`: Filtered subset based on criteria
- `sortOrder`: 'asc' or 'desc'
- `filters`: Date and score range filters

**Data Query**:
```javascript
supabase
  .from('rounds')
  .select(`*, round_statistics(*)`)
  .eq('number_of_holes', 18)
```

---

### HoleByHoleView.jsx
**Purpose**: Detailed scorecard view for individual rounds
**Location**: `/src/components/HoleByHoleView.jsx`

**Features**:
- Round selector dropdown
- Full 18-hole scorecard display
- Front/back nine totals
- Color-coded scoring (par, bogey, etc.)
- Score vs par calculation

**Visual Indicators**:
- Green background: Par or better
- Yellow background: Bogey
- Orange background: Double bogey
- Red background: Triple bogey or worse

---

### CourseByCourseSummary.jsx
**Purpose**: Aggregate statistics by golf course
**Location**: `/src/components/CourseByCourseSummary.jsx`

**Features**:
- Course list with round counts
- Average scores by course
- Best/worst scores per course
- Par type performance (Par 3/4/5 averages)
- Scoring distribution percentages
- Hole-by-hole performance chart

**Nested Component**:
- `HolePerformanceChart`: Bar chart showing average score per hole

---

### YearByYearAnalysis.jsx
**Purpose**: Yearly performance trends and analysis
**Location**: `/src/components/YearByYearAnalysis.jsx`

**Features**:
- Multi-year trend line chart
- Year selector for detailed view
- Monthly performance breakdown
- Scoring distribution pie chart
- Course breakdown by year
- Par type performance by year

**Chart Types Used**:
- LineChart: Yearly trends
- BarChart: Monthly averages
- PieChart: Scoring distribution

---

## Reusable Components

### ScoreTrendChart.jsx
**Purpose**: Line chart showing score trends over time
**Location**: `/src/components/ScoreTrendChart.jsx`
**Used By**: RoundByRoundView

**Props**:
- `data`: Array of round data with dates and scores

**Features**:
- Responsive container
- Formatted date axis
- Hover tooltips
- Green line color for visibility

---

### HolePerformanceChart.jsx
**Purpose**: Bar chart showing average scores by hole
**Location**: `/src/components/HolePerformanceChart.jsx`
**Used By**: CourseByCourseSummary

**Props**:
- `data`: Array of hole averages

**Features**:
- Color-coded bars based on score vs par
- Responsive design
- Hole numbers on X-axis

---

## Service Layer

### golfDataService.js
**Purpose**: Centralized data fetching functions
**Location**: `/src/services/golfDataService.js`

**Functions**:
- `fetchAllScores()`: Get all scores with statistics
- `fetchScoreById(id)`: Get specific round details
- `fetchHoleDetails(scoreId)`: Get hole-by-hole data
- `fetchScoresByDateRange(startDate, endDate)`: Filtered scores
- `fetchCourseStatistics()`: Aggregate course data

---

## Custom Hooks

### useGolfData.js
**Purpose**: Reusable hook for data fetching with state management
**Location**: `/src/hooks/useGolfData.js`

**Usage**:
```javascript
const { data, loading, error, refetch } = useGolfData(fetchFunction, params)
```

**Features**:
- Automatic loading state management
- Error handling
- Refetch capability
- Dependency tracking

---

## Component Communication Patterns

1. **Parent-Child Props**: Navigation state flows from App.jsx to views
2. **Local State Management**: Each view manages its own data
3. **Service Layer**: Shared data fetching logic
4. **No Global State**: Intentionally simple architecture

## Adding New Components

When adding new components:
1. Follow the existing state management pattern
2. Use Tailwind classes for styling
3. Include loading and error states
4. Filter for 18-hole rounds
5. Use the color coding convention for scores
6. Make components responsive with Tailwind breakpoints

## Performance Tips

1. Use `key` props in lists for efficient rendering
2. Memoize expensive calculations with `useMemo`
3. Debounce filter inputs if needed
4. Consider pagination for large datasets
5. Use ResponsiveContainer for all Recharts components