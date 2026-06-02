/*
Component: blueprint-lines
Webflow attribute: data-component="blueprint-lines"

Scroll-driven animation for the Blueprint deliverables section:
trunk-top → 2 branches in parallel → trunk-bottom, with cards revealing
3-per-branch in sync. On mobile (≤991px) the SVG is hidden via CSS
and all 6 cards are revealed together with stagger.
*/

import './blueprint-lines.css'
import { readCaps, fadeSvgPathStart } from './line-caps.js'

const DESKTOP_MQ = '(min-width: 992px)'
const REDUCED_MOTION_MQ = '(prefers-reduced-motion: reduce)'

const isDesktop = window.matchMedia(DESKTOP_MQ).matches
const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_MQ).matches

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='blueprint-lines']
 */
export default function (elements) {
  elements.forEach((section) => {
    const svg = section.querySelector('[data-animate="lines-section"]')
    const cards = [...section.querySelectorAll('.featured-card_button')]
    if (!cards.length) return

    if (prefersReducedMotion) {
      gsap.set(cards, { autoAlpha: 1, y: 0 })
      return
    }

    if (!isDesktop) {
      initMobile(section, cards)
      return
    }

    if (!svg) return
    // Opt-in start cap (line-cap-start="True" on the section or the SVG): fade
    // the top of the trunk. Branches stay solid.
    const capStart = readCaps(section).start || readCaps(svg).start
    initDesktop(svg, cards, capStart)
  })

  return {
    resize() {
      ScrollTrigger.refresh()
    },
  }
}

function initMobile(section, cards) {
  const grid = section.querySelector('.service-cards_grid')
  if (!grid) return

  gsap.set(cards, { autoAlpha: 0, y: 20 })

  ScrollTrigger.create({
    trigger: grid,
    start: 'top 80%',
    toggleActions: 'play none none reverse',
    onEnter: () =>
      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1,
      }),
    onLeaveBack: () =>
      gsap.to(cards, {
        autoAlpha: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in',
      }),
  })
}

function initDesktop(svg, cards, capStart) {
  const allPaths = [...svg.querySelectorAll('[data-line="branch"]')]
  if (allPaths.length < 2) return

  allPaths.forEach((path) => {
    const length = path.getTotalLength()
    path.style.strokeDasharray = length
    path.style.strokeDashoffset = length
  })

  // Read start point + end X of each path to classify them.
  const getStartY = (p) => {
    const m = p.getAttribute('d').match(/^M\s*[-\d.]+[\s,]+([-\d.]+)/)
    return m ? parseFloat(m[1]) : Infinity
  }
  const getStartX = (p) => {
    const m = p.getAttribute('d').match(/^M\s*([-\d.]+)/)
    return m ? parseFloat(m[1]) : 0
  }
  const getEndX = (p) => p.getPointAtLength(p.getTotalLength()).x
  // A path with no horizontal travel is a vertical trunk segment, not a branch.
  const isVertical = (p) => Math.abs(getEndX(p) - getStartX(p)) < 5

  // Lowest starting Y = trunk-top. Of the remaining paths, the vertical one(s)
  // are the trunk-bottom (the centre line continuing straight down) and the rest
  // are the side branches (sorted left-to-right by end X). Drawing trunk-bottom
  // in its own later phase means the centre line only starts growing once the
  // side branches have fanned out and begun dropping.
  const sortedByY = [...allPaths].sort((a, b) => getStartY(a) - getStartY(b))
  const trunkTop = sortedByY[0]
  if (capStart) fadeSvgPathStart(trunkTop)
  const rest = sortedByY.slice(1)
  const branchPaths = rest
    .filter((p) => !isVertical(p))
    .sort((a, b) => getEndX(a) - getEndX(b))
  const trunkBottomPaths = rest.filter((p) => isVertical(p))
  const hasTrunkBottom = trunkBottomPaths.length > 0

  if (!branchPaths.length) return

  // Split cards in half — first half = left branch, second half = right.
  // Odd count: the middle card goes with the left branch.
  const half = Math.ceil(cards.length / 2)
  const cardsPerBranch =
    branchPaths.length === 2
      ? [cards.slice(0, half), cards.slice(half)]
      : branchPaths.map((_, i, arr) => {
          const start = Math.floor((i * cards.length) / arr.length)
          const end = Math.floor(((i + 1) * cards.length) / arr.length)
          return cards.slice(start, end)
        })

  gsap.set(cards, { autoAlpha: 0, y: 20 })

  const trunkTopDur = 0.5
  const branchDur = 0.3
  const trunkBottomDur = 0.2
  // Overlap the centre line into the tail of the branch draw, so it starts
  // growing while the side branches are dropping rather than only after.
  const trunkBottomOverlap = 0.15
  const branchStart = trunkTopDur
  const trunkBottomStart = branchStart + branchDur - trunkBottomOverlap
  const totalDuration = hasTrunkBottom
    ? trunkBottomStart + trunkBottomDur
    : branchStart + branchDur

  const branchCompletion = (branchStart + branchDur) / totalDuration

  const branchShown = branchPaths.map(() => false)

  const tweenCards = (cardGroup, show) => {
    gsap.killTweensOf(cardGroup)
    gsap.to(cardGroup, {
      autoAlpha: show ? 1 : 0,
      y: show ? 0 : 20,
      duration: show ? 0.5 : 0.3,
      ease: show ? 'power2.out' : 'power2.in',
      stagger: show ? 0.1 : 0,
    })
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: svg,
      start: 'top 85%',
      end: 'bottom 65%',
      scrub: true,
      onUpdate(self) {
        branchPaths.forEach((_, i) => {
          if (self.progress >= branchCompletion && !branchShown[i]) {
            branchShown[i] = true
            tweenCards(cardsPerBranch[i], true)
          } else if (self.progress < branchCompletion && branchShown[i]) {
            branchShown[i] = false
            tweenCards(cardsPerBranch[i], false)
          }
        })
      },
    },
  })

  tl.to(
    trunkTop,
    { strokeDashoffset: 0, duration: trunkTopDur, ease: 'none' },
    0
  )

  branchPaths.forEach((path) => {
    tl.to(
      path,
      { strokeDashoffset: 0, duration: branchDur, ease: 'none' },
      branchStart
    )
  })

  trunkBottomPaths.forEach((path) => {
    tl.to(
      path,
      { strokeDashoffset: 0, duration: trunkBottomDur, ease: 'none' },
      trunkBottomStart
    )
  })
}
