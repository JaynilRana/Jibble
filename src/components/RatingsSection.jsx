import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const RatingsSection = ({ ratings, onRatingsChange }) => {
  const { isDark } = useTheme()

  const setRating = (category, rating) => {
    onRatingsChange(category, rating)
  }

  const categories = [
    { key: 'discipline', label: 'Discipline' },
    { key: 'sociability', label: 'Sociability' },
    { key: 'productivity', label: 'Productivity' }
  ]

  // Generate rating options from 1 to 10 with 1.0 intervals
  const ratingOptions = []
  for (let i = 1; i <= 10; i += 1.0) {
    ratingOptions.push(i)
  }

  return (
    <div className="section section-ratings">
      <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${
        isDark ? 'text-blue-200' : 'text-blue-800'
      }`}>
        <span className="text-2xl">⭐</span>
        Daily Ratings
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.key} className={`text-center p-4 rounded-xl border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700/60 border-gray-600' 
              : 'bg-white/60 border-blue-100'
          }`}>
            <label className={`block text-sm font-medium mb-3 ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              {category.label}
            </label>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl text-amber-400">⭐</span>
              <span className={`text-2xl font-bold ${
                isDark ? 'text-cyan-400' : 'text-cyan-600'
              }`}>
                {ratings[category.key]}/10
              </span>
            </div>
            
            {/* Progress Bar Slider */}
            <div className="relative mb-4">
              <div className={`w-full h-3 rounded-full ${
                isDark ? 'bg-gray-600' : 'bg-gray-200'
              }`}>
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                      : 'bg-gradient-to-r from-cyan-400 to-blue-400'
                  }`}
                  style={{ width: `${(ratings[category.key] / 10) * 100}%` }}
                ></div>
              </div>
              
              {/* Slider Thumb */}
              <div 
                className={`absolute top-1/2 w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-300 transform -translate-y-1/2 ${
                  isDark 
                    ? 'bg-cyan-400 border-cyan-300 shadow-lg' 
                    : 'bg-cyan-500 border-cyan-400 shadow-lg'
                }`}
                style={{ left: `${((ratings[category.key] - 1) / 9) * 100}%` }}
                onMouseDown={(e) => {
                  const slider = e.currentTarget.parentElement
                  const rect = slider.getBoundingClientRect()
                  
                  const handleMouseMove = (moveEvent) => {
                    const x = moveEvent.clientX - rect.left
                    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
                    const rating = 1 + (percentage / 100) * 9
                    const roundedRating = Math.round(rating) // Round to nearest whole number
                    const clampedRating = Math.max(1, Math.min(10, roundedRating))
                    setRating(category.key, clampedRating)
                  }
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }
                  
                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
                onTouchStart={(e) => {
                  const slider = e.currentTarget.parentElement
                  const rect = slider.getBoundingClientRect()

                  const handleTouchMove = (touchEvent) => {
                    const touch = touchEvent.touches[0]
                    if (!touch) return
                    const x = touch.clientX - rect.left
                    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
                    const rating = 1 + (percentage / 100) * 9
                    const roundedRating = Math.round(rating)
                    const clampedRating = Math.max(1, Math.min(10, roundedRating))
                    setRating(category.key, clampedRating)
                  }

                  const handleTouchEnd = () => {
                    document.removeEventListener('touchmove', handleTouchMove)
                    document.removeEventListener('touchend', handleTouchEnd)
                  }

                  document.addEventListener('touchmove', handleTouchMove, { passive: true })
                  document.addEventListener('touchend', handleTouchEnd)
                }}
              ></div>
            </div>
            
            {/* Rating Scale Labels */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RatingsSection 