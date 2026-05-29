/*
Component: home
Webflow attribute: data-component="home"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='home']
 */
export default function () {
  console.log('[home] 🟢 component running', {
    gsap: typeof gsap,
    ScrollTrigger: typeof ScrollTrigger,
    viewportWidth: window.innerWidth,
    isMobile: window.matchMedia('(max-width: 991px)').matches,
  })

  // ---------------------------------------------------------------------------
  // Global Lines — vertical lines between line-start / line-end pairs
  // (Skips pairs whose end is inside [data-component="timeline"])
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

  // Page-relative Y of an element's TOP edge. Used for the end anchor when a
  // line points at a tall container (e.g. the mobile override to
  // .featured-cards_grid) so the line stops at the top of the cards rather
  // than running down to the container's vertical center.
  function getTopY(el) {
    return el.getBoundingClientRect().top + window.scrollY
  }

  function initGlobalLines() {
    // The line-end-mobile override only applies on Webflow's Mobile Portrait
    // breakpoint (≤479px). On Tablet (≤991) and Mobile Landscape (≤767) the
    // line keeps the desktop endpoint (its normal line-end pair).
    const isMobilePortrait = window.matchMedia('(max-width: 479px)').matches
    // On mobile (≤991px) the line starts drawing earlier — when its start
    // point reaches 70% of the viewport (lower on screen) instead of center.
    const isMobile = window.matchMedia('(max-width: 991px)').matches
    const starts = document.querySelectorAll('[line-start]')
    const ends = document.querySelectorAll('[line-end]')
    console.log('[home] initGlobalLines', {
      isMobilePortrait,
      startsFound: starts.length,
      endsFound: ends.length,
    })
    const endMap = {}
    ends.forEach((el) => {
      endMap[el.getAttribute('line-end')] = el
    })

    const timelineContainer = document.querySelector(
      '[data-component="timeline"]'
    )

    starts.forEach((startEl) => {
      const id = startEl.getAttribute('line-start')
      let endEl = endMap[id]
      let usedMobileOverride = false

      const mobileEndSel = startEl.getAttribute('line-end-mobile')
      if (isMobilePortrait && mobileEndSel) {
        try {
          const mobileEnd = document.querySelector(mobileEndSel)
          if (mobileEnd) {
            endEl = mobileEnd
            usedMobileOverride = true
          }
          console.log(
            `[home] line "${id}" mobile override: "${mobileEndSel}" →`,
            mobileEnd
          )
        } catch (e) {
          console.warn(
            `[home] Invalid line-end-mobile selector: "${mobileEndSel}"`,
            e
          )
        }
      }

      if (!endEl) {
        console.warn(`[home] line "${id}" skipped — no endEl found`)
        return
      }
      // Skip lines whose end is owned by the timeline component — but NOT when
      // an explicit line-end-mobile override deliberately points into it (e.g.
      // a hero→featured-grid line on mobile). The override is author intent.
      if (
        !usedMobileOverride &&
        timelineContainer &&
        timelineContainer.contains(endEl)
      ) {
        console.log(`[home] line "${id}" skipped — endEl inside timeline`)
        return
      }
      console.log(`[home] ✏️ drawing line "${id}"`, { startEl, endEl })

      // Override-driven lines end at the destination's TOP edge; normal pairs
      // (small marker divs) end at center, which equals their top anyway.
      const endAtTop = usedMobileOverride
      const startPos = getCenter(startEl)
      const endY = endAtTop ? getTopY(endEl) : getCenter(endEl).y

      const container = document.createElement('div')
      container.className = 'global-line'
      container.style.cssText = `
        position: absolute;
        left: ${startPos.x - lineWidth / 2}px;
        top: ${startPos.y}px;
        width: ${lineWidth}px;
        height: ${endY - startPos.y}px;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
      `

      if (startEl.hasAttribute('line-background')) {
        const bg = document.createElement('div')
        bg.style.cssText = `
          position: absolute;
          top: 0; left: 0;
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
      `
      container.appendChild(line)
      document.body.appendChild(container)

      const triggerSel = startEl.getAttribute('line-trigger')
      const triggerEl = triggerSel
        ? document.querySelector(triggerSel)
        : startEl

      gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: triggerEl,
          endTrigger: endEl,
          start: isMobile ? 'center 70%' : 'center center',
          // Match the physical end anchor: complete the draw when the
          // destination's top (not center) reaches viewport center.
          end: endAtTop ? 'top center' : 'center center',
          scrub: true,
        },
      })

      globalLines.push({ container, line, startEl, endEl, endAtTop })
    })
  }

  function repositionLines() {
    globalLines.forEach(({ container, startEl, endEl, endAtTop }) => {
      const startPos = getCenter(startEl)
      const endY = endAtTop ? getTopY(endEl) : getCenter(endEl).y
      container.style.left = `${startPos.x - lineWidth / 2}px`
      container.style.top = `${startPos.y}px`
      container.style.height = `${endY - startPos.y}px`
    })
    ScrollTrigger.refresh()
  }

  initGlobalLines()

  // ---------------------------------------------------------------------------
  // Nav — hidden on load, deblur reveal on second section
  // ---------------------------------------------------------------------------
  const nav = document.querySelector('.navbar_component')
  console.log('[home] nav block', { navFound: !!nav })
  if (nav) {
    const isDesktop = window.matchMedia('(min-width: 992px)').matches
    console.log('[home] nav mode:', isDesktop ? 'desktop' : 'mobile')

    if (!isDesktop) {
      gsap.set(nav, {
        opacity: 1,
        filter: 'blur(0px)',
        yPercent: 0,
        backgroundColor: 'rgba(11, 11, 12, 0.5)',
      })
      console.log(
        '[home] nav opacity after set:',
        window.getComputedStyle(nav).opacity
      )
    } else {
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

  console.log('[home] hero items', {
    heroTitle: !!heroTitle,
    heroBy: !!heroBy,
    heroLogo1: !!heroLogo1,
    heroLogo2: !!heroLogo2,
    heroInfinite: !!heroInfinite,
    total: heroItems.length,
  })

  if (heroItems.length) {
    gsap.set(heroItems, { opacity: 0, y: 20, filter: 'blur(12px)' })
    console.log('[home] hero gsap.set done')

    gsap.to(heroItems, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power2.out',
      stagger: 0.25,
      delay: 0.3,
      onStart: () => console.log('[home] hero gsap.to onStart'),
      onComplete: () => console.log('[home] ✅ hero gsap.to onComplete'),
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
    // Mobile: skip the scroll-driven fade-in/reverse. Cards stay in their
    // natural Webflow state (visible) and the SVG paths still draw with scroll.
    const isMobileBranchCards = window.matchMedia('(max-width: 991px)').matches
    if (!isMobileBranchCards) gsap.set(cards, { autoAlpha: 0, y: 20 })

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

    const sloganTrigger = document.querySelector(
      '[home-animation="section-slogan"]'
    )

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sloganTrigger || branchSection,
        start: sloganTrigger ? 'center center' : 'top 50%',
        endTrigger: branchSection,
        end: 'bottom 30%',
        scrub: true,
        onUpdate(self) {
          if (isMobileBranchCards) return
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
        toggleActions: 'play none none reverse',
      },
    })
  }

  return {
    resize() {
      repositionLines()
    },
  }
}
