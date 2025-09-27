import React, { createContext, useContext, useState, useEffect } from 'react'
import { getProfile, logout as apiLogout } from '../api'
 

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

  // Initialize from localStorage JWT
  useEffect(() => {
    try {
      const raw = localStorage.getItem('authUser')
      if (raw) {
        const u = JSON.parse(raw)
        setIsLoggedIn(true)
        setUser(u)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (_) {
      setIsLoggedIn(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (userLike) => {
    if (userLike) setUser(userLike)
    setIsLoggedIn(true)
    return { success: true }
  }

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
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
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