import { format, parseISO } from 'date-fns'

/**
 * Date helper utilities for formatting and grouping dates
 */

/**
 * Format date for display
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr)
}

/**
 * Format date for short display
 */
export const formatShortDate = (date) => {
  return formatDate(date, 'MMM dd')
}

/**
 * Format date with day of week
 */
export const formatDateWithDay = (date) => {
  return formatDate(date, 'EEE, MMM dd, yyyy')
}

/**
 * Get month-year key for grouping
 */
export const getMonthYearKey = (date) => {
  if (!date) return null
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM')
}

/**
 * Get year from date
 */
export const getYear = (date) => {
  if (!date) return null
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj.getFullYear()
}

/**
 * Get month name from date
 */
export const getMonthName = (date) => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMMM')
}

/**
 * Get short month name from date
 */
export const getShortMonthName = (date) => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM')
}

/**
 * Group data by month-year
 */
export const groupByMonthYear = (items, dateField = 'played_at') => {
  const groups = {}
  
  items.forEach(item => {
    const date = item[dateField]
    if (!date) return
    
    const key = getMonthYearKey(date)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
  })
  
  return groups
}

/**
 * Group data by year
 */
export const groupByYear = (items, dateField = 'played_at') => {
  const groups = {}
  
  items.forEach(item => {
    const date = item[dateField]
    if (!date) return
    
    const year = getYear(date)
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(item)
  })
  
  return groups
}

/**
 * Sort dates in ascending order
 */
export const sortByDateAsc = (items, dateField = 'played_at') => {
  return [...items].sort((a, b) => {
    const dateA = typeof a[dateField] === 'string' ? parseISO(a[dateField]) : a[dateField]
    const dateB = typeof b[dateField] === 'string' ? parseISO(b[dateField]) : b[dateField]
    return dateA - dateB
  })
}

/**
 * Sort dates in descending order
 */
export const sortByDateDesc = (items, dateField = 'played_at') => {
  return [...items].sort((a, b) => {
    const dateA = typeof a[dateField] === 'string' ? parseISO(a[dateField]) : a[dateField]
    const dateB = typeof b[dateField] === 'string' ? parseISO(b[dateField]) : b[dateField]
    return dateB - dateA
  })
}

/**
 * Get date range string
 */
export const getDateRangeString = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  
  const start = formatDate(startDate, 'MMM dd, yyyy')
  const end = formatDate(endDate, 'MMM dd, yyyy')
  
  return `${start} - ${end}`
}

/**
 * Calculate days between dates
 */
export const getDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
  
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Get recent date filter
 */
export const getRecentDateFilter = (days = 30) => {
  const now = new Date()
  const past = new Date()
  past.setDate(past.getDate() - days)
  
  return (date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return dateObj >= past && dateObj <= now
  }
}