# global

## Purpose

Runs on every page before any component loads. Initializes Lenis smooth scroll, wires it to GSAP's ticker and ScrollTrigger, and keeps ScrollTrigger refreshed when the document height changes.

## Webflow Setup

No `data-component` attribute needed. This file is always loaded by `main.js` unconditionally.

## Exports

- **default**: The init function (called once by `main.js`).
- **`getLenis()`**: Named export that returns the live Lenis instance, or `null` if `global.js` has not finished initialising yet. Lets other components pause/resume Lenis when needed (e.g. the `pricing-calculator` modal calls `getLenis().stop()` on open and `getLenis().start()` on close).

## Behavior

- **Init**:
  1. Creates a Lenis instance with `autoRaf: false` (GSAP drives the animation frame, not Lenis's own loop).
  2. Registers `ScrollTrigger.update` on Lenis's `scroll` event so ScrollTrigger stays in sync with Lenis's interpolated scroll position.
  3. Adds `lenis.raf(time * 1000)` to `gsap.ticker` so Lenis updates on every GSAP frame.
  4. Disables `gsap.ticker.lagSmoothing` — Lenis handles its own easing; GSAP lag smoothing would cause double-smoothing artifacts.
  5. Attaches a `ResizeObserver` to `document.body` that calls `ScrollTrigger.refresh()` (debounced to the next animation frame so multiple resizes coalesce into one refresh) whenever the body's box size changes. This catches late-loading content — lazy-loaded images, font swaps, deferred CMS content — that grows or shrinks the page after init. Without this, ScrollTrigger's cached pixel positions go stale and components near the bottom of long pages fire their animations against the old layout (e.g. the cta lines completing before the section ever comes into view).
- **Resize**: Not used — Lenis handles viewport resize internally; the `ResizeObserver` set up at init handles document-height changes globally.

## Dependencies

- **lenis** (npm): Bundled by Rollup. CSS imported from `lenis/dist/lenis.css`, extracted to `dist/styles.css`.
- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration and available as globals when this runs.

## DOM Expectations

None. Lenis targets the root scroll container automatically.
