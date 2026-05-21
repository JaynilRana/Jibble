import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useSettings } from '../contexts/SettingsContext'
import { analyzeMealsWithGemini } from '../services/geminiService'

const DietSection = ({ diet, onDietChange }) => {
  const { isDark } = useTheme()
  const { settings } = useSettings()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  // Provide defaults for backwards compatibility or initial state
  const meals = diet.mealsText || { breakfast: '', lunch: '', snack: '', dinner: '' }
  const nutrients = diet.nutrients || { protein: diet.protein || 0, fats: 0, carbohydrates: 0, sugars: 0, calories: diet.calories || 0 }
  const waterLiters = diet.water || 0

  const handleMealChange = (mealType, value) => {
    const updatedMeals = { ...meals, [mealType]: value }
    onDietChange('mealsText', updatedMeals)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError('')
    try {
      const calculatedNutrients = await analyzeMealsWithGemini(meals)
      onDietChange('nutrients', calculatedNutrients)
    } catch (err) {
      setError(err.message || 'Failed to analyze meals.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleWaterAdd = () => {
    // Add 1 glass (200ml = 0.2L)
    const newWater = parseFloat((waterLiters + 0.2).toFixed(1))
    onDietChange('water', newWater)
  }

  const handleWaterSubtract = () => {
    // Subtract 1 glass (200ml = 0.2L), min 0
    const newWater = Math.max(0, parseFloat((waterLiters - 0.2).toFixed(1)))
    onDietChange('water', newWater)
  }

  const nutrientFields = [
    { key: 'protein', label: 'Protein', unit: 'g', color: isDark ? 'text-red-400' : 'text-red-600', icon: '🥩' },
    { key: 'fats', label: 'Fats', unit: 'g', color: isDark ? 'text-yellow-400' : 'text-yellow-600', icon: '🥑' },
    { key: 'carbohydrates', label: 'Carbs', unit: 'g', color: isDark ? 'text-orange-400' : 'text-orange-600', icon: '🍞' },
    { key: 'sugars', label: 'Sugars', unit: 'g', color: isDark ? 'text-pink-400' : 'text-pink-600', icon: '🍬' },
    { key: 'calories', label: 'Calories', unit: 'kcal', color: isDark ? 'text-blue-400' : 'text-blue-600', icon: '🔥' }
  ]

  const mealInputs = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { key: 'lunch', label: 'Lunch', icon: '☀️' },
    { key: 'snack', label: 'Snacks', icon: '🍪' },
    { key: 'dinner', label: 'Dinner', icon: '🌙' }
  ]

  return (
    <div className="section section-diet">
      <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-green-200' : 'text-green-800'}`}>
        <span className="text-2xl">🍎</span>
        AI Diet Tracker
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Meals Input Column */}
        <div className={`p-5 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-gray-700/60 border-gray-600' : 'bg-white/60 border-green-100'}`}>
          <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
            🍽️ Log Your Meals
          </h4>
          <div className="space-y-4">
            {mealInputs.map((meal) => (
              <div key={meal.key}>
                <label className={`block text-sm font-medium mb-1 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span>{meal.icon}</span> {meal.label}
                </label>
                <textarea
                  value={meals[meal.key]}
                  onChange={(e) => handleMealChange(meal.key, e.target.value)}
                  placeholder={`What did you eat for ${meal.label.toLowerCase()}? e.g. 2 eggs, 1 toast`}
                  className={`w-full px-3 py-2 rounded-lg border resize-none h-20 transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white focus:border-green-400 focus:ring-green-400/20' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500/20'
                  } focus:outline-none focus:ring-2`}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`mt-4 w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isAnalyzing 
                ? 'opacity-70 cursor-not-allowed bg-gray-500 text-white' 
                : isDark 
                  ? 'bg-green-600 hover:bg-green-500 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Analyzing with Gemini...
              </>
            ) : (
              <>
                <span>✨</span> Analyze & Calculate Nutrients
              </>
            )}
          </button>
          
          {error && (
            <div className={`mt-3 text-sm p-3 rounded-lg border ${isDark ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Results & Hydration Column */}
        <div className="space-y-6">
          {/* Nutrients Result */}
          <div className={`p-5 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-gray-700/60 border-gray-600' : 'bg-white/60 border-green-100'}`}>
            <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
              📊 Estimated Nutrients
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {nutrientFields.map((field) => (
                <div key={field.key} className={`p-3 rounded-lg flex flex-col items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-green-50'}`}>
                  <span className="text-xl mb-1">{field.icon}</span>
                  <span className={`text-2xl font-bold ${field.color}`}>
                    {nutrients[field.key] || 0}
                  </span>
                  <span className={`text-xs uppercase font-medium tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {field.label} ({field.unit})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hydration Section */}
          <div className={`p-5 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-gray-700/60 border-gray-600' : 'bg-white/60 border-blue-100'}`}>
            <h4 className={`text-lg font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              💧 Hydration Tracker
            </h4>
            
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-6 mb-6">
                <button
                  onClick={handleWaterSubtract}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-110 active:scale-95 ${
                    isDark ? 'bg-gray-600 hover:bg-gray-500 text-blue-300' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  -
                </button>
                
                <div className="flex flex-col items-center text-center w-32">
                  <div className={`text-4xl font-bold mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {Math.round(waterLiters / 0.2)}
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Glasses
                  </div>
                  <div className={`text-xs mt-2 flex items-center justify-center gap-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={waterLiters === 0 ? '' : Number(waterLiters).toString()}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        onDietChange('water', val);
                      }}
                      className={`w-16 px-1 py-0.5 text-center text-sm rounded border transition-colors ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-white' 
                          : 'bg-white border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
                      }`}
                    />
                    <span>Liters</span>
                  </div>
                </div>
                
                <button
                  onClick={handleWaterAdd}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-110 active:scale-95 ${
                    isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  +
                </button>
              </div>

              {/* Water Progress Bar */}
              <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>0L</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Goal: 2.5L</span>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-blue-100'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, (waterLiters / 2.5) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DietSection
