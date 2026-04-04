# home

## Purpose

Scroll-drawn vertical lines between paired `line-start` and `line-end` markers on the home page.

## Webflow Setup

Add to any element on the home page:

```
data-component="home"
```

Then mark line endpoints anywhere in the page with matching numbers:

```html
<div line-start="1"></div>
<!-- ... content between ... -->
<div line-end="1"></div>
```

## Behavior

- **Init**:
  1. **Global lines**: Queries all `[line-start]` and `[line-end]` elements on the page. For each matching number pair, creates an absolutely positioned 1px-wide div line between the vertical centers of the two elements. Uses GSAP ScrollTrigger with `scrub: true` to progressively draw each line (scaleY 0→1). Lines have a red glow (`box-shadow`).
  2. **Branch lines**: When `[line-end="2"]` enters the viewport (top 70%), draws all SVG paths with `[data-line="branch"]` inside `[data-animate="lines-section"]` (strokeDashoffset animation, 1.2s). After lines finish, fades in `.featured-card_button` cards with stagger. Plays once.
- **Resize**: Recalculates global line positions and refreshes ScrollTrigger.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **CSS variable**: `var(--base--red)` for line color and glow.

## DOM Expectations

- One element matching `[data-component='home']` (triggers component loading).
- Any number of `[line-start="N"]` / `[line-end="N"]` pairs throughout the page.
- Lines are appended to `document.body` as absolutely positioned divs with class `global-line`.
