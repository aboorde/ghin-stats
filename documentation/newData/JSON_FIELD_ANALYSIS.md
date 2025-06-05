# JSON Field Analysis for Golf Round Data

This document provides a comprehensive analysis of every field in the golf round JSON structure and verifies that our SQL migrations properly account for each field.

## Round Object (Top Level)

### ✅ Fields Covered in rounds table:

1. **id** → `id BIGINT PRIMARY KEY` ✅
2. **order_number** → `order_number INTEGER` ✅
3. **score_day_order** → `score_day_order INTEGER` ✅
4. **gender** → `gender VARCHAR(1)` ✅
5. **status** → `status VARCHAR(50)` ✅
6. **manual** → `is_manual BOOLEAN` ✅
7. **number_of_holes** → `number_of_holes INTEGER` ✅
8. **number_of_played_holes** → `number_of_played_holes INTEGER` ✅
9. **golfer_id** → `golfer_id BIGINT` ✅
10. **facility_name** → `facility_name TEXT` ✅
11. **course_id** → `course_id VARCHAR(50)` ✅
12. **course_name** → `course_name TEXT` ✅
13. **front9_course_name** → `front9_course_name TEXT` ✅
14. **back9_course_name** → `back9_course_name TEXT` ✅
15. **adjusted_gross_score** → `adjusted_gross_score INTEGER` ✅
16. **front9_adjusted** → `front9_adjusted INTEGER` ✅
17. **back9_adjusted** → `back9_adjusted INTEGER` ✅
18. **course_rating** → `course_rating NUMERIC(4,1)` ✅
19. **slope_rating** → `slope_rating INTEGER` ✅
20. **front9_course_rating** → `front9_course_rating NUMERIC(4,1)` ✅
21. **back9_course_rating** → `back9_course_rating NUMERIC(4,1)` ✅
22. **front9_slope_rating** → `front9_slope_rating NUMERIC(4,1)` ✅
23. **back9_slope_rating** → `back9_slope_rating NUMERIC(4,1)` ✅
24. **tee_name** → `tee_name TEXT` ✅
25. **tee_set_id** → `tee_set_id VARCHAR(50)` ✅
26. **tee_set_side** → `tee_set_side VARCHAR(20)` ✅
27. **front9_tee_name** → `front9_tee_name TEXT` ✅
28. **back9_tee_name** → `back9_tee_name TEXT` ✅
29. **differential** → `differential NUMERIC(4,1)` ✅
30. **unadjusted_differential** → `unadjusted_differential NUMERIC(4,1)` ✅
31. **scaled_up_differential** → `scaled_up_differential NUMERIC(4,1)` ✅
32. **adjusted_scaled_up_differential** → `adjusted_scaled_up_differential NUMERIC(4,1)` ✅
33. **net_score** → `net_score INTEGER` ✅
34. **net_score_differential** → `net_score_differential NUMERIC(4,1)` ✅
35. **course_handicap** → `course_handicap INTEGER` ✅
36. **score_type** → `score_type VARCHAR(10)` ✅
37. **score_type_display_full** → `score_type_display_full VARCHAR(50)` ✅
38. **score_type_display_short** → `score_type_display_short VARCHAR(10)` ✅
39. **penalty** → `penalty NUMERIC(4,1)` ✅
40. **penalty_type** → `penalty_type VARCHAR(50)` ✅
41. **penalty_method** → `penalty_method VARCHAR(50)` ✅
42. **played_at** → `played_at DATE` ✅
43. **posted_at** → `posted_at TIMESTAMPTZ` ✅
44. **posted_on_home_course** → `posted_on_home_course BOOLEAN` ✅
45. **season_start_date_at** → `season_start_date_at VARCHAR(50)` ✅
46. **season_end_date_at** → `season_end_date_at VARCHAR(50)` ✅
47. **course_display_value** → `course_display_value TEXT` ✅
48. **ghin_course_name_display** → `ghin_course_name_display TEXT` ✅
49. **edited** → `edited BOOLEAN` ✅
50. **used** → `used BOOLEAN` ✅
51. **revision** → `revision BOOLEAN` ✅
52. **exceptional** → `exceptional BOOLEAN` ✅
53. **is_recent** → `is_recent BOOLEAN` ✅
54. **short_course** → `short_course BOOLEAN` ✅
55. **challenge_available** → `challenge_available BOOLEAN` ✅
56. **parent_id** → `parent_id BIGINT` ✅
57. **pcc** → `pcc NUMERIC(3,1)` ✅
58. **adjustments** → `adjustments JSONB` ✅
59. **message_club_authorized** → `message_club_authorized TEXT` ✅

### ⚠️ Fields in JSON but NOT in migration:

1. **revision_group_id** - Missing from rounds table
2. **rating_id** - Missing from rounds table

## Hole Details Array

### ✅ Fields Covered in hole_details table:

1. **id** → `id BIGINT PRIMARY KEY` ✅
2. **hole_number** → `hole_number INTEGER` ✅
3. **par** → `par INTEGER` ✅
4. **stroke_allocation** → `stroke_allocation INTEGER` ✅
5. **adjusted_gross_score** → `adjusted_gross_score INTEGER` ✅
6. **raw_score** → `raw_score INTEGER` ✅
7. **most_likely_score** → `most_likely_score INTEGER` ✅
8. **putts** → `putts INTEGER` ✅
9. **fairway_hit** → `fairway_hit BOOLEAN` ✅
10. **gir_flag** → `gir_flag BOOLEAN` ✅
11. **drive_accuracy** → `drive_accuracy VARCHAR(20)` ✅
12. **approach_shot_accuracy** → `approach_shot_accuracy VARCHAR(20)` ✅
13. **x_hole** → `x_hole BOOLEAN` ✅

### ⚠️ Fields in JSON but NOT in migration:

None - All hole_details fields are covered!

## Statistics Object

### ✅ Fields Covered in round_statistics table:

1. **putts_total** → `putts_total VARCHAR(10)` ✅
2. **one_putt_or_better_percent** → `one_putt_or_better_percent VARCHAR(10)` ✅
3. **two_putt_percent** → `two_putt_percent VARCHAR(10)` ✅
4. **three_putt_or_worse_percent** → `three_putt_or_worse_percent VARCHAR(10)` ✅
5. **two_putt_or_better_percent** → `two_putt_or_better_percent VARCHAR(10)` ✅
6. **up_and_downs_total** → `up_and_downs_total VARCHAR(10)` ✅
7. **par3s_average** → `par3s_average VARCHAR(20)` ✅
8. **par4s_average** → `par4s_average VARCHAR(20)` ✅
9. **par5s_average** → `par5s_average VARCHAR(20)` ✅
10. **pars_percent** → `pars_percent VARCHAR(10)` ✅
11. **birdies_or_better_percent** → `birdies_or_better_percent VARCHAR(10)` ✅
12. **bogeys_percent** → `bogeys_percent VARCHAR(10)` ✅
13. **double_bogeys_percent** → `double_bogeys_percent VARCHAR(10)` ✅
14. **triple_bogeys_or_worse_percent** → `triple_bogeys_or_worse_percent VARCHAR(10)` ✅
15. **fairway_hits_percent** → `fairway_hits_percent VARCHAR(10)` ✅
16. **missed_left_percent** → `missed_left_percent VARCHAR(10)` ✅
17. **missed_right_percent** → `missed_right_percent VARCHAR(10)` ✅
18. **missed_long_percent** → `missed_long_percent VARCHAR(10)` ✅
19. **missed_short_percent** → `missed_short_percent VARCHAR(10)` ✅
20. **gir_percent** → `gir_percent VARCHAR(10)` ✅
21. **missed_left_approach_shot_accuracy_percent** → `missed_left_approach_shot_accuracy_percent VARCHAR(10)` ✅
22. **missed_right_approach_shot_accuracy_percent** → `missed_right_approach_shot_accuracy_percent VARCHAR(10)` ✅
23. **missed_long_approach_shot_accuracy_percent** → `missed_long_approach_shot_accuracy_percent VARCHAR(10)` ✅
24. **missed_short_approach_shot_accuracy_percent** → `missed_short_approach_shot_accuracy_percent VARCHAR(10)` ✅
25. **missed_general_approach_shot_accuracy_percent** → `missed_general_approach_shot_accuracy_percent VARCHAR(10)` ✅
26. **last_stats_update_date** → `last_stats_update_date VARCHAR(50)` ✅
27. **last_stats_update_type** → `last_stats_update_type VARCHAR(50)` ✅

### ⚠️ Fields in JSON but NOT in migration:

None - All statistics fields are covered!

## Summary

### Missing Fields that Need to be Added:

1. **rounds table**:
   - `revision_group_id` (appears to be a grouping identifier for related revisions)
   - `rating_id` (appears to be an identifier for the rating system used)

### Recommendations:

1. Add the two missing fields to the rounds table migration
2. Consider the data types:
   - `revision_group_id` - Should likely be `BIGINT` to match other ID fields
   - `rating_id` - Should likely be `VARCHAR(50)` or `BIGINT` depending on the format

3. All other fields are properly accounted for in the migrations
4. The field mappings are consistent and appropriate
5. Data types chosen are suitable for the expected data

## Next Steps:

1. Update `001_create_rounds_table.sql` to include the missing fields
2. Update `004_combined_migration.sql` to include the missing fields
3. Test the import process with sample data to ensure all fields map correctly