# global

## Purpose

Runs on every page before any component loads. On desktop (>991px) it initializes Lenis smooth scroll, wires it to GSAP's ticker and ScrollTrigger, and keeps ScrollTrigger refreshed when the document height changes. On mobile/tablet (≤991px) it stays out of the way — native scroll is used and ScrollTrigger listens to `window.scroll` by default.

## Webflow Setup

No `data-component` attribute needed. This file is always loaded by `main.js` unconditionally.

## Exports

- **default**: The init function (called once by `main.js`).
- **`getLenis()`**: Named export that returns the live Lenis instance, or `null` (a) before `global.js` has finished initialising, or (b) on mobile/tablet (≤991px) where Lenis is intentionally not instantiated. Lets other components pause/resume Lenis when needed (e.g. the `pricing-calculator` modal calls `getLenis().stop()` on open and `getLenis().start()` on close). Consumers MUST handle the `null` case and fall back to native behaviour.

## Behavior

- **Init**:
  1. Reads `window.matchMedia('(min-width: 992px)')` ONCE at load to branch between desktop and mobile/tablet. The decision is sticky for the session — no rotation/resize re-evaluation, so ScrollTrigger doesn't get destabilised by a mid-session mode flip.
  2. **Global-line fade (both branches)**: Toggles a `global-lines-visible` class on `<html>` based on whether `window.scrollY` is above an 8px threshold (a dead zone that prevents flicker near the top). The matching CSS rule lives in `global.css` (imported from this file, extracted to `dist/styles.css`) — `.global-line` and `[data-hero='line-track']` start at `opacity: 0` and transition to `opacity: 1` over 0.6s when the class is present. Shipping the rule via CSS (not JS) guarantees that line elements created at runtime are invisible from the first paint, and that the pre-existing hero track in the Webflow HTML is also hidden before any JS runs — no FOUC. On desktop the toggle hooks to `lenis.on('scroll', …)`; on mobile it hooks to `window.addEventListener('scroll', …, { passive: true })`.
  3. **Desktop-only**: Creates a Lenis instance with `autoRaf: false` (GSAP drives the animation frame, not Lenis's own loop), registers `ScrollTrigger.update` on Lenis's `scroll` event so ScrollTrigger stays in sync with Lenis's interpolated scroll position, adds `lenis.raf(time * 1000)` to `gsap.ticker` so Lenis updates on every GSAP frame, and disables `gsap.ticker.lagSmoothing` — Lenis handles its own easing; GSAP lag smoothing would cause double-smoothing artifacts.
  4. **Desktop-only**: Attaches a `ResizeObserver` to `document.body` that calls `ScrollTrigger.refresh()` (debounced to the next animation frame so multiple resizes coalesce into one refresh) whenever the body's box size changes. This catches late-loading content — lazy-loaded images, font swaps, deferred CMS content — that grows or shrinks the page after init. Without this, ScrollTrigger's cached pixel positions go stale and components near the bottom of long pages fire their animations against the old layout (e.g. the cta lines completing before the section ever comes into view). **Disabled on mobile** because iOS Safari fires this on every address-bar show/hide during scroll → `ScrollTrigger.refresh()` storms → visible scroll jank.
  5. **Mobile branch (≤991px)**: NO Lenis instance, NO ticker hook, NO `lagSmoothing(0)` (keeps GSAP's default lag smoothing which helps mask micro-stutters on native scroll), NO `ResizeObserver`. ScrollTrigger continues to function because it listens to `window.scroll` by default — no manual wiring needed.
- **Resize**: Not used — on desktop, Lenis handles viewport resize internally and the `ResizeObserver` set up at init handles document-height changes globally; on mobile, ScrollTrigger's own resize listener handles it.

## Dependencies

- **lenis** (npm): Bundled by Rollup. CSS imported from `lenis/dist/lenis.css`, extracted to `dist/styles.css`.
- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration and available as globals when this runs.
- **`./global.css`**: Sibling CSS file imported and extracted to `dist/styles.css`. Owns the `.global-line` + `[data-hero='line-track']` fade rule. Components that append `.global-line` elements (home, timeline, services-timeline, intercom-timeline, steps-timeline) and the hero (`[data-hero='line-track']`) all participate in the fade automatically — no per-component CSS.

## DOM Expectations

None. Lenis targets the root scroll container automatically.
