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
  environment: window.location.hostname,
  protocol: window.location.protocol
});

// Create client with GitHub Pages-friendly settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable URL detection on GitHub Pages
    storage: window.localStorage,
    storageKey: 'ghin-stats-auth',
    flowType: 'pkce', // Use PKCE for better security
    debug: window.location.hostname === 'localhost' // Debug in dev only
  },
  global: {
    headers: {
      'x-client-info': 'ghin-stats'
    },
    fetch: (url, options = {}) => {
      // Add timeout to all fetch requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
    }
  },
  db: {
    schema: 'public'
  }
});

console.log('Supabase client initialized');

// Verify we're using HTTPS in production
if (window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
  console.warn('🔒 Security Warning: This application should be served over HTTPS in production');
}