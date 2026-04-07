/*
Component: timeline
Webflow attribute: data-component="timeline"
*/

const LINE_WIDTH = 1
const LINE_GAP = 20 // px clipped at each end to clear bullets
const LINE_COLOR = 'var(--base--red)'
const LINE_BG_COLOR = 'var(--base--grey)'
const PROGRESS_THRESHOLD = 0.98

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='timeline']
 */
export default function (elements) {
  const allLines = []

  function getPos(el, anchor = 'center') {
    const rect = el.getBoundingClientRect()
    // Compensate for any active GSAP y-transform (e.g. card entrance animation)
    // so the line anchors to the element's natural resting position.
    const yTransform = gsap.getProperty(el, 'y') || 0
    return {
      x: rect.left + rect.width / 2 + window.scrollX,
      y:
        rect.top +
        (anchor === 'bottom' ? rect.height : rect.height / 2) +
        window.scrollY -
        yTransform,
    }
  }

  elements.forEach((container) => {
    // Ensure timeline container sits above body-level lines
    container.style.position = 'relative'
    container.style.zIndex = '2'

    // Find bullets inside this timeline container
    const bullets = [...container.querySelectorAll('.featured-card_nav_icon')]

    // Set all bullets to inactive
    bullets.forEach((bullet) => {
      const blur = bullet.querySelector('.featured-card_nav_icon-blur')
      if (blur) gsap.set(blur, { opacity: 0 })
      gsap.set(bullet, { filter: 'grayscale(1) brightness(0.6)' })
    })

    // Use first child of the grid as the origin of the first line
    const grid = container.querySelector('.featured-cards_grid')
    const gridStart = grid?.firstElementChild

    // Pair line endpoints by DOM order (no number matching needed)
    const starts = [...container.querySelectorAll('.line_start')]
    const ends = [...container.querySelectorAll('.line_end')]

    // Prepend grid start so the first line runs from the grid to the first bullet
    if (gridStart) starts.unshift(gridStart)
    const pairs = []
    const count = Math.min(starts.length, ends.length)
    for (let i = 0; i < count; i++) {
      const isGridStart = gridStart && i === 0
      pairs.push({ startEl: starts[i], endEl: ends[i], isGridStart })
    }

    pairs.forEach((pair, i) => {
      const { startEl, endEl, isGridStart } = pair
      const bullet = bullets[i]
      const startAnchor = isGridStart ? 'bottom' : 'center'

      const startPos = getPos(startEl, startAnchor)
      const endPos = getPos(endEl)

      // Grid-start line has no bullet at the top, so don't clip the top.
      const topClip = isGridStart ? 0 : LINE_GAP
      const lineContainer = document.createElement('div')
      lineContainer.className = 'global-line'
      lineContainer.style.cssText = `
        position: absolute;
        left: ${startPos.x - LINE_WIDTH / 2 + 1}px;
        top: ${startPos.y}px;
        width: ${LINE_WIDTH}px;
        height: ${endPos.y - startPos.y}px;
        pointer-events: none;
        z-index: 1;
        clip-path: inset(${topClip}px 0 ${LINE_GAP}px 0);
      `

      // Static background track
      if (startEl.hasAttribute('line-background')) {
        const bg = document.createElement('div')
        bg.style.cssText = `
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          background: ${LINE_BG_COLOR};
        `
        lineContainer.appendChild(bg)
      }

      const line = document.createElement('div')
      line.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        background: ${LINE_COLOR};
        transform-origin: top center;
        transform: scaleY(0);
        box-shadow: 0 0 6px 1px ${LINE_COLOR};
      `

      lineContainer.appendChild(line)
      document.body.appendChild(lineContainer)

      let isActive = false
      const blur = bullet?.querySelector('.featured-card_nav_icon-blur')

      const tween = gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: startEl,
          endTrigger: endEl,
          start: isGridStart ? 'bottom center' : 'center center',
          end: 'center center',
          scrub: true,
          onUpdate(self) {
            if (!bullet) return
            if (self.progress >= PROGRESS_THRESHOLD && !isActive) {
              isActive = true
              gsap.to(bullet, {
                filter: 'grayscale(0) brightness(1)',
                duration: 0.3,
                ease: 'power2.out',
              })
              if (blur) gsap.to(blur, { opacity: 1, duration: 0.3 })
            } else if (self.progress < PROGRESS_THRESHOLD && isActive) {
              isActive = false
              gsap.to(bullet, {
                filter: 'grayscale(1) brightness(0.6)',
                duration: 0.3,
                ease: 'power2.out',
              })
              if (blur) gsap.to(blur, { opacity: 0, duration: 0.3 })
            }
          },
        },
      })

      // The first card has an entrance animation (opacity 0→1, y 20→0).
      // If the user scrolls fast, the line can start drawing before the card
      // has appeared. Defer the grid-start line until its card has settled.
      if (isGridStart && tween.scrollTrigger) {
        tween.scrollTrigger.disable(false)
        gsap.set(line, { scaleY: 0 })
        const checkReady = () => {
          const opacity = gsap.getProperty(startEl, 'opacity')
          const yTransform = gsap.getProperty(startEl, 'y')
          if (opacity >= 1 && yTransform === 0) {
            tween.scrollTrigger.enable()
            ScrollTrigger.refresh()
            return
          }
          requestAnimationFrame(checkReady)
        }
        requestAnimationFrame(checkReady)
      }

      allLines.push({
        container: lineContainer,
        line,
        startEl,
        endEl,
        startAnchor,
      })
    })

    // Parallax background image — starts above its natural position and
    // drifts down to its natural position as the section scrolls, creating
    // a "far back / slower" depth effect. Ends exactly at its CSS-defined
    // position so it never overflows into the next section.
    // xPercent: -50 preserves the CSS `transform: translate(-50%)` horizontal
    // centering once GSAP takes over the element's transform.
    const bg = container.querySelector('[data-timeline="bg"]')
    if (bg) {
      gsap.fromTo(
        bg,
        { xPercent: -50, yPercent: -100 },
        {
          xPercent: -50,
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0,
          },
        }
      )
    }
  })

  // Wire up scroll-to links inside timeline containers
  document.querySelectorAll('[data-scroll-to]').forEach((link) => {
    const targetId = link.getAttribute('data-scroll-to')
    link.href = `#${targetId}`
    link.addEventListener('click', (e) => {
      const target = document.getElementById(targetId)
      if (!target) return
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth' })
    })
  })

  function repositionLines() {
    allLines.forEach(
      ({ container: lineContainer, startEl, endEl, startAnchor }) => {
        const startPos = getPos(startEl, startAnchor)
        const endPos = getPos(endEl)
        lineContainer.style.left = `${startPos.x - LINE_WIDTH / 2 + 1}px`
        lineContainer.style.top = `${startPos.y}px`
        lineContainer.style.height = `${endPos.y - startPos.y}px`
      }
    )
    ScrollTrigger.refresh()
  }

  return {
    resize() {
      repositionLines()
    },
  }
}
