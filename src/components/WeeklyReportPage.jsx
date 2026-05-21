import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { getWeeklyReport } from '../api'
import { getCurrentWeekStart, getWeekEndDate, addDaysToDateKey, formatDateKey } from '../utils/dateUtils'
const WeeklyReportPage = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [report, setReport] = useState(null)
  const [comparisonReports, setComparisonReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState('')

  // Get current week start date (Monday) - now using utility function

  useEffect(() => {
    if (!selectedWeek) {
      setSelectedWeek(getCurrentWeekStart())
    }
  }, [selectedWeek])

  const loadWeeklyReport = async (weekStart, forceRegenerate = false) => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await getWeeklyReport(weekStart, forceRegenerate)
      if (response.data) {
        setReport(response.data)
      } else {
        setReport(null)
      }

      // Load comparison reports
      const prev1Start = addDaysToDateKey(weekStart, -7)
      const prev2Start = addDaysToDateKey(weekStart, -14)
      
      const [res1, res2] = await Promise.all([
        getWeeklyReport(prev1Start),
        getWeeklyReport(prev2Start)
      ])
      
      const compReports = []
      if (res2.data) compReports.push({...res2.data, label: '2 Weeks Ago'})
      if (res1.data) compReports.push({...res1.data, label: 'Last Week'})
      if (response.data) compReports.push({...response.data, label: 'This Week'})
      
      setComparisonReports(compReports)

    } catch (error) {
      console.error('Error loading weekly report:', error)
      setReport(null)
      setComparisonReports([])
    } finally {
      setLoading(false)
    }
  }

  const changeWeek = (direction) => {
    if (!selectedWeek) return
    
    const daysToAdd = direction === 'next' ? 7 : -7
    const newWeekStart = addDaysToDateKey(selectedWeek, daysToAdd)
    setSelectedWeek(newWeekStart)
    loadWeeklyReport(newWeekStart)
  }

  // Using utility functions for consistent date formatting

  useEffect(() => {
    if (selectedWeek) {
      loadWeeklyReport(selectedWeek)
    }
  }, [selectedWeek, user])

  // Auto-refresh weekly report when new logs are added
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Check if the change is related to daily logs
      if (e.key && e.key.includes('dailyLogs') && selectedWeek) {
        // Check if the change affects the current week
        const currentWeekStart = getCurrentWeekStart()
        if (selectedWeek === currentWeekStart) {
          console.log('📊 Auto-refreshing weekly report due to new log data')
          loadWeeklyReport(selectedWeek, true) // Force regenerate
        }
      }
    }

    // Listen for storage changes (when new logs are saved)
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events (for same-tab updates)
    const handleLogUpdate = () => {
      if (selectedWeek) {
        const currentWeekStart = getCurrentWeekStart()
        if (selectedWeek === currentWeekStart) {
          console.log('📊 Auto-refreshing weekly report due to log update')
          loadWeeklyReport(selectedWeek, true) // Force regenerate
        }
      }
    }

    window.addEventListener('logUpdated', handleLogUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('logUpdated', handleLogUpdate)
    }
  }, [selectedWeek])

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Weekly Report</h2>
          <p>Please log in to view your weekly reports.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Weekly Performance Report</h1>
        
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeWeek('prev')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← Previous Week
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {selectedWeek && formatDateKey(selectedWeek)} - {selectedWeek && formatDateKey(getWeekEndDate(selectedWeek))}
            </h2>
            <button
              onClick={() => loadWeeklyReport(selectedWeek, true)}
              className="mt-2 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              🔄 Regenerate Report
            </button>
          </div>
          
          <button
            onClick={() => changeWeek('next')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Next Week →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading weekly report...</p>
        </div>
      ) : report ? (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-2">Total Logs</h3>
              <p className="text-3xl font-bold text-blue-500">{report.total_logs}</p>
              <p className="text-sm text-gray-500">Days tracked this week</p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-2">Task Completion</h3>
              <p className="text-3xl font-bold text-green-500">{report.completion_rate?.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">{report.tasks_completed}/{report.total_tasks} tasks</p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-2">Average Mood</h3>
              <p className="text-3xl font-bold text-yellow-500">{report.average_mood?.toFixed(1) || 'N/A'}</p>
              <p className="text-sm text-gray-500">Out of 10</p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-2">Energy Level</h3>
              <p className="text-3xl font-bold text-purple-500">{report.average_energy?.toFixed(1) || 'N/A'}</p>
              <p className="text-sm text-gray-500">Out of 10</p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span>👟</span>
                Average Steps
              </h3>
              <p className="text-3xl font-bold text-green-500">{report.average_steps ? Math.round(report.average_steps).toLocaleString() : 'N/A'}</p>
              <p className="text-sm text-gray-500">Daily average</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-xl font-semibold mb-4">Performance Ratings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Discipline</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(report.average_discipline || 0) * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{report.average_discipline?.toFixed(1) || 'N/A'}/10</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Sociability</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(report.average_sociability || 0) * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{report.average_sociability?.toFixed(1) || 'N/A'}/10</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Productivity</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(report.average_productivity || 0) * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{report.average_productivity?.toFixed(1) || 'N/A'}/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diet Metrics */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🍎</span>
              Weekly Diet Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <span>🥩</span>
                  Average Protein
                </h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, ((report.average_protein || 0) / 150) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{report.average_protein?.toFixed(1) || 'N/A'}g</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 50-150g daily</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <span>🔥</span>
                  Average Calories
                </h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, ((report.average_calories || 0) / 2500) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{report.average_calories?.toFixed(0) || 'N/A'} kcal</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 1800-2500 kcal daily</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <span>💧</span>
                  Average Water
                </h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, ((report.average_water || 0) / 3) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{report.average_water?.toFixed(1) || 'N/A'}L</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 2-3L daily</p>
              </div>
            </div>
            
            {/* Diet Health Indicators */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-3 rounded-lg text-center ${
                (report.average_protein || 0) >= 50 ? 
                  (isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200') :
                  (isDark ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200')
              } border`}>
                <div className={`font-semibold ${
                  (report.average_protein || 0) >= 50 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {(report.average_protein || 0) >= 50 ? '✅' : '⚠️'} Protein Intake
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(report.average_protein || 0) >= 50 ? 'Good protein levels' : 'Consider increasing protein'}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg text-center ${
                (report.average_calories || 0) >= 1800 && (report.average_calories || 0) <= 2500 ? 
                  (isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200') :
                  (isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200')
              } border`}>
                <div className={`font-semibold ${
                  (report.average_calories || 0) >= 1800 && (report.average_calories || 0) <= 2500 ? 
                    'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
                }`}>
                  {(report.average_calories || 0) >= 1800 && (report.average_calories || 0) <= 2500 ? '✅' : '⚠️'} Calorie Balance
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(report.average_calories || 0) >= 1800 && (report.average_calories || 0) <= 2500 ? 
                    'Balanced intake' : 'Monitor calorie intake'}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg text-center ${
                (report.average_water || 0) >= 2 ? 
                  (isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200') :
                  (isDark ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200')
              } border`}>
                <div className={`font-semibold ${
                  (report.average_water || 0) >= 2 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {(report.average_water || 0) >= 2 ? '✅' : '⚠️'} Hydration
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(report.average_water || 0) >= 2 ? 'Well hydrated' : 'Increase water intake'}
                </div>
              </div>
            </div>
          </div>

          {/* Steps Activity Section */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">👟</span>
              Weekly Activity Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <span>📊</span>
                  Average Daily Steps
                </h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, ((report.average_steps || 0) / 15000) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{report.average_steps ? Math.round(report.average_steps).toLocaleString() : 'N/A'} steps</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 15,000 steps daily</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  Goal Achievement
                </h4>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    (report.average_steps || 0) >= 15000 ? 'text-green-500' : 
                    (report.average_steps || 0) >= 10000 ? 'text-blue-500' : 
                    (report.average_steps || 0) >= 8000 ? 'text-orange-500' : 'text-red-500'
                  }`}>
                    {report.average_steps ? Math.round(((report.average_steps || 0) / 15000) * 100) : 0}%
                  </div>
                  <div className={`text-sm ${
                    (report.average_steps || 0) >= 15000 ? 'text-green-600' : 
                    (report.average_steps || 0) >= 10000 ? 'text-blue-600' : 
                    (report.average_steps || 0) >= 8000 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {(report.average_steps || 0) >= 15000 ? '🎉 Target Achieved!' : 
                     (report.average_steps || 0) >= 10000 ? '💪 Great Progress!' : 
                     (report.average_steps || 0) >= 8000 ? '🚶‍♂️ Good Start' : '🏃‍♂️ Keep Moving!'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activity Health Indicators */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-3 rounded-lg text-center ${
                (report.average_steps || 0) >= 15000 ? 
                  (isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200') :
                (report.average_steps || 0) >= 10000 ?
                  (isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200') :
                (report.average_steps || 0) >= 8000 ?
                  (isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200') :
                  (isDark ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200')
              } border`}>
                <div className={`font-semibold ${
                  (report.average_steps || 0) >= 15000 ? 'text-green-700 dark:text-green-300' : 
                  (report.average_steps || 0) >= 10000 ? 'text-blue-700 dark:text-blue-300' : 
                  (report.average_steps || 0) >= 8000 ? 'text-orange-700 dark:text-orange-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {(report.average_steps || 0) >= 15000 ? '✅' : 
                   (report.average_steps || 0) >= 10000 ? '🔥' : 
                   (report.average_steps || 0) >= 8000 ? '⚠️' : '❌'} Daily Activity
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(report.average_steps || 0) >= 15000 ? 'Excellent activity level' : 
                   (report.average_steps || 0) >= 10000 ? 'Good daily movement' : 
                   (report.average_steps || 0) >= 8000 ? 'Moderate activity' : 'Increase daily steps'}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg text-center ${
                (report.average_steps || 0) >= 12000 ? 
                  (isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200') :
                  (isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200')
              } border`}>
                <div className={`font-semibold ${
                  (report.average_steps || 0) >= 12000 ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
                }`}>
                  {(report.average_steps || 0) >= 12000 ? '✅' : '⚠️'} Cardiovascular Health
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(report.average_steps || 0) >= 12000 ? 'Great heart health support' : 'More steps for better heart health'}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg text-center ${
                (report.average_steps || 0) >= 10000 ? 
                  (isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200') :
                  (isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200')
              } border`}>
                <div className={`font-semibold ${
                  (report.average_steps || 0) >= 10000 ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
                }`}>
                  {(report.average_steps || 0) >= 10000 ? '✅' : '⚠️'} Fitness Level
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(report.average_steps || 0) >= 10000 ? 'Active lifestyle maintained' : 'Build more daily activity'}
                </div>
              </div>
            </div>
          </div>

          {/* Visualizations */}
          {report.daily_data && report.daily_data.length > 0 && (
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Daily Progress Trends
              </h3>
              
              <div className="space-y-12">
                {/* Mood & Energy Trend */}
                <div>
                  <h4 className="font-medium mb-4 text-center">Mood & Energy</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={report.daily_data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', {weekday: 'short'})} stroke={isDark ? '#9ca3af' : '#4b5563'} />
                        <YAxis domain={[0, 10]} stroke={isDark ? '#9ca3af' : '#4b5563'} />
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#374151' : '#e5e7eb', color: isDark ? '#ffffff' : '#000000' }} />
                        <Legend />
                        <Line type="monotone" dataKey="mood" stroke="#eab308" strokeWidth={2} name="Mood" />
                        <Line type="monotone" dataKey="energy" stroke="#a855f7" strokeWidth={2} name="Energy" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Diet Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium mb-4 text-center">Calorie Intake</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={report.daily_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                          <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', {weekday: 'short'})} stroke={isDark ? '#9ca3af' : '#4b5563'} />
                          <YAxis stroke={isDark ? '#9ca3af' : '#4b5563'} />
                          <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#374151' : '#e5e7eb', color: isDark ? '#ffffff' : '#000000' }} />
                          <Legend />
                          <Bar dataKey="calories" fill="#f97316" name="Calories (kcal)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4 text-center">Protein & Water</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={report.daily_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                          <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', {weekday: 'short'})} stroke={isDark ? '#9ca3af' : '#4b5563'} />
                          <YAxis yAxisId="left" stroke={isDark ? '#9ca3af' : '#4b5563'} />
                          <YAxis yAxisId="right" orientation="right" stroke={isDark ? '#9ca3af' : '#4b5563'} />
                          <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#374151' : '#e5e7eb', color: isDark ? '#ffffff' : '#000000' }} />
                          <Legend />
                          <Bar yAxisId="left" dataKey="protein" fill="#ef4444" name="Protein (g)" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="water" fill="#3b82f6" name="Water (L)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Steps Trend */}
                <div>
                  <h4 className="font-medium mb-4 text-center">Daily Steps</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.daily_data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', {weekday: 'short'})} stroke={isDark ? '#9ca3af' : '#4b5563'} />
                        <YAxis stroke={isDark ? '#9ca3af' : '#4b5563'} />
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#374151' : '#e5e7eb', color: isDark ? '#ffffff' : '#000000' }} />
                        <Legend />
                        <Bar dataKey="steps" fill="#22c55e" name="Steps" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Comparison */}
          {comparisonReports.length > 1 && (
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-2xl">⚖️</span>
                Weekly Comparison
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium mb-4 text-center">Average Ratings</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonReports}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="label" stroke={isDark ? '#9ca3af' : '#4b5563'} />
                        <YAxis domain={[0, 10]} stroke={isDark ? '#9ca3af' : '#4b5563'} />
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#374151' : '#e5e7eb', color: isDark ? '#ffffff' : '#000000' }} />
                        <Legend />
                        <Bar dataKey="average_mood" fill="#eab308" name="Mood" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="average_energy" fill="#a855f7" name="Energy" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="average_productivity" fill="#f97316" name="Productivity" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4 text-center">Activity & Completion</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonReports}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="label" stroke={isDark ? '#9ca3af' : '#4b5563'} />
                        <YAxis yAxisId="left" stroke={isDark ? '#9ca3af' : '#4b5563'} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke={isDark ? '#9ca3af' : '#4b5563'} />
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#374151' : '#e5e7eb', color: isDark ? '#ffffff' : '#000000' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="average_steps" fill="#22c55e" name="Steps (Avg)" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="completion_rate" fill="#3b82f6" name="Task Completion (%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Quotes */}
          {report.top_quotes && report.top_quotes.length > 0 && (
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-xl font-semibold mb-4">Top Quotes This Week</h3>
              <div className="space-y-3">
                {report.top_quotes.map((quote, index) => (
                  <blockquote key={index} className="border-l-4 border-blue-500 pl-4 italic">
                    "{quote}"
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Personal Insights & Self-Improvement Report */}
          {report.personal_insights && (
            <div className="space-y-6">
              {/* Top 5 Suggestions */}
              {report.personal_insights.suggestions && report.personal_insights.suggestions.length > 0 && (
                <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Top 5 Suggestions for Next Week
                  </h3>
                  <div className="space-y-3">
                    {report.personal_insights.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </span>
                        <p className={`leading-relaxed ${
                          isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Correlations */}
              {report.personal_insights.correlations && report.personal_insights.correlations.length > 0 && (
                <div className={`p-6 rounded-lg ${isDark ? 'bg-purple-900/50 border-purple-700' : 'bg-purple-50 border-purple-200'} shadow-lg border`}>
                  <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                    <span className="text-2xl">🔗</span>
                    AI-Discovered Correlations
                  </h3>
                  <div className="space-y-3">
                    {report.personal_insights.correlations.map((correlation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className={`text-xl ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>✨</span>
                        <p className={`leading-relaxed italic ${isDark ? 'text-purple-200' : 'text-purple-900'}`}>
                          {correlation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Positive Patterns */}
              {report.personal_insights.positives && report.personal_insights.positives.length > 0 && (
                <div className={`p-6 rounded-lg ${isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'} shadow-lg border`}>
                  <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                    isDark ? 'text-green-200' : 'text-green-800'
                  }`}>
                    <span className="text-2xl">✅</span>
                    What You Did Great This Week
                  </h3>
                  <div className="space-y-2">
                    {report.personal_insights.positives.map((positive, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">•</span>
                        <p className={`leading-relaxed ${
                          isDark ? 'text-green-200' : 'text-green-800'
                        }`}>
                          {positive}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas for Improvement */}
              {report.personal_insights.negatives && report.personal_insights.negatives.length > 0 && (
                <div className={`p-6 rounded-lg ${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200'} shadow-lg border`}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <span className="text-2xl">🎯</span>
                    Areas to Focus On
                  </h3>
                  <div className="space-y-2">
                    {report.personal_insights.negatives.map((negative, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-orange-500 mt-1">•</span>
                        <p className="text-orange-700 dark:text-orange-300 leading-relaxed">
                          {negative}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available for this week. Start logging your daily activities to generate reports!</p>
        </div>
      )}
    </div>
  )
}

export default WeeklyReportPage
