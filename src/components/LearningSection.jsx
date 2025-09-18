import React, { useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const LearningSection = ({ learning, onLearningChange }) => {
  const { isDark } = useTheme()

  const textareaRef = useRef(null)

  // Auto-resize textarea as content changes and on mount
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
    el.style.overflow = 'hidden'
  }, [learning])

  return (
    <div className="section section-learning">
      <h3 className={`text-xl font-playfair font-semibold mb-3 flex items-center gap-2 ${
        isDark ? 'text-blue-200' : 'text-blue-800'
      }`}>
        <span className="text-2xl">🧠</span>
        Learning of the Day
      </h3>
      <textarea 
        ref={textareaRef}
        className={`font-bold w-full p-4 border-2 rounded-xl text-base transition-all duration-300 resize-none overflow-hidden whitespace-pre-wrap break-words focus:outline-none focus:ring-4 backdrop-blur-sm font-lora italic ${
          isDark 
            ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-700/80 text-gray-200 placeholder-gray-400' 
            : 'border-blue-200 focus:border-cyan-400 focus:ring-cyan-100 bg-white/80 text-gray-800 placeholder-gray-500'
        }`}
        rows="1"
        placeholder="What did you learn today? Reflect on new insights, skills, or experiences..."
        value={learning}
        onChange={(e) => {
          onLearningChange(e.target.value)
          const el = textareaRef.current
          if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; el.style.overflow = 'hidden' }
        }}
      />
    </div>
  )
}

export default LearningSection 