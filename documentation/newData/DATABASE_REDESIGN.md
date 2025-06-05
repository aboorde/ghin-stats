# Database Redesign Documentation

## Overview
This document outlines the new database structure for importing golf round data from external APIs. The data will be imported by users through the Settings page using an API token, and will be stored in a normalized structure in Supabase.

## Data Import Flow
1. User enters API token in Settings page
2. System makes HTTP GET request with Bearer token
3. Receives JSON array of round objects
4. Transforms and stores data in Supabase tables
5. Links all data to the authenticated user

## Database Schema

### 1. rounds Table
Main table storing golf round information. Each round is linked to a user.

**Fields:**
- `id` (bigint, primary key) - External round ID from API
- `user_id` (uuid, foreign key) - References auth.users(id)
- `order_number` (integer) - Order number of the round
- `score_day_order` (integer) - Order within the same day
- `gender` (varchar(1)) - M/F gender indicator
- `status` (varchar(50)) - Round status (e.g., "Validated")
- `is_manual` (boolean) - Whether manually entered
- `number_of_holes` (integer) - Total holes in round (18 or 9)
- `number_of_played_holes` (integer) - Actual holes played
- `golfer_id` (bigint) - External golfer ID
- `facility_name` (text) - Name of golf facility
- `adjusted_gross_score` (integer) - Total adjusted score
- `front9_adjusted` (integer, nullable) - Front 9 adjusted score
- `back9_adjusted` (integer, nullable) - Back 9 adjusted score
- `posted_on_home_course` (boolean) - Whether played at home course
- `played_at` (date) - Date round was played
- `front9_slope_rating` (numeric, nullable) - Front 9 slope rating
- `back9_slope_rating` (numeric, nullable) - Back 9 slope rating
- `course_id` (varchar(50)) - External course ID
- `course_name` (text) - Name of golf course
- `front9_course_name` (text, nullable) - Front 9 course name
- `back9_course_name` (text, nullable) - Back 9 course name
- `front9_course_rating` (numeric, nullable) - Front 9 course rating
- `back9_course_rating` (numeric, nullable) - Back 9 course rating
- `tee_name` (text) - Name of tees played
- `tee_set_id` (varchar(50)) - External tee set ID
- `tee_set_side` (varchar(20)) - Tee set side (e.g., "All18")
- `front9_tee_name` (text, nullable) - Front 9 tee name
- `back9_tee_name` (text, nullable) - Back 9 tee name
- `differential` (numeric) - Handicap differential
- `unadjusted_differential` (numeric) - Unadjusted differential
- `scaled_up_differential` (numeric, nullable) - Scaled up differential
- `adjusted_scaled_up_differential` (numeric, nullable) - Adjusted scaled differential
- `score_type` (varchar(10)) - Score type code
- `penalty` (numeric, nullable) - Penalty strokes
- `penalty_type` (varchar(50), nullable) - Type of penalty
- `penalty_method` (varchar(50), nullable) - Penalty calculation method
- `parent_id` (bigint, nullable) - Parent round ID
- `course_rating` (numeric) - Course rating
- `slope_rating` (integer) - Slope rating
- `score_type_display_full` (varchar(50)) - Full score type display
- `score_type_display_short` (varchar(10)) - Short score type display
- `edited` (boolean) - Whether round was edited
- `posted_at` (timestamptz) - When round was posted
- `season_start_date_at` (varchar(50)) - Season start date
- `season_end_date_at` (varchar(50)) - Season end date
- `challenge_available` (boolean, nullable) - Whether challenge available
- `net_score` (integer, nullable) - Net score
- `course_handicap` (integer, nullable) - Course handicap
- `course_display_value` (text) - Course display name
- `ghin_course_name_display` (text) - GHIN course display
- `used` (boolean) - Whether used in handicap
- `revision` (boolean) - Whether a revision
- `pcc` (numeric) - Playing conditions calculation
- `adjustments` (jsonb) - JSON array of adjustments
- `exceptional` (boolean) - Whether exceptional score
- `message_club_authorized` (text, nullable) - Club authorization message
- `is_recent` (boolean) - Whether recent round
- `net_score_differential` (numeric) - Net score differential
- `short_course` (boolean, nullable) - Whether short course
- `created_at` (timestamptz) - Record creation time
- `updated_at` (timestamptz) - Record update time

### 2. hole_details Table
Stores individual hole scores and details for each round.

**Fields:**
- `id` (bigint, primary key) - External hole detail ID
- `round_id` (bigint, foreign key) - References rounds(id)
- `user_id` (uuid, foreign key) - References auth.users(id)
- `adjusted_gross_score` (integer) - Adjusted score for hole
- `raw_score` (integer) - Raw score for hole
- `hole_number` (integer) - Hole number (1-18)
- `par` (integer) - Par for the hole
- `putts` (integer, nullable) - Number of putts
- `fairway_hit` (boolean, nullable) - Whether fairway was hit
- `gir_flag` (boolean, nullable) - Green in regulation flag
- `drive_accuracy` (varchar(20), nullable) - Drive accuracy
- `stroke_allocation` (integer) - Stroke allocation/handicap
- `approach_shot_accuracy` (varchar(20), nullable) - Approach shot accuracy
- `x_hole` (boolean) - Whether X-ed out hole
- `most_likely_score` (integer, nullable) - Most likely score
- `created_at` (timestamptz) - Record creation time
- `updated_at` (timestamptz) - Record update time

### 3. round_statistics Table
Stores calculated statistics for each round.

**Fields:**
- `id` (uuid, primary key) - Auto-generated UUID
- `round_id` (bigint, foreign key) - References rounds(id)
- `user_id` (uuid, foreign key) - References auth.users(id)
- `putts_total` (varchar(10)) - Total putts
- `one_putt_or_better_percent` (varchar(10)) - One putt percentage
- `two_putt_percent` (varchar(10)) - Two putt percentage
- `three_putt_or_worse_percent` (varchar(10)) - Three putt percentage
- `two_putt_or_better_percent` (varchar(10)) - Two putt or better percentage
- `up_and_downs_total` (varchar(10)) - Total up and downs
- `par3s_average` (varchar(20)) - Par 3 scoring average
- `par4s_average` (varchar(20)) - Par 4 scoring average
- `par5s_average` (varchar(20)) - Par 5 scoring average
- `pars_percent` (varchar(10)) - Pars percentage
- `birdies_or_better_percent` (varchar(10)) - Birdies or better percentage
- `bogeys_percent` (varchar(10)) - Bogeys percentage
- `double_bogeys_percent` (varchar(10)) - Double bogeys percentage
- `triple_bogeys_or_worse_percent` (varchar(10)) - Triple bogeys or worse percentage
- `fairway_hits_percent` (varchar(10)) - Fairway hits percentage
- `missed_left_percent` (varchar(10)) - Missed left percentage
- `missed_right_percent` (varchar(10)) - Missed right percentage
- `missed_long_percent` (varchar(10)) - Missed long percentage
- `missed_short_percent` (varchar(10)) - Missed short percentage
- `gir_percent` (varchar(10)) - Greens in regulation percentage
- `missed_left_approach_shot_accuracy_percent` (varchar(10)) - Missed left approach percentage
- `missed_right_approach_shot_accuracy_percent` (varchar(10)) - Missed right approach percentage
- `missed_long_approach_shot_accuracy_percent` (varchar(10)) - Missed long approach percentage
- `missed_short_approach_shot_accuracy_percent` (varchar(10)) - Missed short approach percentage
- `missed_general_approach_shot_accuracy_percent` (varchar(10)) - Missed general approach percentage
- `last_stats_update_date` (varchar(50)) - Last stats update date
- `last_stats_update_type` (varchar(50)) - Last stats update type
- `created_at` (timestamptz) - Record creation time
- `updated_at` (timestamptz) - Record update time

## Data Import Process

1. **Authentication**: User must be authenticated to import data
2. **API Call**: Make GET request to external API with Bearer token
3. **Data Transformation**: 
   - Map external IDs to prevent duplicates
   - Add user_id to all records
   - Split nested data into appropriate tables
4. **Upsert Strategy**: Use ON CONFLICT to handle duplicate rounds
5. **Transaction**: Import all data in a single transaction for consistency

## Security Considerations

1. **Row Level Security (RLS)**: Enable on all tables
   - Users can only see/modify their own data
   - Policies: `user_id = auth.uid()`
2. **API Token**: Never store in database, only use for one-time import
3. **Data Validation**: Validate all imported data before insertion

## Migration Strategy

1. Create new tables with all required fields
2. Enable RLS policies
3. Create indexes for performance
4. Add foreign key constraints
5. Create views for backward compatibility if needed

## Notes

- All numeric statistics are stored as varchar in the source data, but could be converted to numeric types if needed
- Timestamps are stored with timezone information
- The `adjustments` field is stored as JSONB for flexibility
- External IDs are preserved to prevent duplicate imports