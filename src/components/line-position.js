/*
Shared helper: line-position
Used by the timeline-family components (timeline, services-timeline,
intercom-timeline, steps-timeline) that anchor body-level absolute line
elements to dots/cards every animation frame.

Two rules keep per-frame repositioning cheap enough not to stutter on iOS:
  1. Callers must READ all geometry first, then call applyLinePosition for
     each element (writes batched after reads). Interleaving reads and writes
     forces one synchronous reflow per element per frame — the classic cause
     of scroll jank on Safari iOS.
  2. applyLinePosition writes each style property ONLY when it changed since
     the last frame. When the page is idle nothing is written, so layout
     stays clean and the next frame's reads don't force a reflow either.
*/

/**
 * Apply an absolute-position layout to a line element, skipping no-op writes.
 *
 * @param {HTMLElement} el - the body-level line container/element
 * @param {{hidden?: boolean, left?: number, top?: number, height?: number}} layout
 *   Pass `{ hidden: true }` to hide the element; otherwise pixel values.
 */
export function applyLinePosition(el, layout) {
  const prev = el.__linePos || (el.__linePos = {})

  if (layout.hidden) {
    if (prev.display !== 'none') {
      el.style.display = 'none'
      prev.display = 'none'
    }
    return
  }

  if (prev.display !== '') {
    el.style.display = ''
    prev.display = ''
  }
  if (prev.left !== layout.left) {
    el.style.left = `${layout.left}px`
    prev.left = layout.left
  }
  if (prev.top !== layout.top) {
    el.style.top = `${layout.top}px`
    prev.top = layout.top
  }
  if (prev.height !== layout.height) {
    el.style.height = `${layout.height}px`
    prev.height = layout.height
  }
}
