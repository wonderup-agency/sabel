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

  function getCenter(el) {
    const rect = el.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + rect.height / 2 + window.scrollY,
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

    // Find line pairs where line-end is inside this container
    const allStarts = document.querySelectorAll('[line-start]')
    const allEnds = document.querySelectorAll('[line-end]')

    const endMap = {}
    allEnds.forEach((el) => {
      endMap[el.getAttribute('line-end')] = el
    })

    // Collect pairs where line-end is inside the timeline container
    const pairs = []
    allStarts.forEach((startEl) => {
      const id = startEl.getAttribute('line-start')
      const endEl = endMap[id]
      if (!endEl) return
      if (!container.contains(endEl)) return
      pairs.push({ id, startEl, endEl })
    })

    // Sort by line number so bullet mapping is consistent
    pairs.sort((a, b) => Number(a.id) - Number(b.id))

    pairs.forEach((pair, i) => {
      const { startEl, endEl } = pair
      const bullet = bullets[i]

      const startPos = getCenter(startEl)
      const endPos = getCenter(endEl)

      const lineContainer = document.createElement('div')
      lineContainer.className = 'global-line'
      lineContainer.style.cssText = `
        position: absolute;
        left: ${startPos.x - LINE_WIDTH / 2}px;
        top: ${startPos.y}px;
        width: ${LINE_WIDTH}px;
        height: ${endPos.y - startPos.y}px;
        pointer-events: none;
        z-index: 1;
        clip-path: inset(${LINE_GAP}px 0);
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

      gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: startEl,
          endTrigger: endEl,
          start: 'center center',
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

      allLines.push({ container: lineContainer, line, startEl, endEl })
    })
  })

  function repositionLines() {
    allLines.forEach(({ container: lineContainer, startEl, endEl }) => {
      const startPos = getCenter(startEl)
      const endPos = getCenter(endEl)
      lineContainer.style.left = `${startPos.x - LINE_WIDTH / 2}px`
      lineContainer.style.top = `${startPos.y}px`
      lineContainer.style.height = `${endPos.y - startPos.y}px`
    })
    ScrollTrigger.refresh()
  }

  return {
    resize() {
      repositionLines()
    },
  }
}
