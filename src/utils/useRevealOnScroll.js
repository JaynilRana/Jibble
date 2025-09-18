import { useEffect } from 'react'

const useRevealOnScroll = (selector = '[data-reveal]') => {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(selector))
    if (elements.length === 0) return

    const reveal = (el) => {
      el.classList.add('reveal-in')
      try { observer.unobserve(el) } catch (_) {}
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target)
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' })

    elements.forEach((el) => observer.observe(el))

    // Immediately reveal items already in viewport to avoid blank sections
    const inView = (el) => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      return rect.top <= vh * 0.9 && rect.bottom >= 0
    }
    elements.forEach((el) => { if (inView(el)) reveal(el) })

    // Fallback: reveal any remaining hidden items after 1.2s
    const fallbackTimer = window.setTimeout(() => {
      elements.forEach((el) => { if (!el.classList.contains('reveal-in')) reveal(el) })
    }, 1200)

    return () => { window.clearTimeout(fallbackTimer); observer.disconnect() }
  }, [selector])
}

export default useRevealOnScroll


