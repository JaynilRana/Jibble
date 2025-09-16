import React, { createContext, useContext, useMemo, useEffect, useState } from 'react'
import { getDailyQuoteWithAttribution } from '../utils/dailyQuote'
import { getAIQuote } from '../api'
import { useAuth } from './AuthContext'
import { getCurrentDateKey } from '../utils/dateUtils'

const QuoteContext = createContext()

export const useQuote = () => {
  const context = useContext(QuoteContext)
  if (!context) throw new Error('useQuote must be used within a QuoteProvider')
  return context
}

export const QuoteProvider = ({ children }) => {
  const { user } = useAuth()
  const [dayKey, setDayKey] = useState(() => getCurrentDateKey())

  const [quote, setQuote] = useState('')

  useEffect(() => {
    const loadQuote = async () => {
      // Use localStorage to avoid repeats for at least 60 days
      const storageKey = 'ai_quote_history_v1'
      const todayKey = getCurrentDateKey()
      try {
        const raw = localStorage.getItem(storageKey)
        const history = raw ? JSON.parse(raw) : { used: [], byDate: {} }
        // If already set for today, reuse
        if (history.byDate && history.byDate[todayKey]) {
          setQuote(history.byDate[todayKey])
          return
        }

        // Try backend/public AI quotes
        const res = await getAIQuote()
        let next = null
        if (res.success && res.text) {
          // ensure not in recent used (60-day window)
          const recent = (history.used || []).slice(-120) // keep more buffer
          if (!recent.includes(res.text)) {
            next = res.text
          }
        }

        // Fallback to deterministic local quote if AI unavailable or duplicate
        if (!next) {
          next = getDailyQuoteWithAttribution({ userName: user?.name })
        }

        // Persist and update history (cap size)
        const updatedUsed = [...(history.used || []), next].slice(-300)
        const updatedByDate = { ...(history.byDate || {}), [todayKey]: next }
        localStorage.setItem(storageKey, JSON.stringify({ used: updatedUsed, byDate: updatedByDate }))
        setQuote(next)
      } catch {
        // Last resort: deterministic quote
        setQuote(getDailyQuoteWithAttribution({ userName: user?.name }))
      }
    }
    loadQuote()
  }, [user?.name, dayKey])

  useEffect(() => {
    const now = new Date()
    const nextUtcMidnightMs = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    )
    const delay = Math.max(1000, nextUtcMidnightMs - now.getTime())
    const id = setTimeout(() => {
      setDayKey(getCurrentDateKey())
    }, delay)
    return () => clearTimeout(id)
  }, [dayKey])

  const refresh = () => {
    // Manual refresh in case consumers want to force update
    setDayKey(getCurrentDateKey())
  }

  return (
    <QuoteContext.Provider value={{ quote, refresh }}>
      {children}
    </QuoteContext.Provider>
  )
}


