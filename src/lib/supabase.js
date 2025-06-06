import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Log environment for debugging
console.log('Initializing Supabase client...', {
  url: supabaseUrl?.substring(0, 30) + '...',
  hasKey: !!supabaseAnonKey,
  environment: window.location.hostname
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'ghin-stats-auth',
    flowType: 'pkce', // PKCE flow for enhanced security
    debug: window.location.hostname === 'localhost' // Debug in dev only
  },
  global: {
    headers: {
      'x-client-info': 'ghin-stats',
      'x-requested-with': 'XMLHttpRequest' // CSRF protection
    }
  },
  // Add timeout for requests
  db: {
    schema: 'public'
  }
});

console.log('Supabase client initialized');

// Verify we're using HTTPS in production
if (window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
  console.warn('🔒 Security Warning: This application should be served over HTTPS in production');
}