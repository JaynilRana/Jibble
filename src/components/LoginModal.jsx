import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import OTPVerification from './OTPVerification'
import { emailSignUp, emailSignIn, forgotPassword, resendVerificationEmail } from '../api'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { doc, setDoc, collection } from 'firebase/firestore'

const LoginModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState('auth') // 'auth', 'forgot', 'otp'
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [pendingUser, setPendingUser] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  // No OTP countdown needed anymore

  if (!isOpen) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (currentStep === 'auth') {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      if (isSignup) {
        if (!formData.name) {
          newErrors.name = 'Name is required'
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match'
        }
      }
    }

    // No OTP validation

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrors({})
    setMessage('')

    try {
      let result
      if (isSignup) {
        result = await emailSignUp(formData.name, formData.email, formData.password)
      } else {
        result = await emailSignIn(formData.email, formData.password)
      }

      // Check if email verification is needed
      if (result.needsVerification) {
        setPendingUser(result.user)
        setMessage(result.message)
        setCurrentStep('otp')
      } else {
        handleSuccessfulAuth()
      }
    } catch (error) {
      const msg = error?.message || 'Authentication failed. Please try again.'
      setErrors({ email: msg, password: '' })
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessfulAuth = () => {
    login()
    onClose()
    navigate('/dashboard')
    resetForm()
  }

  const handleOTPVerify = async (otpCode) => {
    setLoading(true)
    try {
      // Reload the user to get the latest email verification status
      await pendingUser.reload()
      
      if (pendingUser.emailVerified) {
        // Update user profile in Firestore
        try {
          await setDoc(doc(collection(db, 'users'), pendingUser.uid), {
            email: pendingUser.email,
            name: pendingUser.displayName || pendingUser.email?.split('@')[0],
            emailVerified: true,
            last_login_at: new Date().toISOString()
          }, { merge: true });
        } catch {}
        
        handleSuccessfulAuth()
      } else {
        setMessage('Email not verified yet. Please check your email and click the verification link.')
      }
    } catch (error) {
      setMessage('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      await resendVerificationEmail()
      setMessage('Verification email sent! Please check your inbox.')
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToAuth = () => {
    setCurrentStep('auth')
    setPendingUser(null)
    setMessage('')
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!formData.email) {
      setErrors({ email: 'Email is required' })
      return
    }

    setLoading(true)
    setErrors({})
    setMessage('')

    try {
      await forgotPassword(formData.email)
      setMessage('Password reset instructions sent to your email!')
      setTimeout(() => {
        setCurrentStep('auth')
        setMessage('')
      }, 3000)
    } catch (error) {
      setErrors({ 
        email: error.response?.data?.detail || 'Failed to send reset email.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setErrors({})
    setMessage('')
    setCurrentStep('auth')
    setCountdown(0)
    setPendingUser(null)
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    resetForm()
  }

  const goBack = () => {
    setCurrentStep('auth')
    setErrors({})
    setMessage('')
    setCountdown(0)
  }

  // No OTP resend needed

  const renderAuthStep = () => (
    <form onSubmit={handleAuthSubmit} className="space-y-4">
      {isSignup && (
        <div>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full p-3 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
              errors.name 
                ? 'border-red-500 focus:ring-red-200' 
                : isDark 
                  ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-700 text-gray-200 placeholder-gray-400' 
                  : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-100 bg-white text-gray-800 placeholder-gray-500'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm text-left mt-1">{errors.name}</p>
          )}
        </div>
      )}

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full p-3 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
            errors.email 
              ? 'border-red-500 focus:ring-red-200' 
              : isDark 
                ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-700 text-gray-200 placeholder-gray-400' 
                : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-100 bg-white text-gray-800 placeholder-gray-500'
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm text-left mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          className={`w-full p-3 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
            errors.password 
              ? 'border-red-500 focus:ring-red-200' 
              : isDark 
                ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-700 text-gray-200 placeholder-gray-400' 
                : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-100 bg-white text-gray-800 placeholder-gray-500'
          }`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm text-left mt-1">{errors.password}</p>
        )}
      </div>

      {isSignup && (
        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full p-3 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
              errors.confirmPassword 
                ? 'border-red-500 focus:ring-red-200' 
                : isDark 
                  ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-700 text-gray-200 placeholder-gray-400' 
                  : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-100 bg-white text-gray-800 placeholder-gray-500'
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm text-left mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        {!isSignup && (
          <button
            type="button"
            onClick={() => setCurrentStep('forgot')}
            className={`text-sm underline transition-colors duration-200 ${
              isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
            }`}
          >
            Forgot password?
          </button>
        )}
      </div>

      <button 
        type="submit"
        disabled={loading}
        className={`w-full text-white py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
          isDark 
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="sm" text="" />
            <span>Signing {isSignup ? 'up' : 'in'}...</span>
          </div>
        ) : (
          (isSignup ? 'Create Account' : 'Sign In')
        )}
      </button>
    </form>
  )

  // Removed OTP step entirely

  const renderForgotStep = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🔑</div>
        <h3 className={`text-xl font-bold mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Reset Password
        </h3>
        <p className={`text-sm ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Enter your email to receive password reset instructions
        </p>
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full p-3 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
            errors.email 
              ? 'border-red-500 focus:ring-red-200' 
              : isDark 
                ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-700 text-gray-200 placeholder-gray-400' 
                : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-100 bg-white text-gray-800 placeholder-gray-500'
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm text-left mt-1">{errors.email}</p>
        )}
      </div>

      <button 
        type="submit"
        disabled={loading}
        className={`w-full text-white py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
          isDark 
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="sm" text="" />
            <span>Sending...</span>
          </div>
        ) : (
          'Send Reset Email'
        )}
      </button>

      <button
        type="button"
        onClick={goBack}
        className={`w-full py-2 text-sm transition-colors duration-200 ${
          isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        ← Back to Sign In
      </button>
    </form>
  )

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${
      isDark ? 'bg-black/70' : 'bg-black/50'
    }`}>
      <div className={`relative rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl border transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <button
          onClick={onClose}
          className={`absolute top-3 right-4 text-3xl font-bold hover:scale-110 transition-transform duration-200 ${
            isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
          }`}
          title="Close"
        >
          ×
        </button>
        
        {currentStep === 'auth' && (
          <>
            <div className="text-4xl mb-4">🔐</div>
            <h3 className={`text-xl font-bold mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {isSignup ? 'Sign up to start your daily log journey' : 'Sign in to continue your daily log'}
            </p>
          </>
        )}

        {currentStep === 'otp' && (
          <>
            <div className="text-4xl mb-4">📧</div>
            <h3 className={`text-xl font-bold mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Email Verification Required
            </h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Please check your email and click the verification link to complete your {isSignup ? 'signup' : 'login'}
            </p>
          </>
        )}

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            isDark ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {currentStep === 'auth' && renderAuthStep()}
        {currentStep === 'forgot' && renderForgotStep()}
        {currentStep === 'otp' && (
          <OTPVerification
            email={formData.email}
            onVerify={handleOTPVerify}
            onResend={handleResendOTP}
            onBack={handleBackToAuth}
            isSignup={isSignup}
            loading={loading}
          />
        )}

        {currentStep === 'auth' && (
          <div className="mt-4">
            <button
              onClick={toggleMode}
              className={`text-sm underline transition-colors duration-200 ${
                isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
              }`}
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginModal
