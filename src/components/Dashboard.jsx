import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardStats, getRecentLogs } from '../api'
import Footer from './Footer'

const Dashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalLogs: 0,
    currentStreak: 0,
    thisMonth: 0,
    averageRating: 0
  })
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const quickActions = [
    { name: "Write Today's Log", icon: '✏️', path: '/daily-log' },
    { name: 'View Calendar', icon: '📅', path: '/calendar' },
    { name: 'See Statistics', icon: '📊', path: '/stats' },
    { name: 'Weekly Reports', icon: '📋', path: '/weekly-reports' },
    { name: 'Export Data', icon: '📤', path: '/export' }
  ]

  useEffect(() => {
    const loadDashboardData = async () => {
      if (user) {
        try {
          setLoading(true)
          // Load dashboard statistics
          const dashboardStats = await getDashboardStats()
          setStats(dashboardStats)

          // Load recent logs
          const recentLogsData = await getRecentLogs(3)
          setRecentLogs(recentLogsData)
        } catch (error) {
          console.error('Error loading dashboard data:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    loadDashboardData()

    // Refresh at midnight to keep streak current
    const scheduleMidnightRefresh = () => {
      const now = new Date()
      const next = new Date(now)
      next.setHours(24, 0, 5, 0) // a few seconds after midnight
      const ms = next.getTime() - now.getTime()
      return setTimeout(async () => {
        await loadDashboardData()
        intervalId = scheduleMidnightRefresh()
      }, ms)
    }
    let intervalId = scheduleMidnightRefresh()

    // Listen for log updates to refresh dashboard data
    const handleLogUpdate = () => {
      console.log('📊 Dashboard refreshing due to log update')
      loadDashboardData()
    }

    window.addEventListener('logUpdated', handleLogUpdate)

    return () => {
      window.removeEventListener('logUpdated', handleLogUpdate)
      if (intervalId) clearTimeout(intervalId)
    }
  }, [user])

  const handleQuickAction = (path) => {
    navigate(path)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div data-reveal="up" className={`mb-8 p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h1 className={`text-3xl journal-heading mb-2 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className={`text-lg journal-body ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Ready to capture today's thoughts and experiences?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div data-reveal="up" style={{ animationDelay: '0s' }} className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-source-sans ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Logs
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {stats.totalLogs}
                </p>
              </div>
              <div className="text-3xl">📖</div>
            </div>
          </div>

          <div data-reveal="up" style={{ animationDelay: '0.05s' }} className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-source-sans ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Current Streak
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  {stats.currentStreak}
                </p>
              </div>
              <div className="text-3xl">🔥</div>
            </div>
          </div>

          <div data-reveal="up" style={{ animationDelay: '0.1s' }} className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-source-sans ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  This Month
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {stats.thisMonth}
                </p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>

          <div data-reveal="up" style={{ animationDelay: '0.15s' }} className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
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
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div data-reveal="up" className={`mb-8 p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl journal-heading mb-6 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.path)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 hover:border-blue-500 hover:bg-gray-600' 
                    : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <p className={`font-source-sans font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {action.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Logs */}
        <div className={`mb-8 p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl journal-heading mb-6 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Recent Logs
          </h2>
          {recentLogs.length > 0 ? (
            <div className="space-y-4">
              {recentLogs.map((log, index) => (
                <div
                  key={index}
                  data-reveal="up"
                  style={{ animationDelay: `${0.05 * index}s` }}
                  className={`p-4 rounded-lg border-2 transition-colors duration-300 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-source-sans font-medium ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {new Date(log.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {log.completed}/{log.tasks} tasks completed
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className={`font-medium ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {log.rating}/10
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className={`text-lg ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No logs yet. Start your journey by writing your first log!
              </p>
              <button
                onClick={() => navigate('/daily-log')}
                className={`mt-4 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Write Your First Log
              </button>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div data-reveal="up" className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl journal-heading mb-4 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            💡 Daily Journaling Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className={`font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                🎯 Set Daily Intentions
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Start each day by setting clear intentions and goals. This helps you stay focused and motivated throughout the day.
              </p>
            </div>
            <div>
              <h3 className={`font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                📊 Track Your Progress
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Regularly review your logs to identify patterns, celebrate achievements, and areas for improvement.
              </p>
            </div>
            <div>
              <h3 className={`font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                🌟 Be Consistent
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Make journaling a daily habit. Even a few minutes each day can make a significant difference over time.
              </p>
            </div>
            <div>
              <h3 className={`font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                💭 Reflect Honestly
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Be honest with yourself in your reflections. This is your personal space for growth and self-discovery.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard 