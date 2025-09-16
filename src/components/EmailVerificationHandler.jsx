import React, { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { verifyEmail } from '../api'
import { useNavigate, useSearchParams } from 'react-router-dom'

const EmailVerificationHandler = () => {
  const { isDark } = useTheme()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleVerification = async () => {
      const actionCode = searchParams.get('oobCode')
      const mode = searchParams.get('mode')

      if (mode === 'verifyEmail' && actionCode) {
        try {
          await verifyEmail(actionCode)
          setStatus('success')
          setMessage('Email verified successfully! You can now sign in.')
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/')
          }, 3000)
        } catch (error) {
          setStatus('error')
          setMessage('Verification failed. The link may be expired or invalid.')
        }
      } else {
        setStatus('error')
        setMessage('Invalid verification link.')
      }
    }

    handleVerification()
  }, [searchParams, navigate])

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md mx-4 p-8 rounded-xl shadow-xl border transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <h2 className={`text-2xl font-bold mb-4 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Verifying Email...
              </h2>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className={`text-2xl font-bold mb-4 ${
                isDark ? 'text-green-300' : 'text-green-600'
              }`}>
                Email Verified!
              </h2>
              <p className={`mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {message}
              </p>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Redirecting to login page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className={`text-2xl font-bold mb-4 ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>
                Verification Failed
              </h2>
              <p className={`mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {message}
              </p>
              <button
                onClick={() => navigate('/')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
                }`}
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationHandler
