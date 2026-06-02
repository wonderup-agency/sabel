/*
Shared line-cap helpers.

Opt-in end fades for any div line in the project. A line "fades" when it
dissolves into the background at its top and/or bottom extreme. The fade is
baked into the fill's BACKGROUND as a vertical gradient (solid in the middle,
transparent at the faded end) at the fill's FULL length, and the line is drawn
top→bottom via `clip-path` — NOT a CSS mask (mask-image triggers a WebKit
repaint flicker) and NOT a layout/scale animation.

Components opt in per line via the attributes `line-cap-start="True"` /
`line-cap-end="True"` (read with `readCaps`). Lines without an attribute never
touch any of this — they keep their plain `scaleY` draw.

Consumed by: vertical-line, hero, home, steps-timeline, timeline,
services-timeline, intercom-timeline.
*/

// How much of each enabled end fades out, as a % of the line's own length.
// Percentage stops keep the fade locked to the line's real ends at any reveal
// amount; plain numbers (no `calc()`, which some gradient parsers drop and
// collapse into one long fade over the whole line).
export const LINE_FADE = 24

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
export function buildFillBackground(
  color,
  { start = false, end = false } = {}
) {
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

  Operates on the EXISTING fill element — it does NOT create a new node, so it
  never duplicates a line that already has its own fill in the markup.

  The fade gradient is baked into the fill at full length and the fill starts
  fully clipped. The caller reveals it top→bottom via setLineReveal(); the clip
  edge is hard, so while the line fills you only see a solid leading edge and
  the fade shows up only once the reveal reaches each extreme.

  fade.start: fade the top end.  fade.end: fade the bottom end.
*/
export function prepareLineFill(fillEl, fade = {}) {
  const color = resolveLineColor(fillEl)
  fillEl.style.background = buildFillBackground(color, fade)

  // Neutralise any scaleY(0) starting state (via GSAP, so a positioning
  // translate is preserved) — the reveal is done by clip, not scale, and the
  // fill must render at full height for the fade ends to land on the real ends.
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

/*
  Read the opt-in cap attributes off an element (the line-start element, the
  section, or the component wrapper — whatever the component scopes to).
*/
export function readCaps(el) {
  return {
    start: el?.getAttribute('line-cap-start') === 'True',
    end: el?.getAttribute('line-cap-end') === 'True',
  }
}

/*
  Fade the START end of an SVG <path>'s stroke — the equivalent of a start cap
  for line trees built from SVG strokes (e.g. the home / fin branch-line trunk),
  where the div clip/background technique can't be used.

  Implemented as a vertical linear-gradient stroke (transparent at offset 0,
  solid from LINE_FADE% inward) baked into a <defs> on the path's own <svg>.
  This is independent of the stroke-dashoffset draw animation, so the line still
  draws normally — the top just dissolves into the background instead of ending
  on a hard edge.

  Assumes a roughly vertical path whose `d` starts at its top end (true for the
  branch-tree trunks). Only the start/top is faded — branch tips fan out in
  different directions and aren't "global ends", so they're left solid. No-ops
  if the path or its owning <svg> is missing.
*/
export function fadeSvgPathStart(path) {
  if (!path) return
  const svg = path.ownerSVGElement
  if (!svg) return

  // Need the path's geometry to place the gradient. A vertical trunk has a
  // zero-width bounding box, and `objectBoundingBox` gradients are IGNORED on
  // zero-width/height geometry (SVG spec) — so the gradient must be in
  // `userSpaceOnUse` with real viewBox coordinates.
  let box
  try {
    box = path.getBBox()
  } catch {
    return
  }
  if (!box || box.height <= 0) return

  const ns = 'http://www.w3.org/2000/svg'
  const cs = getComputedStyle(path)
  const color =
    cs.stroke && cs.stroke !== 'none' ? cs.stroke : 'var(--base--red, #e10600)'

  const cx = box.x + box.width / 2
  const gradId = `line-cap-${Math.random().toString(36).slice(2, 8)}`
  const grad = document.createElementNS(ns, 'linearGradient')
  grad.setAttribute('id', gradId)
  grad.setAttribute('gradientUnits', 'userSpaceOnUse')
  // Vertical vector spanning the trunk's full height, top → bottom.
  grad.setAttribute('x1', String(cx))
  grad.setAttribute('y1', String(box.y))
  grad.setAttribute('x2', String(cx))
  grad.setAttribute('y2', String(box.y + box.height))

  // [offset, opacity] — transparent at the top end, solid from LINE_FADE% down.
  ;[
    [0, 0],
    [LINE_FADE / 100, 1],
    [1, 1],
  ].forEach(([offset, opacity]) => {
    const stop = document.createElementNS(ns, 'stop')
    stop.setAttribute('offset', String(offset))
    stop.setAttribute('stop-color', color)
    stop.setAttribute('stop-opacity', String(opacity))
    grad.appendChild(stop)
  })

  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = document.createElementNS(ns, 'defs')
    svg.insertBefore(defs, svg.firstChild)
  }
  defs.appendChild(grad)

  // Apply via inline style, NOT setAttribute('stroke'): the path's solid colour
  // is usually set by a CSS rule (the Webflow class), and a `stroke`
  // presentation attribute loses to any CSS declaration — the gradient would be
  // silently overridden. Inline style wins over the class rule.
  path.style.stroke = `url(#${gradId})`
}

/*
  Draw a runtime div line with optional end fades.

  This is the single draw primitive for every dynamic-line component, so the
  gradient/clip logic is never duplicated.

  - No cap → unchanged behaviour: the line is drawn solid via a scaleY 0→1
    tween linked to the given ScrollTrigger config.
  - Cap on either end → the fade is baked in and the line is revealed via
    clip-path, driven by a standalone ScrollTrigger's progress.

  The component's own `scrollTrigger.onUpdate` (icon activation, shadow, dot
  toggles, …) is preserved in both paths.

  fade.start / fade.end: which global end fades.
*/
export function drawLine(lineEl, { fade = {}, scrollTrigger = {} } = {}) {
  const hasCap = fade.start || fade.end

  if (!hasCap) {
    gsap.to(lineEl, { scaleY: 1, ease: 'none', scrollTrigger })
    return
  }

  prepareLineFill(lineEl, fade)
  const userOnUpdate = scrollTrigger.onUpdate
  ScrollTrigger.create({
    ...scrollTrigger,
    onUpdate(self) {
      setLineReveal(lineEl, self.progress)
      if (userOnUpdate) userOnUpdate(self)
    },
  })
}
