/*
Component: home
Webflow attribute: data-component="home"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='home']
 */
export default function () {
  // ---------------------------------------------------------------------------
  // Global Lines — vertical lines between line-start / line-end pairs
  // ---------------------------------------------------------------------------
  const lineWidth = 1
  const globalLines = []
  function getCenter(el) {
    const rect = el.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + rect.height / 2 + window.scrollY,
    }
  }

  function initGlobalLines() {
    const starts = document.querySelectorAll('[line-start]')
    const ends = document.querySelectorAll('[line-end]')

    const endMap = {}
    ends.forEach((el) => {
      endMap[el.getAttribute('line-end')] = el
    })

    // Skip lines managed by the timeline component
    const timelineContainer = document.querySelector(
      '[data-component="timeline"]'
    )

    starts.forEach((startEl) => {
      const id = startEl.getAttribute('line-start')
      const endEl = endMap[id]
      if (!endEl) return
      if (timelineContainer && timelineContainer.contains(endEl)) return

      const startPos = getCenter(startEl)
      const endPos = getCenter(endEl)

      const container = document.createElement('div')
      container.className = 'global-line'
      container.style.cssText = `
        position: absolute;
        left: ${startPos.x - lineWidth / 2}px;
        top: ${startPos.y}px;
        width: ${lineWidth}px;
        height: ${endPos.y - startPos.y}px;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
      `

      // Static background track (only if line-background is set)
      if (startEl.hasAttribute('line-background')) {
        const bg = document.createElement('div')
        bg.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #94A3B8;
        `
        container.appendChild(bg)
      }

      const line = document.createElement('div')
      line.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        background: var(--base--red);
        transform-origin: top center;
        transform: scaleY(0);
        box-shadow: 0 0 6px 1px var(--base--red);
      `

      container.appendChild(line)
      document.body.appendChild(container)

      gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: startEl,
          endTrigger: endEl,
          start: 'center center',
          end: 'center center',
          scrub: true,
        },
      })

      globalLines.push({ container, line, startEl, endEl })
    })
  }

  function repositionLines() {
    globalLines.forEach(({ container, startEl, endEl }) => {
      const startPos = getCenter(startEl)
      const endPos = getCenter(endEl)
      container.style.left = `${startPos.x - lineWidth / 2}px`
      container.style.top = `${startPos.y}px`
      container.style.height = `${endPos.y - startPos.y}px`
    })
    ScrollTrigger.refresh()
  }

  initGlobalLines()

  // ---------------------------------------------------------------------------
  // Nav — hidden on load, deblur reveal on second section
  // ---------------------------------------------------------------------------
  const nav = document.querySelector('.navbar_component')
  if (nav) {
    gsap.set(nav, { opacity: 0, filter: 'blur(12px)', yPercent: -100 })

    const sloganSection = document.querySelector(
      '[home-animation="section-slogan"]'
    )
    if (sloganSection) {
      ScrollTrigger.create({
        trigger: sloganSection,
        start: 'center center',
        onEnter() {
          gsap.to(nav, {
            opacity: 1,
            filter: 'blur(0px)',
            yPercent: 0,
            backgroundColor: 'rgba(11, 11, 12, 0.5)',
            duration: 0.8,
            ease: 'power2.out',
          })
        },
        onLeaveBack() {
          gsap.to(nav, {
            opacity: 0,
            filter: 'blur(12px)',
            yPercent: -100,
            backgroundColor: 'rgba(11, 11, 12, 0)',
            duration: 0.5,
            ease: 'power2.in',
          })
        },
      })
    }
  }

  // ---------------------------------------------------------------------------
  // Hero — staggered entrance on load
  // ---------------------------------------------------------------------------
  const heroTitle = document.querySelector('.home-hero_title')
  const heroBy = document.querySelector('.home-hero_text')
  const heroLogo1 = document.querySelector('[home-animation="logo-1"]')
  const heroLogo2 = document.querySelector('[home-animation="logo-2"]')

  const heroInfinite = document.querySelector(
    '.home-hero_logos-layout .home-hero_lines:not(.hide)'
  )
  const heroItems = [
    heroTitle,
    heroBy,
    heroLogo1,
    heroLogo2,
    heroInfinite,
  ].filter(Boolean)

  if (heroItems.length) {
    gsap.set(heroItems, { opacity: 0, y: 20, filter: 'blur(12px)' })

    gsap.to(heroItems, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power2.out',
      stagger: 0.25,
      delay: 0.3,
    })
  }

  // ---------------------------------------------------------------------------
  // Branch Lines — SVG paths + cards in the featured section
  // ---------------------------------------------------------------------------
  const branchSection = document.querySelector('[data-animate="lines-section"]')
  if (branchSection) {
    const allPaths = [...branchSection.querySelectorAll('[data-line="branch"]')]

    allPaths.forEach((path) => {
      const length = path.getTotalLength()
      path.style.strokeDasharray = length
      path.style.strokeDashoffset = length
    })

    // Main line = path starting at y≈0
    const mainPath = allPaths.find((p) => {
      const m = p.getAttribute('d').match(/^M[\d.]+ ([\d.]+)/)
      return m && parseFloat(m[1]) < 1
    })

    // Branch paths sorted left-to-right by their end X position
    const branchPaths = allPaths
      .filter((p) => p !== mainPath)
      .sort(
        (a, b) =>
          a.getPointAtLength(a.getTotalLength()).x -
          b.getPointAtLength(b.getTotalLength()).x
      )

    // All 5 branch paths map 1:1 to the 5 cards (sorted left-to-right, same as cards)
    const cards = [...document.querySelectorAll('.featured-card_button')]
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
        trigger: branchSection,
        start: 'top 50%',
        end: 'bottom 30%',
        scrub: true,
        markers: true,
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
  }

  // ---------------------------------------------------------------------------
  // Slogan — deblur reveal
  // ---------------------------------------------------------------------------
  const sloganTitle = document.querySelector('[home-animation="slogan"]')
  if (sloganTitle) {
    gsap.set(sloganTitle, { filter: 'blur(12px)', opacity: 0 })

    gsap.to(sloganTitle, {
      filter: 'blur(0px)',
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sloganTitle,
        start: 'top 60%',
        once: true,
      },
    })
  }

  return {
    resize() {
      repositionLines()
    },
  }
}
