/*
Component: scroll-tabs
Webflow attribute: data-component="scroll-tabs"
*/

const CROSSFADE = 0.3
const MOBILE_BREAKPOINT = 991

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='scroll-tabs']
 */
export default function (elements) {
  const instances = []

  elements.forEach((el) => {
    const frame = el.querySelector('[data-scroll-tabs="frame"]')
    const buttonsWrapper = el.querySelector('.scroll-tabs_buttons_wrapper')
    const buttons = [...el.querySelectorAll('[data-scroll-tabs="button"]')]
    const dots = [...el.querySelectorAll('[data-scroll-tabs="dot"]')]
    // Scope dot-blurs to buttons area only — panels have their own for mobile
    const dotBlurs = buttonsWrapper
      ? [...buttonsWrapper.querySelectorAll('[data-scroll-tabs="dot-blur"]')]
      : []
    const lineFills = [...el.querySelectorAll('[data-scroll-tabs="line-fill"]')]
    const panels = [...el.querySelectorAll('[data-scroll-tabs="panel"]')]

    const numTabs = buttons.length
    if (!frame || !numTabs || panels.length !== numTabs) return

    const cs = getComputedStyle(el)
    const dotInactiveColor =
      cs.getPropertyValue('--base--grey-2').trim() || '#4c6280'
    const dotActiveColor =
      cs.getPropertyValue('--base--red').trim() || '#E10600'

    let st = null
    let activeTab = 0
    let inactiveColor = ''
    const activated = new Array(numTabs).fill(false)

    function isMobile() {
      return window.innerWidth <= MOBILE_BREAKPOINT
    }

    // --- Tab state helpers (desktop only) ---

    function activateTab(index) {
      if (activated[index]) return
      activated[index] = true
      gsap.to(buttons[index], { color: '#ffffff', duration: CROSSFADE })
      gsap.to(dots[index], {
        backgroundColor: dotActiveColor,
        duration: CROSSFADE,
        ease: 'power2.out',
      })
      if (dotBlurs[index])
        gsap.to(dotBlurs[index], { opacity: 1, duration: CROSSFADE })
    }

    function deactivateTab(index) {
      if (!activated[index]) return
      activated[index] = false
      gsap.to(buttons[index], { color: inactiveColor, duration: CROSSFADE })
      gsap.to(dots[index], {
        backgroundColor: dotInactiveColor,
        duration: CROSSFADE,
        ease: 'power2.out',
      })
      if (dotBlurs[index])
        gsap.to(dotBlurs[index], { opacity: 0, duration: CROSSFADE })
      gsap.set(lineFills[index], { scaleX: 0 })
    }

    function showPanel(index) {
      panels.forEach((panel, i) => {
        gsap.killTweensOf(panel)
        if (i === index) {
          gsap.set(panel, { visibility: 'visible', pointerEvents: 'auto' })
          gsap.to(panel, { opacity: 1, duration: CROSSFADE })
        } else if (gsap.getProperty(panel, 'opacity') > 0) {
          gsap.to(panel, {
            opacity: 0,
            duration: CROSSFADE,
            onComplete() {
              gsap.set(panel, { visibility: 'hidden', pointerEvents: 'none' })
            },
          })
        }
      })
    }

    // --- Setup (desktop) ---

    function computeStickyTop() {
      const navbar = document.querySelector('.navbar_component')
      const navHeight = navbar ? navbar.offsetHeight : 0
      const frameHeight = frame.offsetHeight
      return Math.max(navHeight, (window.innerHeight - frameHeight) / 2)
    }

    function setup() {
      el.style.height = `${(numTabs + 1) * 66}vh`
      frame.style.position = 'sticky'
      frame.style.top = `${computeStickyTop()}px`

      inactiveColor = getComputedStyle(buttons[0]).color

      // Initial states
      panels.forEach((panel, i) => {
        gsap.set(panel, {
          opacity: i === 0 ? 1 : 0,
          visibility: i === 0 ? 'visible' : 'hidden',
          pointerEvents: i === 0 ? 'auto' : 'none',
        })
      })
      dots.forEach((dot, i) => {
        gsap.set(dot, {
          filter: 'none',
          backgroundColor: i === 0 ? dotActiveColor : dotInactiveColor,
        })
      })
      dotBlurs.forEach((blur, i) => {
        gsap.set(blur, { opacity: i === 0 ? 1 : 0 })
      })
      lineFills.forEach((fill) => gsap.set(fill, { scaleX: 0 }))
      gsap.set(buttons[0], { color: '#ffffff' })

      activeTab = 0
      activated.fill(false)
      activated[0] = true

      st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate(self) {
          const progress = self.progress
          const tabIndex = Math.min(Math.floor(progress * numTabs), numTabs - 1)
          const localProgress = progress * numTabs - tabIndex

          gsap.set(lineFills[tabIndex], { scaleX: localProgress })

          if (tabIndex !== activeTab) {
            if (tabIndex > activeTab) {
              for (let i = activeTab; i < tabIndex; i++) {
                gsap.set(lineFills[i], { scaleX: 1 })
                activateTab(i)
              }
              activateTab(tabIndex)
            } else {
              for (let i = activeTab; i > tabIndex; i--) {
                deactivateTab(i)
              }
            }
            showPanel(tabIndex)
            activeTab = tabIndex
          }
        },
      })
    }

    // --- Teardown (switching to mobile) ---

    function teardown() {
      if (st) {
        st.kill()
        st = null
      }

      // Clear all GSAP inline styles so CSS handles mobile layout
      el.style.height = ''
      frame.style.position = ''
      frame.style.top = ''

      panels.forEach((panel) => {
        gsap.killTweensOf(panel)
        panel.style.opacity = ''
        panel.style.visibility = ''
        panel.style.pointerEvents = ''
      })
      dots.forEach((dot) => {
        gsap.killTweensOf(dot)
        dot.style.filter = ''
        dot.style.backgroundColor = ''
      })
      dotBlurs.forEach((blur) => {
        gsap.killTweensOf(blur)
        blur.style.opacity = ''
      })
      buttons.forEach((btn) => {
        gsap.killTweensOf(btn)
        btn.style.color = ''
      })
      lineFills.forEach((fill) => {
        fill.style.transform = ''
      })

      activeTab = 0
      activated.fill(false)
    }

    // --- Click to scroll (safe at any breakpoint) ---

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        if (!st) return
        const targetScroll = st.start + (i / numTabs) * (st.end - st.start)
        window.scrollTo({ top: targetScroll, behavior: 'smooth' })
      })
    })

    // --- Init based on current breakpoint ---

    let isDesktop = !isMobile()
    if (isDesktop) setup()

    instances.push({
      checkBreakpoint() {
        const nowDesktop = !isMobile()
        if (nowDesktop && !isDesktop) setup()
        else if (!nowDesktop && isDesktop) teardown()
        else if (nowDesktop) frame.style.top = `${computeStickyTop()}px`
        isDesktop = nowDesktop
      },
    })
  })

  return {
    resize() {
      instances.forEach((inst) => inst.checkBreakpoint())
      if (window.innerWidth > MOBILE_BREAKPOINT) ScrollTrigger.refresh()
    },
  }
}
