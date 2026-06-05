import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import './global.css'

let lenisInstance = null

// Lets other components access the live Lenis instance (e.g. to stop/start
// scroll while a modal is open). Returns null on mobile (Lenis is gated to
// desktop) or before global.js has run.
export function getLenis() {
  return lenisInstance
}

// Lenis and the body ResizeObserver are disabled at and below this width.
// Lenis fights iOS Safari's native momentum; the ResizeObserver triggers
// ScrollTrigger.refresh storms when the address bar shows/hides during scroll.
const MOBILE_BREAKPOINT = 991

export default function () {
  const isDesktop = window.matchMedia(
    `(min-width: ${MOBILE_BREAKPOINT + 1}px)`
  ).matches

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

  if (!isDesktop) {
    // Mobile: native scroll. ScrollTrigger listens to window.scroll by
    // default so no wiring is needed beyond the lines-visibility toggle.
    window.addEventListener('scroll', updateGlobalLinesVisibility, {
      passive: true,
    })
    // Debug: Lenis is intentionally OFF here. Inspect via window.__lenis (null).
    window.__lenis = null
    console.log(
      `%c🐌 [global.js] Lenis OFF — native scroll (viewport ≤${MOBILE_BREAKPOINT}px)`,
      'color: #fbbf24; font-weight: bold'
    )
    return
  }

  // ---- Desktop only from here on ----

  const lenis = new Lenis({ autoRaf: false })
  lenisInstance = lenis

  // Debug: expose the live instance on window and log that Lenis is active.
  // Inspect from devtools via window.__lenis (the instance) or call getLenis().
  window.__lenis = lenis
  console.log(
    `%c🐌 [global.js] Lenis ON — smooth scroll (viewport >${MOBILE_BREAKPOINT}px)`,
    'color: #4ade80; font-weight: bold',
    lenis
  )

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

  lenis.on('scroll', updateGlobalLinesVisibility)
}
