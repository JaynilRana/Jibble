// Local Data Service - Provides full functionality without backend
import { getDateKey } from '../utils/dateUtils'
import { calculateCurrentStreak } from '../utils/streakUtils'

class LocalDataService {
  constructor() {
    this.storageKey = 'jibble_user_data'
    this.initializeStorage()
  }

  // Initialize storage structure
  initializeStorage() {
    const existing = localStorage.getItem(this.storageKey)
    if (!existing) {
      const initialData = {
        logs: {},
        user: null,
        settings: {
          theme: 'light',
          notifications: true
        }
      }
      localStorage.setItem(this.storageKey, JSON.stringify(initialData))
    }
  }

  // Get all data
  getData() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : { logs: {}, user: null, settings: {} }
    } catch (error) {
      console.error('Error reading local data:', error)
      return { logs: {}, user: null, settings: {} }
    }
  }

  // Save all data
  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error saving local data:', error)
      return false
    }
  }

  // User management
  setUser(user) {
    const data = this.getData()
    data.user = user
    this.saveData(data)
  }

  getUser() {
    return this.getData().user
  }

  // Log management
  createLog(logData) {
    const data = this.getData()
    const dateKey = logData.date
    data.logs[dateKey] = {
      ...logData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    this.saveData(data)
    return Promise.resolve({ success: true, data: data.logs[dateKey] })
  }

  updateLog(date, updates) {
    const data = this.getData()
    if (data.logs[date]) {
      data.logs[date] = {
        ...data.logs[date],
        ...updates,
        updated_at: new Date().toISOString()
      }
      this.saveData(data)
      return Promise.resolve({ success: true, data: data.logs[date] })
    }
    return Promise.reject(new Error('Log not found'))
  }

  deleteLog(date) {
    const data = this.getData()
    if (data.logs[date]) {
      delete data.logs[date]
      this.saveData(data)
      return Promise.resolve({ success: true })
    }
    return Promise.reject(new Error('Log not found'))
  }

  getLogByDate(date) {
    const data = this.getData()
    const log = data.logs[date]
    return Promise.resolve(log ? { success: true, data: log } : { success: false, data: null })
  }

  getAllLogs() {
    const data = this.getData()
    const logs = Object.values(data.logs).sort((a, b) => new Date(b.date) - new Date(a.date))
    return Promise.resolve({ success: true, data: logs })
  }

  // Weekly report generation
  generateWeeklyReport(weekStartDate) {
    const data = this.getData()
    const logs = data.logs
    
    // Calculate week end date (7 days from start)
    const startDate = new Date(weekStartDate)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    
    // Get logs for the week
    const weekLogs = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateKey = getDateKey(currentDate)
      if (logs[dateKey]) {
        weekLogs.push(logs[dateKey])
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Calculate statistics
    const stats = this.calculateWeeklyStats(weekLogs)
    
    return Promise.resolve({
      success: true,
      data: {
        week_start: weekStartDate,
        week_end: getDateKey(endDate),
        logs: weekLogs,
        statistics: stats
      }
    })
  }

  // Calculate weekly statistics
  calculateWeeklyStats(logs) {
    if (logs.length === 0) {
      return {
        total_logs: 0,
        average_mood: 0,
        average_energy: 0,
        average_discipline: 0,
        average_sociability: 0,
        average_productivity: 0,
        total_tasks: 0,
        completed_tasks: 0,
        completion_rate: 0,
        streak_days: 0
      }
    }

    const totalLogs = logs.length
    const totalMood = logs.reduce((sum, log) => sum + (log.mood_score || 0), 0)
    const totalEnergy = logs.reduce((sum, log) => sum + (log.energy_level || 0), 0)
    const totalDiscipline = logs.reduce((sum, log) => sum + (log.ratings?.discipline || 0), 0)
    const totalSociability = logs.reduce((sum, log) => sum + (log.ratings?.sociability || 0), 0)
    const totalProductivity = logs.reduce((sum, log) => sum + (log.ratings?.productivity || 0), 0)

    let totalTasks = 0
    let completedTasks = 0

    logs.forEach(log => {
      if (log.tasks && Array.isArray(log.tasks)) {
        totalTasks += log.tasks.length
        completedTasks += log.tasks.filter(task => task.completed).length
      }
    })

    return {
      total_logs: totalLogs,
      average_mood: Math.round((totalMood / totalLogs) * 10) / 10,
      average_energy: Math.round((totalEnergy / totalLogs) * 10) / 10,
      average_discipline: Math.round((totalDiscipline / totalLogs) * 10) / 10,
      average_sociability: Math.round((totalSociability / totalLogs) * 10) / 10,
      average_productivity: Math.round((totalProductivity / totalLogs) * 10) / 10,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      streak_days: this.calculateStreakDays(logs)
    }
  }

  // Calculate streak days using unified utility
  calculateStreakDays(logs) {
    return calculateCurrentStreak(logs)
  }

  // Dashboard statistics
  getDashboardStats() {
    const data = this.getData()
    const logs = Object.values(data.logs)
    
    if (logs.length === 0) {
      return {
        totalLogs: 0,
        currentStreak: 0,
        thisMonth: 0,
        averageRating: 0
      }
    }

    // Calculate total logs
    const totalLogs = logs.length

    // Calculate current streak
    const currentStreak = this.calculateStreakDays(logs)

    // Calculate this month's logs
    const now = new Date()
    const thisMonth = logs.filter(log => {
      const logDate = new Date(log.date)
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()
    }).length

    // Calculate average rating
    const totalRating = logs.reduce((sum, log) => {
      const avgRating = log.ratings ? 
        (log.ratings.discipline + log.ratings.sociability + log.ratings.productivity) / 3 : 0
      return sum + avgRating
    }, 0)
    const averageRating = Math.round((totalRating / totalLogs) * 10) / 10

    return {
      totalLogs,
      currentStreak,
      thisMonth,
      averageRating
    }
  }

  // Get recent logs for dashboard
  getRecentLogs(limit = 5) {
    const data = this.getData()
    const logs = Object.values(data.logs)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
      .map(log => ({
        date: log.date,
        rating: log.ratings ? Math.round((log.ratings.discipline + log.ratings.sociability + log.ratings.productivity) / 3) : 0,
        tasks: log.tasks ? log.tasks.length : 0,
        completed: log.tasks ? log.tasks.filter(task => task.completed).length : 0
      }))

    return logs
  }

  // Export data
  exportData() {
    const data = this.getData()
    return {
      export_date: new Date().toISOString(),
      user: data.user,
      logs: data.logs,
      settings: data.settings
    }
  }

  // Import data
  importData(importedData) {
    try {
      if (importedData.logs && typeof importedData.logs === 'object') {
        const data = this.getData()
        data.logs = { ...data.logs, ...importedData.logs }
        if (importedData.user) data.user = importedData.user
        if (importedData.settings) data.settings = { ...data.settings, ...importedData.settings }
        this.saveData(data)
        return Promise.resolve({ success: true })
      }
      return Promise.reject(new Error('Invalid data format'))
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // Clear all data
  clearAllData() {
    localStorage.removeItem(this.storageKey)
    this.initializeStorage()
    return Promise.resolve({ success: true })
  }
}

// Create singleton instance
const localDataService = new LocalDataService()

export default localDataService

