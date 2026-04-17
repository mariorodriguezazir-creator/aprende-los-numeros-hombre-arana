import gsap from 'gsap'

// Spring easing — da sensación "viva" y juguetonamente elástica
export const SPRING_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

// --- Entrance animations ---

export const animateIn = (element: Element | string, delay = 0): gsap.core.Tween =>
  gsap.fromTo(
    element,
    { opacity: 0, y: 20, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.4, delay, ease: SPRING_EASE },
  )

export const animatePop = (element: Element | string, delay = 0): gsap.core.Tween =>
  gsap.fromTo(
    element,
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, delay, ease: SPRING_EASE },
  )

// --- Feedback animations ---

export const animateSuccess = (element: Element | string): gsap.core.Timeline =>
  gsap.timeline()
    .to(element, { scale: 1.2, duration: 0.15, ease: 'power2.out' })
    .to(element, { scale: 1, duration: 0.3, ease: SPRING_EASE })

export const animateError = (element: Element | string): gsap.core.Timeline =>
  gsap.timeline()
    .to(element, { x: -8, duration: 0.07, ease: 'power2.out' })
    .to(element, { x: 8, duration: 0.07 })
    .to(element, { x: -8, duration: 0.07 })
    .to(element, { x: 8, duration: 0.07 })
    .to(element, { x: 0, duration: 0.07, ease: 'power2.inOut' })

// Celebración Spider-Man: burst elástico + rotación de tela de araña
export const animateSpiderSuccess = (element: Element | string): gsap.core.Timeline =>
  gsap.timeline()
    .fromTo(element,
      { scale: 0.5, rotation: -15, opacity: 0 },
      { scale: 1.15, rotation: 8, opacity: 1, duration: 0.25, ease: 'back.out(1.7)' },
    )
    .to(element, { scale: 0.95, rotation: -4, duration: 0.15 })
    .to(element, { scale: 1, rotation: 0, duration: 0.2, ease: SPRING_EASE })

// Spider-Sense: shake más agresivo con bounce final
export const animateSpiderError = (element: Element | string): gsap.core.Timeline =>
  gsap.timeline()
    .to(element, { x: -12, duration: 0.06, ease: 'power3.out' })
    .to(element, { x: 12, duration: 0.06 })
    .to(element, { x: -10, duration: 0.06 })
    .to(element, { x: 10, duration: 0.06 })
    .to(element, { x: -6, duration: 0.06 })
    .to(element, { x: 0, duration: 0.1, ease: 'elastic.out(1, 0.5)' })

// --- Celebration ---

export const animateCelebration = (element: Element | string): gsap.core.Timeline =>
  gsap.timeline()
    .to(element, { scale: 1.3, rotation: -5, duration: 0.2, ease: 'power2.out' })
    .to(element, { scale: 1.1, rotation: 5, duration: 0.2 })
    .to(element, { scale: 1.2, rotation: -3, duration: 0.15 })
    .to(element, { scale: 1, rotation: 0, duration: 0.3, ease: SPRING_EASE })

// --- Page transitions ---

export const animatePageOut = (element: Element | string): gsap.core.Tween =>
  gsap.to(element, { opacity: 0, y: -20, duration: 0.25, ease: 'power2.in' })

export const animatePageIn = (element: Element | string): gsap.core.Tween =>
  gsap.fromTo(
    element,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.35, ease: SPRING_EASE },
  )

// --- Stagger (for lists of items) ---

export const animateStagger = (
  elements: Element[] | string,
  staggerDelay = 0.05,
): gsap.core.Tween =>
  gsap.fromTo(
    elements,
    { opacity: 0, y: 15, scale: 0.9 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      stagger: staggerDelay,
      ease: SPRING_EASE,
    },
  )

// --- Number tile pulse (idle animation) ---

export const animateNumberPulse = (element: Element | string): gsap.core.Tween =>
  gsap.to(element, {
    scale: 1.05,
    duration: 1.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
