/*
Component: timeline
Webflow attribute: data-component="timeline"
*/

const LINE_WIDTH = 1
const LINE_COLOR = 'var(--base--red)'
const LINE_BG_COLOR = 'var(--base--grey)'
const LINE_GAP = 16 // px gap above/below each dot so lines don't strike through
const STICKY_TOP_PX = 8 * 16 // matches CSS `top: 8rem` on .featured-card_nav
const PROGRESS_THRESHOLD = 0.98
const MOBILE_BREAKPOINT = 991

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='timeline']
 */
export default function (elements) {
  const allBridges = []
  const allTrails = []

  function rectPageTop(el) {
    return el.getBoundingClientRect().top + window.scrollY
  }

  function rectPageBottom(el) {
    return el.getBoundingClientRect().bottom + window.scrollY
  }

  // Current visual center of an icon (reflects sticky/transform state).
  function iconCenter(icon) {
    const r = icon.getBoundingClientRect()
    return {
      pageY: r.top + r.height / 2 + window.scrollY,
      pageX: r.left + r.width / 2 + window.scrollX,
    }
  }

  // Icon's NATURAL center page Y — where it sits in normal flow before any
  // sticky offset. Derived from the wrapper (which is never sticky) so this
  // is correct regardless of the current scroll position.
  function naturalCenterY(icon) {
    const nav = icon.closest('.featured-card_nav')
    const wrapper = icon.closest('.featured-card_nav-wrapper')
    if (!nav || !wrapper) return iconCenter(icon).pageY
    const wrapperPageTop = rectPageTop(wrapper)
    const iconRelToNav =
      icon.getBoundingClientRect().top - nav.getBoundingClientRect().top
    const iconHalfH = icon.getBoundingClientRect().height / 2
    return wrapperPageTop + iconRelToNav + iconHalfH
  }

  // Scroll position at which icon's sticky nav would reach top:8rem.
  // Uses the wrapper (not the nav rect) so it's correct even when
  // the nav is currently in its sticky or pinned state.
  function scrollAtSticky(icon) {
    const wrapper = icon.closest('.featured-card_nav-wrapper')
    if (!wrapper) return rectPageTop(icon) - STICKY_TOP_PX
    return rectPageTop(wrapper) - STICKY_TOP_PX
  }

  function scrollAtUnstick(icon) {
    const nav = icon.closest('.featured-card_nav')
    const wrapper = icon.closest('.featured-card_nav-wrapper')
    if (!nav || !wrapper) return Infinity
    return rectPageBottom(wrapper) - STICKY_TOP_PX - nav.offsetHeight
  }

  elements.forEach((container) => {
    container.style.position = 'relative'
    container.style.zIndex = '2'

    const icons = [...container.querySelectorAll('.featured-card_nav_icon')]
    if (!icons.length) return

    icons.forEach((icon) => {
      const blur = icon.querySelector('.featured-card_nav_icon-blur')
      if (blur) gsap.set(blur, { opacity: 0 })
      gsap.set(icon, { filter: 'grayscale(1) brightness(0.6)' })
    })

    // -----------------------------------------------------------------
    // TRAILS — one per icon, red only, no scrub. Height is driven by
    // the gap between the icon's natural page position and its current
    // (sticky-shifted) position. Grows while sticky, stays after unstick.
    // -----------------------------------------------------------------
    icons.forEach((icon) => {
      const initNaturalY = naturalCenterY(icon)

      const trailContainer = document.createElement('div')
      trailContainer.className = 'global-line global-line--trail'
      trailContainer.style.cssText = `
        position: absolute;
        width: ${LINE_WIDTH}px;
        pointer-events: none;
        z-index: 1;
        display: none;
      `

      const trailLine = document.createElement('div')
      trailLine.style.cssText = `
        width: 100%;
        height: 100%;
        background: ${LINE_COLOR};
      `
      trailContainer.appendChild(trailLine)
      document.body.appendChild(trailContainer)

      allTrails.push({ trailContainer, icon, natY: initNaturalY })
    })

    // -----------------------------------------------------------------
    // BRIDGES — one per consecutive pair (+ grid-start). Grey track
    // always full, red fills via scrub during the transition phase
    // (startEl unsticks → endEl becomes sticky).
    // -----------------------------------------------------------------
    const grid = container.querySelector('.featured-cards_grid')
    const gridStart = grid?.firstElementChild

    const pairs = []
    if (gridStart) {
      pairs.push({
        startEl: gridStart,
        endEl: icons[0],
        kind: 'gridStart',
        bullet: icons[0],
      })
    }
    for (let i = 0; i < icons.length - 1; i++) {
      pairs.push({
        startEl: icons[i],
        endEl: icons[i + 1],
        kind: 'iconPair',
        bullet: icons[i + 1],
      })
    }

    pairs.forEach((pair) => {
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

      const line = document.createElement('div')
      line.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        background: ${LINE_COLOR};
        transform-origin: top center;
        transform: scaleY(0);
      `
      lineContainer.appendChild(line)
      document.body.appendChild(lineContainer)

      // Bullet activation
      const { bullet } = pair
      const blur = bullet?.querySelector('.featured-card_nav_icon-blur')
      let isActive = false
      const activate = () => {
        if (isActive) return
        isActive = true
        gsap.to(bullet, {
          filter: 'grayscale(0) brightness(1)',
          duration: 0.3,
          ease: 'power2.out',
        })
        if (blur) gsap.to(blur, { opacity: 1, duration: 0.3 })
      }
      const deactivate = () => {
        if (!isActive) return
        isActive = false
        gsap.to(bullet, {
          filter: 'grayscale(1) brightness(0.6)',
          duration: 0.3,
          ease: 'power2.out',
        })
        if (blur) gsap.to(blur, { opacity: 0, duration: 0.3 })
      }

      const scrubStart = () => bridgeScrollStart(pair)
      const scrubEnd = () => bridgeScrollEnd(pair)

      gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          start: scrubStart,
          end: scrubEnd,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate(self) {
            if (!bullet) return
            if (self.progress >= PROGRESS_THRESHOLD) activate()
            else deactivate()
          },
        },
      })

      allBridges.push({ lineContainer, line, pair })
    })

    repositionAll()
  })

  // ---------------------------------------------------------------------------
  // Parallax background image
  // ---------------------------------------------------------------------------
  elements.forEach((container) => {
    const bg = container.querySelector('[data-timeline="bg"]')
    if (!bg) return
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
  })

  // ---------------------------------------------------------------------------
  // Smooth scroll for [data-scroll-to] links
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Scroll ranges for bridge scrubs
  // ---------------------------------------------------------------------------
  function bridgeScrollStart(pair) {
    if (pair.kind === 'gridStart') {
      // Grid-start bridge: red fills from "grid bottom at 8rem" …
      return rectPageBottom(pair.startEl) - STICKY_TOP_PX
    }
    // Icon bridge: red fills from "startEl unsticks" …
    return scrollAtUnstick(pair.startEl)
  }

  function bridgeScrollEnd(pair) {
    // … to "endEl becomes sticky".
    return scrollAtSticky(pair.endEl)
  }

  // ---------------------------------------------------------------------------
  // Per-tick repositioning
  // ---------------------------------------------------------------------------
  function positionBridge({ lineContainer, pair }) {
    const { startEl, endEl, kind } = pair

    if (kind === 'gridStart' && window.innerWidth <= MOBILE_BREAKPOINT) {
      lineContainer.style.display = 'none'
      return
    }

    // Bridge connects between dots with LINE_GAP clearance around each dot.
    const endC = iconCenter(endEl)
    let topPageY
    if (kind === 'gridStart') {
      topPageY = startEl.getBoundingClientRect().bottom + window.scrollY
    } else {
      topPageY = iconCenter(startEl).pageY + LINE_GAP
    }
    const bottomPageY = endC.pageY - LINE_GAP
    const heightPx = bottomPageY - topPageY

    if (heightPx <= 0) {
      lineContainer.style.display = 'none'
      return
    }

    lineContainer.style.display = ''
    lineContainer.style.left = `${endC.pageX - LINE_WIDTH / 2}px`
    lineContainer.style.top = `${topPageY}px`
    lineContainer.style.height = `${heightPx}px`
  }

  function positionTrail(trail) {
    const c = iconCenter(trail.icon)
    const heightPx = c.pageY - trail.natY - LINE_GAP

    if (heightPx <= 1) {
      trail.trailContainer.style.display = 'none'
      return
    }

    trail.trailContainer.style.display = ''
    trail.trailContainer.style.left = `${c.pageX - LINE_WIDTH / 2}px`
    trail.trailContainer.style.top = `${trail.natY}px`
    trail.trailContainer.style.height = `${heightPx}px`
  }

  function repositionAll() {
    allBridges.forEach(positionBridge)
    allTrails.forEach(positionTrail)
  }

  if (window.gsap) gsap.ticker.add(repositionAll)

  return {
    resize() {
      allTrails.forEach((trail) => {
        trail.natY = naturalCenterY(trail.icon)
      })
      repositionAll()
      if (window.ScrollTrigger) ScrollTrigger.refresh()
    },
  }
}
