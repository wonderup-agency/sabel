/*
Component: vertical-line
Webflow attribute: data-component="vertical-line"
*/

import './vertical-line.css'

// How much of each enabled end fades out, as a % of the line's own length.
// Percentage stops keep the fade locked to the line's real ends at any reveal
// amount; plain numbers (no `calc()`, which some gradient parsers drop and
// collapse into one long fade over the whole line).
const LINE_FADE = 24

/*
  Resolve a fill element's colour, falling back to the project red if its
  background can't be read as a solid colour.
*/
function resolveLineColor(fillEl) {
  const bg = getComputedStyle(fillEl).backgroundColor
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg
  return 'var(--base--red, #e10600)'
}

/*
  Build a fill background: a solid colour, or — when an end fades — a vertical
  gradient that's solid in the middle and transparent at the faded end(s).

  The fade lives in the BACKGROUND (not a CSS mask) so there's no WebKit
  mask-repaint flicker, and it's baked at the fill's FULL length so the
  transparent zones stay locked to the line's real ends.

  start: fade the top end.  end: fade the bottom end.
*/
function buildFillBackground(color, { start = false, end = false } = {}) {
  if (!start && !end) return color

  const stops = []
  stops.push(start ? 'transparent 0' : `${color} 0`)
  if (start) stops.push(`${color} ${LINE_FADE}%`)
  if (end) stops.push(`${color} ${100 - LINE_FADE}%`)
  stops.push(end ? 'transparent 100%' : `${color} 100%`)

  return `linear-gradient(180deg, ${stops.join(', ')})`
}

/*
  Prepare a line's fill element for a clip-path reveal with optional end fades.

  Operates on the EXISTING fill element (e.g. [data-vertical-line="fill"] or
  [data-hero="line-fill"]) — it does NOT create a new node, so it never
  duplicates a line that already has its own fill in the Webflow markup.

  The fade gradient is baked into the fill at full length and the fill starts
  fully clipped. The caller reveals it top→bottom via setLineReveal(); the clip
  edge is hard, so while the line fills you only see a solid leading edge and
  the fade shows up only once the reveal reaches each extreme.

  fade.start: fade the top end.  fade.end: fade the bottom end.
*/
export function prepareLineFill(fillEl, fade = {}) {
  const color = resolveLineColor(fillEl)
  fillEl.style.background = buildFillBackground(color, fade)

  // Neutralise any Webflow scaleY(0) starting state (via GSAP, so a
  // positioning translate is preserved) — the reveal is done by clip, not
  // scale, and the fill must render at full height for the fade ends to land
  // on the real ends.
  gsap.set(fillEl, { scaleY: 1 })
  fillEl.style.clipPath = 'inset(0 0 100% 0)' // start fully clipped (hidden)
}

/*
  Reveal a fill from the top down to `progress` (0 = hidden, 1 = full) by
  clipping off the bottom with a hard edge.
*/
export function setLineReveal(fillEl, progress) {
  const clipped = (1 - progress) * 100
  fillEl.style.clipPath = `inset(0 0 ${clipped}% 0)`
}

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='vertical-line']
 */
export default function (elements) {
  elements.forEach((el) => {
    // Use the line's own fill child if present; otherwise treat the element
    // itself as the fill.
    const fill = el.querySelector('[data-vertical-line="fill"]') || el

    prepareLineFill(fill, {
      start: el.getAttribute('line-cap-start') === 'True',
      end: el.getAttribute('line-cap-end') === 'True',
    })

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
