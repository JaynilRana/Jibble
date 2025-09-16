import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const { isDark } = useTheme()
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-t-transparent ${
        isDark ? 'border-cyan-400' : 'border-cyan-500'
      }`}></div>
      {text && (
        <p className={`${textSizes[size]} ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner
