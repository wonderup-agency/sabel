/*
Component: intercom-timeline
Webflow attribute: data-component="intercom-timeline"
*/

const LINE_WIDTH = 1
const LINE_COLOR = 'var(--base--red)'
const LINE_BG_COLOR = 'var(--base--grey-2, #4c6280)'
const LINE_GAP = 16
const PROGRESS_THRESHOLD = 0.98

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='intercom-timeline']
 */
export default function (elements) {
  const allBridges = []

  function iconCenter(icon) {
    const r = icon.getBoundingClientRect()
    return {
      pageX: r.left + r.width / 2 + window.scrollX,
      pageY: r.top + r.height / 2 + window.scrollY,
    }
  }

  elements.forEach((el) => {
    el.style.position = 'relative'
    el.style.zIndex = '2'

    // --- Icons ---
    const icons = [...el.querySelectorAll('.featured-card_nav_icon')]
    if (!icons.length) return

    const iconStates = icons.map(() => false)
    icons.forEach((icon) => {
      gsap.set(icon, { filter: 'grayscale(1) brightness(0.6)' })
      const blur = icon.querySelector('.featured-card_nav_icon-blur')
      if (blur) gsap.set(blur, { opacity: 0 })
    })

    function activateIcon(index) {
      if (iconStates[index]) return
      iconStates[index] = true
      const icon = icons[index]
      const blur = icon.querySelector('.featured-card_nav_icon-blur')
      gsap.to(icon, {
        filter: 'grayscale(0) brightness(1)',
        duration: 0.3,
        ease: 'power2.out',
      })
      if (blur) gsap.to(blur, { opacity: 1, duration: 0.3 })
    }

    function deactivateIcon(index) {
      if (!iconStates[index]) return
      iconStates[index] = false
      const icon = icons[index]
      const blur = icon.querySelector('.featured-card_nav_icon-blur')
      gsap.to(icon, {
        filter: 'grayscale(1) brightness(0.6)',
        duration: 0.3,
        ease: 'power2.out',
      })
      if (blur) gsap.to(blur, { opacity: 0, duration: 0.3 })
    }

    // --- SVG stroke draw ---
    // The SVG uses preserveAspectRatio="none" + vector-effect="non-scaling-stroke".
    // This breaks stroke-dashoffset animation because dashes are computed in screen
    // space while getTotalLength() returns user-space length. Fix: animate a mask
    // path (without vector-effect) whose dash math stays in user space, and apply
    // it as a mask on the visible path.
    const svgWrapper = el.querySelector('[data-intercom-timeline="svg-line"]')
    if (svgWrapper) {
      const svg = svgWrapper.querySelector('svg')
      const path = svgWrapper.querySelector('path')
      if (svg && path) {
        const ns = 'http://www.w3.org/2000/svg'
        const maskId = `itl-mask-${Math.random().toString(36).slice(2, 8)}`

        const defs = document.createElementNS(ns, 'defs')
        const mask = document.createElementNS(ns, 'mask')
        mask.setAttribute('id', maskId)

        const maskPath = path.cloneNode()
        maskPath.removeAttribute('vector-effect')
        maskPath.setAttribute('stroke', 'white')
        maskPath.setAttribute('stroke-width', '20')
        maskPath.setAttribute('fill', 'none')

        const length = path.getTotalLength()
        maskPath.style.strokeDasharray = length
        maskPath.style.strokeDashoffset = length

        mask.appendChild(maskPath)
        defs.appendChild(mask)
        svg.insertBefore(defs, svg.firstChild)

        path.setAttribute('mask', `url(#${maskId})`)

        gsap.to(maskPath, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: svgWrapper,
            start: 'top 70%',
            end: 'bottom 50%',
            scrub: 1,
            onUpdate(self) {
              if (self.progress >= PROGRESS_THRESHOLD) activateIcon(0)
              else deactivateIcon(0)
            },
          },
        })
      }
    }

    // --- Bridges between consecutive icons ---
    for (let i = 0; i < icons.length - 1; i++) {
      const startIcon = icons[i]
      const endIcon = icons[i + 1]
      const startCard = startIcon.closest('.featured-cards_card_wrapper')
      const endCard = endIcon.closest('.featured-cards_card_wrapper')

      const lineContainer = document.createElement('div')
      lineContainer.className = 'global-line global-line--bridge'
      lineContainer.style.cssText = `
        position: absolute;
        width: ${LINE_WIDTH}px;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
      `

      const bg = document.createElement('div')
      bg.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 100%;
        background: ${LINE_BG_COLOR};
      `
      lineContainer.appendChild(bg)

      const redLine = document.createElement('div')
      redLine.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        background: ${LINE_COLOR};
        transform-origin: top center;
        transform: scaleY(0);
      `
      lineContainer.appendChild(redLine)
      document.body.appendChild(lineContainer)

      const bulletIndex = i + 1

      gsap.to(redLine, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: startCard,
          start: 'top center',
          endTrigger: endCard,
          end: 'top center',
          scrub: true,
          onUpdate(self) {
            if (self.progress >= PROGRESS_THRESHOLD) activateIcon(bulletIndex)
            else deactivateIcon(bulletIndex)
          },
        },
      })

      allBridges.push({ lineContainer, startIcon, endIcon })
    }
  })

  // --- Per-frame repositioning ---
  function repositionAll() {
    allBridges.forEach(({ lineContainer, startIcon, endIcon }) => {
      const startC = iconCenter(startIcon)
      const endC = iconCenter(endIcon)
      const topY = startC.pageY + LINE_GAP
      const bottomY = endC.pageY - LINE_GAP
      const height = bottomY - topY

      if (height <= 0) {
        lineContainer.style.display = 'none'
        return
      }

      lineContainer.style.display = ''
      lineContainer.style.left = `${startC.pageX - LINE_WIDTH / 2}px`
      lineContainer.style.top = `${topY}px`
      lineContainer.style.height = `${height}px`
    })
  }

  if (allBridges.length) {
    gsap.ticker.add(repositionAll)
    repositionAll()
  }

  return {
    resize() {
      repositionAll()
      ScrollTrigger.refresh()
    },
  }
}
