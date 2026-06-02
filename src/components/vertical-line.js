/*
Component: vertical-line
Webflow attribute: data-component="vertical-line"
*/

import './vertical-line.css'
import { prepareLineFill, setLineReveal, readCaps } from './line-caps.js'

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='vertical-line']
 */
export default function (elements) {
  elements.forEach((el) => {
    // Use the line's own fill child if present; otherwise treat the element
    // itself as the fill.
    const fill = el.querySelector('[data-vertical-line="fill"]') || el

    prepareLineFill(fill, readCaps(el))

    // Drive the clip reveal off a proxy so we don't depend on GSAP
    // interpolating clip-path strings directly.
    const state = { progress: 0 }
    gsap.to(state, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true,
      },
      onUpdate: () => setLineReveal(fill, state.progress),
    })
  })
}
