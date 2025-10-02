import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardStats, getLogs } from '../api'
import { getStreakStats } from '../utils/streakUtils'
import Footer from './Footer'

const Stats = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [statsData, setStatsData] = useState({
    overview: {
      totalLogs: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageRating: 0,
      completionRate: 0
    },
    monthly: {
      logs: 0,
      averageRating: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      topRating: 0,
      lowRating: 0
    },
    weekly: {
      logs: 0,
      averageRating: 0,
      tasksCompleted: 0,
      totalTasks: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        // Load dashboard stats
        const dashboardStats = await getDashboardStats()
        
        // Load all logs for detailed analysis
        const logsResponse = await getLogs()
        const allLogs = logsResponse.success ? logsResponse.data : []
        
        // Calculate detailed statistics
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        
        // Monthly logs
        const monthlyLogs = allLogs.filter(log => {
          const logDate = new Date(log.date)
          return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear
        })
        
        // Weekly logs (last 7 days)
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const weeklyLogs = allLogs.filter(log => {
          const logDate = new Date(log.date)
          return logDate >= weekAgo
        })
        
        // Calculate task statistics
        let totalTasks = 0
        let completedTasks = 0
        let totalRating = 0
        let ratingCount = 0
        let maxRating = 0
        let minRating = 10
        
        allLogs.forEach(log => {
          if (log.tasks) {
            totalTasks += log.tasks.length
            completedTasks += log.tasks.filter(task => task.completed).length
          }
          
          if (log.ratings) {
            const avgRating = (log.ratings.discipline + log.ratings.sociability + log.ratings.productivity) / 3
            totalRating += avgRating
            ratingCount++
            maxRating = Math.max(maxRating, avgRating)
            minRating = Math.min(minRating, avgRating)
          }
        })
        
        const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        
        // Calculate streak statistics using unified utility
        const streakStats = getStreakStats(allLogs)
        
        setStatsData({
          overview: {
            totalLogs: allLogs.length,
            currentStreak: streakStats.currentStreak,
            longestStreak: streakStats.longestStreak,
            averageRating: averageRating,
            completionRate: completionRate,
            isStreakBroken: streakStats.isStreakBroken,
            streakBrokenInfo: streakStats.streakBrokenInfo,
            isMilestone: streakStats.isMilestone,
            milestoneInfo: streakStats.milestoneInfo
          },
          monthly: {
            logs: monthlyLogs.length,
            averageRating: monthlyLogs.length > 0 ? 
              monthlyLogs.reduce((sum, log) => {
                if (log.ratings) {
                  return sum + (log.ratings.discipline + log.ratings.sociability + log.ratings.productivity) / 3
                }
                return sum
              }, 0) / monthlyLogs.length : 0,
            tasksCompleted: monthlyLogs.reduce((sum, log) => 
              sum + (log.tasks ? log.tasks.filter(task => task.completed).length : 0), 0),
            totalTasks: monthlyLogs.reduce((sum, log) => 
              sum + (log.tasks ? log.tasks.length : 0), 0),
            topRating: maxRating,
            lowRating: minRating === 10 ? 0 : minRating
          },
          weekly: {
            logs: weeklyLogs.length,
            averageRating: weeklyLogs.length > 0 ? 
              weeklyLogs.reduce((sum, log) => {
                if (log.ratings) {
                  return sum + (log.ratings.discipline + log.ratings.sociability + log.ratings.productivity) / 3
                }
                return sum
              }, 0) / weeklyLogs.length : 0,
            tasksCompleted: weeklyLogs.reduce((sum, log) => 
              sum + (log.tasks ? log.tasks.filter(task => task.completed).length : 0), 0),
            totalTasks: weeklyLogs.reduce((sum, log) => 
              sum + (log.tasks ? log.tasks.length : 0), 0)
          }
        })
        
      } catch (error) {
        console.error('Error loading statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-500'
    if (rating >= 3) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className={`mb-8 p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl journal-heading mb-2 ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>
                Your Statistics
              </h1>
              <p className={`text-lg journal-body ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Track your progress and discover patterns in your daily logs
              </p>
            </div>
            <button
              onClick={() => navigate('/weekly-reports')}
              className={`px-4 py-2 rounded-lg font-source-sans font-medium transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              📋 Weekly Reports
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-source-sans ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Entries
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {statsData.overview.totalLogs}
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            statsData.overview.isStreakBroken
              ? (isDark 
                  ? 'bg-orange-900/20 border-orange-600' 
                  : 'bg-orange-50 border-orange-200')
              : statsData.overview.isMilestone && statsData.overview.milestoneInfo?.isSpecialMilestone
                ? (isDark 
                    ? 'bg-yellow-900/20 border-yellow-600' 
                    : 'bg-yellow-50 border-yellow-300')
                : statsData.overview.isMilestone
                  ? (isDark 
                      ? 'bg-green-900/20 border-green-600' 
                      : 'bg-green-50 border-green-300')
                  : (isDark 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-white border-gray-200')
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-source-sans ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Current Streak
                  {statsData.overview.isMilestone && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      statsData.overview.milestoneInfo?.isSpecialMilestone
                        ? (isDark ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-200 text-yellow-800')
                        : (isDark ? 'bg-green-600 text-green-100' : 'bg-green-200 text-green-800')
                    }`}>
                      MILESTONE!
                    </span>
                  )}
                </p>
                <p className={`text-3xl font-bold ${
                  statsData.overview.isStreakBroken
                    ? (isDark ? 'text-orange-400' : 'text-orange-600')
                    : statsData.overview.isMilestone && statsData.overview.milestoneInfo?.isSpecialMilestone
                      ? (isDark ? 'text-yellow-400' : 'text-yellow-600')
                      : statsData.overview.isMilestone
                        ? (isDark ? 'text-green-400' : 'text-green-600')
                        : (isDark ? 'text-green-400' : 'text-green-600')
                }`}>
                  {statsData.overview.currentStreak}
                </p>
                {statsData.overview.isStreakBroken && (
                  <div className={`mt-2 text-xs px-2 py-1 rounded-lg ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {statsData.overview.streakBrokenInfo?.encouragingMessage}
                  </div>
                )}
                {statsData.overview.isMilestone && (
                  <div className={`mt-2 text-xs px-2 py-1 rounded-lg ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {statsData.overview.milestoneInfo?.celebrationMessage}
                  </div>
                )}
              </div>
              <div className="text-3xl">
                {statsData.overview.isStreakBroken ? '💔' : 
                 statsData.overview.isMilestone && statsData.overview.milestoneInfo?.isSpecialMilestone ? '🏆' :
                 statsData.overview.isMilestone ? '🎉' : '🔥'}
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-source-sans ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Avg Rating
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {statsData.overview.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-source-sans ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Completion Rate
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {Math.round(statsData.overview.completionRate)}%
                </p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className={`mb-6 p-4 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedPeriod === 'week'
                  ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                  : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedPeriod === 'month'
                  ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                  : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Period Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-center">
              <p className={`text-sm font-source-sans ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {selectedPeriod === 'week' ? 'Weekly' : 'Monthly'} Logs
              </p>
              <p className={`text-2xl font-bold ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {selectedPeriod === 'week' ? statsData.weekly.logs : statsData.monthly.logs}
              </p>
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-center">
              <p className={`text-sm font-source-sans ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Avg Rating
              </p>
              <p className={`text-2xl font-bold ${
                isDark ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {(selectedPeriod === 'week' ? statsData.weekly.averageRating : statsData.monthly.averageRating).toFixed(1)}
              </p>
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-center">
              <p className={`text-sm font-source-sans ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Tasks Completed
              </p>
              <p className={`text-2xl font-bold ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                {selectedPeriod === 'week' ? statsData.weekly.tasksCompleted : statsData.monthly.tasksCompleted}
              </p>
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-center">
              <p className={`text-sm font-source-sans ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Tasks
              </p>
              <p className={`text-2xl font-bold ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {selectedPeriod === 'week' ? statsData.weekly.totalTasks : statsData.monthly.totalTasks}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className={`mb-8 p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl journal-heading mb-6 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Progress Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className={`text-lg font-source-sans font-semibold mb-4 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Task Completion Rate
              </h3>
              <div className={`h-48 rounded-lg border-2 flex items-center justify-center ${
                isDark 
                  ? 'border-gray-600 bg-gray-700' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {Math.round(statsData.overview.completionRate)}%
                  </div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {statsData.overview.totalLogs > 0 ? 
                      `Approx. ${Math.round(statsData.overview.completionRate)}% completion` : 
                      'No tasks logged yet'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className={`text-lg font-source-sans font-semibold mb-4 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Rating Distribution
              </h3>
              <div className={`h-48 rounded-lg border-2 flex items-center justify-center ${
                isDark 
                  ? 'border-gray-600 bg-gray-700' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    isDark ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    {statsData.overview.averageRating.toFixed(1)}
                  </div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Average Rating
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl journal-heading mb-6 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Insights & Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <h4 className={`font-source-sans font-semibold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Longest Streak
              </h4>
              <p className={`text-sm journal-body ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Your longest consecutive logging streak is {statsData.overview.longestStreak} days
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <h4 className={`font-source-sans font-semibold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Current Progress
              </h4>
              <p className={`text-sm journal-body ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                You've logged {statsData.overview.totalLogs} entries with an average rating of {statsData.overview.averageRating.toFixed(1)}/10
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Stats 