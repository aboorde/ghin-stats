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

## User Management Tables (Added Dec 2024)

### `users`
User profiles linked to auth.users

**Key Fields:**
- `id` (UUID) - References auth.users.id
- `golfer_id` (BIGINT) - Links to scores.golfer_id
- `display_name` (TEXT) - Public display name
- `handicap_index` (DECIMAL) - Handicap index
- `is_public` (BOOLEAN) - Whether profile is publicly visible
- `display_preferences` (JSONB) - User display settings

### `user_sessions`
Session tracking for auth

**Key Fields:**
- `id` (UUID)
- `user_id` (UUID) - References users.id
- `expires_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

### `subscriptions`
Subscription management

**Key Fields:**
- `id` (UUID)
- `user_id` (UUID) - References users.id
- `status` (TEXT) - active, cancelled, past_due
- `stripe_customer_id` (TEXT)
- `stripe_subscription_id` (TEXT)
- `current_period_end` (TIMESTAMPTZ)

## Pine Valley Golf Club Course Information

| Tee | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | Out | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | In | Tot |
|-----|---|---|---|---|---|---|---|---|---|-----|----|----|----|----|----|----|----|----|----|----|-----|
| **Yds** | 331 | 487 | 335 | 129 | 379 | 376 | 142 | 456 | 291 | 2926 | 447 | 356 | 191 | 358 | 466 | 388 | 330 | 168 | 367 | 3071 | 5997 |
| **Par** | 4 | 5 | 4 | 3 | 4 | 4 | 3 | 5 | 4 | 36 | 5 | 4 | 3 | 4 | 5 | 4 | 4 | 3 | 4 | 36 | 72 |
| **Hcp** | 11 | 17 | 3 | 13 | 1 | 7 | 15 | 5 | 9 | | 18 | 10 | 8 | 4 | 16 | 2 | 12 | 14 | 6 | | |

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