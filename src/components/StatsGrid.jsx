import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardStats, getLogs } from '../api'
import { getStreakStats } from '../utils/streakUtils'

const StatsGrid = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalLogs: 0,
    currentStreak: 0,
    averageRating: 0
  })
  const [streakInfo, setStreakInfo] = useState({
    isStreakBroken: false,
    streakBrokenInfo: null,
    isMilestone: false,
    milestoneInfo: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const dashboardStats = await getDashboardStats()
        setStats(dashboardStats)
        
        // Load logs to check for streak information
        const logsResponse = await getLogs()
        const logs = logsResponse.success ? logsResponse.data : []
        const streakStats = getStreakStats(logs)
        setStreakInfo({
          isStreakBroken: streakStats.isStreakBroken,
          streakBrokenInfo: streakStats.streakBrokenInfo,
          isMilestone: streakStats.isMilestone,
          milestoneInfo: streakStats.milestoneInfo
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()

    // Listen for log updates to refresh stats
    const handleLogUpdate = () => {
      console.log('📊 StatsGrid refreshing due to log update')
      loadStats()
    }

    window.addEventListener('logUpdated', handleLogUpdate)

    return () => {
      window.removeEventListener('logUpdated', handleLogUpdate)
    }
  }, [user])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className={`rounded-xl shadow-lg p-6 text-center border transition-colors duration-300 ${
            isDark 
              ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' 
              : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
          }`}>
            <div className="animate-pulse">
              <div className={`h-8 bg-gray-300 rounded mb-2 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-4 bg-gray-300 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className={`rounded-xl shadow-lg p-6 text-center border transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-800' 
          : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100'
      }`}>
        <div className={`text-3xl font-bold mb-1 ${
          isDark ? 'text-cyan-400' : 'text-cyan-600'
        }`}>{stats.totalLogs}</div>
        <div className={`font-medium ${
          isDark ? 'text-blue-300' : 'text-blue-600'
        }`}>Days Logged</div>
      </div>
      <div className={`rounded-xl shadow-lg p-6 text-center border transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-teal-900/40 to-emerald-900/40 border-teal-800' 
          : 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100'
      }`}>
        <div className={`text-3xl font-bold mb-1 ${
          isDark ? 'text-teal-400' : 'text-teal-600'
        }`}>{stats.averageRating.toFixed(1)}</div>
        <div className={`font-medium ${
          isDark ? 'text-emerald-300' : 'text-emerald-600'
        }`}>Avg. Rating</div>
      </div>
      <div className={`rounded-xl shadow-lg p-6 text-center border transition-colors duration-300 ${
        streakInfo.isStreakBroken
          ? (isDark 
              ? 'bg-gradient-to-br from-orange-900/40 to-red-900/40 border-orange-800' 
              : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-100')
          : streakInfo.isMilestone && streakInfo.milestoneInfo?.isSpecialMilestone
            ? (isDark 
                ? 'bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-600' 
                : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300')
            : streakInfo.isMilestone
              ? (isDark 
                  ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-600' 
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300')
              : (isDark 
                  ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-800' 
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100')
      }`}>
        {streakInfo.isStreakBroken ? (
          <div>
            <div className={`text-2xl font-bold mb-1 ${
              isDark ? 'text-orange-400' : 'text-orange-600'
            }`}>💔 0</div>
            <div className={`font-medium mb-2 ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}>Streak Broken</div>
            <div className={`text-xs px-2 py-1 rounded-lg ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {streakInfo.streakBrokenInfo?.encouragingMessage}
            </div>
          </div>
        ) : (
          <div>
            <div className={`text-3xl font-bold mb-1 ${
              streakInfo.isMilestone && streakInfo.milestoneInfo?.isSpecialMilestone
                ? (isDark ? 'text-yellow-400' : 'text-yellow-600')
                : streakInfo.isMilestone
                  ? (isDark ? 'text-green-400' : 'text-green-600')
                  : (isDark ? 'text-blue-400' : 'text-blue-600')
            }`}>
              {streakInfo.isMilestone && streakInfo.milestoneInfo?.isSpecialMilestone ? '🏆' : 
               streakInfo.isMilestone ? '🎉' : '🔥'} {stats.currentStreak}
            </div>
            <div className={`font-medium ${
              streakInfo.isMilestone && streakInfo.milestoneInfo?.isSpecialMilestone
                ? (isDark ? 'text-yellow-300' : 'text-yellow-700')
                : streakInfo.isMilestone
                  ? (isDark ? 'text-green-300' : 'text-green-700')
                  : (isDark ? 'text-indigo-300' : 'text-indigo-600')
            }`}>
              {streakInfo.isMilestone ? 'Milestone!' : 'Day Streak'}
            </div>
            {streakInfo.isMilestone && (
              <div className={`mt-2 text-xs px-2 py-1 rounded-lg ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {streakInfo.milestoneInfo?.celebrationMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsGrid 