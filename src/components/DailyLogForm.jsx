import React, { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useQuote } from '../contexts/QuoteContext'
import { useGamification } from '../contexts/GamificationContext'
import { createLog, getLogByDate } from '../api'
import QuoteSection from './QuoteSection'
import TasksSection from './TasksSection'
import RatingsSection from './RatingsSection'
import LearningSection from './LearningSection'
import DietSection from './DietSection'
import StepsCounter from './StepsCounter'
import draftService from '../services/draftService'
import { getDateKey } from '../utils/dateUtils'
import { useSettings } from '../contexts/SettingsContext'

const DailyLogForm = ({ currentDate }) => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { quote: dailyQuote } = useQuote()
  const { settings, toggleNutritionDetails } = useSettings()
  const { processNewLog } = useGamification()
  const [formData, setFormData] = useState({
    quote: '',
    tasks: [],
    ratings: {
      discipline: 5,
      sociability: 5,
      productivity: 5
    },
    learning: '',
    mood_score: 5,
    energy_level: 5,
    diet: {
      mealsText: { breakfast: '', lunch: '', snack: '', dinner: '' },
      nutrients: { protein: 0, fats: 0, carbohydrates: 0, sugars: 0, calories: 0 },
      water: 0
    },
    steps: 0,
    custom_metrics: {}
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // New state for loading
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'success' | 'error'

  // Using utility function for consistent date handling

  // Load draft or existing log for the selected date
  useEffect(() => {
    const dateKey = getDateKey(currentDate)
    if (!dateKey || !user) return
    
    const loadExistingLog = async () => {
      setIsLoading(true)
      try {
        // First try to load draft (now async)
        const draft = await draftService.getDraft(user.id, dateKey)
        if (draft) {
          setFormData(prev => ({
            ...prev,
            ...draft,
            tasks: draft.tasks || prev.tasks,
            ratings: draft.ratings || prev.ratings,
            diet: draft.diet || prev.diet,
            steps: draft.steps || prev.steps,
            custom_metrics: draft.custom_metrics || prev.custom_metrics || {}
          }))
          console.log('📝 Loaded draft for:', dateKey)
          return
        }

        // Otherwise fetch existing log from Firestore
        const response = await getLogByDate(dateKey)
        if (response.success && response.data) {
          setFormData(prev => ({
            ...prev,
            ...response.data,
            tasks: response.data.tasks || prev.tasks,
            ratings: response.data.ratings || prev.ratings,
            mood_score: response.data.mood_score || prev.mood_score,
            energy_level: response.data.energy_level || prev.energy_level,
            diet: response.data.diet || prev.diet,
            steps: response.data.steps || prev.steps,
            custom_metrics: response.data.custom_metrics || prev.custom_metrics || {}
          }))
          console.log('✅ Loaded existing log for:', dateKey)
        } else {
          console.log('📝 No existing log found for:', dateKey)
          // Reset to clean form for new day
          setFormData({
            quote: dailyQuote,
            tasks: [],
            ratings: {
              discipline: 5,
              sociability: 5,
              productivity: 5
            },
            learning: '',
            mood_score: 5,
            energy_level: 5,
            diet: {
              mealsText: { breakfast: '', lunch: '', snack: '', dinner: '' },
              nutrients: { protein: 0, fats: 0, carbohydrates: 0, sugars: 0, calories: 0 },
              water: 0
            },
            steps: 0,
            custom_metrics: {}
          })
        }
      } catch (error) {
        console.log('📝 No existing log found for:', dateKey)
        // Reset to clean form for new day on error
        setFormData({
          quote: dailyQuote,
          tasks: [],
          ratings: {
            discipline: 5,
            sociability: 5,
            productivity: 5
          },
          learning: '',
          mood_score: 5,
          energy_level: 5,
          diet: {
            mealsText: { breakfast: '', lunch: '', snack: '', dinner: '' },
            nutrients: { protein: 0, fats: 0, carbohydrates: 0, sugars: 0, calories: 0 },
            water: 0
          },
          steps: 0,
          custom_metrics: {}
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadExistingLog()
  }, [currentDate, user, dailyQuote])

  const persistDraft = async (partial) => {
    const dateKey = getDateKey(currentDate)
    if (!dateKey || !user) return
    const next = { ...formData, ...partial }
    await draftService.saveDraft(user.id, dateKey, next)
  }

  const updateQuote = (newQuote) => {
    setFormData(prev => ({ ...prev, quote: newQuote }))
    persistDraft({ quote: newQuote })
  }

  const updateTasks = (newTasks) => {
    setFormData(prev => ({ ...prev, tasks: newTasks }))
    persistDraft({ tasks: newTasks })
  }

  const updateRatings = (category, rating) => {
    const nextRatings = { ...formData.ratings, [category]: rating }
    setFormData(prev => ({
      ...prev,
      ratings: nextRatings
    }))
    persistDraft({ ratings: nextRatings })
  }

  const updateLearning = (newLearning) => {
    setFormData(prev => ({ ...prev, learning: newLearning }))
    persistDraft({ learning: newLearning })
  }

  const updateDiet = (field, value) => {
    const nextDiet = { ...formData.diet, [field]: value }
    setFormData(prev => ({
      ...prev,
      diet: nextDiet
    }))
    persistDraft({ diet: nextDiet })
  }

  const updateSteps = (newSteps) => {
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }))
    persistDraft({ steps: newSteps })
  }

  const handleSave = async () => {
    const dateKey = getDateKey(currentDate)
    if (!dateKey) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2500)
      return
    }

    const payload = {
      date: dateKey,
      quote: formData.quote,
      tasks: formData.tasks,
      ratings: formData.ratings,
      learning: formData.learning,
      mood_score: formData.mood_score,
      energy_level: formData.energy_level,
      diet: formData.diet,
      steps: formData.steps,
      custom_metrics: formData.custom_metrics
    }

    setIsSaving(true)
    setSaveStatus('idle')
    try {
      await createLog(payload)
      setSaveStatus('success')
      
      // Process Gamification
      await processNewLog(payload)

      setTimeout(() => setSaveStatus('idle'), 2500)
      if (user) {
        await draftService.clearDraft(user.id, dateKey)
      }
      
      // Dispatch custom event to notify other components of log update
      window.dispatchEvent(new CustomEvent('logUpdated', {
        detail: { dateKey, payload }
      }))
    } catch (error) {
      console.error('Error saving log:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={`relative rounded-2xl shadow-xl p-8 mb-8 border transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 border-gray-600' 
        : 'bg-gradient-to-br from-white via-blue-50 to-cyan-50 border-blue-100'
    }`}>
      {saveStatus !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className={`${
            saveStatus === 'success'
              ? (isDark ? 'bg-green-900 border-green-700 text-green-100' : 'bg-white border-green-200 text-green-700')
              : (isDark ? 'bg-red-900 border-red-700 text-red-100' : 'bg-white border-red-200 text-red-700')
          } relative px-6 py-5 rounded-xl border shadow-2xl max-w-sm w-[90%] text-center`}> 
            <div className="text-4xl mb-2">{saveStatus === 'success' ? '✅' : '⚠️'}</div>
            <div className="text-base font-medium">
              {saveStatus === 'success' ? 'Log saved successfully' : 'Failed to save log. Please try again'}
            </div>
          </div>
        </div>
      )}
      <h2 className={`text-2xl journal-heading mb-6 ${
        isDark ? 'text-gray-100' : 'text-gray-800'
      }`}>
        Daily Log - {currentDate instanceof Date ? currentDate.toDateString() : String(currentDate)}
        {isLoading && (
          <span className="ml-2 text-sm text-blue-500">🔄 Loading...</span>
        )}
      </h2>

      <QuoteSection 
        quote={formData.quote}
        onQuoteChange={updateQuote}
      />
      
      <TasksSection 
        tasks={formData.tasks}
        onTasksChange={updateTasks}
      />
      
      <RatingsSection 
        ratings={formData.ratings}
        onRatingsChange={updateRatings}
      />
      
      <LearningSection 
        learning={formData.learning}
        onLearningChange={updateLearning}
      />
      
      {/* Diet toggle just above the section */}
      <div className="mb-3 flex justify-end">
        <button
          onClick={toggleNutritionDetails}
          className={`${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-3 py-1 rounded`}
        >
          {settings.showNutritionDetails ? '🥗 Hide nutrition details' : '🥗 Show nutrition details'}
        </button>
      </div>
      
      {settings.showNutritionDetails && (
        <DietSection 
          diet={formData.diet}
          onDietChange={updateDiet}
        />
      )}
      
      {/* Steps Counter Section (hidden when nutrition details are hidden) */}
      {settings.showNutritionDetails && (
        <div className="mb-6">
          <StepsCounter 
            steps={formData.steps}
            onStepsChange={updateSteps}
          />
        </div>
      )}
      
      {/* Mood and Energy Section */}
      <div className={`mb-6 p-6 rounded-xl transition-colors duration-300 ${
        isDark ? 'bg-gray-700' : 'bg-blue-50'
      }`}>
        <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
          isDark ? 'text-blue-200' : 'text-blue-800'
        }`}>
          <span className="text-2xl">😊</span>
          Mood & Energy
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mood Score */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Mood Score (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.mood_score}
              onChange={(e) => setFormData(prev => ({ ...prev, mood_score: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>😢 1</span>
              <span className="text-center">{formData.mood_score}</span>
              <span>😊 10</span>
            </div>
          </div>
          
          {/* Energy Level */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Energy Level (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.energy_level}
              onChange={(e) => setFormData(prev => ({ ...prev, energy_level: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>😴 1</span>
              <span className="text-center">{formData.energy_level}</span>
              <span>⚡ 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Metrics Section */}
      {settings.customMetrics && settings.customMetrics.length > 0 && (
        <div className={`mb-6 p-6 rounded-xl transition-colors duration-300 ${
          isDark ? 'bg-gray-700' : 'bg-purple-50'
        }`}>
          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
            isDark ? 'text-purple-200' : 'text-purple-800'
          }`}>
            <span className="text-2xl">📊</span>
            Custom Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.customMetrics.map(metric => (
              <div key={metric.id}>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {metric.name}
                </label>
                <input
                  type="number"
                  value={formData.custom_metrics?.[metric.id] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                    const nextMetrics = { ...(formData.custom_metrics || {}), [metric.id]: val };
                    setFormData(prev => ({ ...prev, custom_metrics: nextMetrics }));
                    persistDraft({ custom_metrics: nextMetrics });
                  }}
                  className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDark 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Saving...
            </span>
          ) : '💾 Save Log'}
        </button>
      </div>
    </div>
  )
}

export default DailyLogForm 