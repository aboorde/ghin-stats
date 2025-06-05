# Exact JSON Field Mapping

This document maps EVERY field from the exact JSON structure provided to ensure our database schema accounts for all data.

## Round Object Fields (59 total)

Based on the exact JSON provided, here are all fields at the round level:

| JSON Field | Database Column | Type | Status |
|------------|-----------------|------|--------|
| id | id | BIGINT | ✅ Exists |
| order_number | order_number | INTEGER | ✅ Exists |
| score_day_order | score_day_order | INTEGER | ✅ Exists |
| gender | gender | VARCHAR(1) | ✅ Exists |
| status | status | VARCHAR(50) | ✅ Exists |
| is_manual | is_manual | BOOLEAN | ✅ Exists |
| number_of_holes | number_of_holes | INTEGER | ✅ Exists |
| number_of_played_holes | number_of_played_holes | INTEGER | ✅ Exists |
| golfer_id | golfer_id | BIGINT | ✅ Exists |
| facility_name | facility_name | TEXT | ✅ Exists |
| adjusted_gross_score | adjusted_gross_score | INTEGER | ✅ Exists |
| front9_adjusted | front9_adjusted | INTEGER | ✅ Exists |
| back9_adjusted | back9_adjusted | INTEGER | ✅ Exists |
| posted_on_home_course | posted_on_home_course | BOOLEAN | ✅ Exists |
| played_at | played_at | DATE | ✅ Exists |
| front9_slope_rating | front9_slope_rating | NUMERIC(4,1) | ✅ Exists |
| back9_slope_rating | back9_slope_rating | NUMERIC(4,1) | ✅ Exists |
| course_id | course_id | VARCHAR(50) | ✅ Exists |
| course_name | course_name | TEXT | ✅ Exists |
| front9_course_name | front9_course_name | TEXT | ✅ Exists |
| back9_course_name | back9_course_name | TEXT | ✅ Exists |
| front9_course_rating | front9_course_rating | NUMERIC(4,1) | ✅ Exists |
| back9_course_rating | back9_course_rating | NUMERIC(4,1) | ✅ Exists |
| tee_name | tee_name | TEXT | ✅ Exists |
| tee_set_id | tee_set_id | VARCHAR(50) | ✅ Exists |
| tee_set_side | tee_set_side | VARCHAR(20) | ✅ Exists |
| front9_tee_name | front9_tee_name | TEXT | ✅ Exists |
| back9_tee_name | back9_tee_name | TEXT | ✅ Exists |
| differential | differential | NUMERIC(4,1) | ✅ Exists |
| unadjusted_differential | unadjusted_differential | NUMERIC(4,1) | ✅ Exists |
| scaled_up_differential | scaled_up_differential | NUMERIC(4,1) | ✅ Exists |
| adjusted_scaled_up_differential | adjusted_scaled_up_differential | NUMERIC(4,1) | ✅ Exists |
| score_type | score_type | VARCHAR(10) | ✅ Exists |
| penalty | penalty | NUMERIC(4,1) | ✅ Exists |
| penalty_type | penalty_type | VARCHAR(50) | ✅ Exists |
| penalty_method | penalty_method | VARCHAR(50) | ✅ Exists |
| parent_id | parent_id | BIGINT | ✅ Exists |
| course_rating | course_rating | NUMERIC(4,1) | ✅ Exists |
| slope_rating | slope_rating | INTEGER | ✅ Exists |
| score_type_display_full | score_type_display_full | VARCHAR(50) | ✅ Exists |
| score_type_display_short | score_type_display_short | VARCHAR(10) | ✅ Exists |
| edited | edited | BOOLEAN | ✅ Exists |
| posted_at | posted_at | TIMESTAMPTZ | ✅ Exists |
| season_start_date_at | season_start_date_at | VARCHAR(50) | ✅ Exists |
| season_end_date_at | season_end_date_at | VARCHAR(50) | ✅ Exists |
| challenge_available | challenge_available | BOOLEAN | ✅ Exists |
| net_score | net_score | INTEGER | ✅ Exists |
| course_handicap | course_handicap | INTEGER | ✅ Exists |
| course_display_value | course_display_value | TEXT | ✅ Exists |
| ghin_course_name_display | ghin_course_name_display | TEXT | ✅ Exists |
| used | used | BOOLEAN | ✅ Exists |
| revision | revision | BOOLEAN | ✅ Exists |
| pcc | pcc | NUMERIC(3,1) | ✅ Exists |
| adjustments | adjustments | JSONB | ✅ Exists |
| exceptional | exceptional | BOOLEAN | ✅ Exists |
| message_club_authorized | message_club_authorized | TEXT | ✅ Exists |
| is_recent | is_recent | BOOLEAN | ✅ Exists |
| net_score_differential | net_score_differential | NUMERIC(4,1) | ✅ Exists |
| short_course | short_course | BOOLEAN | ✅ Exists |

### Additional database fields (not in JSON):
- user_id (UUID) - Added for user relationship
- created_at (TIMESTAMPTZ) - Added for tracking
- updated_at (TIMESTAMPTZ) - Added for tracking

## Hole Details Array Fields (13 total)

| JSON Field | Database Column | Type | Status |
|------------|-----------------|------|--------|
| id | id | BIGINT | ✅ Exists |
| adjusted_gross_score | adjusted_gross_score | INTEGER | ✅ Exists |
| raw_score | raw_score | INTEGER | ✅ Exists |
| hole_number | hole_number | INTEGER | ✅ Exists |
| par | par | INTEGER | ✅ Exists |
| putts | putts | INTEGER | ✅ Exists |
| fairway_hit | fairway_hit | BOOLEAN | ✅ Exists |
| gir_flag | gir_flag | BOOLEAN | ✅ Exists |
| drive_accuracy | drive_accuracy | VARCHAR(20) | ✅ Exists |
| stroke_allocation | stroke_allocation | INTEGER | ✅ Exists |
| approach_shot_accuracy | approach_shot_accuracy | VARCHAR(20) | ✅ Exists |
| x_hole | x_hole | BOOLEAN | ✅ Exists |
| most_likely_score | most_likely_score | INTEGER | ✅ Exists |

### Additional database fields (not in JSON):
- round_id (BIGINT) - Foreign key reference
- user_id (UUID) - Added for user relationship
- created_at (TIMESTAMPTZ) - Added for tracking
- updated_at (TIMESTAMPTZ) - Added for tracking

## Statistics Object Fields (27 total)

| JSON Field | Database Column | Type | Status |
|------------|-----------------|------|--------|
| putts_total | putts_total | VARCHAR(10) | ✅ Exists |
| one_putt_or_better_percent | one_putt_or_better_percent | VARCHAR(10) | ✅ Exists |
| two_putt_percent | two_putt_percent | VARCHAR(10) | ✅ Exists |
| three_putt_or_worse_percent | three_putt_or_worse_percent | VARCHAR(10) | ✅ Exists |
| two_putt_or_better_percent | two_putt_or_better_percent | VARCHAR(10) | ✅ Exists |
| up_and_downs_total | up_and_downs_total | VARCHAR(10) | ✅ Exists |
| par3s_average | par3s_average | VARCHAR(20) | ✅ Exists |
| par4s_average | par4s_average | VARCHAR(20) | ✅ Exists |
| par5s_average | par5s_average | VARCHAR(20) | ✅ Exists |
| pars_percent | pars_percent | VARCHAR(10) | ✅ Exists |
| birdies_or_better_percent | birdies_or_better_percent | VARCHAR(10) | ✅ Exists |
| bogeys_percent | bogeys_percent | VARCHAR(10) | ✅ Exists |
| double_bogeys_percent | double_bogeys_percent | VARCHAR(10) | ✅ Exists |
| triple_bogeys_or_worse_percent | triple_bogeys_or_worse_percent | VARCHAR(10) | ✅ Exists |
| fairway_hits_percent | fairway_hits_percent | VARCHAR(10) | ✅ Exists |
| missed_left_percent | missed_left_percent | VARCHAR(10) | ✅ Exists |
| missed_right_percent | missed_right_percent | VARCHAR(10) | ✅ Exists |
| missed_long_percent | missed_long_percent | VARCHAR(10) | ✅ Exists |
| missed_short_percent | missed_short_percent | VARCHAR(10) | ✅ Exists |
| gir_percent | gir_percent | VARCHAR(10) | ✅ Exists |
| missed_left_approach_shot_accuracy_percent | missed_left_approach_shot_accuracy_percent | VARCHAR(10) | ✅ Exists |
| missed_right_approach_shot_accuracy_percent | missed_right_approach_shot_accuracy_percent | VARCHAR(10) | ✅ Exists |
| missed_long_approach_shot_accuracy_percent | missed_long_approach_shot_accuracy_percent | VARCHAR(10) | ✅ Exists |
| missed_short_approach_shot_accuracy_percent | missed_short_approach_shot_accuracy_percent | VARCHAR(10) | ✅ Exists |
| missed_general_approach_shot_accuracy_percent | missed_general_approach_shot_accuracy_percent | VARCHAR(10) | ✅ Exists |
| last_stats_update_date | last_stats_update_date | VARCHAR(50) | ✅ Exists |
| last_stats_update_type | last_stats_update_type | VARCHAR(50) | ✅ Exists |

### Additional database fields (not in JSON):
- id (UUID) - Primary key
- round_id (BIGINT) - Foreign key reference
- user_id (UUID) - Added for user relationship
- created_at (TIMESTAMPTZ) - Added for tracking
- updated_at (TIMESTAMPTZ) - Added for tracking

## Summary

✅ **ALL 99 FIELDS FROM THE JSON ARE ACCOUNTED FOR:**
- Round object: 59 fields → All mapped to rounds table
- Hole details: 13 fields → All mapped to hole_details table
- Statistics: 27 fields → All mapped to round_statistics table

✅ **CURRENT DATABASE SCHEMA STATUS:**
- The rounds table has all 59 fields from the JSON
- The hole_details table has all 13 fields from the JSON
- The round_statistics table has all 27 fields from the JSON

✅ **NO MISSING FIELDS** - Every single field from the provided JSON structure is properly mapped to a database column with an appropriate data type.

## Data Type Notes

1. **Nullable fields**: Many fields in the JSON can be null (e.g., front9_adjusted, penalty, etc.). Our schema allows NULL for these fields.

2. **JSONB for adjustments**: The adjustments field is an array in the JSON, stored as JSONB for flexibility.

3. **VARCHAR for statistics**: Statistics fields are stored as VARCHAR because they come as strings in the JSON (e.g., "0.0", "0.28").

4. **Boolean fields**: Fields like is_manual, edited, used, etc. properly map to BOOLEAN type.

5. **Date/Time fields**: 
   - played_at → DATE (just the date portion)
   - posted_at → TIMESTAMPTZ (full timestamp with timezone)