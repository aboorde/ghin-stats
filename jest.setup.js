import '@testing-library/jest-dom'

// Mock import.meta.env
global.importMeta = {
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key'
  }
}