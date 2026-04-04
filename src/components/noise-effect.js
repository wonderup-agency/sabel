/*
Component: noise-effect
Webflow attribute: data-component="noise-effect"
*/

const OPACITY = 0.03
const GRAIN_SIZE = 100

function createNoiseSVG() {
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${GRAIN_SIZE}' height='${GRAIN_SIZE}'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
}

function applyNoise(element) {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: absolute;
    inset: 0;
    opacity: ${OPACITY};
    pointer-events: none;
    border-radius: inherit;
    z-index: 1;
    background-image: ${createNoiseSVG()};
    background-repeat: repeat;
  `
  overlay.setAttribute('data-noise-overlay', '')

  // For void elements (img, etc.), add overlay as a sibling inside the parent
  const isVoid = element instanceof HTMLImageElement
  const parent = isVoid ? element.parentElement : element

  const position = getComputedStyle(parent).position
  if (position === 'static') {
    parent.style.position = 'relative'
  }

  parent.appendChild(overlay)
  return { overlay, parent }
}

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='noise-effect']
 */
export default function (elements) {
  const entries = []

  elements.forEach((element) => {
    entries.push(applyNoise(element))
  })

  return {
    resize() {},
  }
}
