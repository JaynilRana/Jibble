import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import OTPInput from './OTPInput'

const OTPDemo = () => {
  const { isDark } = useTheme()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')

  const handleOTPChange = (value) => {
    setOtp(value)
    setError(false)
    setMessage('')
  }

  const handleOTPComplete = (value) => {
    if (value === '123456') {
      setMessage('✅ Correct OTP! Demo successful.')
      setError(false)
    } else {
      setError(true)
      setMessage('❌ Invalid OTP. Try 123456')
    }
  }

  const handleVerify = () => {
    if (otp === '123456') {
      setMessage('✅ Correct OTP! Demo successful.')
      setError(false)
    } else {
      setError(true)
      setMessage('❌ Invalid OTP. Try 123456')
    }
  }

  const handleReset = () => {
    setOtp('')
    setError(false)
    setMessage('')
  }

  return (
    <div className={`p-8 rounded-xl border-2 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          🔐 OTP Input Demo
        </h2>
        <p className={`text-sm ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Try entering the code: <span className="font-mono font-bold">123456</span>
        </p>
      </div>

      <div className="space-y-6">
        <OTPInput
          value={otp}
          onChange={handleOTPChange}
          onComplete={handleOTPComplete}
          error={error}
          length={6}
        />

        {message && (
          <div className={`text-center text-sm ${
            error ? 'text-red-500' : 'text-green-500'
          }`}>
            {message}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleVerify}
            disabled={otp.length !== 6}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              otp.length === 6
                ? isDark
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Verify Code
          </button>
          
          <button
            onClick={handleReset}
            className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              isDark
                ? 'bg-gray-600 hover:bg-gray-700 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Reset
          </button>
        </div>

        <div className={`text-xs text-center ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Features:</p>
          <ul className="mt-2 space-y-1">
            <li>• Auto-focus next input</li>
            <li>• Paste support (Ctrl+V)</li>
            <li>• Arrow key navigation</li>
            <li>• Backspace handling</li>
            <li>• Auto-verify on complete</li>
            <li>• Error state styling</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default OTPDemo
