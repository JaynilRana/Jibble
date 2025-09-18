import React, { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useQuote } from '../contexts/QuoteContext'
import { createLog, getLogByDate, getCloudDraft, saveCloudDraft, clearCloudDraft, subscribeCloudDraft } from '../api'
import QuoteSection from './QuoteSection'
import TasksSection from './TasksSection'
import RatingsSection from './RatingsSection'
import LearningSection from './LearningSection'
import DietSection from './DietSection'
import StepsCounter from './StepsCounter'
import draftService from '../services/draftService'
import { getDateKey } from '../utils/dateUtils'

const DailyLogForm = ({ currentDate }) => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { quote: dailyQuote } = useQuote()
  const getInitialFormData = () => ({
    quote: dailyQuote || '"The only way to do great work is to love what you do." - Steve Jobs',
    tasks: [
      { id: 1, text: 'Complete morning workout', completed: false },
      { id: 2, text: 'Read 30 pages of book', completed: false },
      { id: 3, text: 'Work on personal project', completed: false }
    ],
    ratings: {
      discipline: 5,
      sociability: 5,
      productivity: 5
    },
    learning: '',
    mood_score: 5,
    energy_level: 5,
    diet: {
      protein: 0,
      calories: 0,
      water: 0
    },
    steps: 0
  })
  const [formData, setFormData] = useState(getInitialFormData())
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // New state for loading
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'success' | 'error'
  const [showDiet, setShowDiet] = useState(true)
  const [showSteps, setShowSteps] = useState(true)

  // Using utility function for consistent date handling

  // Load draft or existing log for the selected date
  useEffect(() => {
    // Load UI preferences for toggles
    try {
      const key = user ? `ui_prefs_${user.id}` : 'ui_prefs_guest'
      const raw = localStorage.getItem(key)
      if (raw) {
        const prefs = JSON.parse(raw)
        if (typeof prefs.showDiet === 'boolean') setShowDiet(prefs.showDiet)
        if (typeof prefs.showSteps === 'boolean') setShowSteps(prefs.showSteps)
      }
    } catch (_) {}

    const dateKey = getDateKey(currentDate)
    if (!dateKey || !user) return
    
    const loadExistingLog = async () => {
      setIsLoading(true)
      try {
        // 1) Try cloud draft first for cross-device
        let chosen = null
        const cloudResp = await getCloudDraft(dateKey)
        const cloudDraft = cloudResp?.data || null

        // 2) Check local draft
        const localDraft = draftService.getDraft(user.id, dateKey)

        // 3) Choose newest by _updatedAt
        const ts = (obj) => new Date(obj?._updatedAt || 0).getTime()
        if (cloudDraft && (!localDraft || ts(cloudDraft) >= ts(localDraft))) {
          chosen = cloudDraft
        } else if (localDraft) {
          chosen = localDraft
        }

        if (chosen) {
          setFormData(prev => ({
            ...prev,
            ...chosen,
            tasks: chosen.tasks || prev.tasks,
            ratings: chosen.ratings || prev.ratings,
            diet: chosen.diet || prev.diet,
            steps: chosen.steps || prev.steps
          }))
          console.log('📝 Loaded draft for:', dateKey, 'source:', chosen === cloudDraft ? 'cloud' : 'local')

          // If local is newer than cloud, push it to cloud for sync
          if (chosen === localDraft && (!cloudDraft || ts(localDraft) > ts(cloudDraft))) {
            await saveCloudDraft(dateKey, localDraft)
          }

          // Subscribe to cloud updates so the other device's edits appear live
          if (user) {
            if (loadExistingLog._unsub) { try { loadExistingLog._unsub() } catch (_) {} }
            loadExistingLog._unsub = subscribeCloudDraft(dateKey, (remote) => {
              if (!remote) return
              const localTs = ts(draftService.getDraft(user.id, dateKey))
              const remoteTs = ts(remote)
              if (remoteTs >= localTs) {
                setFormData(prev => ({
                  ...prev,
                  ...remote,
                  tasks: remote.tasks || prev.tasks,
                  ratings: remote.ratings || prev.ratings,
                  diet: remote.diet || prev.diet,
                  steps: remote.steps || prev.steps
                }))
              }
            })
          }
          return
        }

        // Otherwise fetch existing log from Firestore
        const response = await getLogByDate(dateKey)
        if (response && response.data) {
          setFormData(prev => ({
            ...prev,
            ...response.data,
            tasks: response.data.tasks || prev.tasks,
            ratings: response.data.ratings || prev.ratings,
            mood_score: response.data.mood_score || prev.mood_score,
            energy_level: response.data.energy_level || prev.energy_level,
            diet: response.data.diet || prev.diet,
            steps: response.data.steps || prev.steps
          }))
          console.log('✅ Loaded existing log for:', dateKey)
        } else {
          console.log('📝 No existing log found for:', dateKey)
          // Clean slate for new date: fresh form
          setFormData(getInitialFormData())
        }
      } catch (error) {
        console.log('📝 No existing log found for:', dateKey)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadExistingLog()
    return () => { if (loadExistingLog._unsub) { try { loadExistingLog._unsub() } catch (_) {} } }
  }, [currentDate, user, dailyQuote])

  // Persist UI preferences
  useEffect(() => {
    try {
      const key = user ? `ui_prefs_${user.id}` : 'ui_prefs_guest'
      const raw = localStorage.getItem(key)
      const existing = raw ? JSON.parse(raw) : {}
      const next = { ...existing, showDiet, showSteps }
      localStorage.setItem(key, JSON.stringify(next))
    } catch (_) {}
  }, [showDiet, showSteps, user])

  const persistDraft = async (partial) => {
    const dateKey = getDateKey(currentDate)
    if (!dateKey || !user) return
    const next = { ...formData, ...partial }
    // Update timestamps for conflict resolution
    const withTs = { ...next, _updatedAt: new Date().toISOString() }
    // Save locally for offline
    draftService.saveDraft(user.id, dateKey, withTs)
    // Save to cloud for cross-device
    try { await saveCloudDraft(dateKey, withTs) } catch (e) { console.warn('Cloud draft save failed:', e?.message || e) }
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
      steps: formData.steps
    }

    setIsSaving(true)
    setSaveStatus('idle')
    try {
      await createLog(payload)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2500)
      if (user) {
        draftService.clearDraft(user.id, dateKey)
        try { await clearCloudDraft(dateKey) } catch (_) {}
      }
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
      
      {/* Diet Toggle */}
      <div className="mb-2 flex items-center justify-between">
        <div className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm font-medium flex items-center gap-2`}>
          🍎 Diet
        </div>
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={showDiet} onChange={() => setShowDiet(v => !v)} />
          <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} relative peer-checked:${isDark ? 'bg-green-600' : 'bg-green-500'}`}>
            <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-5"></span>
          </div>
        </label>
      </div>
      {showDiet && (
        <DietSection 
          diet={formData.diet}
          onDietChange={updateDiet}
        />
      )}
      
      {/* Steps Toggle */}
      <div className="mb-2 flex items-center justify-between">
        <div className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm font-medium flex items-center gap-2`}>
          👟 Steps
        </div>
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={showSteps} onChange={() => setShowSteps(v => !v)} />
          <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} relative peer-checked:${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
            <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-5"></span>
          </div>
        </label>
      </div>
      {/* Steps Counter Section */}
      <div className="mb-6">
        {showSteps && (
          <StepsCounter 
            steps={formData.steps}
            onStepsChange={updateSteps}
          />
        )}
      </div>
      
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
              onChange={(e) => {
                const v = parseInt(e.target.value)
                setFormData(prev => ({ ...prev, mood_score: v }))
                persistDraft({ mood_score: v })
              }}
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
              onChange={(e) => {
                const v = parseInt(e.target.value)
                setFormData(prev => ({ ...prev, energy_level: v }))
                persistDraft({ energy_level: v })
              }}
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