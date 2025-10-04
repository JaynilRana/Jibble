import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { QuoteProvider } from './contexts/QuoteContext'
import { SettingsProvider } from './contexts/SettingsContext'
import Navigation from './components/Navigation'
import Home from './components/Home'
import About from './components/About'
import Dashboard from './components/Dashboard'
import DailyLogPage from './components/DailyLogPage'
import Calendar from './components/Calendar'
import Stats from './components/Stats'
import Export from './components/Export'
import WeeklyReportPage from './components/WeeklyReportPage'
import FingerprintModal from './components/FingerprintModal'
import LoadingSpinner from './components/LoadingSpinner'
import initScrollytelling from './utils/scrollytelling'
import ScrollProgress from './components/ScrollProgress'

function AppContent() {
  const [showFingerprintModal, setShowFingerprintModal] = useState(false)
  const { isDark } = useTheme()
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  // Initialize scrollytelling once on mount
  React.useEffect(() => {
    initScrollytelling()
  }, [])

  const simulateFingerprint = () => {
    setShowFingerprintModal(false)
    alert('Authentication successful! Welcome back.')
  }

  // Check if current page is home
  const isHomePage = location.pathname === '/'

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-gray-200' 
          : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 text-gray-700'
      }`}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-gray-200' 
          : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 text-gray-700'
      }`}
    >
      <ScrollProgress />
      {/* Only show main navigation for logged-in users (not on home page) */}
      {isLoggedIn && !isHomePage && (
        <Navigation />
      )}
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected routes - redirect to home if not logged in */}
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/daily-log" 
          element={isLoggedIn ? <DailyLogPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/calendar" 
          element={isLoggedIn ? <Calendar /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/stats" 
          element={isLoggedIn ? <Stats /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/export" 
          element={isLoggedIn ? <Export /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/weekly-reports" 
          element={isLoggedIn ? <WeeklyReportPage /> : <Navigate to="/" replace />} 
        />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <FingerprintModal 
        isOpen={showFingerprintModal}
        onClose={() => setShowFingerprintModal(false)}
        onAuthenticate={simulateFingerprint}
      />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <QuoteProvider>
            <AppContent />
          </QuoteProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
