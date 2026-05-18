# hero

## Purpose

Animates a vertical line track in hero sections using smooth scroll-interpolated drawing (scaleY 0→1).

## Webflow Setup

Add to the hero section container:

```
data-component="hero"
```

Inside the section, the line track uses custom data attributes:

```html
<div data-hero="line-track" class="hero_line-track">
  <div data-hero="line-fill" class="hero_line-fill"></div>
</div>
```

The track is absolutely positioned at the bottom center of the hero section (`inset: auto auto 0px 50%; transform: translate(-50%, 50%)`), 20rem tall. The fill element is 1px wide with `var(--base--red)` background and `transform-origin: top center`.

If the line-track or line-fill elements are missing, the component does nothing (graceful skip).

## Behavior

- **Init**:
  1. Queries `[data-hero="line-track"]` and `[data-hero="line-fill"]` inside each matching element. If both exist, sets `scaleY: 0` with `transformOrigin: top center` on the fill.
  2. Creates a ScrollTrigger on the track (`start: 'top 80%'`, `end: 'bottom 50%'`) and uses a manual ticker-based interpolation (`current += diff * 0.08`) against the ScrollTrigger's progress for smooth drawing.
  3. **Opacity gate**: The track participates in the shared `.global-line` fade rule (see `global.css` + `global.js`) via its `[data-hero='line-track']` attribute. The fill's scale tracking is gated on the track's opacity reaching `1`: a `MutationObserver` watches `<html>`'s class list, and once `global-lines-visible` is added, a 600ms `setTimeout` (matching the CSS transition duration in `global.css`) flips an `opacityReady` flag and disconnects the observer. The flag is **sticky** — once enabled it never resets, even if the user scrolls back to the top and the class is removed. This prevents flicker when Lenis's smoothed scroll position briefly oscillates around the 8px threshold and toggles the class rapidly (which would otherwise cause "draws, erases, draws" cycles). When the user does return to the top, `st.progress` naturally falls to 0 so the line collapses smoothly via the existing interpolation — no manual reset needed.
- **Resize**: Not used — CSS handles responsive sizing.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **`global.js` + `global.css`**: Own the `global-lines-visible` class toggle on `<html>` and the CSS opacity transition that this component gates on.

## DOM Expectations

- Elements matching `[data-component='hero']` (the hero section container).
- Optional `[data-hero="line-track"]` inside the section — the positioned track container.
- Optional `[data-hero="line-fill"]` inside the track — the 1px-wide red line element that draws via scaleY.
