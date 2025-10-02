import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SettingsContext = createContext()

const STORAGE_KEY = 'app_settings_v1'

const defaultSettings = {
  quoteMode: 'ai', // 'ai' | 'curated'
  showNutritionDetails: true,
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultSettings
      const parsed = JSON.parse(raw)
      return { ...defaultSettings, ...parsed }
    } catch {
      return defaultSettings
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {}
  }, [settings])

  const value = useMemo(() => ({
    settings,
    setSettings,
    setQuoteMode: (mode) => setSettings(prev => ({ ...prev, quoteMode: mode })),
    toggleNutritionDetails: () => setSettings(prev => ({ ...prev, showNutritionDetails: !prev.showNutritionDetails })),
  }), [settings])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export default SettingsContext


