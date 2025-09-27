import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import LoadingSpinner from './LoadingSpinner'
import OTPInput from './OTPInput'

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
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState(false)

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleCheckVerification = async (code = otpCode) => {
    setCheckingVerification(true)
    setError('')
    setOtpError(false)
    
    try {
      // Call the verification check function
      await onVerify(code)
    } catch (error) {
      setOtpError(true)
      setError('Invalid or expired code. Please try again.')
    } finally {
      setCheckingVerification(false)
    }
  }

  const handleOTPChange = (value) => {
    setOtpCode(value)
    setOtpError(false)
    setError('')
  }

  const handleOTPComplete = (value) => {
    if (value.length === 6) {
      handleCheckVerification(value)
    }
  }

  const handleResend = async () => {
    setCountdown(60)
    setCanResend(false)
    setError('')
    setOtpError(false)
    setOtpCode('')
    await onResend()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className={`text-xl font-bold mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Enter Verification Code
        </h3>
        <p className={`text-sm mb-4 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          We've sent a 6-digit code to
        </p>
        <p className={`font-medium mb-6 ${
          isDark ? 'text-cyan-400' : 'text-cyan-600'
        }`}>
          {email}
        </p>
      </div>

      <OTPInput
        value={otpCode}
        onChange={handleOTPChange}
        onComplete={handleOTPComplete}
        disabled={checkingVerification || loading}
        error={otpError}
        length={6}
      />

      {error && (
        <div className={`text-center text-sm ${
          otpError ? 'text-red-500' : isDark ? 'text-green-300' : 'text-green-600'
        }`}>
          {error}
        </div>
      )}

      <button
        onClick={() => handleCheckVerification()}
        disabled={checkingVerification || loading || otpCode.length !== 6}
        className={`w-full text-white py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
          isDark
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
        }`}
      >
        {checkingVerification ? (
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="sm" text="" />
            <span>Verifying...</span>
          </div>
        ) : (
          'Verify Code'
        )}
      </button>

      <div className="text-center space-y-2">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className={`text-sm underline transition-colors duration-200 ${
              isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
            } disabled:opacity-50`}
          >
            Resend Code
          </button>
        ) : (
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Resend code in {countdown}s
          </p>
        )}
        
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className={`block mx-auto text-sm transition-colors duration-200 ${
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
        <p>Didn't receive the code?</p>
        <p>Check your spam folder first, then try resending</p>
      </div>
    </div>
  )
}

export default OTPVerification
