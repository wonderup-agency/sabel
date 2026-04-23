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

- **Init**: Queries `[data-hero="line-track"]` and `[data-hero="line-fill"]` inside each matching element. If both exist, sets `scaleY: 0` with `transformOrigin: top center` on the fill element. Creates a ScrollTrigger on the track (`start: 'top 80%'`, `end: 'bottom 50%'`) and uses a manual ticker-based interpolation (`current += diff * 0.08`) against the ScrollTrigger's progress for smooth drawing. Reverses on scroll back.
- **Resize**: Not used — CSS handles responsive sizing.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.

## DOM Expectations

- Elements matching `[data-component='hero']` (the hero section container).
- Optional `[data-hero="line-track"]` inside the section — the positioned track container.
- Optional `[data-hero="line-fill"]` inside the track — the 1px-wide red line element that draws via scaleY.
