import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { generateDailyQuoteWithGemini } from '../services/geminiService'

const QuoteSection = ({ quote, onQuoteChange }) => {
  const { isDark } = useTheme()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateQuote = async () => {
    setIsGenerating(true)
    setError('')
    try {
      const aiQuote = await generateDailyQuoteWithGemini()
      onQuoteChange(`“${aiQuote}”`)
    } catch (err) {
      setError(err.message || 'Failed to generate quote.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="section section-quote">
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-xl font-playfair font-semibold flex items-center gap-2 ${
          isDark ? 'text-blue-200' : 'text-blue-800'
        }`}>
          <span className="text-2xl">📝</span>
          Quote of the Day
        </h3>
        <button
          onClick={handleGenerateQuote}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isGenerating ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          }`}
        >
          {isGenerating ? (
            <>
              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></span>
              Generating...
            </>
          ) : (
            <>✨ AI Generate</>
          )}
        </button>
      </div>

      {error && (
        <div className={`mb-3 text-sm p-2 rounded-lg border ${isDark ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
          ⚠️ {error}
        </div>
      )}

      <textarea 
        className={`w-full p-4 border-2 rounded-xl text-3xl transition-all duration-300 resize-none focus:outline-none focus:ring-4 backdrop-blur-sm font-crimson italic ${
          isDark 
            ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-700/80 text-gray-200 placeholder-gray-400' 
            : 'border-blue-200 focus:border-cyan-400 focus:ring-cyan-100 bg-white/80 text-gray-800 placeholder-gray-500'
        }`}
        rows="3"
        placeholder="Enter an inspiring quote that resonates with you today..."
        value={quote}
        onChange={(e) => onQuoteChange(e.target.value)}
      />
    </div>
  )
}

export default QuoteSection 