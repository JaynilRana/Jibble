import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const About = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'Founder & CEO',
      bio: 'Passionate about personal development and creating meaningful digital experiences.',
      avatar: '👩‍💼'
    },
    {
      name: 'Alex Rodriguez',
      role: 'Lead Developer',
      bio: 'Full-stack developer with a love for clean code and user-centered design.',
      avatar: '👨‍💻'
    },
    {
      name: 'Maria Kim',
      role: 'UX Designer',
      bio: 'Creating beautiful, intuitive interfaces that make daily reflection a joy.',
      avatar: '👩‍🎨'
    },
    {
      name: 'David Thompson',
      role: 'Product Manager',
      bio: 'Focused on building features that truly help users grow and reflect.',
      avatar: '👨‍💼'
    }
  ]

  const values = [
    {
      icon: '🤝',
      title: 'Authenticity',
      description: 'We believe in being genuine and transparent in everything we do.'
    },
    {
      icon: '🌱',
      title: 'Growth',
      description: 'Personal development is at the heart of our mission and values.'
    },
    {
      icon: '🔒',
      title: 'Privacy',
      description: 'Your personal data and reflections are sacred and protected.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'We continuously improve and innovate to serve you better.'
    }
  ]

  const milestones = [
    {
      year: '2024',
      title: 'Jibble Launch',
      description: 'Official launch of Jibble with core daily logging features.'
    },
    {
      year: '2024',
      title: '10,000 Users',
      description: 'Reached our first milestone of 10,000 active users.'
    },
    {
      year: '2024',
      title: 'Advanced Analytics',
      description: 'Introduced comprehensive statistics and insights features.'
    },
    {
      year: '2024',
      title: 'Mobile App',
      description: 'Launched mobile applications for iOS and Android.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className={`relative overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50'
      }`} data-reveal="up" data-reveal-once>
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className={`text-5xl md:text-6xl journal-heading font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              About Jibble
            </h1>
            <p className={`text-xl md:text-2xl journal-body mb-8 max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Empowering personal growth through mindful daily reflection and meaningful insights.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className={`py-20 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`} data-reveal="up">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl journal-heading font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Our Story
            </h2>
            <p className={`text-xl journal-body ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              How Jibble came to life
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-reveal="left">
              <h3 className={`text-2xl journal-heading font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                The Beginning
              </h3>
              <p className={`journal-body mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Jibble was born from a simple observation: while there were many journaling apps 
                available, none quite captured the essence of what makes daily reflection truly 
                meaningful and sustainable.
              </p>
              <p className={`journal-body mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Our founder, Sarah, was struggling to maintain a consistent journaling habit. 
                The existing apps were either too complex with overwhelming features, or too 
                simple without providing any real insights or motivation to continue.
              </p>
              <p className={`journal-body ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                That's when the idea for Jibble was born - a platform that strikes the perfect 
                balance between simplicity and power, making daily reflection both enjoyable 
                and insightful.
              </p>
            </div>
            <div className={`p-8 rounded-xl border-2 ${
              isDark 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-200 bg-gray-50'
            }`} data-reveal="right">
              <div className="text-center">
                <div className="text-6xl mb-4">📖</div>
                <h4 className={`text-xl journal-heading font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Our Vision
                </h4>
                <p className={`journal-body ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  To become the world's most trusted platform for personal reflection and growth, 
                  helping millions of people discover themselves one day at a time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Values Section */}
      <div className={`py-20 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`} data-reveal="up">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl journal-heading font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Our Mission & Values
            </h2>
            <p className={`text-xl journal-body ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              What drives us forward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className={`text-2xl journal-heading font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Our Mission
              </h3>
              <p className={`journal-body mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                To empower individuals to lead more mindful, reflective lives by providing 
                them with beautiful, intuitive tools for daily self-discovery and personal growth.
              </p>
              <p className={`journal-body ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We believe that everyone deserves the opportunity to understand themselves 
                better, track their progress, and celebrate their journey of personal development.
              </p>
            </div>
            <div data-reveal="right">
              <h3 className={`text-2xl journal-heading font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Our Promise
              </h3>
              <p className={`journal-body mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We promise to always put our users first, creating features that genuinely 
                help them grow and reflect, while maintaining the highest standards of 
                privacy and security.
              </p>
              <p className={`journal-body ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Your personal journey is sacred, and we're committed to being your trusted 
                companion every step of the way.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                data-reveal="up"
                style={{ animationDelay: `${0.05 * index}s` }}
                className={`p-6 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 hover:border-cyan-500' 
                    : 'border-gray-200 bg-gray-50 hover:border-cyan-400'
                }`}
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h4 className={`text-lg journal-heading font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {value.title}
                </h4>
                <p className={`text-sm journal-body ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className={`py-20 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`} data-reveal="up">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl journal-heading font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Meet Our Team
            </h2>
            <p className={`text-xl journal-body ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              The passionate people behind Jibble
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                data-reveal="up"
                style={{ animationDelay: `${0.05 * index}s` }}
                className={`p-6 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 hover:border-cyan-500' 
                    : 'border-gray-200 bg-gray-50 hover:border-cyan-400'
                }`}
              >
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h4 className={`text-lg journal-heading font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {member.name}
                </h4>
                <p className={`text-sm font-source-sans font-medium mb-3 ${
                  isDark ? 'text-cyan-400' : 'text-cyan-600'
                }`}>
                  {member.role}
                </p>
                <p className={`text-sm journal-body ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <div className={`py-20 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`} data-reveal="up">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl journal-heading font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Our Journey
            </h2>
            <p className={`text-xl journal-body ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Key milestones in our growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                data-reveal="up"
                style={{ animationDelay: `${0.05 * index}s` }}
                className={`p-6 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 hover:border-cyan-500' 
                    : 'border-gray-200 bg-gray-50 hover:border-cyan-400'
                }`}
              >
                <div className={`text-2xl font-bold mb-3 ${
                  isDark ? 'text-cyan-400' : 'text-cyan-600'
                }`}>
                  {milestone.year}
                </div>
                <h4 className={`text-lg journal-heading font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {milestone.title}
                </h4>
                <p className={`text-sm journal-body ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-20 ${
        isDark 
          ? 'bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500'
      }`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`text-4xl journal-heading font-bold mb-4 ${
            isDark ? 'text-white' : 'text-white'
          }`}>
            Join Our Community
          </h2>
          <p className={`text-xl journal-body mb-8 ${
            isDark ? 'text-gray-300' : 'text-gray-100'
          }`}>
            Be part of a growing community of mindful individuals
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-4 text-lg font-semibold bg-white text-gray-900 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  )
}

export default About 