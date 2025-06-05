import { supabase } from '../lib/supabase'

// Helper to add auth token to requests
export const makeAuthenticatedRequest = async (queryBuilder) => {
  try {
    // First attempt
    const result = await queryBuilder
    
    // Check if we got an auth error
    if (result.error && result.error.message?.includes('JWT')) {
      console.log('JWT error detected, refreshing session...')
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError || !refreshData.session) {
        // Refresh failed, user needs to re-login
        console.error('Session refresh failed:', refreshError)
        await supabase.auth.signOut()
        window.location.href = '/'
        return result
      }
      
      // Retry the original request
      console.log('Session refreshed, retrying request...')
      return await queryBuilder
    }
    
    return result
  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}

// Wrapper for Supabase queries with auth retry
export const supabaseWithRetry = {
  from: (table) => {
    const queryBuilder = supabase.from(table)
    
    // Override select, update, insert, delete methods
    const methods = ['select', 'update', 'insert', 'delete', 'upsert']
    
    methods.forEach(method => {
      const originalMethod = queryBuilder[method].bind(queryBuilder)
      queryBuilder[method] = function(...args) {
        const query = originalMethod(...args)
        
        // Override the final execution methods
        const executionMethods = ['single', 'limit', 'order', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in', 'contains', 'containedBy', 'range', 'filter']
        
        // Wrap the terminal method (the one that executes the query)
        const originalThen = query.then.bind(query)
        query.then = async function(onFulfilled, onRejected) {
          const result = await makeAuthenticatedRequest(query)
          return originalThen(() => result).then(onFulfilled, onRejected)
        }
        
        return query
      }
    })
    
    return queryBuilder
  }
}