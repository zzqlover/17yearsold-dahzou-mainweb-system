export function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax-element')

  if (!parallaxElements.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  )

  parallaxElements.forEach((el) => {
    observer.observe(el)
  })

  return observer
}

export function scrollToElement(selector, offset = 80) {
  const element = document.querySelector(selector)
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}
