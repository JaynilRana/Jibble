import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import LoadingSpinner from './LoadingSpinner'

const OTPVerification = ({ 
  email, 
  onVerify, 
  onResend, 
  onBack, 
  isSignup = false,
  loading = false 
}) => {
  const { isDark } = useTheme()
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')
  const [checkingVerification, setCheckingVerification] = useState(false)

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleCheckVerification = async () => {
    setCheckingVerification(true)
    setError('')
    
    try {
      // Call the verification check function
      await onVerify('check')
    } catch (error) {
      setError('Please click the verification link in your email first, then try again.')
    } finally {
      setCheckingVerification(false)
    }
  }

  const handleResend = async () => {
    setCountdown(60)
    setCanResend(false)
    setError('')
    await onResend()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">📧</div>
        <h3 className={`text-xl font-bold mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Verify Your Email
        </h3>
        <p className={`text-sm mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          We've sent a verification link to
        </p>
        <p className={`font-medium ${
          isDark ? 'text-cyan-400' : 'text-cyan-600'
        }`}>
          {email}
        </p>
        <div className={`text-xs mt-2 p-2 rounded-lg ${
          isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <p className={`font-medium ${
            isDark ? 'text-yellow-300' : 'text-yellow-700'
          }`}>
            📧 Important: Check your spam/junk folder!
          </p>
          <p className={`mt-1 ${
            isDark ? 'text-yellow-200' : 'text-yellow-600'
          }`}>
            Verification emails often end up in spam folders. Look for emails from "noreply@jibble-f2531.firebaseapp.com"
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Instructions */}
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 text-xl">ℹ️</div>
            <div>
              <h4 className={`font-medium mb-1 ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>
                How to verify:
              </h4>
              <ol className={`text-sm space-y-1 ${
                isDark ? 'text-blue-200' : 'text-blue-600'
              }`}>
                <li>1. Check your email inbox AND spam folder</li>
                <li>2. Look for email from "noreply@jibble-f2531.firebaseapp.com"</li>
                <li>3. Click the verification link in the email</li>
                <li>4. Return here and click "I've Verified"</li>
              </ol>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Check Verification Button */}
        <button
          onClick={handleCheckVerification}
          disabled={checkingVerification || loading}
          className={`w-full text-white py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDark
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
          }`}
        >
          {checkingVerification ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="sm" text="" />
              <span>Checking...</span>
            </div>
          ) : (
            'I\'ve Verified My Email'
          )}
        </button>

        {/* Resend Email */}
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className={`text-sm underline transition-colors duration-200 ${
                isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
              } disabled:opacity-50`}
            >
              Resend Verification Email
            </button>
          ) : (
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Resend email in {countdown}s
            </p>
          )}
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className={`w-full py-2 text-sm transition-colors duration-200 ${
            isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
          } disabled:opacity-50`}
        >
          ← Back to {isSignup ? 'Sign Up' : 'Sign In'}
        </button>
      </div>

      {/* Help Text */}
      <div className={`text-center text-xs ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <p>Didn't receive the email?</p>
        <p>Check your spam folder first, then try resending</p>
        <p className="mt-1 font-medium">Email sender: noreply@jibble-f2531.firebaseapp.com</p>
      </div>
    </div>
  )
}

export default OTPVerification
