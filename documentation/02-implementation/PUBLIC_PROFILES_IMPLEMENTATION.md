# Public Profiles Implementation

## Overview
This feature allows golfers to make their profiles public so that anyone can browse and view their golf statistics without logging in.

## Implementation Details

### 1. Components Created/Modified

#### **PublicProfilesList.jsx** (New)
- Displays a grid of all public profiles
- Shows golfer name, home course, handicap (if allowed), and sharing preferences
- Links to individual profile pages
- Accessible at `/profiles/public`

#### **Profile.jsx** (Modified)
- Added privacy controls based on display settings
- Shows `RestrictedView` component when data is not shared
- Added "Back to Profiles" button for anonymous users
- Respects `display_handicap`, `display_scores`, and `display_statistics` settings

#### **Login.jsx** (Modified)
- Updated "Browse Public Profiles" link to use React Router
- Changed route from `/profile/public` to `/profiles/public`

#### **App.jsx** (Modified)
- Added route for `/profiles/public` to show PublicProfilesList
- Imported PublicProfilesList component

### 2. Database Privacy Settings

The `users` table has the following privacy-related columns:
- `profile_visibility`: 'private' or 'public' - Controls if profile appears in public list
- `display_handicap`: boolean - Controls if handicap is shown publicly
- `display_scores`: boolean - Controls if round-by-round and hole-by-hole data is shown
- `display_statistics`: boolean - Controls if course summary and yearly analysis is shown

### 3. Row Level Security (RLS) Policies

Created policies to allow anonymous access to public data:

#### **Users Table**
```sql
CREATE POLICY "Public profiles are viewable by everyone"
ON public.users FOR SELECT
USING (
    auth.uid() = id OR profile_visibility = 'public'
);
```

#### **Scores/Hole Details/Statistics Tables**
The policies check if the associated user has made their profile public AND has enabled the specific data type to be shown.

### 4. User Flow

1. **Anonymous User**:
   - Visits login page
   - Clicks "Browse Public Profiles →"
   - Sees list of public profiles with basic info
   - Clicks on a profile to view details
   - Sees only the data that golfer has chosen to share

2. **Profile Owner**:
   - Can always see all their own data
   - Has "Edit Profile" button to change privacy settings
   - Settings are managed in the Settings component

### 5. Privacy Respecting Features

- **Handicap**: Only shown if `display_handicap` is true
- **Scores**: Round-by-round and hole-by-hole views restricted if `display_scores` is false
- **Statistics**: Course summary and yearly analysis restricted if `display_statistics` is false
- **Restricted View**: Shows a lock icon and message when data is not shared

## SQL Migration Scripts

### 1. **public_profiles_rls.sql**
Main RLS policy setup for public profile access. Run this if your tables have `user_id` columns.

### 2. **check_public_profiles_schema.sql**
Checks your schema and creates appropriate RLS policies based on whether tables have `user_id` or use `golfer_id` for relationships.

## Setup Instructions

1. **Run the appropriate SQL migration**:
   ```sql
   -- First check your schema
   \i check_public_profiles_schema.sql
   
   -- If you have user_id columns, run:
   \i public_profiles_rls.sql
   ```

2. **Enable anonymous access in Supabase**:
   - Go to Authentication → Policies
   - Ensure anonymous access is enabled for your project

3. **Update user privacy settings**:
   ```sql
   -- Make a user's profile public
   UPDATE public.users 
   SET profile_visibility = 'public',
       display_handicap = true,
       display_scores = true,
       display_statistics = true
   WHERE email = 'user@example.com';
   ```

## Testing

1. **As anonymous user**:
   - Navigate to `/profiles/public` (or click link from login page)
   - Verify you can see list of public profiles
   - Click on a profile and verify you can only see allowed data

2. **As authenticated user**:
   - Verify you can see all your own data
   - Check that privacy settings in Settings component work
   - Verify other users' private data is not visible

## Security Considerations

- RLS policies ensure data access is properly restricted
- No sensitive data (email, GHIN number) is shown for public profiles unless explicitly allowed
- Users have granular control over what data is shared
- Anonymous users can only read data, not modify anything

## Future Enhancements

1. **Search/Filter**: Add ability to search profiles by name or filter by home course
2. **Social Features**: Allow following other golfers
3. **Comparison**: Compare your stats with public profiles
4. **Privacy Presets**: Quick settings like "Share Everything" or "Private"
5. **Profile URLs**: Custom URLs like `/golfer/username` instead of UUIDs