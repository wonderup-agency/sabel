# global

## Purpose

Runs on every page before any component loads. Initializes Lenis smooth scroll and wires it to GSAP's ticker and ScrollTrigger.

## Webflow Setup

No `data-component` attribute needed. This file is always loaded by `main.js` unconditionally.

## Behavior

- **Init**:
  1. Creates a Lenis instance with `autoRaf: false` (GSAP drives the animation frame, not Lenis's own loop).
  2. Registers `ScrollTrigger.update` on Lenis's `scroll` event so ScrollTrigger stays in sync with Lenis's interpolated scroll position.
  3. Adds `lenis.raf(time * 1000)` to `gsap.ticker` so Lenis updates on every GSAP frame.
  4. Disables `gsap.ticker.lagSmoothing` — Lenis handles its own easing; GSAP lag smoothing would cause double-smoothing artifacts.
- **Resize**: Not used — Lenis handles resize internally.

## Dependencies

- **lenis** (npm): Bundled by Rollup. CSS imported from `lenis/dist/lenis.css`, extracted to `dist/styles.css`.
- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration and available as globals when this runs.

## DOM Expectations

None. Lenis targets the root scroll container automatically.
