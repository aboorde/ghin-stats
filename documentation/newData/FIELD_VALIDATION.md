# Field Validation - JSON to Database Mapping

This document validates that all fields from the imported JSON are properly mapped to database tables.

## Round Object Fields → rounds table

| JSON Field | Database Field | Type | Notes |
|------------|----------------|------|-------|
| id | id | BIGINT | Primary key |
| order_number | order_number | INTEGER | ✓ |
| score_day_order | score_day_order | INTEGER | ✓ |
| gender | gender | VARCHAR(1) | ✓ |
| status | status | VARCHAR(50) | ✓ |
| is_manual | is_manual | BOOLEAN | ✓ |
| number_of_holes | number_of_holes | INTEGER | ✓ |
| number_of_played_holes | number_of_played_holes | INTEGER | ✓ |
| golfer_id | golfer_id | BIGINT | ✓ |
| facility_name | facility_name | TEXT | ✓ |
| adjusted_gross_score | adjusted_gross_score | INTEGER | ✓ |
| front9_adjusted | front9_adjusted | INTEGER | ✓ |
| back9_adjusted | back9_adjusted | INTEGER | ✓ |
| posted_on_home_course | posted_on_home_course | BOOLEAN | ✓ |
| played_at | played_at | DATE | ✓ |
| front9_slope_rating | front9_slope_rating | NUMERIC(4,1) | ✓ |
| back9_slope_rating | back9_slope_rating | NUMERIC(4,1) | ✓ |
| course_id | course_id | VARCHAR(50) | ✓ |
| course_name | course_name | TEXT | ✓ |
| front9_course_name | front9_course_name | TEXT | ✓ |
| back9_course_name | back9_course_name | TEXT | ✓ |
| front9_course_rating | front9_course_rating | NUMERIC(4,1) | ✓ |
| back9_course_rating | back9_course_rating | NUMERIC(4,1) | ✓ |
| tee_name | tee_name | TEXT | ✓ |
| tee_set_id | tee_set_id | VARCHAR(50) | ✓ |
| tee_set_side | tee_set_side | VARCHAR(20) | ✓ |
| front9_tee_name | front9_tee_name | TEXT | ✓ |
| back9_tee_name | back9_tee_name | TEXT | ✓ |
| differential | differential | NUMERIC(4,1) | ✓ |
| unadjusted_differential | unadjusted_differential | NUMERIC(4,1) | ✓ |
| scaled_up_differential | scaled_up_differential | NUMERIC(4,1) | ✓ |
| adjusted_scaled_up_differential | adjusted_scaled_up_differential | NUMERIC(4,1) | ✓ |
| score_type | score_type | VARCHAR(10) | ✓ |
| penalty | penalty | NUMERIC(4,1) | ✓ |
| penalty_type | penalty_type | VARCHAR(50) | ✓ |
| penalty_method | penalty_method | VARCHAR(50) | ✓ |
| parent_id | parent_id | BIGINT | ✓ |
| course_rating | course_rating | NUMERIC(4,1) | ✓ |
| slope_rating | slope_rating | INTEGER | ✓ |
| score_type_display_full | score_type_display_full | VARCHAR(50) | ✓ |
| score_type_display_short | score_type_display_short | VARCHAR(10) | ✓ |
| edited | edited | BOOLEAN | ✓ |
| posted_at | posted_at | TIMESTAMPTZ | ✓ |
| season_start_date_at | season_start_date_at | VARCHAR(50) | ✓ |
| season_end_date_at | season_end_date_at | VARCHAR(50) | ✓ |
| challenge_available | challenge_available | BOOLEAN | ✓ |
| net_score | net_score | INTEGER | ✓ |
| course_handicap | course_handicap | INTEGER | ✓ |
| course_display_value | course_display_value | TEXT | ✓ |
| ghin_course_name_display | ghin_course_name_display | TEXT | ✓ |
| used | used | BOOLEAN | ✓ |
| revision | revision | BOOLEAN | ✓ |
| pcc | pcc | NUMERIC(3,1) | ✓ |
| adjustments | adjustments | JSONB | ✓ |
| exceptional | exceptional | BOOLEAN | ✓ |
| message_club_authorized | message_club_authorized | TEXT | ✓ |
| is_recent | is_recent | BOOLEAN | ✓ |
| net_score_differential | net_score_differential | NUMERIC(4,1) | ✓ |
| short_course | short_course | BOOLEAN | ✓ |
| revision_group_id | revision_group_id | BIGINT | ✓ |
| rating_id | rating_id | VARCHAR(50) | ✓ |
| - | user_id | UUID | Added for user relationship |
| - | created_at | TIMESTAMPTZ | Added for tracking |
| - | updated_at | TIMESTAMPTZ | Added for tracking |

## Hole Details Array → hole_details table

| JSON Field | Database Field | Type | Notes |
|------------|----------------|------|-------|
| id | id | BIGINT | Primary key |
| adjusted_gross_score | adjusted_gross_score | INTEGER | ✓ |
| raw_score | raw_score | INTEGER | ✓ |
| hole_number | hole_number | INTEGER | ✓ |
| par | par | INTEGER | ✓ |
| putts | putts | INTEGER | ✓ |
| fairway_hit | fairway_hit | BOOLEAN | ✓ |
| gir_flag | gir_flag | BOOLEAN | ✓ |
| drive_accuracy | drive_accuracy | VARCHAR(20) | ✓ |
| stroke_allocation | stroke_allocation | INTEGER | ✓ |
| approach_shot_accuracy | approach_shot_accuracy | VARCHAR(20) | ✓ |
| x_hole | x_hole | BOOLEAN | ✓ |
| most_likely_score | most_likely_score | INTEGER | ✓ |
| - | round_id | BIGINT | Added for relationship |
| - | user_id | UUID | Added for user relationship |
| - | created_at | TIMESTAMPTZ | Added for tracking |
| - | updated_at | TIMESTAMPTZ | Added for tracking |

## Statistics Object → round_statistics table

| JSON Field | Database Field | Type | Notes |
|------------|----------------|------|-------|
| putts_total | putts_total | VARCHAR(10) | ✓ |
| one_putt_or_better_percent | one_putt_or_better_percent | VARCHAR(10) | ✓ |
| two_putt_percent | two_putt_percent | VARCHAR(10) | ✓ |
| three_putt_or_worse_percent | three_putt_or_worse_percent | VARCHAR(10) | ✓ |
| two_putt_or_better_percent | two_putt_or_better_percent | VARCHAR(10) | ✓ |
| up_and_downs_total | up_and_downs_total | VARCHAR(10) | ✓ |
| par3s_average | par3s_average | VARCHAR(20) | ✓ |
| par4s_average | par4s_average | VARCHAR(20) | ✓ |
| par5s_average | par5s_average | VARCHAR(20) | ✓ |
| pars_percent | pars_percent | VARCHAR(10) | ✓ |
| birdies_or_better_percent | birdies_or_better_percent | VARCHAR(10) | ✓ |
| bogeys_percent | bogeys_percent | VARCHAR(10) | ✓ |
| double_bogeys_percent | double_bogeys_percent | VARCHAR(10) | ✓ |
| triple_bogeys_or_worse_percent | triple_bogeys_or_worse_percent | VARCHAR(10) | ✓ |
| fairway_hits_percent | fairway_hits_percent | VARCHAR(10) | ✓ |
| missed_left_percent | missed_left_percent | VARCHAR(10) | ✓ |
| missed_right_percent | missed_right_percent | VARCHAR(10) | ✓ |
| missed_long_percent | missed_long_percent | VARCHAR(10) | ✓ |
| missed_short_percent | missed_short_percent | VARCHAR(10) | ✓ |
| gir_percent | gir_percent | VARCHAR(10) | ✓ |
| missed_left_approach_shot_accuracy_percent | missed_left_approach_shot_accuracy_percent | VARCHAR(10) | ✓ |
| missed_right_approach_shot_accuracy_percent | missed_right_approach_shot_accuracy_percent | VARCHAR(10) | ✓ |
| missed_long_approach_shot_accuracy_percent | missed_long_approach_shot_accuracy_percent | VARCHAR(10) | ✓ |
| missed_short_approach_shot_accuracy_percent | missed_short_approach_shot_accuracy_percent | VARCHAR(10) | ✓ |
| missed_general_approach_shot_accuracy_percent | missed_general_approach_shot_accuracy_percent | VARCHAR(10) | ✓ |
| last_stats_update_date | last_stats_update_date | VARCHAR(50) | ✓ |
| last_stats_update_type | last_stats_update_type | VARCHAR(50) | ✓ |
| - | id | UUID | Added as primary key |
| - | round_id | BIGINT | Added for relationship |
| - | user_id | UUID | Added for user relationship |
| - | created_at | TIMESTAMPTZ | Added for tracking |
| - | updated_at | TIMESTAMPTZ | Added for tracking |

## Summary

✅ **All fields from the JSON structure have been accounted for in the database schema**

- Round object: 59 fields from JSON → All mapped to rounds table
- Hole details array: 13 fields from JSON → All mapped to hole_details table  
- Statistics object: 27 fields from JSON → All mapped to round_statistics table

Additional fields added for database integrity:
- user_id on all tables for user relationship and RLS
- created_at and updated_at timestamps for tracking
- UUID primary key for round_statistics table

The database schema fully supports importing and storing all data from the external API.