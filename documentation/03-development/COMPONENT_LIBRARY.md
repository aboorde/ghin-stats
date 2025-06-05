# Golf Stats Component Library

This component library follows Atomic Design principles to create reusable, maintainable components.

## Architecture Overview

```
components/
├── atoms/          # Basic building blocks
├── molecules/      # Combinations of atoms
├── organisms/      # Complex UI sections
└── [pages]         # Full page components
```

## Atoms (Basic Building Blocks)

### MetricCard
Displays a single metric with customizable styling.

```jsx
import { MetricCard } from './atoms'

<MetricCard
  label="Average Score"
  value="108.5"
  subValue="18-hole rounds"
  theme="green"       // blue, green, purple, orange, red, yellow, gray
  size="md"          // sm, md, lg
  icon="🏌️"
  trend="+2.5 vs par"
/>
```

### SectionHeader
Consistent section headers throughout the app.

```jsx
<SectionHeader 
  title="Performance Statistics"
  subtitle="Last 20 rounds"
  size="md"          // sm, md, lg
/>
```

### SelectableButton
Button with selected state styling.

```jsx
<SelectableButton
  isSelected={isActive}
  onClick={handleClick}
>
  Button Content
</SelectableButton>
```

### ScrollableList
Container for scrollable content.

```jsx
<ScrollableList maxHeight="max-h-96">
  {items.map(item => <ItemComponent key={item.id} />)}
</ScrollableList>
```

### HoleCard
Individual hole score display with automatic coloring.

```jsx
<HoleCard
  holeNumber={1}
  par={4}
  score={5}
  size="md"          // sm, md, lg
  showLabel={true}   // Show "Birdie", "Par", etc.
  onClick={handleClick}
/>
```

### TotalCard
Display total scores for sections.

```jsx
<TotalCard
  label="Front Nine Total"
  value={42}
  theme="gray"       // gray, green, blue
  size="md"
/>
```

## Molecules (Component Combinations)

### MetricGrid
Responsive grid layout for metric cards.

```jsx
<MetricGrid 
  columns={4}
  responsive={{ sm: 2, md: 4 }}
>
  <MetricCard {...props1} />
  <MetricCard {...props2} />
</MetricGrid>
```

### CourseCard
Individual course display in selection lists.

```jsx
<CourseCard
  course={courseData}
  isSelected={selected}
  onClick={handleSelect}
  showDetails={true}
/>
```

### CourseSelector
Handles course selection for mobile and desktop.

```jsx
<CourseSelector
  courses={courseArray}
  selectedCourse={currentCourse}
  onCourseSelect={handleCourseChange}
  showMobile={true}
  showDesktop={true}
/>
```

### ParTypePerformance
Displays par 3/4/5 performance metrics.

```jsx
<ParTypePerformance
  avgPar3={4.5}
  avgPar4={5.8}
  avgPar5={6.2}
  par3VsPar={1.5}
  par4VsPar={1.8}
  par5VsPar={1.2}
  title="Par Type Performance"
  roundType="18-hole rounds"
/>
```

### ScoringDistribution
Shows scoring distribution percentages.

```jsx
<ScoringDistribution
  parPercent={0.15}
  bogeyPercent={0.35}
  doublePlusPercent={0.45}
  birdiePercent={0.05}
  title="Scoring Distribution"
/>
```

### EmptyState
Displays when no data is available.

```jsx
<EmptyState
  message="No rounds found"
  submessage="Play some golf to see statistics"
  icon="⛳"
/>
```

### RoundSelector
Dropdown for selecting golf rounds.

```jsx
<RoundSelector
  rounds={roundsArray}
  selectedRound={currentRoundId}
  onRoundSelect={handleRoundChange}
  showCourse={true}
  showScore={true}
  showHoles={true}
/>
```

### RoundSummaryCard
Summary information for a selected round.

```jsx
<RoundSummaryCard
  round={roundData}
  showDate={true}
  gradient={true}    // Use gradient styling
/>
```

### NineHoleGrid
Grid display for 9 holes with total.

```jsx
<NineHoleGrid
  holes={holeDetailsArray}
  title="Front Nine"
  totalLabel="Front Nine Total:"
  showTotal={true}
  gridCols="grid-cols-2 sm:grid-cols-3"
  holeSize="md"
  onHoleClick={handleHoleClick}
/>
```

### ScoreTypeSummary
Scoring distribution display.

```jsx
<ScoreTypeSummary
  holeDetails={holeDetailsArray}
  showEagles={true}     // Show eagles if any
  showDoubles={false}   // Combine doubles with triple+
/>
```

## Organisms (Complex Components)

### CourseStatistics
Complete statistics panel for a course.

```jsx
<CourseStatistics
  courseData={selectedCourseData}
  holeAverages={holeAveragesArray}
  showHoleChart={true}
/>
```

### HoleByHoleScorecard
Complete scorecard display with automatic 9/18 hole layout.

```jsx
<HoleByHoleScorecard
  holeDetails={holeDetailsArray}
  numberOfHoles={18}    // 9 or 18
  onHoleClick={handleHoleClick}
  showScoreSummary={true}
/>
```

## Usage Examples

### Creating a New Statistics View

```jsx
import { MetricCard, MetricGrid, SectionHeader } from './atoms'
import { ParTypePerformance, EmptyState } from './molecules'

const MyStatsView = ({ data }) => {
  if (!data) return <EmptyState message="No data available" />
  
  return (
    <div>
      <SectionHeader title="My Statistics" />
      
      <MetricGrid columns={3}>
        <MetricCard 
          label="Rounds Played" 
          value={data.rounds} 
          theme="blue" 
        />
        <MetricCard 
          label="Best Score" 
          value={data.best} 
          theme="green" 
        />
        <MetricCard 
          label="Average" 
          value={data.avg} 
          theme="purple" 
        />
      </MetricGrid>
      
      <ParTypePerformance {...data.parStats} />
    </div>
  )
}
```

### Extending Components

Components are designed to be extended:

```jsx
// Custom metric card with special styling
const HandicapCard = ({ handicap, trend }) => (
  <MetricCard
    label="Handicap Index"
    value={handicap.toFixed(1)}
    trend={trend > 0 ? `↑ ${trend}` : `↓ ${Math.abs(trend)}`}
    theme={trend > 0 ? 'red' : 'green'}
    icon="📊"
    size="lg"
  />
)
```

## Best Practices

1. **Import from index files** for cleaner imports:
   ```jsx
   import { MetricCard, SectionHeader } from './atoms'
   ```

2. **Use semantic props** - `theme` instead of `color`, `size` instead of `variant`

3. **Provide sensible defaults** - All components work with minimal props

4. **Compose, don't customize** - Build new components by combining existing ones

5. **Keep atoms pure** - No data fetching or business logic in atoms

6. **Document props** - Use JSDoc comments for all component props

## Theme Guidelines

- **Blue**: General information, counts
- **Green**: Good performance, improvements
- **Yellow**: Average performance, warnings
- **Red**: Poor performance, alerts
- **Purple**: Special achievements, records
- **Orange**: Notable stats, outliers
- **Gray**: Neutral information, defaults

## Utility Functions

### Scoring Utilities
Helper functions for golf score calculations.

```jsx
import { 
  calculateScoreToPar, 
  getScoreBackgroundColor,
  getScoreTheme,
  countScoreTypes 
} from './utils/scoringUtils'

// Get score label and color
const { text, color, diff } = calculateScoreToPar(5, 4) 
// Returns: { text: 'Bogey', color: 'text-yellow-400', diff: 1 }

// Get background styling
const bgClasses = getScoreBackgroundColor(3, 4)
// Returns: 'bg-blue-900/30 border-blue-600/50'

// Get theme name
const theme = getScoreTheme(-1) // Returns: 'blue'

// Count score types in a round
const counts = countScoreTypes(holeDetails)
// Returns: { eagles: 0, birdies: 2, pars: 10, bogeys: 5, ... }
```

## Future Components

Potential components to add:
- `TrendIndicator` - Show up/down trends
- `PerformanceHeatmap` - Visual performance grid
- `RoundCard` - Individual round summary
- `StatComparison` - Compare two metrics
- `ProgressBar` - Show progress toward goals
- `HoleDetailModal` - Detailed view of individual hole
- `ScorecardPrint` - Print-friendly scorecard layout