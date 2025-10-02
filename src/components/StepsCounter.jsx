import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const StepsCounter = ({ steps, onStepsChange }) => {
  const { isDark } = useTheme()
  
  const targetSteps = 10000
  const progress = Math.min(100, (steps / targetSteps) * 100)
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const updateSteps = (newSteps) => {
    onStepsChange(Math.max(0, Math.min(50000, newSteps))) // Cap at 50k steps
  }

  const getStepsColor = () => {
    if (progress >= 100) return isDark ? '#10B981' : '#059669' // Green when target reached
    if (progress >= 75) return isDark ? '#3B82F6' : '#2563EB' // Blue when close
    if (progress >= 50) return isDark ? '#F59E0B' : '#D97706' // Orange when halfway
    return isDark ? '#EF4444' : '#DC2626' // Red when low
  }

  const getStepsStatus = () => {
    if (progress >= 100) return '🎉 Target Achieved!'
    if (progress >= 75) return '🔥 Almost There!'
    if (progress >= 50) return '💪 Keep Going!'
    if (progress >= 25) return '🚶‍♂️ Getting Started'
    return '🏃‍♂️ Let\'s Move!'
  }

  return (
    <div className={`p-6 rounded-xl border transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-white border-blue-200 shadow-sm'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 text-center flex items-center justify-center gap-2 ${
        isDark ? 'text-blue-200' : 'text-blue-800'
      }`}>
        <span className="text-xl">👟</span>
        Daily Steps
      </h3>
      
      {/* Circular Progress */}
      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={isDark ? '#374151' : '#E5E7EB'}
            strokeWidth="8"
            fill="none"
          />
          
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={getStepsColor()}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-in-out"
          />
          
          {/* Additional loop for over-achievement */}
          {progress > 100 && (
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={getStepsColor()}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={circumference - ((progress - 100) / 100) * circumference}
              className="transition-all duration-500 ease-in-out opacity-60"
            />
          )}
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-2xl font-bold ${
            isDark ? 'text-cyan-400' : 'text-cyan-600'
          }`}>
            {steps.toLocaleString()}
          </div>
          <div className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            steps
          </div>
          <div className={`text-xs font-medium mt-1 ${
            progress >= 100 ? 'text-green-500' : 
            progress >= 75 ? 'text-blue-500' : 
            progress >= 50 ? 'text-orange-500' : 'text-red-500'
          }`}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>
      
      {/* Target and Status */}
      <div className="text-center mb-4">
        <div className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Target: {targetSteps.toLocaleString()} steps
        </div>
        <div className={`text-sm font-medium mt-1 ${
          progress >= 100 ? 'text-green-500' : 
          progress >= 75 ? 'text-blue-500' : 
          progress >= 50 ? 'text-orange-500' : 'text-red-500'
        }`}>
          {getStepsStatus()}
        </div>
      </div>
      
      {/* Input Controls */}
      <div className="space-y-3">
        {/* Number Input */}
        <div>
          <input
            type="number"
            min="0"
            max="50000"
            step="100"
            value={steps || ''}
            onChange={(e) => updateSteps(parseInt(e.target.value) || 0)}
            className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 text-center ${
              isDark 
                ? 'bg-gray-600 border-gray-500 text-white focus:border-cyan-400' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-cyan-500'
            } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
            placeholder="Enter steps"
          />
        </div>
        
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => updateSteps(steps - 1000)}
            className={`px-2 py-1 text-xs rounded transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            -1K
          </button>
          <button
            onClick={() => updateSteps(steps - 500)}
            className={`px-2 py-1 text-xs rounded transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            -500
          </button>
          <button
            onClick={() => updateSteps(steps + 500)}
            className={`px-2 py-1 text-xs rounded transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            +500
          </button>
          <button
            onClick={() => updateSteps(steps + 1000)}
            className={`px-2 py-1 text-xs rounded transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            +1K
          </button>
        </div>
        
        {/* Preset Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateSteps(10000)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors duration-300 ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            10K Steps
          </button>
          <button
            onClick={() => updateSteps(15000)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors duration-300 ${
              isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            15K Target
          </button>
        </div>
      </div>
      
      {/* Achievement Badge */}
      {progress >= 100 && (
        <div className={`mt-4 p-3 rounded-lg text-center ${
          isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'
        } border`}>
          <div className="text-green-600 dark:text-green-400 font-semibold">
            🏆 Daily Goal Achieved!
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {steps > targetSteps ? `+${(steps - targetSteps).toLocaleString()} extra steps!` : 'Perfect!'}
          </div>
        </div>
      )}
    </div>
  )
}

export default StepsCounter
