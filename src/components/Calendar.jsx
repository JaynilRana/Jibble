import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import Footer from './Footer'
import { useAuth } from '../contexts/AuthContext'
import { getLogs, getLogByDate } from '../api'
import { getDateKey, getCurrentDateKey, isToday } from '../utils/dateUtils'

const Calendar = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [logEntries, setLogEntries] = useState({})
  const [selectedLog, setSelectedLog] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load all logs for the calendar
  useEffect(() => {
    const loadLogs = async () => {
      if (!user) {
        console.log('❌ No user found, skipping log loading')
        return
      }
      
      try {
        setLoading(true)
        console.log('🔄 Loading logs for calendar...')
        console.log('👤 Current user:', user)
        console.log('🔑 Auth token:', localStorage.getItem('authToken'))
        
        // Check localStorage directly
        const localData = localStorage.getItem('jibble_user_data')
        console.log('💾 Local storage data:', localData)
        if (localData) {
          const parsed = JSON.parse(localData)
          console.log('📦 Parsed local data:', parsed)
          console.log('📝 Local logs:', parsed.logs)
        }
        
        const response = await getLogs()
        console.log('📊 Calendar API response:', response)
        
        if (response.success) {
          const logs = response.data || []
          console.log('📅 Logs loaded:', logs.length, 'entries')
          const entries = {}
          
          logs.forEach(log => {
            console.log('📝 Processing log:', log.date, log)
            const avgRating = log.ratings ? 
              Math.round((log.ratings.discipline + log.ratings.sociability + log.ratings.productivity) / 3) : 0
            entries[log.date] = { 
              rating: avgRating, 
              hasLog: true,
              log: log
            }
          })
          
          console.log('🗓️ Calendar entries created:', Object.keys(entries))
          setLogEntries(entries)
        } else {
          console.log('❌ Failed to load logs:', response)
        }
      } catch (error) {
        console.error('❌ Error loading logs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [user])

  // Load selected date's log details
  useEffect(() => {
    const loadSelectedLog = async () => {
      if (!selectedDate) {
        setSelectedLog(null)
        return
      }

      const dateKey = getDateKey(selectedDate)
      const existingEntry = logEntries[dateKey]
      
      if (existingEntry && existingEntry.log) {
        setSelectedLog(existingEntry.log)
      } else {
        // Try to load from API
        try {
          const response = await getLogByDate(dateKey)
          if (response.success && response.data) {
            setSelectedLog(response.data)
          } else {
            setSelectedLog(null)
          }
        } catch (error) {
          setSelectedLog(null)
        }
      }
    }

    loadSelectedLog()
  }, [selectedDate, logEntries])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    return { daysInMonth, startingDay }
  }

  // Using utility function for consistent date formatting

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-500'
    if (rating >= 3) return 'text-yellow-500'
    return 'text-red-500'
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate)
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dateString = getDateKey(date)
      const entry = logEntries[dateString]
      const isTodayDate = isToday(dateString)
      const isSelected = selectedDate && getDateKey(selectedDate) === dateString
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => setSelectedDate(date)}
          className={`h-16 sm:h-20 border p-1 sm:p-2 rounded-lg focus:outline-none focus-visible:ring-2 transition-all duration-200 ${
            isDark 
              ? 'border-gray-600 hover:bg-gray-700 focus-visible:ring-blue-500' 
              : 'border-gray-200 hover:bg-gray-50 focus-visible:ring-blue-500'
          } ${isTodayDate ? 'ring-2 ring-blue-500' : ''} ${isSelected ? (isDark ? 'bg-blue-900' : 'bg-blue-100') : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xs sm:text-sm font-source-sans ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {day}
            </span>
            {entry && entry.hasLog && (
              <div className="flex items-center gap-1">
                <span className={`text-[10px] sm:text-xs ${getRatingColor(entry.rating)} truncate max-w-[40px] sm:max-w-none`}>
                  {'⭐'.repeat(Math.min(entry.rating, 5))}
                </span>
                <span className="text-[10px] sm:text-xs text-green-500">✓</span>
              </div>
            )}
          </div>
          {entry && entry.hasLog && entry.log && (
            <div className="mt-0.5 sm:mt-1 space-y-0.5">
              {typeof entry.log.steps === 'number' && entry.log.steps > 0 && (
                <div className={`text-[9px] sm:text-[10px] leading-tight flex items-center justify-start gap-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span>👟</span>
                  <span className="truncate">{entry.log.steps >= 1000 ? `${Math.round(entry.log.steps/100)/10}k` : entry.log.steps}</span>
                </div>
              )}
              {entry.log.diet && (entry.log.diet.protein || entry.log.diet.calories || entry.log.diet.water) && (
                <div className={`text-[9px] sm:text-[10px] leading-tight grid grid-cols-3 gap-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="truncate">🥩 {entry.log.diet.protein || 0}g</span>
                  <span className="truncate">🔥 {entry.log.diet.calories || 0}</span>
                  <span className="truncate">💧 {entry.log.diet.water || 0}L</span>
                </div>
              )}
            </div>
          )}
        </button>
      )
    }
    
    return days
  }

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading calendar...</p>
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
          <h1 className={`text-3xl journal-heading mb-2 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Calendar View
          </h1>
          <p className={`text-lg journal-body ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Visualize your daily logs and track your journey over time
          </p>
        </div>

        {/* Calendar Controls */}
        <div className={`mb-6 p-4 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              ←
            </button>
            <h2 className={`text-xl journal-heading font-semibold ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4 text-xs sm:text-base">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className={`p-3 text-center font-source-sans font-semibold ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2">
            {renderCalendar()}
          </div>
        </div>

        {/* Selected Day Details - collapsible on mobile */}
        {selectedDate && (
          <div className={`mt-6 p-6 rounded-xl border-2 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-xl journal-heading mb-4 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {selectedDate.toLocaleDateString('default', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {selectedLog ? (
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'border-gray-600 bg-gray-700' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                {/* Quote */}
                {selectedLog.quote && (
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>Quote of the Day</h4>
                    <p className={`italic ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>"{selectedLog.quote}"</p>
                  </div>
                )}

                {/* Tasks */}
                {selectedLog.tasks && selectedLog.tasks.length > 0 && (
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>Tasks</h4>
                    <ul className="space-y-1">
                      {selectedLog.tasks.map((task, index) => (
                        <li key={index} className={`flex items-center gap-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <span>{task.completed ? '✅' : '⭕'}</span>
                          <span className={task.completed ? 'line-through opacity-60' : ''}>
                            {task.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ratings */}
                {selectedLog.ratings && (
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>Daily Ratings</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Discipline</span>
                        <div className="text-lg font-semibold text-blue-500">
                          {selectedLog.ratings.discipline}/10
                        </div>
                      </div>
                      <div>
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Sociability</span>
                        <div className="text-lg font-semibold text-green-500">
                          {selectedLog.ratings.sociability}/10
                        </div>
                      </div>
                      <div>
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>Productivity</span>
                        <div className="text-lg font-semibold text-purple-500">
                          {selectedLog.ratings.productivity}/10
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Steps */}
                {typeof selectedLog.steps === 'number' && (
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>Steps</h4>
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>👟 {selectedLog.steps.toLocaleString()}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>target 15,000</div>
                    </div>
                  </div>
                )}

                {/* Diet */}
                {selectedLog.diet && (
                  <div className="mb-2">
                    <h4 className={`font-semibold mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>Diet</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className={`${isDark ? 'text-red-300' : 'text-red-600'} font-semibold`}>{selectedLog.diet.protein || 0}g</div>
                        <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Protein</div>
                      </div>
                      <div className="text-center">
                        <div className={`${isDark ? 'text-orange-300' : 'text-orange-600'} font-semibold`}>{selectedLog.diet.calories || 0}</div>
                        <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Calories</div>
                      </div>
                      <div className="text-center">
                        <div className={`${isDark ? 'text-blue-300' : 'text-blue-600'} font-semibold`}>{selectedLog.diet.water || 0}L</div>
                        <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Water</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mood & Energy */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedLog.mood_score && (
                    <div>
                      <span className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Mood Score</span>
                      <div className="text-lg font-semibold text-yellow-500">
                        {selectedLog.mood_score}/10
                      </div>
                    </div>
                  )}
                  {selectedLog.energy_level && (
                    <div>
                      <span className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Energy Level</span>
                      <div className="text-lg font-semibold text-orange-500">
                        {selectedLog.energy_level}/10
                      </div>
                    </div>
                  )}
                </div>

                {/* Learning */}
                {selectedLog.learning && (
                  <div className="mt-4">
                    <h4 className={`font-semibold mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>Learning</h4>
                    <p className={`${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>{selectedLog.learning}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'border-gray-600 bg-gray-700' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <p className={`text-center ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No log entry found for this date.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

            {/* Footer */}
      <Footer />
    </div>
  )
}

export default Calendar 