import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'ghin-stats-auth',
    flowType: 'pkce', // PKCE flow for enhanced security
    debug: false // Ensure debug is off in production
  },
  global: {
    headers: {
      'x-client-info': 'ghin-stats',
      'x-requested-with': 'XMLHttpRequest' // CSRF protection
    }
  }
});

// Verify we're using HTTPS in production
if (window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
  console.warn('🔒 Security Warning: This application should be served over HTTPS in production');
}