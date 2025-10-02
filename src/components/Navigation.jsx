import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import LoginModal from './LoginModal'

const Navigation = () => {
  const { isDark, toggleTheme } = useTheme()
  const { isLoggedIn, user, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'New Log', icon: '✏️', path: '/daily-log' },
    { name: 'Calendar', icon: '📅', path: '/calendar' },
    { name: 'Stats', icon: '📈', path: '/stats' },
    { name: 'Weekly Reports', icon: '📋', path: '/weekly-reports' }
  ]

  const handleNavClick = (path) => {
    navigate(path)
    setShowMobileMenu(false)
  }

  const isActivePage = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <nav className={`shadow-lg border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 border-blue-600' 
          : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 border-cyan-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleNavClick('/dashboard')}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-300"
                >
                  <img 
                    src="/Logo.png" 
                    alt="Jibble Logo" 
                    className="h-12 w-auto"
                  />
                  <h1 className="text-2xl journal-heading text-white">
                    JIBBLE
                  </h1>
                </button>
              </div>
              
              {/* Navigation Items */}
              <div className="hidden md:flex items-center gap-1 ml-8">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.path)}
                    className={`px-4 py-2 rounded-lg font-source-sans font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActivePage(item.path)
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="bg-white/20 text-white p-2 rounded-lg transition-all duration-300 hover:bg-white/30 border border-white/30"
                >
                  {showMobileMenu ? '✕' : '☰'}
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="bg-white/20 text-white p-2 rounded-lg transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {isLoggedIn ? (
                <>
                  {/* User Avatar Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="bg-white/20 text-white p-2 rounded-lg transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30 flex items-center gap-2"
                      title="User Menu"
                    >
                      👤
                      <span className="font-source-sans font-medium hidden sm:block">
                        {user?.name || 'User'}
                      </span>
                    </button>
                    
                    {/* User Dropdown */}
                    {showUserDropdown && (
                      <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border-2 z-50 ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="py-2">
                          <div className={`px-4 py-2 border-b ${
                            isDark ? 'border-gray-600' : 'border-gray-200'
                          }`}>
                            <p className={`font-source-sans font-medium ${
                              isDark ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {user?.name || 'User'}
                            </p>
                            <p className={`text-sm font-source-sans ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {user?.email}
                            </p>
                          </div>
                          {/* Settings toggles removed per requirements */}
                          <button 
                            onClick={logout}
                            className={`w-full text-left px-4 py-2 font-source-sans hover:bg-gray-100 transition-colors duration-200 ${
                              isDark 
                                ? 'text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            🚪 Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg ui-text font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30"
                >
                  Login / Signup
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className={`md:hidden border-b transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  handleNavClick(item.path)
                  setShowMobileMenu(false)
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-source-sans font-medium transition-all duration-300 flex items-center gap-3 ${
                  isActivePage(item.path)
                    ? isDark 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}

      />
    </>
  )
}

export default Navigation