/**
 * Utility functions for calculating streaks
 */

/**
 * Calculate current streak days
 * @param {Array} logs - Array of log objects with date property
 * @returns {number} Current streak in days
 */
import { createDateFromKey } from './dateUtils'

export const calculateCurrentStreak = (logs) => {
  if (!logs || logs.length === 0) return 0

  // Sort copy by date (most recent first) using local date parsing
  const sortedLogs = [...logs].sort((a, b) => createDateFromKey(b.date) - createDateFromKey(a.date))
  
  let streak = 0
  // Use the most recent log date as the base for streak counting
  const baseDate = createDateFromKey(sortedLogs[0].date)
  baseDate.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = createDateFromKey(sortedLogs[i].date)
    logDate.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(baseDate)
    expectedDate.setDate(baseDate.getDate() - i)
    
    if (logDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }
  return streak
}

/**
 * Calculate longest streak in the logs
 * @param {Array} logs - Array of log objects with date property
 * @returns {number} Longest streak in days
 */
export const calculateLongestStreak = (logs) => {
  if (!logs || logs.length === 0) return 0

  // Sort logs by date (oldest first)
  const sortedLogs = [...logs].sort((a, b) => createDateFromKey(a.date) - createDateFromKey(b.date))
  
  let longestStreak = 0
  let currentStreak = 1
  
  for (let i = 1; i < sortedLogs.length; i++) {
    const prevDate = createDateFromKey(sortedLogs[i - 1].date)
    const currDate = createDateFromKey(sortedLogs[i].date)
    
    prevDate.setHours(0, 0, 0, 0)
    currDate.setHours(0, 0, 0, 0)
    
    const dayDifference = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (dayDifference === 1) {
      // Consecutive day
      currentStreak++
    } else {
      // Streak broken
      longestStreak = Math.max(longestStreak, currentStreak)
      currentStreak = 1
    }
  }
  
  // Check the last streak
  longestStreak = Math.max(longestStreak, currentStreak)
  
  return longestStreak
}

/**
 * Get streak statistics
 * @param {Array} logs - Array of log objects with date property
 * @returns {Object} Streak statistics
 */
export const getStreakStats = (logs) => {
  return {
    currentStreak: calculateCurrentStreak(logs),
    longestStreak: calculateLongestStreak(logs)
  }
}

/**
 * Check if a date is consecutive to the previous date
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if dates are consecutive
 */
export const isConsecutiveDay = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  
  const dayDifference = Math.abs((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
  return dayDifference === 1
}

/**
 * Get all unique dates from logs
 * @param {Array} logs - Array of log objects with date property
 * @returns {Array} Array of unique date strings
 */
export const getUniqueDates = (logs) => {
  if (!logs || logs.length === 0) return []
  
  const dates = logs.map(log => {
    const date = new Date(log.date)
    date.setHours(0, 0, 0, 0)
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  })
  
  return [...new Set(dates)].sort()
}
