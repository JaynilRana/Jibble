import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const FingerprintModal = ({ isOpen, onClose, onAuthenticate }) => {
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleDemoAuth = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onAuthenticate()
    }, 1500)
  }

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${
      isDark ? 'bg-black/70' : 'bg-black/50'
    }`}>
      <div className={`rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl border transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="text-6xl mb-4">👆</div>
        <h3 className={`text-xl font-bold mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>Biometric Authentication</h3>
        <p className={`mb-6 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>Touch the fingerprint button to authenticate</p>
        {loading ? (
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-cyan-500 mb-2"></div>
            <span className={`text-base ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>Scanning...</span>
          </div>
        ) : (
          <button 
            className={`text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
            }`}
            onClick={handleDemoAuth}
            disabled={loading}
          >
            Authenticate
          </button>
        )}
      </div>
    </div>
  )
}

export default FingerprintModal 