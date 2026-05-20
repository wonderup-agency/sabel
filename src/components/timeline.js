/*
Component: timeline
Webflow attribute: data-component="timeline"
*/

const LINE_WIDTH = 1
const LINE_COLOR = 'var(--base--red)'
const LINE_BG_COLOR = 'var(--base--grey-2, #4c6280)'
const LINE_GAP = 16 // px gap above/below each dot so lines don't strike through

// Trigger viewport positions, expressed in ScrollTrigger string syntax.
// Both refer to the non-sticky `.featured-card_nav-wrapper` (the wrapper's
// TOP edge in the viewport). Because the icon sits at the top of the wrapper,
// these effectively read as "icon top in viewport".
const ACTIVATE_AT = 'top 50%' // dot turns on + bridge end
const BRIDGE_START_AT = 'top 40%' // bridge begins filling 10vh AFTER activation, so the dot is clearly lit before the line starts drawing toward the next dot
const DEACTIVATE_AT = 'top 55%' // sits 5vh BELOW activation — hysteresis zone so Lenis jitter and small refresh shifts can't flip the dot off

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='timeline']
 */
export default function (elements) {
  const allBridges = []

  function iconCenter(icon) {
    const r = icon.getBoundingClientRect()
    return {
      pageY: r.top + r.height / 2 + window.scrollY,
      pageX: r.left + r.width / 2 + window.scrollX,
    }
  }

  elements.forEach((container) => {
    container.style.position = 'relative'
    container.style.zIndex = '2'

    const icons = [...container.querySelectorAll('.featured-card_nav_icon')]
    if (!icons.length) return

    const cs = getComputedStyle(icons[0])
    const iconInactiveColor =
      cs.getPropertyValue('--base--grey-2').trim() || '#4c6280'
    const iconActiveColor =
      cs.getPropertyValue('--base--red').trim() || '#E10600'

    icons.forEach((icon) => {
      const blur = icon.querySelector('.featured-card_nav_icon-blur')
      if (blur) gsap.set(blur, { opacity: 0 })
      gsap.set(icon, { filter: 'none', backgroundColor: iconInactiveColor })
    })

    // -----------------------------------------------------------------
    // Snap activation — dot turns red the moment its wrapper top reaches
    // 50% of the viewport. Reverses on scroll back.
    // -----------------------------------------------------------------
    icons.forEach((icon, i) => {
      const wrapper = icon.closest('.featured-card_nav-wrapper')
      if (!wrapper) return
      const blur = icon.querySelector('.featured-card_nav_icon-blur')
      const label = `icon[${i}]`
      let isActive = false

      const activate = () => {
        if (isActive) return
        isActive = true
        console.log(
          `%c[snap ${label}] ACTIVATE @ scrollY=${window.scrollY.toFixed(0)}`,
          'color: lime; font-weight: bold',
          icon
        )
        gsap.set(icon, { backgroundColor: iconActiveColor })
        if (blur) gsap.set(blur, { opacity: 1 })
      }

      const deactivate = () => {
        if (!isActive) return
        isActive = false
        console.log(
          `%c[snap ${label}] DEACTIVATE @ scrollY=${window.scrollY.toFixed(0)}`,
          'color: orange; font-weight: bold',
          icon
        )
        gsap.set(icon, { backgroundColor: iconInactiveColor })
        if (blur) gsap.set(blur, { opacity: 0 })
      }

      // Activation trigger — fires only on forward scroll past `top 50%`.
      // Has no onLeaveBack, so refresh-induced state flips on this trigger
      // (which happen when lazy images shift `top 50%` past the current
      // scrollY) never deactivate the dot.
      ScrollTrigger.create({
        trigger: wrapper,
        start: ACTIVATE_AT,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          console.log(
            `%c[snap ${label} ACTIVATE] refresh — fires at scrollY=${self.start.toFixed(0)}`,
            'color: lime',
            icon
          )
        },
        onEnter: activate,
      })

      // Deactivation trigger — sits 5vh BELOW the activation point. The
      // user has to scroll back PAST that lower boundary before the dot
      // turns off, so Lenis micro-jitter and small layout shifts around
      // the activation point can't flip the dot.
      // Direction guard catches the remaining refresh-induced case where
      // a big layout shift moves `top 55%` ahead of current scrollY: in
      // that case `self.direction` stays at 1 (last user direction), so
      // we ignore.
      ScrollTrigger.create({
        trigger: wrapper,
        start: DEACTIVATE_AT,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          console.log(
            `%c[snap ${label} DEACTIVATE] refresh — fires at scrollY=${self.start.toFixed(0)}`,
            'color: orange',
            icon
          )
        },
        onLeaveBack: (self) => {
          if (self.direction !== -1) {
            console.log(
              `%c[snap ${label}] leaveBack ignored (direction=${self.direction}, refresh-induced)`,
              'color: gray',
              icon
            )
            return
          }
          deactivate()
        },
      })
    })

    // -----------------------------------------------------------------
    // Bridges between consecutive icons. The red line starts filling
    // EARLIER than the previous dot's activation — at "wrapper top 80%"
    // of the start icon — so by the time the start dot lights up there's
    // already ~20% of red advancing toward the next dot. The bridge
    // reaches 100% exactly when the next dot activates ("top 50%").
    // -----------------------------------------------------------------
    for (let i = 0; i < icons.length - 1; i++) {
      const startIcon = icons[i]
      const endIcon = icons[i + 1]
      const startWrapper = startIcon.closest('.featured-card_nav-wrapper')
      const endWrapper = endIcon.closest('.featured-card_nav-wrapper')
      if (!startWrapper || !endWrapper) continue
      const pairLabel = `icon[${i}]→icon[${i + 1}]`

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

      gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: startWrapper,
          start: BRIDGE_START_AT,
          endTrigger: endWrapper,
          end: ACTIVATE_AT,
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            console.log(
              `%c[bridge ${pairLabel}] refresh — start=${self.start.toFixed(0)} end=${self.end.toFixed(0)}`,
              'color: cyan',
              { startWrapper, endWrapper }
            )
          },
        },
      })

      allBridges.push({ lineContainer, startIcon, endIcon, pairLabel })
    }

    // -----------------------------------------------------------------
    // First bridge — from the bottom of `.featured-cards_grid` (the row
    // of card-buttons above the dots) down to icon[0]. Starts filling
    // when the grid's BOTTOM edge crosses 50% of the viewport (per user
    // request), reaches 100% exactly when icon[0] activates.
    // Unique behaviour vs the dot-to-dot bridges:
    //   • the grey track itself grows in (scaleY 0 → 1 over the first
    //     20% of the scrub) so it's not pre-painted full-height waiting
    //     to be filled — it appears as the line is "drawn" downward;
    //   • the red line follows the scroll linearly over the full scrub.
    // After the grey track is fully drawn (~20% of scrub), the red just
    // fills inside it normally, matching the rest of the bridges.
    // -----------------------------------------------------------------
    const grid = container.querySelector('.featured-cards_grid')
    const firstIconWrapper = icons[0].closest('.featured-card_nav-wrapper')
    if (grid && firstIconWrapper) {
      const lineContainer = document.createElement('div')
      lineContainer.className =
        'global-line global-line--bridge global-line--first'
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
        transform-origin: top center;
        transform: scaleY(0);
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

      // Other timeline elements (the 4 other dots + their inter-dot bridge
      // containers) start hidden; they fade in alongside the grey track
      // entrance below.
      const fadeTargets = [
        ...icons,
        ...allBridges.filter((b) => !b.isFirst).map((b) => b.lineContainer),
      ]
      gsap.set(fadeTargets, { opacity: 0 })

      // Entrance — fires ONCE (not scrub) when `.featured-cards_grid`'s
      // bottom enters the viewport, i.e. once the user has scrolled enough
      // that the cards above are visibly settled. The grey first-bridge
      // track grows in as a single 0.5s motion, and the rest of the
      // timeline fades in at the same time. Reverses if the user scrolls
      // back above the trigger.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: grid,
            start: 'bottom 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              console.log(
                `%c[first bridge entrance] refresh — fires at scrollY=${self.start.toFixed(0)}`,
                'color: cyan',
                { grid }
              )
            },
          },
        })
        .to(bg, { scaleY: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .to(fadeTargets, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)

      // Red line — scrubs with scroll across the same range as before, so
      // it tracks the user's scroll position linearly and reaches 100%
      // exactly when icon[0] activates.
      gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: grid,
          start: 'bottom 50%',
          endTrigger: firstIconWrapper,
          end: 'top 50%',
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            console.log(
              `%c[first bridge red scrub] refresh — start=${self.start.toFixed(0)} end=${self.end.toFixed(0)}`,
              'color: cyan',
              { grid, firstIconWrapper }
            )
          },
        },
      })

      allBridges.push({
        lineContainer,
        startEl: grid,
        endIcon: icons[0],
        isFirst: true,
        pairLabel: 'grid→icon[0]',
      })
    }

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
  // Per-tick repositioning — keeps each bridge container stuck to its two
  // dots through every sticky / flow / pinned transition.
  // ---------------------------------------------------------------------------
  function positionBridge(bridge) {
    const { lineContainer, startIcon, endIcon, startEl, isFirst } = bridge
    const endC = iconCenter(endIcon)

    let topPageY
    if (isFirst) {
      // First bridge: anchored to the bottom of the grid element above.
      const r = startEl.getBoundingClientRect()
      topPageY = r.bottom + window.scrollY
    } else {
      topPageY = iconCenter(startIcon).pageY + LINE_GAP
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

  function repositionAll() {
    allBridges.forEach(positionBridge)
  }

  if (window.gsap) gsap.ticker.add(repositionAll)

  return {
    resize() {
      repositionAll()
      if (window.ScrollTrigger) ScrollTrigger.refresh()
    },
  }
}
