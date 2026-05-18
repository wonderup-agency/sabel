import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import './global.css'

let lenisInstance = null

// Lets other components access the live Lenis instance (e.g. to stop/start
// scroll while a modal is open). Returns null if global.js hasn't run yet.
export function getLenis() {
  return lenisInstance
}

export default function () {
  const lenis = new Lenis({ autoRaf: false })
  lenisInstance = lenis

  // Keep ScrollTrigger in sync with Lenis scroll position
  lenis.on('scroll', ScrollTrigger.update)

  // Drive Lenis via GSAP's ticker so both run on the same animation frame
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  // Disable GSAP lag smoothing — Lenis handles its own smoothing
  gsap.ticker.lagSmoothing(0)

  // Refresh ScrollTrigger when the document grows or shrinks after init
  // (lazy-loaded images, font swaps, deferred content). Without this,
  // components near the bottom of long pages keep stale cached pixel
  // positions and fire their animations against the old layout.
  let refreshScheduled = false
  const scheduleRefresh = () => {
    if (refreshScheduled) return
    refreshScheduled = true
    requestAnimationFrame(() => {
      refreshScheduled = false
      ScrollTrigger.refresh()
    })
  }
  new ResizeObserver(scheduleRefresh).observe(document.body)

  // Toggle the .global-lines-visible class on <html> as the user scrolls
  // past a small threshold. The matching CSS rule lives in global.css so
  // .global-line elements start at opacity 0 from the first paint (no
  // FOUC) regardless of when components append them to the DOM.
  const SCROLL_THRESHOLD = 8 // px — dead zone to prevent flicker at the top
  const updateGlobalLinesVisibility = () => {
    document.documentElement.classList.toggle(
      'global-lines-visible',
      window.scrollY > SCROLL_THRESHOLD
    )
  }

  updateGlobalLinesVisibility()
  lenis.on('scroll', updateGlobalLinesVisibility)
}
