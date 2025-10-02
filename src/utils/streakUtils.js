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
  
  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get yesterday's date
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  
  // Get the most recent log date
  const mostRecentLogDate = createDateFromKey(sortedLogs[0].date)
  mostRecentLogDate.setHours(0, 0, 0, 0)
  
  // Check if the most recent log is from today or yesterday
  // If not, the streak is broken (return 0)
  if (mostRecentLogDate.getTime() !== today.getTime() && 
      mostRecentLogDate.getTime() !== yesterday.getTime()) {
    return 0
  }
  
  let streak = 0
  // Use the most recent log date as the base for streak counting
  const baseDate = mostRecentLogDate

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
 * Check if streak was recently broken (within last 7 days)
 * @param {Array} logs - Array of log objects with date property
 * @returns {Object} Streak break information
 */
export const checkStreakBroken = (logs) => {
  if (!logs || logs.length === 0) return { isBroken: false, lastStreak: 0, daysSinceLastLog: 0 }

  // Sort logs by date (most recent first)
  const sortedLogs = [...logs].sort((a, b) => createDateFromKey(b.date) - createDateFromKey(a.date))
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  
  const mostRecentLogDate = createDateFromKey(sortedLogs[0].date)
  mostRecentLogDate.setHours(0, 0, 0, 0)
  
  // Calculate days since last log
  const daysSinceLastLog = Math.floor((today.getTime() - mostRecentLogDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // If last log was today or yesterday, streak is not broken
  if (mostRecentLogDate.getTime() === today.getTime() || 
      mostRecentLogDate.getTime() === yesterday.getTime()) {
    return { isBroken: false, lastStreak: 0, daysSinceLastLog }
  }
  
  // If it's been more than 7 days, don't show the broken message anymore
  if (daysSinceLastLog > 7) {
    return { isBroken: false, lastStreak: 0, daysSinceLastLog }
  }
  
  // Calculate what the streak was before it was broken
  let lastStreak = 0
  const baseDate = mostRecentLogDate

  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = createDateFromKey(sortedLogs[i].date)
    logDate.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(baseDate)
    expectedDate.setDate(baseDate.getDate() - i)
    
    if (logDate.getTime() === expectedDate.getTime()) {
      lastStreak++
    } else {
      break
    }
  }
  
  return { 
    isBroken: true, 
    lastStreak, 
    daysSinceLastLog,
    encouragingMessage: getEncouragingMessage(lastStreak, daysSinceLastLog)
  }
}

/**
 * Get encouraging message for broken streaks
 * @param {number} lastStreak - The streak that was broken
 * @param {number} daysSinceLastLog - Days since last log
 * @returns {string} Encouraging message
 */
const getEncouragingMessage = (lastStreak, daysSinceLastLog) => {
  const messages = [
    "Streak broken! 💔 But every expert was once a beginner. Start fresh! 🌟",
    "Oops! Your streak took a break. 😅 Time to bounce back stronger! 💪",
    "Streak reset! 🔄 Remember, progress isn't always perfect. Keep going! 🚀",
    "Don't worry about the broken streak! 🤗 What matters is getting back on track! ✨",
    "Streak interrupted! 📱 But your journey continues. Let's rebuild it! 🏗️",
    "Every champion has setbacks! 🏆 Your streak may be gone, but your spirit isn't! 🔥",
    "Streak broken, but not your determination! 💯 Fresh start, same goals! 🎯"
  ]
  
  if (lastStreak >= 10) {
    return `Amazing ${lastStreak}-day streak ended! 🌟 That's incredible progress. Ready for round two? 💪`
  } else if (lastStreak >= 5) {
    return `Your ${lastStreak}-day streak was great! 👏 Time to beat that record! 🏆`
  } else {
    return messages[Math.floor(Math.random() * messages.length)]
  }
}

/**
 * Get streak statistics
 * @param {Array} logs - Array of log objects with date property
 * @returns {Object} Streak statistics
 */
export const getStreakStats = (logs) => {
  const currentStreak = calculateCurrentStreak(logs)
  const streakBrokenInfo = checkStreakBroken(logs)
  
  return {
    currentStreak,
    longestStreak: calculateLongestStreak(logs),
    isStreakBroken: streakBrokenInfo.isBroken,
    streakBrokenInfo
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
