import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import DateHeader from './DateHeader'
import DailyLogForm from './DailyLogForm'
import StatsGrid from './StatsGrid'

const DailyLogPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { isDark } = useTheme()

  const changeDate = (days) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate)
    console.log('Loading log for:', newDate.toDateString())
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <DateHeader 
        currentDate={currentDate}
        onDateChange={changeDate}
        onGoToToday={goToToday}
      />
      
      <DailyLogForm currentDate={currentDate} />
      
      <StatsGrid />
    </div>
  )
}

export default DailyLogPage 