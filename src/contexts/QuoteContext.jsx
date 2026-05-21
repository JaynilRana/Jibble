import React, { createContext, useContext, useEffect, useState } from 'react'
import { getAIStyledDailyQuoteWithAttribution } from '../utils/dailyQuote'
import { useAuth } from './AuthContext'
import { getCurrentDateKey } from '../utils/dateUtils'
import { generateDailyQuoteWithGemini } from '../services/geminiService'

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
    let isMounted = true;
    
    const fetchQuote = async () => {
      const fallbackQuote = getAIStyledDailyQuoteWithAttribution({ userName: user?.name });
      const storageKey = `gemini_quote_${dayKey}`;
      const cached = localStorage.getItem(storageKey);
      
      if (cached) {
        setQuote(cached);
        return;
      }

      // Show fallback while loading
      setQuote(fallbackQuote);

      try {
        const aiQuote = await generateDailyQuoteWithGemini();
        if (isMounted && aiQuote) {
          const formatted = `“${aiQuote}”`;
          setQuote(formatted);
          localStorage.setItem(storageKey, formatted);
        }
      } catch (e) {
        console.error('Failed to fetch AI quote, using fallback:', e);
      }
    };

    fetchQuote();

    const now = new Date()
    const nextLocalMidnight = new Date(now)
    nextLocalMidnight.setHours(24, 0, 0, 0)
    const delay = Math.max(1000, nextLocalMidnight.getTime() - now.getTime())
    const id = setTimeout(() => {
      setDayKey(getCurrentDateKey())
    }, delay)
    
    return () => {
      isMounted = false;
      clearTimeout(id)
    }
  }, [dayKey, user?.name])

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


