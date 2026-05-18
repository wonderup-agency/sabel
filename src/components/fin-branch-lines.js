/*
Component: fin-branch-lines
Webflow attribute: data-component="fin-branch-lines"

Variant of the homepage's branch-lines animation, scoped to the Fin page's
featured-cards section. The Fin SVG uses a viewBox that doesn't start at y=0,
so main-path detection picks the topmost path (smallest starting Y) instead of
hardcoding y < 1. Queries are scoped to the section so this never touches
the homepage section animated by home.js.
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='fin-branch-lines']
 */
export default function (elements) {
  elements.forEach((section) => {
    // CTA-style top lines animation (data-cta elements copied from cta section)
    const topH = section.querySelector(
      '[data-cta="line-top-horizontal"] .cta_line-fill'
    )
    const topV = section.querySelector(
      '[data-cta="line-top-vertical"] .cta_line-fill'
    )

    if (topH && topV) {
      gsap.set(topH, { scaleX: 0, scaleY: 1 })
      gsap.set(topV, { scaleX: 1, scaleY: 0, transformOrigin: '50% 0%' })

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 30%',
            scrub: 1,
          },
        })
        .to(topH, { scaleX: 1, ease: 'none', duration: 1 }, 0)
        .to(topV, { scaleY: 1, ease: 'none', duration: 1 }, 0)
    }

    const svg = section.querySelector('[data-animate="lines-section"]')
    if (!svg) return

    const allPaths = [...svg.querySelectorAll('[data-line="branch"]')]
    if (!allPaths.length) return

    const cards = [...section.querySelectorAll('.featured-card_button')]

    allPaths.forEach((path) => {
      const length = path.getTotalLength()
      path.style.strokeDasharray = length
      path.style.strokeDashoffset = length
    })

    // Main line = the topmost path (smallest starting Y in its `d`).
    // Works for any viewBox origin, unlike the homepage version which hardcodes y < 1.
    const getStartY = (p) => {
      const m = p.getAttribute('d').match(/^M\s*[-\d.]+[\s,]+([-\d.]+)/)
      return m ? parseFloat(m[1]) : Infinity
    }
    const mainPath = allPaths.reduce(
      (best, p) => (getStartY(p) < getStartY(best) ? p : best),
      allPaths[0]
    )

    // Branch paths sorted left-to-right by their end X position
    const branchPaths = allPaths
      .filter((p) => p !== mainPath)
      .sort(
        (a, b) =>
          a.getPointAtLength(a.getTotalLength()).x -
          b.getPointAtLength(b.getTotalLength()).x
      )

    gsap.set(cards, { autoAlpha: 0, y: 20 })

    const mainDuration = 0.5
    const branchDuration = 0.3
    const branchStagger = 0.2
    const branchStart = mainDuration // branches start exactly when the main line finishes
    const totalDuration =
      branchStart + (branchPaths.length - 1) * branchStagger + branchDuration

    // Scroll progress at which each branch line completes
    const completionProgress = branchPaths.map(
      (_, i) =>
        (branchStart + i * branchStagger + branchDuration) / totalDuration
    )

    const cardShown = new Array(cards.length).fill(false)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: svg,
        start: 'top 50%',
        end: 'bottom 30%',
        scrub: true,
        onUpdate(self) {
          branchPaths.forEach((_, i) => {
            const card = cards[i]
            if (!card) return
            const threshold = completionProgress[i]
            if (self.progress >= threshold && !cardShown[i]) {
              cardShown[i] = true
              gsap.killTweensOf(card)
              gsap.to(card, {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
              })
            } else if (self.progress < threshold && cardShown[i]) {
              cardShown[i] = false
              gsap.killTweensOf(card)
              gsap.to(card, {
                autoAlpha: 0,
                y: 20,
                duration: 0.3,
                ease: 'power2.in',
              })
            }
          })
        },
      },
    })

    // ease: none so scroll progress = fraction of Y drawn — makes branch timing exact
    if (mainPath) {
      tl.to(
        mainPath,
        { strokeDashoffset: 0, duration: mainDuration, ease: 'none' },
        0
      )
    }

    // Branches stagger left-to-right, all starting when the main line reaches the first branch point
    branchPaths.forEach((path, i) => {
      tl.to(
        path,
        { strokeDashoffset: 0, duration: branchDuration, ease: 'none' },
        branchStart + i * branchStagger
      )
    })
  })
}
