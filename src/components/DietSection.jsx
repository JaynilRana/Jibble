import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useSettings } from '../contexts/SettingsContext'

const DietSection = ({ diet, onDietChange }) => {
  const { isDark } = useTheme()
  const { settings } = useSettings()

  const updateDietValue = (field, value) => {
    onDietChange(field, value)
  }

  const dietFields = [
    {
      key: 'protein',
      label: 'Protein Intake',
      unit: 'grams',
      icon: '🥩',
      min: 0,
      max: 300,
      step: 1,
      color: 'from-red-400 to-red-600'
    },
    {
      key: 'calories',
      label: 'Total Calories',
      unit: 'kcal',
      icon: '🔥',
      min: 0,
      max: 5000,
      step: 10,
      color: 'from-orange-400 to-orange-600'
    },
    {
      key: 'water',
      label: 'Water Intake',
      unit: 'liters',
      icon: '💧',
      min: 0,
      max: 10,
      step: 0.1,
      color: 'from-blue-400 to-blue-600'
    }
  ]

  return (
    <div className="section section-diet">
      <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${
        isDark ? 'text-green-200' : 'text-green-800'
      }`}>
        <span className="text-2xl">🍎</span>
        Daily Diet Tracking
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dietFields.map(field => (
          <div key={field.key} className={`text-center p-4 rounded-xl border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700/60 border-gray-600' 
              : 'bg-white/60 border-green-100'
          }`}>
            <label className={`block text-sm font-medium mb-3 ${
              isDark ? 'text-green-300' : 'text-green-700'
            }`}>
              {field.icon} {field.label}
            </label>
            
            {/* Value Display */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className={`text-2xl font-bold ${
                isDark ? 'text-cyan-400' : 'text-cyan-600'
              }`}>
                {diet[field.key] || 0}
              </span>
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {field.unit}
              </span>
            </div>
            
            {/* Input Field */}
            <div className="mb-4">
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={diet[field.key] || ''}
                onChange={(e) => updateDietValue(field.key, parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white focus:border-cyan-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-cyan-500'
                } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            </div>
            
            {/* Progress Bar */}
            <div className="relative mb-4">
              <div className={`w-full h-3 rounded-full ${
                isDark ? 'bg-gray-600' : 'bg-gray-200'
              }`}>
                <div 
                  className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${field.color}`}
                  style={{ 
                    width: `${Math.min(100, ((diet[field.key] || 0) / field.max) * 100)}%` 
                  }}
                ></div>
              </div>
              
              {/* Progress Labels */}
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{field.min}</span>
                <span className="text-center font-medium">
                  {Math.round(((diet[field.key] || 0) / field.max) * 100)}%
                </span>
                <span>{field.max}</span>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => updateDietValue(field.key, Math.max(field.min, (diet[field.key] || 0) - field.step))}
                className={`px-2 py-1 text-xs rounded transition-colors duration-300 ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                -{field.step}
              </button>
              <button
                onClick={() => updateDietValue(field.key, Math.min(field.max, (diet[field.key] || 0) + field.step))}
                className={`px-2 py-1 text-xs rounded transition-colors duration-300 ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                +{field.step}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Diet Summary */}
      {settings.showNutritionDetails && (
        <div className={`mt-6 p-4 rounded-xl border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-700/40 border-gray-600' 
            : 'bg-green-50/60 border-green-200'
        }`}>
          <h4 className={`text-lg font-medium mb-3 ${
            isDark ? 'text-green-300' : 'text-green-700'
          }`}>
            📊 Today's Nutrition Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className={`font-semibold ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                {diet.protein || 0}g Protein
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {diet.protein >= 50 ? '✅ Good' : diet.protein >= 30 ? '⚠️ Low' : '❌ Very Low'}
              </div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${
                isDark ? 'text-orange-400' : 'text-orange-600'
              }`}>
                {diet.calories || 0} kcal
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {diet.calories >= 1800 && diet.calories <= 2500 ? '✅ Balanced' : 
                 diet.calories < 1200 ? '⚠️ Low' : diet.calories > 3000 ? '⚠️ High' : '✅ Good'}
              </div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {diet.water || 0}L Water
              </div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {diet.water >= 2.5 ? '✅ Excellent' : diet.water >= 2 ? '✅ Good' : 
                 diet.water >= 1.5 ? '⚠️ Low' : '❌ Very Low'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DietSection
