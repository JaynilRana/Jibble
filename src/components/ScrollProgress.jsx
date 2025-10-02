import React from 'react'

const ScrollProgress = () => {
  const barRef = React.useRef(null)

  React.useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress / 100})`
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 50 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)', opacity: 0.2 }}></div>
      <div ref={barRef} style={{ transformOrigin: '0 0', height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', transform: 'scaleX(0)' }}></div>
    </div>
  )
}

export default ScrollProgress


