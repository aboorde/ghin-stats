# Creating Auth Users for Existing Golfer Data

This guide walks you through creating Supabase Auth users and linking them to existing golfer_ids in your GHIN stats data.

## Step 1: Identify Golfers Needing User Accounts

First, run this query to see which golfer_ids need user accounts:

```sql
-- Find all unique golfer_ids without associated users
SELECT 
    s.golfer_id,
    COUNT(DISTINCT s.id) as total_rounds,
    MIN(s.played_at) as first_round,
    MAX(s.played_at) as last_round,
    ROUND(AVG(s.adjusted_gross_score), 1) as avg_score,
    COUNT(DISTINCT s.course_name) as courses_played,
    ARRAY_AGG(DISTINCT s.course_name) as course_list
FROM scores s
LEFT JOIN users u ON s.golfer_id = u.golfer_id
WHERE u.id IS NULL
GROUP BY s.golfer_id
ORDER BY total_rounds DESC;
```

## Step 2: Create Auth Users in Supabase Dashboard

### Method A: Using Supabase Dashboard (Recommended for Few Users)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Fill in:
   - Email: `golfer.11384483@example.com` (use pattern for tracking)
   - Password: Generate a secure temporary password
   - Auto Confirm User: ✓ (check this)
5. Click **Create user**
6. Copy the generated User UID

### Method B: Using Supabase SQL Editor (For Bulk Creation)

Run this in the SQL editor to create auth users programmatically:

```sql
-- Function to create auth user and profile
CREATE OR REPLACE FUNCTION create_auth_user_for_golfer(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_golfer_id BIGINT
) RETURNS TABLE (
    auth_id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    profile_created BOOLEAN
) AS $$
DECLARE
    v_auth_id UUID;
    v_encrypted_password TEXT;
BEGIN
    -- Create auth user
    v_encrypted_password := crypt(p_password, gen_salt('bf'));
    
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        gen_random_uuid(),
        p_email,
        v_encrypted_password,
        now(), -- Auto-confirm email
        now(),
        now(),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
        jsonb_build_object('full_name', p_full_name, 'golfer_id', p_golfer_id)
    )
    RETURNING id INTO v_auth_id;
    
    -- Create user profile
    INSERT INTO public.users (
        id,
        email,
        full_name,
        golfer_id,
        created_at,
        updated_at
    ) VALUES (
        v_auth_id,
        p_email,
        p_full_name,
        p_golfer_id,
        now(),
        now()
    );
    
    RETURN QUERY SELECT 
        v_auth_id,
        p_email,
        now(),
        true;
        
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'User with email % or golfer_id % already exists', p_email, p_golfer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Step 3: Link Auth Users to Golfer Data

### For Individual User (Manual Process)

After creating the auth user in the dashboard:

```sql
-- Insert user profile record
INSERT INTO public.users (
    id,                    -- Use the UUID from auth.users
    email,
    full_name,
    golfer_id,
    ghin_number,          -- Optional: Add if known
    home_course_name,     -- Optional: Add if known
    created_at,
    updated_at
) VALUES (
    'auth-user-uuid-here', -- From Step 2
    'golfer.213@example.com',
    'Your Name',
    123,             -- Your golfer_id
    NULL,                 -- GHIN number if known
    'Pine Valley CC',     -- Home course if known
    now(),
    now()
);
```

### For Bulk User Creation

Use this script to create multiple users at once:

```sql
-- Bulk create users for specific golfer_ids
DO $$
DECLARE
    v_golfer RECORD;
    v_result RECORD;
BEGIN
    -- Define golfers to create users for
    FOR v_golfer IN 
        SELECT * FROM (VALUES
            (123, 'john.doe@example.com', 'John Doe', 'temporary123'),
            (234, 'jane.smith@example.com', 'Jane Smith', 'temporary456')
            -- Add more as needed
        ) AS t(golfer_id, email, full_name, temp_password)
    LOOP
        BEGIN
            -- Create auth user and profile
            SELECT * INTO v_result
            FROM create_auth_user_for_golfer(
                v_golfer.email,
                v_golfer.temp_password,
                v_golfer.full_name,
                v_golfer.golfer_id
            );
            
            RAISE NOTICE 'Created user % for golfer_id %', v_result.auth_id, v_golfer.golfer_id;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to create user for golfer_id %: %', v_golfer.golfer_id, SQLERRM;
        END;
    END LOOP;
END $$;
```

## Step 4: Verify User Creation

Run these queries to verify users were created correctly:

```sql
-- Check auth.users (need service role)
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data->>'golfer_id' as golfer_id
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Check public.users
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.golfer_id,
    u.created_at,
    COUNT(s.id) as existing_scores
FROM public.users u
LEFT JOIN scores s ON u.golfer_id = s.golfer_id
GROUP BY u.id, u.email, u.full_name, u.golfer_id, u.created_at
ORDER BY u.created_at DESC;
```

## Step 5: Run Data Migration

Once users are created, run the data migration to assign ownership:

```sql
-- Run the migration
SELECT * FROM migrate_golf_data_ownership();

-- Check results
SELECT * FROM verify_data_migration();

-- Review any orphaned data
SELECT * FROM get_orphaned_data_summary();
```

## Important Security Notes

1. **Temporary Passwords**: Always use secure temporary passwords and require users to change them on first login
2. **Email Verification**: Consider sending welcome emails with password reset links
3. **GHIN Verification**: You may want to verify GHIN numbers before creating accounts
4. **Data Privacy**: Ensure you have permission to create accounts for these golfers

## Troubleshooting

### Issue: Email Already Exists
```sql
-- Check if email exists
SELECT id, email FROM auth.users WHERE email = 'test@example.com';

-- If needed, update to unique email
UPDATE auth.users 
SET email = 'golfer.11384483.2@example.com' 
WHERE id = 'user-uuid';
```

### Issue: Golfer ID Already Assigned
```sql
-- Check which user has the golfer_id
SELECT * FROM users WHERE golfer_id = 11384483;

-- If incorrect, you can update it
UPDATE users 
SET golfer_id = NULL 
WHERE id = 'old-user-uuid';
```

### Issue: Auth User Without Profile
```sql
-- Find auth users without profiles
SELECT 
    au.id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Create missing profile
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'Unknown'),
    now(),
    now()
FROM auth.users
WHERE id = 'auth-user-uuid';
```

## Next Steps

After creating users and running the migration:

1. **Send Welcome Emails**: Notify users about their accounts
2. **Set Up Password Reset**: Allow users to set their own passwords
3. **Update Frontend**: Add login/authentication flow
4. **Test Access**: Verify users can see only their own data
5. **Monitor**: Check for any new orphaned data regularly

## Quick Reference

```sql
-- Most common scenario: Create one user
-- 1. In Supabase Dashboard: Create auth user
-- 2. Run this SQL with the auth UUID:
INSERT INTO public.users (
    id, email, full_name, golfer_id, created_at, updated_at
) VALUES (
    'paste-auth-uuid-here',
    'user@example.com',
    'User Full Name',
    123,
    now(),
    now()
);

-- 3. Run migration
SELECT * FROM migrate_golf_data_ownership();

-- 4. Verify
SELECT COUNT(*) FROM scores WHERE golfer_id = 123 AND user_id IS NOT NULL;
```