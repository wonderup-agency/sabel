/*
Component: scroll-tabs
Webflow attribute: data-component="scroll-tabs"
*/

import { getLenis } from './global.js'
import './scroll-tabs.css'

const CROSSFADE = 0.3
const MOBILE_BREAKPOINT = 991
const AUTOPLAY_DELAY = 5000 // ms between auto-advances
const RESUME_DELAY = 5000 // ms of inactivity before autoplay resumes after a touch

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

    // Mobile slider state
    let panelsParent = null
    let dotsWrapper = null
    let sliderDots = []
    let currentIndex = 0
    let autoplayTimer = null
    let resumeTimer = null
    let scrollEndTimer = null
    let observer = null
    let abortController = null
    let inView = false

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
        const img = panel.querySelector('.scroll-tabs_panels_image')
        gsap.killTweensOf(panel)
        if (img) gsap.killTweensOf(img)

        if (i === index) {
          gsap.set(panel, { visibility: 'visible', pointerEvents: 'auto' })
          gsap.to(panel, { opacity: 1, duration: CROSSFADE })
          if (img) {
            gsap.fromTo(
              img,
              { scale: 0.98, y: 4 },
              { scale: 1, y: 0, duration: 0.6, ease: 'sine.inOut' }
            )
          }
        } else if (gsap.getProperty(panel, 'opacity') > 0) {
          if (img) gsap.set(img, { scale: 0.98, y: 4 })
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

    function setupDesktop() {
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

    function teardownDesktop() {
      if (st) {
        st.kill()
        st = null
      }

      // Clear all GSAP inline styles so CSS handles mobile layout
      el.style.height = ''
      frame.style.position = ''
      frame.style.top = ''

      panels.forEach((panel) => {
        const img = panel.querySelector('.scroll-tabs_panels_image')
        if (img) {
          gsap.killTweensOf(img)
          img.style.transform = ''
        }
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

    // --- Mobile slider ---

    // Scroll distance (px) to bring slide i to the start edge. Computed from
    // offsets rather than clientWidth so gaps/padding don't drift the snap.
    function slideLeft(i) {
      return panels[i].offsetLeft - panels[0].offsetLeft
    }

    function nearestIndex() {
      const x = panelsParent.scrollLeft
      let best = 0
      let bestDist = Infinity
      panels.forEach((_, i) => {
        const d = Math.abs(slideLeft(i) - x)
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      })
      return best
    }

    function goToSlide(i) {
      panelsParent.scrollTo({ left: slideLeft(i), behavior: 'smooth' })
    }

    // Pagination dots — reuse Webflow's .hero_tag-icon (+ blur glow child).
    // Active = red, inactive = grey-2 with the glow hidden (matches timelines).
    function buildDots() {
      dotsWrapper = document.createElement('div')
      dotsWrapper.className = 'scroll-tabs_slider-dots'
      sliderDots = []

      for (let i = 0; i < numTabs; i++) {
        const dot = document.createElement('div')
        dot.className = 'hero_tag-icon'
        const blur = document.createElement('div')
        blur.className = 'hero_tag-icon-blur'
        dot.appendChild(blur)
        dot.addEventListener('click', () => {
          onUserInteract()
          currentIndex = i
          goToSlide(i)
          updateDots()
        })
        dotsWrapper.appendChild(dot)
        sliderDots.push(dot)
      }

      panelsParent.insertAdjacentElement('afterend', dotsWrapper)
      updateDots()
    }

    function updateDots() {
      sliderDots.forEach((dot, i) => {
        const active = i === currentIndex
        dot.style.backgroundColor = active ? dotActiveColor : dotInactiveColor
        const blur = dot.firstElementChild
        if (blur) blur.style.opacity = active ? '1' : '0'
      })
    }

    function startAutoplay() {
      stopAutoplay()
      if (!inView || numTabs < 2) return
      autoplayTimer = setInterval(() => {
        currentIndex = (currentIndex + 1) % numTabs
        goToSlide(currentIndex)
        updateDots()
      }, AUTOPLAY_DELAY)
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = null
      }
    }

    function scheduleResume() {
      clearTimeout(resumeTimer)
      resumeTimer = setTimeout(() => {
        if (inView) startAutoplay()
      }, RESUME_DELAY)
    }

    // Genuine user input → pause immediately (programmatic scrolls don't fire these)
    function onUserInteract() {
      stopAutoplay()
      clearTimeout(resumeTimer)
    }

    // Fires for both user and programmatic scrolls; only used to sync the
    // current index once movement settles, then resume if autoplay was paused.
    function onScroll() {
      clearTimeout(scrollEndTimer)
      scrollEndTimer = setTimeout(() => {
        currentIndex = nearestIndex()
        updateDots()
        if (!autoplayTimer) scheduleResume()
      }, 120)
    }

    function setupMobile() {
      panelsParent = panels[0].parentElement
      panelsParent.classList.add('scroll-tabs_panels-slider')
      panels.forEach((panel) => panel.classList.add('scroll-tabs_panels-slide'))

      currentIndex = 0
      panelsParent.scrollLeft = 0

      buildDots()

      abortController = new AbortController()
      const opts = { signal: abortController.signal, passive: true }
      panelsParent.addEventListener('pointerdown', onUserInteract, opts)
      panelsParent.addEventListener('touchstart', onUserInteract, opts)
      panelsParent.addEventListener('wheel', onUserInteract, opts)
      panelsParent.addEventListener('scroll', onScroll, opts)

      observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting
          if (inView) startAutoplay()
          else stopAutoplay()
        },
        { threshold: 0.1 }
      )
      observer.observe(el)
    }

    function teardownMobile() {
      stopAutoplay()
      clearTimeout(resumeTimer)
      clearTimeout(scrollEndTimer)
      if (observer) {
        observer.disconnect()
        observer = null
      }
      if (abortController) {
        abortController.abort()
        abortController = null
      }
      if (dotsWrapper) {
        dotsWrapper.remove()
        dotsWrapper = null
      }
      sliderDots = []
      if (panelsParent) {
        panelsParent.classList.remove('scroll-tabs_panels-slider')
        panelsParent.scrollLeft = 0
      }
      panels.forEach((panel) =>
        panel.classList.remove('scroll-tabs_panels-slide')
      )
      inView = false
      currentIndex = 0
    }

    // --- Click to scroll (desktop only — buttons are hidden on mobile) ---

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        if (!st) return
        const targetScroll =
          st.start + ((i + 0.05) / numTabs) * (st.end - st.start)
        const lenis = getLenis()
        if (lenis) {
          lenis.scrollTo(targetScroll, { immediate: true })
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' })
        }
      })
    })

    // --- Init based on current breakpoint ---

    let mode = isMobile() ? 'mobile' : 'desktop'
    if (mode === 'mobile') setupMobile()
    else setupDesktop()

    instances.push({
      checkBreakpoint() {
        const nowMobile = isMobile()
        if (nowMobile && mode === 'desktop') {
          teardownDesktop()
          setupMobile()
          mode = 'mobile'
        } else if (!nowMobile && mode === 'mobile') {
          teardownMobile()
          setupDesktop()
          mode = 'desktop'
        } else if (!nowMobile) {
          frame.style.top = `${computeStickyTop()}px`
        }
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
