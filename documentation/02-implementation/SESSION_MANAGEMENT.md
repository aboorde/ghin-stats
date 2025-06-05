# Session Management Implementation

## Overview
This document describes the session management improvements implemented to prevent authentication timeouts and improve user experience.

## Problem
Users were experiencing session timeouts, requiring them to log in again frequently. The default Supabase configuration wasn't handling token refresh properly.

## Solution Components

### 1. Enhanced Supabase Client Configuration (`src/lib/supabase.js`)
```javascript
{
  auth: {
    autoRefreshToken: true,        // Automatically refresh tokens
    persistSession: true,          // Persist session to localStorage
    detectSessionInUrl: true,      // Handle OAuth callbacks
    storage: window.localStorage,  // Use localStorage for persistence
    storageKey: 'ghin-stats-auth', // Custom storage key
    flowType: 'pkce'              // Use PKCE flow for security
  }
}
```

### 2. Session Monitor Hook (`src/hooks/useSessionMonitor.js`)
- Monitors session health every 2 minutes
- Checks session on window focus
- Automatically refreshes token when expiring soon (within 5 minutes)
- Provides `checkSessionHealth` function for manual checks

### 3. Enhanced Auth Context (`src/contexts/AuthContext.jsx`)
- Added error logging for session operations
- Tracks authentication state changes (TOKEN_REFRESHED, SIGNED_OUT)
- Provides `refreshSession` helper function
- Better error handling for sign in/out operations

### 4. Visual Session Status (`src/components/SessionStatus.jsx`)
- Shows remaining session time
- Visual indicator (green = healthy, yellow = expiring soon)
- Manual refresh button
- Updates every 30 seconds

### 5. Session Debug Panel (`src/components/SessionDebug.jsx`)
- Development-only debug panel
- Shows detailed session information
- Displays token expiration times
- Shows auth configuration
- Updates every 5 seconds when open

### 6. Request Interceptor (`src/utils/supabaseInterceptor.js`)
- Wraps Supabase queries with retry logic
- Detects JWT errors and refreshes token
- Retries failed requests after refresh
- Signs out user if refresh fails

## Session Lifecycle

1. **Initial Load**: Auth context gets session from localStorage
2. **Monitoring**: Session monitor checks health every 2 minutes
3. **Auto-Refresh**: Token refreshed when < 5 minutes remaining
4. **Visual Feedback**: Status indicator shows session health
5. **Error Recovery**: Failed requests trigger token refresh
6. **Manual Control**: Users can manually refresh session

## Default Session Durations
- **Access Token**: 1 hour (3600 seconds)
- **Refresh Token**: Longer duration (typically days/weeks)
- **Auto-Refresh**: Triggers when < 5 minutes remaining

## Usage

### In Components
```javascript
import { useAuth } from '../contexts/AuthContext'

const MyComponent = () => {
  const { user, refreshSession } = useAuth()
  
  // Manual refresh if needed
  const handleRefresh = async () => {
    await refreshSession()
  }
}
```

### With Retry Logic
```javascript
import { supabaseWithRetry } from '../utils/supabaseInterceptor'

// Use instead of regular supabase client for automatic retry
const { data, error } = await supabaseWithRetry
  .from('scores')
  .select('*')
```

## Troubleshooting

### Session Still Timing Out
1. Check browser console for auth state changes
2. Look for "Session expiring soon" messages
3. Verify localStorage has 'ghin-stats-auth' key
4. Check Session Debug panel in development

### Token Refresh Failing
1. Check network tab for 401 errors
2. Look for "JWT error detected" in console
3. Verify refresh token hasn't expired
4. Check Supabase dashboard for auth settings

## Future Improvements
1. Add session timeout warning modal
2. Implement background sync for offline support
3. Add session analytics/monitoring
4. Implement remember me functionality
5. Add biometric authentication support