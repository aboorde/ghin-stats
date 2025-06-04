# Secure Data Migration Guide

## Overview

This guide covers the secure data migration system for assigning ownership of existing GHIN golf data to users. The system provides comprehensive tracking, rollback capabilities, and orphaned data management.

## Migration Components

### 1. Core Migration File: `secure_data_migration.sql`
- Adds user_id columns to all golf data tables
- Creates migration tracking and orphaned data tables
- Implements secure data assignment with logging
- Provides rollback functionality
- Updates RLS policies for better performance

### 2. Admin Interface: `orphaned_data_admin.sql`
- Admin views for orphaned data management
- Bulk assignment functions
- User creation with automatic data assignment
- Reporting and monitoring tools

## Pre-Migration Checklist

Before running the migration:

1. **Backup your database**
   ```sql
   -- Use Supabase dashboard or pg_dump
   ```

2. **Create auth users** for existing golfers
   ```sql
   -- Check which golfer_ids need users
   SELECT DISTINCT golfer_id, COUNT(*) as rounds
   FROM scores
   WHERE golfer_id NOT IN (SELECT golfer_id FROM users WHERE golfer_id IS NOT NULL)
   GROUP BY golfer_id
   ORDER BY rounds DESC;
   ```

3. **Review the migration plan**
   - Understand which data will be assigned
   - Identify potential orphaned records

## Running the Migration

### Step 1: Execute the Main Migration
```sql
-- Run the entire migration file
\i secure_data_migration.sql

-- Or apply via Supabase migration
SELECT * FROM migrate_golf_data_ownership();
```

### Step 2: Review Migration Results
```sql
-- Check migration status
SELECT * FROM admin_migration_status;

-- Verify data integrity
SELECT * FROM verify_data_migration();

-- Review orphaned data
SELECT * FROM get_orphaned_data_summary();
```

### Step 3: Apply Admin Functions
```sql
-- Run the admin interface file
\i orphaned_data_admin.sql

-- Generate orphaned data report
SELECT * FROM generate_orphaned_data_report();
```

## Managing Orphaned Data

### View Orphaned Records

```sql
-- Summary by golfer with potential matches
SELECT * FROM admin_orphaned_golfer_summary;

-- Detailed orphaned scores
SELECT * FROM admin_orphaned_scores_detail
WHERE golfer_id = 123;

-- Check for new orphans
SELECT * FROM check_for_new_orphans(now() - INTERVAL '7 days');
```

### Assign Orphaned Data

#### Option 1: Assign Individual Records
```sql
-- Assign a single orphaned record
SELECT assign_orphaned_data_to_user(
    'orphan-uuid-here',  -- orphaned record id
    'user-uuid-here',    -- target user id
    'Manual assignment by admin'
);
```

#### Option 2: Bulk Assign by Golfer ID
```sql
-- Assign all orphaned data for a golfer
SELECT * FROM bulk_assign_golfer_data(
    123,           -- golfer_id
    'user-uuid-here',   -- target user id
    'Bulk assignment for historical data'
);
```

#### Option 3: Create User and Assign
```sql
-- Create new user and auto-assign orphaned data
SELECT create_user_for_orphaned_golfer(
    'user@example.com',
    'John Doe',
    123,           -- golfer_id
    'auth-user-uuid'    -- optional auth.users id
);
```

### Recover Orphaned Score with Relations
```sql
-- Recover a score and all its related data
SELECT recover_orphaned_score(
    'orphan-uuid-here',
    'user-uuid-here'
);
```

## Rollback Procedures

If you need to rollback the migration:

```sql
-- Get migration ID
SELECT id, started_at, completed_at, status
FROM migration_history
WHERE migration_name = 'data_ownership_assignment'
ORDER BY started_at DESC;

-- Rollback specific migration
SELECT rollback_data_migration('migration-uuid-here');

-- Verify rollback
SELECT 
    (SELECT COUNT(*) FROM scores WHERE user_id IS NOT NULL) as assigned_scores,
    (SELECT COUNT(*) FROM scores WHERE user_id IS NULL) as unassigned_scores;
```

## RLS Policy Management

### Check RLS Status
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('scores', 'hole_details', 'statistics', 'adjustments');

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

### Test RLS Policies
```sql
-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'your-user-uuid';

-- Should only see own scores
SELECT COUNT(*) FROM scores;

-- Reset role
RESET ROLE;
```

## Performance Optimization

### Indexes Created
- `idx_scores_user_id` - Fast user data lookup
- `idx_scores_user_golfer` - Composite for RLS queries
- `idx_scores_user_visibility` - Partial index for public profiles
- `idx_scores_no_user` - Partial index for orphaned data

### Query Performance
```sql
-- Check query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM scores 
WHERE user_id = 'user-uuid-here';

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Monitoring and Maintenance

### Regular Checks
```sql
-- Weekly orphan check
CREATE OR REPLACE FUNCTION weekly_orphan_report()
RETURNS void AS $$
DECLARE
    v_new_orphans INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_new_orphans
    FROM check_for_new_orphans(now() - INTERVAL '7 days');
    
    IF v_new_orphans > 0 THEN
        RAISE NOTICE 'Found % new orphaned records in the last week', v_new_orphans;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### Data Integrity Verification
```sql
-- Run monthly integrity check
SELECT * FROM verify_data_migration();

-- Check for inconsistencies
SELECT 
    'Scores without hole_details' as issue,
    COUNT(*) as count
FROM scores s
WHERE NOT EXISTS (
    SELECT 1 FROM hole_details hd
    WHERE hd.score_id = s.id
)
AND s.number_of_holes = 18;
```

## Common Issues and Solutions

### Issue 1: User Already Has Different Golfer ID
```sql
-- Update user's golfer_id before assignment
UPDATE users 
SET golfer_id = 123 
WHERE id = 'user-uuid' 
AND golfer_id IS NULL;
```

### Issue 2: Duplicate User Assignments
```sql
-- Find duplicate assignments
SELECT golfer_id, array_agg(DISTINCT user_id) as user_ids
FROM scores
WHERE user_id IS NOT NULL
GROUP BY golfer_id
HAVING COUNT(DISTINCT user_id) > 1;
```

### Issue 3: Missing Related Data
```sql
-- Find scores missing hole_details
SELECT s.id, s.played_at, s.course_name
FROM scores s
WHERE s.user_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM hole_details hd
    WHERE hd.score_id = s.id
);
```

## Best Practices

1. **Always backup before migration**
   - Use Supabase's backup feature
   - Export critical tables separately

2. **Run in test environment first**
   - Create a branch database
   - Test the full migration process

3. **Monitor after migration**
   - Check for new orphaned data regularly
   - Verify RLS policies aren't blocking legitimate access

4. **Document decisions**
   - Keep notes on why certain data was assigned
   - Document any manual interventions

5. **Gradual rollout**
   - Migrate one golfer at a time if needed
   - Verify each step before proceeding

## Security Considerations

1. **RLS Enforcement**
   - All tables have RLS enabled
   - Policies use user_id for efficient filtering
   - Service role bypasses RLS for admin tasks

2. **Audit Trail**
   - Migration history tracks all operations
   - Orphaned data assignments are logged
   - Can trace who assigned what and when

3. **Data Privacy**
   - Users only see their own data
   - Public profiles require explicit opt-in
   - Admin functions require service role

## Next Steps After Migration

1. **Update Frontend**
   - Add authentication flow
   - Update API calls to use auth tokens
   - Handle user sessions

2. **Test User Access**
   - Verify users can see their data
   - Test public profile visibility
   - Ensure no data leakage

3. **Set Up Monitoring**
   - Weekly orphan reports
   - Performance monitoring
   - Error tracking

4. **Plan for Future Data**
   - Ensure new scores get user_id
   - Update import processes
   - Handle edge cases

## Emergency Contacts

If you encounter issues:
1. Check migration logs in `migration_history` table
2. Review error messages in `orphaned_golf_data.reason`
3. Use rollback function if needed
4. Keep backup restore procedures handy

Remember: The migration is designed to be safe and reversible. Take your time and verify each step.