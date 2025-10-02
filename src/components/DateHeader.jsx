import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const DateHeader = ({ currentDate, onDateChange, onGoToToday }) => {
  const { isDark } = useTheme()
  
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <div className="text-center mb-8">
      <div className={`rounded-2xl p-6 shadow-lg mb-4 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600' 
          : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500'
      }`}>
        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
          {formatDate(currentDate)}
        </h2>
        <div className={`text-sm font-medium ${
          isDark ? 'text-blue-200' : 'text-blue-100'
        }`}>
          🌊 Ocean Breeze Daily Log
        </div>
      </div>
      
      <div className="flex justify-center gap-3">
        <button 
          className={`text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg border ${
            isDark 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-blue-400/30' 
              : 'bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 border-blue-300/30'
          }`}
          onClick={() => onDateChange(-1)}
        >
          ← Previous
        </button>
        <button 
          className={`text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg border ${
            isDark 
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 border-teal-400/30' 
              : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 border-teal-300/30'
          }`}
          onClick={onGoToToday}
        >
          🌊 Today
        </button>
        <button 
          className={`text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg border ${
            isDark 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-cyan-400/30' 
              : 'bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 border-cyan-300/30'
          }`}
          onClick={() => onDateChange(1)}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default DateHeader 