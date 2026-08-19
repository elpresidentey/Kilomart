export function initScrollReveal() {
  if (typeof window === 'undefined') return

  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'))
    return
  }

  const applyDelay = (element: HTMLElement) => {
    const delay = Number(element.dataset.revealDelay)
    if (delay > 0) element.style.transitionDelay = `${delay}ms`
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const target = entry.target as HTMLElement
        target.classList.add('is-visible')
        observer.unobserve(target)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  )

  elements.forEach((element) => {
    applyDelay(element)
    observer.observe(element)
  })
}