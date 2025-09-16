import { useEffect } from 'react'

const useRevealOnScroll = (selector = '[data-reveal]') => {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(selector))
    if (elements.length === 0) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' })

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [selector])
}

export default useRevealOnScroll


