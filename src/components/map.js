/*
Component: map
Webflow attribute: data-component="map"
*/

import countries from 'world-map-country-shapes'

// Glow point locations [x, y] on 2000x1001 viewBox
const points = [
  // North America
  [380, 295],  // San Francisco
  [420, 280],  // Denver
  [470, 275],  // Chicago
  [510, 280],  // New York
  [440, 320],  // Dallas
  [370, 310],  // LA
  // Europe
  [960, 230],  // London
  [985, 245],  // Paris
  [1010, 225], // Berlin
  [1005, 260], // Rome
  [990, 220],  // Amsterdam
  [1005, 245], // Zurich
  [1020, 195], // Stockholm
  [1030, 240], // Vienna
  // Middle East
  [1110, 330], // Dubai
  [1085, 310], // Saudi
  // Asia
  [1440, 270], // Beijing
  [1470, 290], // Shanghai
  [1530, 275], // Tokyo
  [1460, 320], // Hong Kong
  [1400, 370], // Bangkok
  [1420, 400], // Singapore
  [1270, 360], // Mumbai
  // Oceania
  [1440, 420], // Jakarta
  [1680, 600], // Sydney
  [1650, 620], // Melbourne
  // South America
  [580, 570],  // Sao Paulo
  [550, 640],  // Buenos Aires
  // Africa
  [1010, 410], // Lagos
  [1080, 470], // Nairobi
]

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='map']
 */
export default function (elements) {
  const svgNS = 'http://www.w3.org/2000/svg'

  elements.forEach((el) => {
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('viewBox', '0 0 2000 1001')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice')
    svg.style.cssText = 'width:100%;height:100%;display:block;'

    // Glow filter
    const defs = document.createElementNS(svgNS, 'defs')
    defs.innerHTML = `
      <filter id="point-glow" x="-300%" y="-300%" width="700%" height="700%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`
    svg.appendChild(defs)

    // Country paths
    countries.forEach(({ shape }) => {
      const path = document.createElementNS(svgNS, 'path')
      path.setAttribute('d', shape)
      path.setAttribute('fill', '#2a0a0a')
      svg.appendChild(path)
    })

    // Glow points
    const pointsGroup = document.createElementNS(svgNS, 'g')
    pointsGroup.setAttribute('filter', 'url(#point-glow)')

    points.forEach(([cx, cy]) => {
      const circle = document.createElementNS(svgNS, 'circle')
      circle.setAttribute('cx', cx)
      circle.setAttribute('cy', cy)
      circle.setAttribute('r', '5')
      circle.setAttribute('fill', '#E10600')
      circle.classList.add('map-point')
      circle.style.opacity = '0'
      pointsGroup.appendChild(circle)
    })
    svg.appendChild(pointsGroup)
    el.appendChild(svg)

    // GSAP scroll animations
    const allDots = svg.querySelectorAll('.map-point')

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.to(allDots, {
        opacity: 1,
        duration: 0.6,
        stagger: { each: 0.06, from: 'random' },
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(allDots, {
        attr: { r: 7 },
        opacity: 0.6,
        duration: 1.8,
        stagger: { each: 0.12, from: 'random', repeat: -1, yoyo: true },
        ease: 'sine.inOut',
        delay: 1.5,
      })
    } else {
      allDots.forEach((p) => { p.style.opacity = '1' })
    }
  })

  return {
    resize() {},
  }
}
