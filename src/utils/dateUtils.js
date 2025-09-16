/**
 * Date utility functions for consistent date handling across the application
 * Ensures that dates are handled consistently regardless of timezone
 */

/**
 * Get a date string in YYYY-MM-DD format using local timezone
 * This ensures consistency between calendar display and log saving
 * @param {Date} date - The date object to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getDateKey = (date) => {
  if (!date) return ''
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    
    // Use local timezone to avoid UTC conversion issues
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Get current date in YYYY-MM-DD format using local timezone
 * @returns {string} Current date string in YYYY-MM-DD format
 */
export const getCurrentDateKey = () => {
  return getDateKey(new Date())
}

/**
 * Create a Date object from a date key (YYYY-MM-DD format)
 * @param {string} dateKey - Date string in YYYY-MM-DD format
 * @returns {Date} Date object
 */
export const createDateFromKey = (dateKey) => {
  if (!dateKey) return new Date()
  
  try {
    // Parse the date key and create a date in local timezone
    const [year, month, day] = dateKey.split('-').map(Number)
    return new Date(year, month - 1, day) // month is 0-indexed
  } catch (error) {
    console.error('Error creating date from key:', error)
    return new Date()
  }
}

/**
 * Get the start of the current week (Monday) in YYYY-MM-DD format
 * @returns {string} Monday of current week in YYYY-MM-DD format
 */
export const getCurrentWeekStart = () => {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const monday = new Date(today)
  monday.setDate(diff)
  return getDateKey(monday)
}

/**
 * Get the end of the week (Sunday) for a given week start date
 * @param {string} weekStart - Week start date in YYYY-MM-DD format
 * @returns {string} Week end date in YYYY-MM-DD format
 */
export const getWeekEndDate = (weekStart) => {
  const startDate = createDateFromKey(weekStart)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  return getDateKey(endDate)
}

/**
 * Add days to a date key
 * @param {string} dateKey - Date string in YYYY-MM-DD format
 * @param {number} days - Number of days to add (can be negative)
 * @returns {string} New date string in YYYY-MM-DD format
 */
export const addDaysToDateKey = (dateKey, days) => {
  const date = createDateFromKey(dateKey)
  date.setDate(date.getDate() + days)
  return getDateKey(date)
}

/**
 * Check if a date key represents today
 * @param {string} dateKey - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is today
 */
export const isToday = (dateKey) => {
  return dateKey === getCurrentDateKey()
}

/**
 * Format a date key for display
 * @param {string} dateKey - Date string in YYYY-MM-DD format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateKey = (dateKey, options = {}) => {
  const date = createDateFromKey(dateKey)
  const defaultOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options })
}
