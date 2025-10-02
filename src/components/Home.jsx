import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import LoginModal from './LoginModal'
import Footer from './Footer'

const Home = () => {
  const { isDark, toggleTheme } = useTheme()
  const { isLoggedIn } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const navigate = useNavigate()

  const features = [
    {
      icon: '📝',
      title: 'Daily Logging',
      description: 'Capture your thoughts, experiences, and daily activities in a beautiful, organized way.'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor your habits, mood, and productivity with detailed analytics and insights.'
    },
    {
      icon: '📅',
      title: 'Calendar View',
      description: 'Visualize your journey with an interactive calendar showing your daily logs and patterns.'
    },
    {
      icon: '🎯',
      title: 'Goal Setting',
      description: 'Set personal goals and track your progress towards achieving them.'
    },
    {
      icon: '📈',
      title: 'Statistics & Reports',
      description: 'Generate comprehensive reports and analyze your personal growth over time.'
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'Your data is secure and private. Your personal journey stays with you.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Student',
      content: 'Jibble has transformed how I track my daily progress. The insights are incredible!',
      rating: 5
    },
    {
      name: 'Alex K.',
      role: 'Professional',
      content: 'Perfect for maintaining work-life balance and personal development tracking.',
      rating: 5
    },
    {
      name: 'Maria L.',
      role: 'Entrepreneur',
      content: 'The best daily logging app I\'ve used. Clean, intuitive, and truly helpful.',
      rating: 5
    }
  ]

  const handleGetStarted = () => {
    setShowLoginModal(true)
  }

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navItems = [
    { name: 'Home', path: 'home-section', icon: '🏠' },
    { name: 'About Us', path: 'about-section', icon: 'ℹ️' },
    { name: 'Services', path: 'services-section', icon: '⚙️' },
    { name: 'Contact Us', path: 'contact-section', icon: '📞' }
  ]

  return (
    <div className="min-h-screen">
      {/* Home Page Navbar */}
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
                  onClick={() => navigate('/')}
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
              <div className="hidden md:flex items-center gap-3 ml-8">
                {navItems.map((item, index) => (
                  <div key={item.name} className="flex items-center">
                    <button
                      onClick={() => scrollToSection(item.path)}
                      className="px-4 py-2 rounded-lg font-source-sans font-medium transition-all duration-300 flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 hover:scale-105 border border-transparent hover:border-white/30"
                    >
                      <span>{item.icon}</span>
                      {item.name}
                    </button>
                    {index < navItems.length - 1 && (
                      <div className="w-px h-6 bg-white/20 mx-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Right Side Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="bg-white/20 text-white p-2 rounded-lg transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {isLoggedIn ? (
                                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-white/20 text-white px-4 py-2 rounded-lg ui-text font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30"
                  >
                  Go to Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg ui-text font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30"
                >
                  Login / Signup
                </button>
              )}
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

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-white/20">
              <div className="flex flex-col gap-3">
                {/* Navigation Items */}
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      scrollToSection(item.path)
                      setShowMobileMenu(false)
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg font-source-sans font-medium transition-all duration-300 hover:scale-105 border border-transparent hover:border-white/30 flex items-center gap-2"
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </button>
                ))}
                
                <div className="flex justify-center gap-3 pt-2">
                  <button 
                    onClick={toggleTheme}
                    className="bg-white/20 text-white p-2 rounded-lg transition-all duration-300 hover:bg-white/30 border border-white/30"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>
                </div>
                {isLoggedIn ? (
                  <button 
                                          onClick={() => {
                        navigate('/dashboard')
                        setShowMobileMenu(false)
                      }}
                    className="bg-white/20 text-white px-4 py-2 rounded-lg ui-text font-medium transition-all duration-300 hover:bg-white/30 border border-white/30"
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setShowLoginModal(true)
                      setShowMobileMenu(false)
                    }}
                    className="bg-white/20 text-white px-4 py-2 rounded-lg ui-text font-medium transition-all duration-300 hover:bg-white/30 border border-white/30"
                  >
                    Login / Signup
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div id="home-section" data-reveal="up" data-reveal-once className={`relative overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h1 className={`text-5xl md:text-6xl journal-heading font-bold mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Welcome to Jibble
                </h1>
              </div>
              
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <p className={`text-xl md:text-2xl journal-body mb-8 max-w-2xl mx-auto lg:mx-0 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Your personal daily logging companion. Track your journey, celebrate your progress, and discover insights about yourself.
                </p>
              </div>
              
              <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  {!isLoggedIn ? (
                    <>
                      <button 
                        onClick={handleGetStarted}
                        className={`px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                          isDark 
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600' 
                            : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
                        }`}
                      >
                        Get Started Free
                      </button>
                      <button 
                        onClick={() => scrollToSection('about-section')}
                        className={`px-8 py-4 text-lg font-semibold rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                          isDark 
                            ? 'border-white text-white hover:bg-white hover:text-gray-900' 
                            : 'border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        Learn More
                      </button>
                    </>
                  ) : (
                                         <button 
                       onClick={() => navigate('/dashboard')}
                       className={`px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                         isDark 
                           ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600' 
                           : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
                       }`}
                     >
                       Go to Dashboard
                     </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Model Image */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div data-parallax="y" data-parallax-speed="0.05" className={`absolute inset-0 rounded-3xl blur-3xl opacity-20 ${
                    isDark ? 'bg-cyan-500' : 'bg-cyan-400'
                  }`}></div>
                  <img 
                    src="/model.png" 
                    alt="Jibble App Model" 
                    data-parallax="y" data-parallax-speed="0.08"
                    className="relative z-10 w-full max-w-md h-auto rounded-3xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:rotate-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="services-section" data-reveal="up" className={`py-20 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl journal-heading font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Why Choose Jibble?
            </h2>
            <p className={`text-xl journal-body ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Everything you need for meaningful daily reflection and personal growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                data-reveal="up"
                style={{ animationDelay: `${0.05 * index}s` }}
                className={`p-8 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 hover:border-cyan-500' 
                    : 'border-gray-200 bg-gray-50 hover:border-cyan-400'
                }`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className={`text-xl journal-heading font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`journal-body ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div data-reveal="up" className={`py-20 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl journal-heading font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              How It Works
            </h2>
            <p className={`text-xl journal-body ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Get started in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center" data-reveal="left" style={{ animationDelay: '0.05s' }}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 ${
                isDark ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-white'
              }`}>
                1
              </div>
              <h3 className={`text-xl journal-heading font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Sign Up
              </h3>
              <p className={`journal-body ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Create your account and set up your profile in seconds
              </p>
            </div>
            
            <div className="text-center" data-reveal="up" style={{ animationDelay: '0.1s' }}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 ${
                isDark ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-white'
              }`}>
                2
              </div>
              <h3 className={`text-xl journal-heading font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Start Logging
              </h3>
              <p className={`journal-body ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Write your daily logs, track tasks, and rate your day
              </p>
            </div>
            
            <div className="text-center" data-reveal="right" style={{ animationDelay: '0.15s' }}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 ${
                isDark ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-white'
              }`}>
                3
              </div>
              <h3 className={`text-xl journal-heading font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Track Progress
              </h3>
              <p className={`journal-body ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                View your statistics, insights, and personal growth over time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div data-reveal="up" className={`py-20 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl journal-heading font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              What Our Users Say
            </h2>
            <p className={`text-xl journal-body ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join thousands of users who have transformed their daily routine
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                data-reveal="up"
                style={{ animationDelay: `${0.05 * index}s` }}
                className={`p-6 rounded-xl border-2 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500">⭐</span>
                  ))}
                </div>
                <p className={`journal-body mb-4 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  "{testimonial.content}"
                </p>
                <div>
                  <p className={`font-source-sans font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {testimonial.name}
                  </p>
                  <p className={`text-sm font-source-sans ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div data-reveal="zoom" data-reveal-once className={`py-20 ${
        isDark 
          ? 'bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500'
      }`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`text-4xl journal-heading font-bold mb-4 ${
            isDark ? 'text-white' : 'text-white'
          }`}>
            Ready to Start Your Journey?
          </h2>
          <p className={`text-xl journal-body mb-8 ${
            isDark ? 'text-gray-300' : 'text-gray-100'
          }`}>
            Join thousands of users who are already tracking their personal growth with Jibble
          </p>
          {!isLoggedIn && (
            <button 
              onClick={handleGetStarted}
              className="px-8 py-4 text-lg font-semibold bg-white text-gray-900 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Get Started Today
            </button>
          )}
        </div>
      </div>

      {/* About Us Section */}
      <div id="about-section" data-reveal="up" className={`py-20 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl journal-heading font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              About Jibble
            </h2>
            <p className={`text-xl journal-body ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Empowering personal growth through mindful daily reflection
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-reveal="left">
              <h3 className={`text-2xl journal-heading font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Our Mission
              </h3>
              <p className={`journal-body mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                At Jibble, we believe that every day is an opportunity for growth and self-discovery. 
                Our mission is to provide a beautiful, intuitive platform that makes daily reflection 
                a meaningful and enjoyable habit.
              </p>
              <p className={`journal-body mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We understand that personal development is a journey, not a destination. That's why 
                we've created tools that help you track your progress, celebrate your achievements, 
                and gain insights into your patterns and habits.
              </p>
              <button 
                onClick={() => scrollToSection('about-section')}
                className={`px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                }`}
              >
                Learn More About Us
              </button>
            </div>
            <div data-reveal="right" className={`p-8 rounded-xl border-2 ${
              isDark 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-center">
                <div className="text-6xl mb-4">🌟</div>
                <h4 className={`text-xl journal-heading font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Why We Built Jibble
                </h4>
                <p className={`journal-body ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  We noticed that existing journaling apps were either too complex or too simple. 
                  We wanted to create something that strikes the perfect balance - powerful enough 
                  to provide real insights, but simple enough to use every day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div id="contact-section" data-reveal="up" className={`py-20 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl journal-heading font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Get in Touch
            </h2>
            <p className={`text-xl journal-body ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              We'd love to hear from you. Let's start a conversation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div data-reveal="left">
              <h3 className={`text-2xl journal-heading font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📧</div>
                  <div>
                    <p className={`font-source-sans font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Email
                    </p>
                    <p className={`journal-body ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      hello@jibble.app
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🌐</div>
                  <div>
                    <p className={`font-source-sans font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Website
                    </p>
                    <p className={`journal-body ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      www.jibble.app
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📍</div>
                  <div>
                    <p className={`font-source-sans font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Location
                    </p>
                    <p className={`journal-body ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Global - Available Worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div data-reveal="right" className={`p-8 rounded-xl border-2 ${
              isDark 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <h4 className={`text-xl journal-heading font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Send us a Message
              </h4>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-100 bg-white text-gray-800 placeholder-gray-500'
                  }`}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-100 bg-white text-gray-800 placeholder-gray-500'
                  }`}
                />
                <textarea
                  placeholder="Your Message"
                  rows="4"
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-900 bg-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'border-gray-300 focus:border-cyan-400 focus:ring-cyan-100 bg-white text-gray-800 placeholder-gray-500'
                  }`}
                ></textarea>
                <button 
                  type="submit"
                  className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${
                    isDark 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                  }`}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
              <Footer />

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}

export default Home 