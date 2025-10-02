import React, { createContext, useContext, useMemo, useEffect, useState } from 'react'
import { getAIStyledDailyQuoteWithAttribution } from '../utils/dailyQuote'
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

  const quote = useMemo(() => {
    return getAIStyledDailyQuoteWithAttribution({ userName: user?.name })
  }, [user?.name, dayKey])

  useEffect(() => {
    const now = new Date()
    const nextLocalMidnight = new Date(now)
    nextLocalMidnight.setHours(24, 0, 0, 0) // next local midnight
    const delay = Math.max(1000, nextLocalMidnight.getTime() - now.getTime())
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


