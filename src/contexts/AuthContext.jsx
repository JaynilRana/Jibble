import React, { createContext, useContext, useState, useEffect } from 'react'
import { getProfile, logout as apiLogout } from '../api'
import { auth } from '../services/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Firebase auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setIsLoggedIn(true)
        setUser({ id: u.uid, email: u.email, name: u.displayName || u.email?.split('@')[0] })
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async () => ({ success: true })

  const handleLogout = async () => {
    try {
      // Call backend logout to invalidate token
      if (user) {
        await apiLogout()
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error)
    } finally {
      // Clear local state and storage
      setUser(null)
      setIsLoggedIn(false)
      
      console.log('User logged out - session cleared')
    }
  }

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      login, 
      logout: handleLogout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
} 