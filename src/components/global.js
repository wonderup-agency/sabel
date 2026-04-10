import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default function () {
  const lenis = new Lenis({ autoRaf: false })

  // Keep ScrollTrigger in sync with Lenis scroll position
  lenis.on('scroll', ScrollTrigger.update)

  // Drive Lenis via GSAP's ticker so both run on the same animation frame
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  // Disable GSAP lag smoothing — Lenis handles its own smoothing
  gsap.ticker.lagSmoothing(0)
}
