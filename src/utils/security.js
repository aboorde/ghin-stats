// Security utilities for the application

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password requirements
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

// Rate limiting storage
const loginAttempts = new Map()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

/**
 * Validates email format
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  return EMAIL_REGEX.test(email.trim())
}

/**
 * Validates password requirements
 * @param {string} password 
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validatePassword(password) {
  const errors = []
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required')
    return { valid: false, errors }
  }
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  }
  
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be less than ${PASSWORD_MAX_LENGTH} characters`)
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Sanitizes input to prevent XSS
 * @param {string} input 
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return ''
  
  // Remove any HTML tags and trim whitespace
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"]/g, '')
    .trim()
}

/**
 * Checks if login attempts are rate limited
 * @param {string} identifier - Email or IP address
 * @returns {{limited: boolean, remainingAttempts: number, resetTime: number}}
 */
export function checkRateLimit(identifier) {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier) || { count: 0, firstAttempt: now }
  
  // Clean up old entries
  if (now - attempts.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.delete(identifier)
    return { limited: false, remainingAttempts: MAX_ATTEMPTS, resetTime: 0 }
  }
  
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attempts.count)
  const resetTime = attempts.firstAttempt + RATE_LIMIT_WINDOW
  
  return {
    limited: attempts.count >= MAX_ATTEMPTS,
    remainingAttempts,
    resetTime
  }
}

/**
 * Records a login attempt
 * @param {string} identifier - Email or IP address
 */
export function recordLoginAttempt(identifier) {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier) || { count: 0, firstAttempt: now }
  
  if (now - attempts.firstAttempt > RATE_LIMIT_WINDOW) {
    // Reset if outside window
    loginAttempts.set(identifier, { count: 1, firstAttempt: now })
  } else {
    // Increment count
    attempts.count++
    loginAttempts.set(identifier, attempts)
  }
}

/**
 * Clears login attempts for an identifier (on successful login)
 * @param {string} identifier 
 */
export function clearLoginAttempts(identifier) {
  loginAttempts.delete(identifier)
}

/**
 * Generates a CSRF token
 * @returns {string}
 */
export function generateCSRFToken() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Creates a secure error message that doesn't expose system details
 * @param {Error} error 
 * @returns {string}
 */
export function getSecureErrorMessage(error) {
  // Map known error types to user-friendly messages
  const errorMap = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email before signing in',
    'User not found': 'Invalid email or password',
    'Invalid password': 'Invalid email or password',
  }
  
  // Check if error message contains any known patterns
  for (const [pattern, message] of Object.entries(errorMap)) {
    if (error.message?.includes(pattern)) {
      return message
    }
  }
  
  // Default generic message
  return 'An error occurred during sign in. Please try again.'
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [identifier, attempts] of loginAttempts.entries()) {
    if (now - attempts.firstAttempt > RATE_LIMIT_WINDOW) {
      loginAttempts.delete(identifier)
    }
  }
}, 60 * 1000) // Run every minute