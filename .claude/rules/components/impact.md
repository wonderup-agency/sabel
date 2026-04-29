# impact

## Purpose

Animates the two vertical line-tracks that bookend the Impact-vs-Effort section (one at the section's top edge, one at the bottom), drawing each via a smooth scroll-interpolated `scaleY` 0 → 1 as it enters the viewport.

## Webflow Setup

Add to the section container:

```
data-component="impact"
```

Inside the section, two line tracks bookend the layout:

```html
<div class="impact_lines-wrapper">
  <div data-impact="line-track" class="impact_line-top-track">
    <div data-impact="line-fill" class="impact_line-fill"></div>
  </div>
  <div data-impact="line-track" class="impact_line-bottom-track">
    <div data-impact="line-fill" class="impact_line-fill"></div>
  </div>
</div>
```

The top track is positioned at the section's top edge (`top: 0; transform: translate(-50%, -50%)`) so half of it sticks out above the section. The bottom track mirrors that at the section's bottom edge (`bottom: 0; transform: translate(-50%, 50%)`). Each track is 1px wide, 20rem tall. Each fill is full-width/height with `var(--base--red)` and `transform-origin: 50% 0px` (top center) — which the component re-applies in case Webflow's CSS changes.

If a track has no `[data-impact="line-fill"]` child, that track is skipped silently.

## Behavior

- **Init**:
  1. Queries all `[data-impact="line-track"]` elements inside each matching section (top + bottom).
  2. For every track that has a `[data-impact="line-fill"]` child: sets `scaleY: 0` with `transformOrigin: top center` immediately so the line is hidden before paint.
  3. Creates a ScrollTrigger per track (`start: 'top 70%'`, `end: 'bottom 50%'`). The trigger is the track itself, so each line draws as it personally enters the viewport — top line draws while the section is entering, bottom line draws while the user is reaching/exiting the section.
  4. Uses a manual `gsap.ticker` interpolation (`current += diff * 0.08`) against each ScrollTrigger's `progress` to draw the fill smoothly. This matches the `hero` component's smoothing — gives a buttery feel in combination with Lenis's interpolated scroll, without the snappiness of plain `scrub: true`. Reverses on scroll back.
- **Resize**: Not used — CSS handles responsive sizing and ScrollTrigger recalculates on resize itself.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **Lenis** (via `global.js`): Drives the scroll position that ScrollTrigger reads, giving the manual interpolation a smooth source signal.
- **CSS variable**: `var(--base--red)` for the line fill color.

## DOM Expectations

- Elements matching `[data-component='impact']` (the section container).
- Zero or more `[data-impact="line-track"]` descendants inside each section. Typical setup is two (top + bottom) but any number works.
- Each track should contain a `[data-impact="line-fill"]` child — the 1px-wide red element that draws via `scaleY`. Tracks without a fill child are skipped.
