# timeline

## Purpose

Scroll-activated timeline with vertical lines between paired markers and bullet indicators that activate progressively as lines complete drawing.

## Webflow Setup

Add to the timeline section container:

```
data-component="timeline"
```

Inside the container, place bullet indicators with class `.featured-card_nav_icon`. Mark line endpoints with matching numbers:

```html
<div line-start="4" line-background></div>
<!-- ... content between ... -->
<div line-end="4"></div>
```

Line-start elements can be outside the timeline container (e.g., line 3 bridging from a previous section) — the component captures any pair whose `line-end` is inside the container.

To show a static inactive track behind the animated line, add `line-background` to the start element.

## Behavior

- **Init**:
  1. Sets `position: relative; z-index: 2` on the timeline container so its content sits above body-level lines (`z-index: 1`).
  2. Finds all `.featured-card_nav_icon` bullets inside the container. Sets them to inactive state: solid `var(--base--grey)` color, `filter: none` (no glow).
  3. Collects all `[line-start]`/`[line-end]` pairs where the `line-end` is inside the container. Sorts by line number.
  4. Creates absolutely positioned 1px-wide div lines between each pair with GSAP ScrollTrigger `scrub: true` (scaleY 0→1).
  5. Each line's ScrollTrigger has an `onUpdate` callback: when progress reaches ≥0.98, the corresponding bullet animates to active state (`var(--base--red)` color + `drop-shadow` glow). When scrolling back below threshold, bullet reverts to inactive (grey, no glow).
  6. Bullets map to lines by sorted order: bullet[0] ↔ line[0], bullet[1] ↔ line[1], etc.
- **Resize**: Recalculates line positions and refreshes ScrollTrigger.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **CSS variable**: `var(--base--red)` for active line and bullet color.

## DOM Expectations

- One element matching `[data-component='timeline']` (the section container).
- `.featured-card_nav_icon` elements inside the container (the bullet indicators).
- `[line-start="N"]` / `[line-end="N"]` pairs, with `line-end` inside the container. `line-start` may be outside (for bridging lines from previous sections).
- Lines are appended to `document.body` as absolutely positioned divs with class `global-line`.
