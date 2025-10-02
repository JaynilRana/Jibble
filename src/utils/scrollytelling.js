// Lightweight scrollytelling: observes [data-reveal] elements and toggles .is-revealed
// Usage: call initScrollytelling() once (e.g., in App) and add data-reveal="up|left|right|zoom" to elements

let observerInstance = null

export function initScrollytelling() {
  if (observerInstance || typeof window === 'undefined') return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const options = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: prefersReducedMotion ? 0 : 0.2
  }

  observerInstance = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = entry.target
      if (entry.isIntersecting) {
        target.classList.add('is-revealed')
        // If element has data-reveal-once, unobserve after revealing
        if (target.hasAttribute('data-reveal-once')) {
          observerInstance.unobserve(target)
        }
      } else {
        // Only reset if not marked as reveal-once
        if (!target.hasAttribute('data-reveal-once')) {
          target.classList.remove('is-revealed')
        }
      }
    })
  }, options)

  const observeAll = () => {
    document.querySelectorAll('[data-reveal]')?.forEach((el) => {
      observerInstance.observe(el)
    })
  }

  // Initial observe
  observeAll()

  // Parallax support: elements with [data-parallax="y"] and optional data-parallax-speed (default 0.2)
  const parallaxElements = new Set()
  const collectParallax = () => {
    document.querySelectorAll('[data-parallax]')?.forEach((el) => parallaxElements.add(el))
  }
  collectParallax()

  const onScroll = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop
    parallaxElements.forEach((el) => {
      const type = el.getAttribute('data-parallax') || 'y'
      const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.2')
      if (type === 'y') {
        el.style.transform = `translateY(${scrollY * speed}px)`
      } else if (type === 'x') {
        el.style.transform = `translateX(${scrollY * speed}px)`
      } else if (type === 'scale') {
        const base = 1
        el.style.transform = `scale(${base + scrollY * speed * 0.0005})`
      }
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  // Observe dynamically added nodes
  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node
            if (element.matches?.('[data-reveal]')) {
              observerInstance.observe(element)
            }
            element.querySelectorAll?.('[data-reveal]')?.forEach((child) => observerInstance.observe(child))
          }
        })
      }
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-reveal') {
        const target = mutation.target
        observerInstance.observe(target)
      }
      if (mutation.type === 'attributes' && mutation.attributeName?.startsWith('data-parallax')) {
        collectParallax()
      }
    }
  })

  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-reveal', 'data-parallax', 'data-parallax-speed']
  })
}

export default initScrollytelling


