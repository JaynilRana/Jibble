import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { exportData, exportDataByDateRange, exportWeeklyReportPDF, importData, clearAllData, getWeeklyReports, getWeeklyReport } from '../api'
import jsPDF from 'jspdf'
import Footer from './Footer'
import { getCurrentDateKey, getCurrentWeekStart } from '../utils/dateUtils'

const Export = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [message, setMessage] = useState('')
  const [exportType, setExportType] = useState('all') // 'all', 'dateRange', 'weekly', 'thisWeek'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedWeek, setSelectedWeek] = useState('')

  const generateLogsPDF = (data, title) => {
    const doc = new jsPDF()
    let yPosition = 20

    // Header with background
    doc.setFillColor(59, 130, 246) // Blue background
    doc.rect(0, 0, 210, 30, 'F')
    
    // Title in white
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(title, 20, 20)
    
    // Reset text color
    doc.setTextColor(0, 0, 0)
    yPosition = 45

    // Date range info in a styled box
    if (data.dateRange) {
      doc.setFillColor(243, 244, 246) // Light gray background
      doc.rect(15, yPosition - 5, 180, 20, 'F')
      doc.setDrawColor(209, 213, 219) // Gray border
      doc.rect(15, yPosition - 5, 180, 20, 'S')
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Date Range: ${data.dateRange.startDate} to ${data.dateRange.endDate}`, 20, yPosition)
      yPosition += 8
      doc.text(`Total Logs: ${data.totalLogs}`, 20, yPosition)
      yPosition += 20
    }

    // Logs with visual styling
    data.logs.forEach((log, index) => {
      // Check if we need a new page for the log header
      if (yPosition > 220) {
        doc.addPage()
        yPosition = 20
      }

      // Log header with colored background
      const headerColors = [
        [239, 68, 68],   // Red
        [34, 197, 94],   // Green
        [59, 130, 246],  // Blue
        [168, 85, 247],  // Purple
        [245, 158, 11]   // Orange
      ]
      const colorIndex = index % headerColors.length
      doc.setFillColor(...headerColors[colorIndex])
      doc.rect(15, yPosition - 5, 180, 12, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`Log ${index + 1}: ${log.date}`, 20, yPosition + 2)
      
      doc.setTextColor(0, 0, 0)
      yPosition += 15

      // Quote section with special styling
      if (log.quote) {
        // Check if we need a new page for quote
        if (yPosition > 240) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFillColor(254, 243, 199) // Light yellow background
        doc.rect(20, yPosition - 3, 170, 12, 'F')
        doc.setDrawColor(251, 191, 36) // Yellow border
        doc.rect(20, yPosition - 3, 170, 12, 'S')
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        const quoteText = `"${log.quote}"`
        const splitQuote = doc.splitTextToSize(quoteText, 160)
        doc.text(splitQuote, 25, yPosition + 3)
        yPosition += 15
      }

      // Tasks section
      if (log.tasks && log.tasks.length > 0) {
        // Check if we need a new page for tasks
        if (yPosition > 200) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Tasks:', 20, yPosition)
        yPosition += 8
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        log.tasks.forEach(task => {
          // Check if we need a new page for each task
          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
          }
          
          const status = task.completed ? '[DONE]' : '[TODO]'
          const textColor = task.completed ? [34, 197, 94] : [107, 114, 128] // Green or gray
          doc.setTextColor(...textColor)
          const taskText = `${status} ${task.text}`
          const splitTask = doc.splitTextToSize(taskText, 150)
          doc.text(splitTask, 25, yPosition)
          yPosition += 5 + (splitTask.length - 1) * 4
        })
        doc.setTextColor(0, 0, 0)
        yPosition += 5
      }

      // Ratings with visual bars
      if (log.ratings) {
        // Check if we need a new page for ratings
        if (yPosition > 200) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Performance Ratings:', 20, yPosition)
        yPosition += 8
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        
        // Discipline bar
        const discipline = log.ratings.discipline || 0
        doc.text(`Discipline: ${discipline}/10`, 20, yPosition)
        doc.setFillColor(59, 130, 246)
        doc.rect(70, yPosition - 3, (discipline / 10) * 50, 4, 'F')
        yPosition += 8
        
        // Sociability bar
        const sociability = log.ratings.sociability || 0
        doc.text(`Sociability: ${sociability}/10`, 20, yPosition)
        doc.setFillColor(34, 197, 94)
        doc.rect(70, yPosition - 3, (sociability / 10) * 50, 4, 'F')
        yPosition += 8
        
        // Productivity bar
        const productivity = log.ratings.productivity || 0
        doc.text(`Productivity: ${productivity}/10`, 20, yPosition)
        doc.setFillColor(245, 158, 11)
        doc.rect(70, yPosition - 3, (productivity / 10) * 50, 4, 'F')
        yPosition += 10
      }

      // Mood and Energy with visual indicators
      if (log.mood_score || log.energy_level) {
        // Check if we need a new page for mood & energy
        if (yPosition > 220) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Mood & Energy:', 20, yPosition)
        yPosition += 8
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        
        if (log.mood_score) {
          const mood = log.mood_score
          const moodColor = mood >= 7 ? [34, 197, 94] : mood >= 4 ? [245, 158, 11] : [239, 68, 68]
          doc.setTextColor(...moodColor)
          doc.text(`Mood: ${mood}/10`, 20, yPosition)
          doc.setFillColor(...moodColor)
          doc.rect(70, yPosition - 3, (mood / 10) * 50, 4, 'F')
          yPosition += 8
        }
        
        if (log.energy_level) {
          const energy = log.energy_level
          const energyColor = energy >= 7 ? [34, 197, 94] : energy >= 4 ? [245, 158, 11] : [239, 68, 68]
          doc.setTextColor(...energyColor)
          doc.text(`Energy: ${energy}/10`, 20, yPosition)
          doc.setFillColor(...energyColor)
          doc.rect(70, yPosition - 3, (energy / 10) * 50, 4, 'F')
          yPosition += 8
        }
        
        doc.setTextColor(0, 0, 0)
      }

      // Learning section
      if (log.learning) {
        // Check if we need a new page for learning
        if (yPosition > 240) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFillColor(219, 234, 254) // Light blue background
        doc.rect(20, yPosition - 3, 170, 10, 'F')
        doc.setDrawColor(59, 130, 246) // Blue border
        doc.rect(20, yPosition - 3, 170, 10, 'S')
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        const learningText = `Learning: ${log.learning}`
        const splitLearning = doc.splitTextToSize(learningText, 150)
        doc.text(splitLearning, 25, yPosition + 3)
        yPosition += 15
      }

      // Separator line
      doc.setDrawColor(209, 213, 219)
      doc.line(20, yPosition, 190, yPosition)
      yPosition += 15
    })

    return doc
  }

  const generateWeeklyReportPDF = (report) => {
    const doc = new jsPDF()
    let yPosition = 20

    // Header with gradient-like effect
    doc.setFillColor(59, 130, 246) // Blue background
    doc.rect(0, 0, 210, 35, 'F')
    
    // Title in white
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Weekly Performance Report', 20, 22)
    
    // Reset text color
    doc.setTextColor(0, 0, 0)
    yPosition = 50

    // Week info in styled box
    doc.setFillColor(243, 244, 246) // Light gray background
    doc.rect(15, yPosition - 5, 180, 25, 'F')
    doc.setDrawColor(209, 213, 219) // Gray border
    doc.rect(15, yPosition - 5, 180, 25, 'S')
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Week: ${report.week_start_date} to ${report.week_end_date}`, 20, yPosition)
    yPosition += 8
    doc.text(`Total Logs: ${report.total_logs}`, 20, yPosition)
    yPosition += 8
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition)
    yPosition += 20

    // Performance Metrics with visual cards
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Performance Metrics', 20, yPosition)
    yPosition += 15

    // Task Completion Card
    const completionRate = report.completion_rate || 0
    const completionColor = completionRate >= 80 ? [34, 197, 94] : completionRate >= 60 ? [245, 158, 11] : [239, 68, 68]
    doc.setFillColor(...completionColor)
    doc.rect(20, yPosition - 5, 80, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Task Completion', 25, yPosition + 2)
    doc.setFontSize(10)
    doc.text(`${completionRate.toFixed(1)}%`, 25, yPosition + 8)
    doc.text(`(${report.tasks_completed}/${report.total_tasks})`, 25, yPosition + 13)
    
    // Mood Card
    const mood = report.average_mood || 0
    const moodColor = mood >= 7 ? [34, 197, 94] : mood >= 4 ? [245, 158, 11] : [239, 68, 68]
    doc.setFillColor(...moodColor)
    doc.rect(110, yPosition - 5, 80, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Average Mood', 115, yPosition + 2)
    doc.setFontSize(10)
    doc.text(`${mood.toFixed(1)}/10`, 115, yPosition + 8)
    doc.text('Mood', 115, yPosition + 13)
    
    doc.setTextColor(0, 0, 0)
    yPosition += 30

    // Energy Card
    const energy = report.average_energy || 0
    const energyColor = energy >= 7 ? [34, 197, 94] : energy >= 4 ? [245, 158, 11] : [239, 68, 68]
    doc.setFillColor(...energyColor)
    doc.rect(20, yPosition - 5, 80, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Energy Level', 25, yPosition + 2)
    doc.setFontSize(10)
    doc.text(`${energy.toFixed(1)}/10`, 25, yPosition + 8)
    doc.text('Energy', 25, yPosition + 13)
    
    // Productivity Card
    const productivity = report.average_productivity || 0
    const productivityColor = productivity >= 7 ? [34, 197, 94] : productivity >= 4 ? [245, 158, 11] : [239, 68, 68]
    doc.setFillColor(...productivityColor)
    doc.rect(110, yPosition - 5, 80, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Productivity', 115, yPosition + 2)
    doc.setFontSize(10)
    doc.text(`${productivity.toFixed(1)}/10`, 115, yPosition + 8)
    doc.text('Productivity', 115, yPosition + 13)
    
    doc.setTextColor(0, 0, 0)
    yPosition += 35

    // Performance Ratings with visual bars
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Detailed Ratings', 20, yPosition)
    yPosition += 12

    const ratings = [
      { name: 'Discipline', value: report.average_discipline || 0, color: [59, 130, 246] },
      { name: 'Sociability', value: report.average_sociability || 0, color: [34, 197, 94] },
      { name: 'Productivity', value: report.average_productivity || 0, color: [245, 158, 11] }
    ]

    ratings.forEach(rating => {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`${rating.name}: ${rating.value.toFixed(1)}/10`, 20, yPosition)
      doc.setFillColor(...rating.color)
      doc.rect(80, yPosition - 3, (rating.value / 10) * 100, 4, 'F')
      yPosition += 10
    })

    yPosition += 15

    // Personal Insights with enhanced styling
    if (report.personal_insights) {
      // Check if we need a new page for insights section
      if (yPosition > 200) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Personal Insights & Self-Improvement', 20, yPosition)
      yPosition += 15

      // Top Suggestions
      if (report.personal_insights.suggestions && report.personal_insights.suggestions.length > 0) {
        // Check if we need a new page for suggestions
        if (yPosition > 180) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFillColor(219, 234, 254) // Light blue background
        doc.rect(15, yPosition - 5, 180, 8 + (report.personal_insights.suggestions.length * 8), 'F')
        doc.setDrawColor(59, 130, 246) // Blue border
        doc.rect(15, yPosition - 5, 180, 8 + (report.personal_insights.suggestions.length * 8), 'S')
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Top 5 Suggestions for Next Week', 20, yPosition + 2)
        yPosition += 10
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        report.personal_insights.suggestions.forEach((suggestion, index) => {
          const suggestionText = `${index + 1}. ${suggestion}`
          const splitSuggestion = doc.splitTextToSize(suggestionText, 150)
          doc.text(splitSuggestion, 25, yPosition)
          yPosition += 6 + (splitSuggestion.length - 1) * 4
        })
        yPosition += 10
      }

      // What You Did Great
      if (report.personal_insights.positives && report.personal_insights.positives.length > 0) {
        // Check if we need a new page for positives
        if (yPosition > 180) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFillColor(220, 252, 231) // Light green background
        doc.rect(15, yPosition - 5, 180, 8 + (report.personal_insights.positives.length * 8), 'F')
        doc.setDrawColor(34, 197, 94) // Green border
        doc.rect(15, yPosition - 5, 180, 8 + (report.personal_insights.positives.length * 8), 'S')
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('What You Did Great This Week', 20, yPosition + 2)
        yPosition += 10
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        report.personal_insights.positives.forEach(positive => {
          const positiveText = `• ${positive}`
          const splitPositive = doc.splitTextToSize(positiveText, 150)
          doc.text(splitPositive, 25, yPosition)
          yPosition += 6 + (splitPositive.length - 1) * 4
        })
        yPosition += 10
      }

      // Areas to Focus On
      if (report.personal_insights.negatives && report.personal_insights.negatives.length > 0) {
        // Check if we need a new page for negatives
        if (yPosition > 180) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.setFillColor(254, 243, 199) // Light orange background
        doc.rect(15, yPosition - 5, 180, 8 + (report.personal_insights.negatives.length * 8), 'F')
        doc.setDrawColor(245, 158, 11) // Orange border
        doc.rect(15, yPosition - 5, 180, 8 + (report.personal_insights.negatives.length * 8), 'S')
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Areas to Focus On', 20, yPosition + 2)
        yPosition += 10
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        report.personal_insights.negatives.forEach(negative => {
          const negativeText = `• ${negative}`
          const splitNegative = doc.splitTextToSize(negativeText, 150)
          doc.text(splitNegative, 25, yPosition)
          yPosition += 6 + (splitNegative.length - 1) * 4
        })
      }
    }

    return doc
  }

  const handleExport = async () => {
    if (!user) {
      setMessage('Please log in to export your data.')
      return
    }

    setExporting(true)
    setMessage('')

    try {
      let data, filename, doc

      if (exportType === 'all') {
        data = exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `jibble-export-${getCurrentDateKey()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setMessage('Data exported successfully!')
      } else if (exportType === 'dateRange') {
        if (!startDate || !endDate) {
          setMessage('Please select both start and end dates.')
          return
        }
        data = await exportDataByDateRange(startDate, endDate)
        doc = generateLogsPDF(data, `Daily Logs Report (${startDate} to ${endDate})`)
        filename = `jibble-logs-${startDate}-to-${endDate}.pdf`
        doc.save(filename)
        setMessage(`PDF exported successfully! (${data.totalLogs} logs)`)
      } else if (exportType === 'weekly') {
        if (!selectedWeek) {
          setMessage('Please select a week.')
          return
        }
        data = await exportWeeklyReportPDF(selectedWeek)
        if (!data) {
          setMessage('No data available for the selected week.')
          return
        }
        doc = generateWeeklyReportPDF(data)
        filename = `jibble-weekly-report-${selectedWeek}.pdf`
        doc.save(filename)
        setMessage('Weekly report PDF exported successfully!')
      } else if (exportType === 'thisWeek') {
        const currentWeekStart = getCurrentWeekStart()
        const response = await getWeeklyReport(currentWeekStart, true) // Force regenerate
        if (!response.data) {
          setMessage('No data available for this week.')
          return
        }
        doc = generateWeeklyReportPDF(response.data)
        filename = `jibble-this-week-report-${currentWeekStart}.pdf`
        doc.save(filename)
        setMessage('This week\'s report PDF exported successfully!')
      }
    } catch (error) {
      console.error('Export error:', error)
      setMessage('Failed to export data. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      setMessage('Please select a file to import.')
      return
    }

    setImporting(true)
    setMessage('')

    try {
      const text = await importFile.text()
      const data = JSON.parse(text)
      await importData(data)
      setMessage('Data imported successfully!')
      setImportFile(null)
      // Reset file input
      const fileInput = document.getElementById('import-file')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Import error:', error)
      setMessage('Failed to import data. Please check the file format.')
    } finally {
      setImporting(false)
    }
  }

  const handleClearData = async () => {
    if (!user) {
      setMessage('Please log in to clear your data.')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to clear all your data? This action cannot be undone.'
    )

    if (!confirmed) return

    setClearing(true)
    setMessage('')

    try {
      await clearAllData()
      setMessage('All data cleared successfully!')
    } catch (error) {
      console.error('Clear data error:', error)
      setMessage('Failed to clear data. Please try again.')
    } finally {
      setClearing(false)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/json') {
      setImportFile(file)
      setMessage('')
    } else {
      setMessage('Please select a valid JSON file.')
      setImportFile(null)
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Data Export</h2>
          <p>Please log in to access data export features.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className={`text-3xl journal-heading mb-8 ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Data Management
        </h1>

        {/* Export Section */}
        <div className={`mb-8 p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl journal-heading mb-4 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            📤 Export Your Data
          </h2>
          <p className={`mb-6 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Choose your export format and date range. Export as JSON for backup or PDF for sharing and printing.
          </p>

          {/* Export Type Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Export Type:
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mr-2"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>All Data (JSON)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="dateRange"
                  checked={exportType === 'dateRange'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mr-2"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Date Range (PDF)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="weekly"
                  checked={exportType === 'weekly'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mr-2"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Weekly Report (PDF)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="thisWeek"
                  checked={exportType === 'thisWeek'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mr-2"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>This Week Report (PDF)</span>
              </label>
            </div>
          </div>

          {/* Date Range Selection */}
          {exportType === 'dateRange' && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Start Date:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full p-3 border-2 rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  End Date:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full p-3 border-2 rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Weekly Report Selection */}
          {exportType === 'weekly' && (
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Select Week (Monday):
              </label>
              <input
                type="date"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className={`w-full p-3 border-2 rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
              <p className={`text-xs mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Select the Monday of the week you want to export
              </p>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={exporting}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 ${
              isDark 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {exporting ? 'Exporting...' : `Export ${exportType === 'all' ? 'Data' : exportType === 'dateRange' ? 'PDF' : exportType === 'thisWeek' ? 'This Week Report' : 'Weekly Report'}`}
          </button>
        </div>

        {/* Import Section */}
        <div className={`mb-8 p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl journal-heading mb-4 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            📥 Import Data
          </h2>
          <p className={`mb-6 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Import previously exported data. This will merge the imported data with your existing data.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="import-file"
              accept=".json"
              onChange={handleFileChange}
              className={`block w-full text-sm ${
                isDark 
                  ? 'text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700' 
                  : 'text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600'
              }`}
            />
            <button
              onClick={handleImport}
              disabled={importing || !importFile}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 ${
                isDark 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {importing ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        </div>

        {/* Clear Data Section */}
        <div className={`mb-8 p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl journal-heading mb-4 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            🗑️ Clear All Data
          </h2>
          <p className={`mb-6 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <strong className="text-red-500">Warning:</strong> This will permanently delete all your logs, settings, and user data. This action cannot be undone.
          </p>
          <button
            onClick={handleClearData}
            disabled={clearing}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 ${
              isDark 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {clearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg border-2 ${
            message.includes('successfully') 
              ? isDark 
                ? 'bg-green-900 border-green-600 text-green-200' 
                : 'bg-green-50 border-green-200 text-green-800'
              : isDark 
                ? 'bg-red-900 border-red-600 text-red-200' 
                : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Information Section */}
        <div className={`p-6 rounded-xl border-2 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl journal-heading mb-4 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            ℹ️ Data Management Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                📤 Export Features
              </h3>
              <ul className={`text-sm space-y-1 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <li>• All data export (JSON backup)</li>
                <li>• Date range filtered logs (PDF)</li>
                <li>• Weekly performance reports (PDF)</li>
                <li>• This week's report (PDF)</li>
                <li>• Professional PDF formatting</li>
                <li>• Personal insights included</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-medium mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                📥 Import Features
              </h3>
              <ul className={`text-sm space-y-1 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <li>• Merge with existing data</li>
                <li>• Preserve current settings</li>
                <li>• Safe data restoration</li>
                <li>• Automatic validation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Export 