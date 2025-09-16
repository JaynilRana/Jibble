import React, { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const ScrollProgressBar = () => {
  const { isDark } = useTheme()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
      setProgress(pct)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={`${isDark ? 'bg-gray-900/60' : 'bg-white/60'} backdrop-blur-sm`} style={{ height: 2 }} />
      <div
        className={`${isDark ? 'bg-cyan-400' : 'bg-cyan-600'}`}
        style={{ height: 3, width: `${progress}%`, transition: 'width 120ms linear' }}
      />
    </div>
  )
}

export default ScrollProgressBar


