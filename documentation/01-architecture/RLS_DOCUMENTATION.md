# Row Level Security (RLS) Documentation

## Overview
Row Level Security has been successfully implemented across all tables in the GHIN Stats application. This ensures that users can only access their own data and view public data according to privacy settings.

## RLS Status by Table

| Table | RLS Enabled | Policy Count | Description |
|-------|-------------|--------------|-------------|
| users | ✅ | 4 | User profiles with privacy controls |
| user_sessions | ✅ | 3 | Session management |
| subscriptions | ✅ | 2 | Payment and subscription data |
| scores | ✅ | 8 | Golf round scores |
| hole_details | ✅ | 6 | Hole-by-hole scoring data |
| statistics | ✅ | 6 | Round statistics |
| adjustments | ✅ | 6 | Score adjustments |
| audit_logs | ✅ | 2 | Audit trail |

## Policy Details

### 1. Users Table Policies
- **Users can view own profile**: Users always see their own profile
- **Users can view public profiles**: Public profiles visible to all authenticated users
- **Users can update own profile**: Users can edit their own data (restricted fields)
- **Service role can manage users**: Backend can manage all user operations

### 2. Scores & Golf Data Policies
- **Own data access**: Users have full CRUD access to their own golf data
- **Public data access**: Users can view scores from public profiles where `display_scores = true`
- **Data ownership**: Based on `golfer_id` linking between users and scores

### 3. Privacy Controls
Users control data visibility through:
- `profile_visibility`: 'private' or 'public'
- `display_handicap`: Show/hide handicap on public profile
- `display_scores`: Show/hide detailed scores on public profile

### 4. Security Functions
- `user_owns_score(score_id)`: Check score ownership
- `score_is_public(score_id)`: Check if score is publicly viewable
- `get_current_user_golfer_id()`: Get current user's golfer_id
- `has_premium_access(user_uuid)`: Check subscription status

### 5. Helper Views
- `my_scores`: Filtered view of user's own scores
- `public_leaderboard`: Public rankings respecting privacy settings
- `active_users`: Active users with round counts
- `user_subscription_status`: Subscription information

## Testing RLS

### Test User Access to Own Data
```sql
-- Set role to authenticated user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'your-user-uuid';

-- Should return only user's own scores
SELECT * FROM scores;
```

### Test Public Profile Access
```sql
-- Should return only public profiles
SELECT * FROM users WHERE profile_visibility = 'public';
```

### Test Service Role Access
```sql
-- Service role bypasses RLS
SET ROLE service_role;
SELECT * FROM users; -- Returns all users
```

## Important Notes

### For Development
- RLS is enforced for all database connections except service_role
- Use service_role sparingly and only for administrative tasks
- Always test with authenticated role to ensure policies work

### For Production
1. Remove the `bypass_rls_for_testing()` function
2. Ensure all API calls use proper authentication
3. Monitor audit_logs for suspicious activity
4. Regularly review and update policies as needed

### Performance Considerations
- Policies add overhead to queries
- Indexes on `user_id`, `golfer_id` are crucial
- Complex policies may impact query performance
- Consider materialized views for heavy aggregations

## Migration Checklist

Before going live:
- [ ] Create auth users for existing golfer_ids
- [ ] Run `link_existing_data_migration.sql` to add user_id foreign keys
- [ ] Test all CRUD operations as authenticated user
- [ ] Verify public/private data separation
- [ ] Remove development bypass functions
- [ ] Set up monitoring for policy violations
- [ ] Document any custom policies for new features

## Troubleshooting

### Common Issues

1. **"New row violates row-level security policy"**
   - Check user is authenticated
   - Verify user owns the parent record
   - Ensure golfer_id matches

2. **"No rows returned" when data exists**
   - Check RLS policies on the table
   - Verify user authentication
   - Check data ownership

3. **Performance degradation**
   - Review policy complexity
   - Add appropriate indexes
   - Consider policy optimization

### Debug Queries
```sql
-- Check current user
SELECT auth.uid();

-- Check user's golfer_id
SELECT golfer_id FROM users WHERE id = auth.uid();

-- Test specific policy
SELECT * FROM scores WHERE (
    auth.uid() IN (
        SELECT id FROM users WHERE golfer_id = scores.golfer_id
    )
);
```