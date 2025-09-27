import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const OTPInput = ({ 
  value = '', 
  onChange, 
  length = 6, 
  disabled = false,
  error = false,
  onComplete,
  autoFocus = true
}) => {
  const { isDark } = useTheme()
  const [otp, setOtp] = useState(Array(length).fill(''))
  const inputRefs = useRef([])

  useEffect(() => {
    if (value) {
      const newOtp = value.split('').slice(0, length)
      setOtp(prev => {
        const updated = [...prev]
        newOtp.forEach((digit, index) => {
          updated[index] = digit
        })
        return updated
      })
    }
  }, [value, length])

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index, value) => {
    if (disabled) return

    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1)
    
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    // Call onChange with the complete OTP string
    const otpString = newOtp.join('')
    onChange?.(otpString)

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Call onComplete if all digits are filled
    if (otpString.length === length && !otpString.includes('')) {
      onComplete?.(otpString)
    }
  }

  const handleKeyDown = (index, e) => {
    if (disabled) return

    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Clear current digit
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onChange?.(newOtp.join(''))
      } else if (index > 0) {
        // Move to previous input
        inputRefs.current[index - 1]?.focus()
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, length)
        const newOtp = Array(length).fill('')
        digits.split('').forEach((digit, i) => {
          if (i < length) newOtp[i] = digit
        })
        setOtp(newOtp)
        onChange?.(newOtp.join(''))
        
        // Focus the next empty input or the last one
        const nextEmptyIndex = newOtp.findIndex(digit => !digit)
        const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1
        inputRefs.current[focusIndex]?.focus()
      })
    }
  }

  const handlePaste = (e) => {
    if (disabled) return
    
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').slice(0, length)
    
    const newOtp = Array(length).fill('')
    digits.split('').forEach((digit, i) => {
      if (i < length) newOtp[i] = digit
    })
    
    setOtp(newOtp)
    onChange?.(newOtp.join(''))
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => !digit)
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1
    inputRefs.current[focusIndex]?.focus()
  }

  const handleFocus = (index) => {
    // Select all text when focusing
    inputRefs.current[index]?.select()
  }

  return (
    <div className="flex justify-center space-x-2 sm:space-x-3">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength="1"
          value={otp[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`
            w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold rounded-lg border-2 
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : isDark
                ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-700 text-gray-200'
                : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-100 bg-white text-gray-800'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            ${otp[index] ? (error ? 'bg-red-50' : isDark ? 'bg-cyan-900/20' : 'bg-cyan-50') : ''}
          `}
          style={{
            caretColor: error ? '#ef4444' : isDark ? '#06b6d4' : '#0891b2'
          }}
        />
      ))}
    </div>
  )
}

export default OTPInput
