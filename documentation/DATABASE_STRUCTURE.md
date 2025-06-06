# Tables in Supabase

# hole_details

| Name | Format | Type |
|------|--------|------|
| id | bigint | number |
| round_id | bigint | number |
| user_id | uuid | string |
| hole_number | integer | number |
| par | integer | number |
| stroke_allocation | integer | number |
| adjusted_gross_score | integer | number |
| raw_score | integer | number |
| most_likely_score | integer | number |
| putts | integer | number |
| fairway_hit | boolean | boolean |
| gir_flag | boolean | boolean |
| drive_accuracy | character varying | string |
| approach_shot_accuracy | character varying | string |
| x_hole | boolean | boolean |
| created_at | timestamp with time zone | string |
| updated_at | timestamp with time zone | string |


# round_statistics

| Name | Format | Type |
|------|--------|------|
| id | uuid | string |
| round_id | bigint | number |
| user_id | uuid | string |
| putts_total | character varying | string |
| one_putt_or_better_percent | character varying | string |
| two_putt_percent | character varying | string |
| three_putt_or_worse_percent | character varying | string |
| two_putt_or_better_percent | character varying | string |
| up_and_downs_total | character varying | string |
| par3s_average | character varying | string |
| par4s_average | character varying | string |
| par5s_average | character varying | string |
| pars_percent | character varying | string |
| birdies_or_better_percent | character varying | string |
| bogeys_percent | character varying | string |
| double_bogeys_percent | character varying | string |
| triple_bogeys_or_worse_percent | character varying | string |
| fairway_hits_percent | character varying | string |
| missed_left_percent | character varying | string |
| missed_right_percent | character varying | string |
| missed_long_percent | character varying | string |
| missed_short_percent | character varying | string |
| gir_percent | character varying | string |
| missed_left_approach_shot_accuracy_percent | character varying | string |
| missed_right_approach_shot_accuracy_percent | character varying | string |
| missed_long_approach_shot_accuracy_percent | character varying | string |
| missed_short_approach_shot_accuracy_percent | character varying | string |
| missed_general_approach_shot_accuracy_percent | character varying | string |
| last_stats_update_date | character varying | string |
| last_stats_update_type | character varying | string |
| created_at | timestamp with time zone | string |
| updated_at | timestamp with time zone | string |

# rounds

| Name | Format | Type |
|------|--------|------|
| id | bigint | number |
| user_id | uuid | string |
| order_number | integer | number |
| score_day_order | integer | number |
| gender | character varying | string |
| status | character varying | string |
| is_manual | boolean | boolean |
| number_of_holes | integer | number |
| number_of_played_holes | integer | number |
| golfer_id | bigint | number |
| facility_name | text | string |
| course_id | character varying | string |
| course_name | text | string |
| front9_course_name | text | string |
| back9_course_name | text | string |
| adjusted_gross_score | integer | number |
| front9_adjusted | integer | number |
| back9_adjusted | integer | number |
| course_rating | numeric | number |
| slope_rating | integer | number |
| front9_course_rating | numeric | number |
| back9_course_rating | numeric | number |
| front9_slope_rating | numeric | number |
| back9_slope_rating | numeric | number |
| tee_name | text | string |
| tee_set_id | character varying | string |
| tee_set_side | character varying | string |
| front9_tee_name | text | string |
| back9_tee_name | text | string |
| differential | numeric | number |
| unadjusted_differential | numeric | number |
| scaled_up_differential | numeric | number |
| adjusted_scaled_up_differential | numeric | number |
| net_score | integer | number |
| net_score_differential | numeric | number |
| course_handicap | integer | number |
| score_type | character varying | string |
| score_type_display_full | character varying | string |
| score_type_display_short | character varying | string |
| penalty | numeric | number |
| penalty_type | character varying | string |
| penalty_method | character varying | string |
| played_at | date | string |
| posted_at | timestamp with time zone | string |
| posted_on_home_course | boolean | boolean |
| season_start_date_at | character varying | string |
| season_end_date_at | character varying | string |
| course_display_value | text | string |
| ghin_course_name_display | text | string |
| edited | boolean | boolean |
| used | boolean | boolean |
| revision | boolean | boolean |
| exceptional | boolean | boolean |
| is_recent | boolean | boolean |
| short_course | boolean | boolean |
| challenge_available | boolean | boolean |
| parent_id | bigint | number |
| pcc | numeric | number |
| adjustments | jsonb | json |
| message_club_authorized | text | string |
| created_at | timestamp with time zone | string |
| updated_at | timestamp with time zone | string |

