/*
Component: map
Webflow attribute: data-component="map"
*/

import countries from 'world-map-country-shapes'

// Glow point locations [x, y] on 2000x1001 viewBox (Robinson projection)
const points = [
  // Oceania
  [1782, 786], // Sydney
  [1736, 811], // Melbourne
  [1809, 746], // Brisbane
  [1897, 805], // Auckland
  [1877, 833], // Wellington
  [1855, 847], // Christchurch
  // Asia
  [1651, 479], // Makati
  [1716, 345], // Tokyo
  [1549, 552], // Kuala Lumpur
  [1561, 563], // Singapore
  [1605, 430], // Hong Kong
  [1577, 611], // Jakarta
  [1395, 390], // New Delhi
  [1386, 454], // Pune
  // Middle East
  [1279, 412], // Dubai
  [1165, 370], // Israel
  // Europe
  [1074, 255], // Krakow
  [976, 246], // London
  [946, 235], // Dublin
  [1000, 241], // Amsterdam
  [1058, 200], // Stockholm
  [1035, 221], // Copenhagen
  [988, 262], // Paris
  [1047, 255], // Prague
  [1013, 275], // Bern
  [969, 242], // Warwick
  [983, 249], // Dover
  // Africa
  [1144, 761], // Durban
  // South America
  [700, 760], // Novo Hamburgo
  // North America
  [367, 265], // Victoria BC
  [593, 313], // New York
  [334, 332], // San Francisco
  [526, 306], // Chicago
]

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='map']
 */
export default function (elements) {
  const svgNS = 'http://www.w3.org/2000/svg'

  elements.forEach((el) => {
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('viewBox', '0 0 2000 1001')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
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
      allDots.forEach((p) => {
        p.style.opacity = '1'
      })
    }
  })

  return {
    resize() {},
  }
}
