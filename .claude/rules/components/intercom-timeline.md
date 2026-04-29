# intercom-timeline

## Purpose

Scroll-activated timeline for the Intercom Foundations section: an SVG path stroke draws at the top of the section, then four red lines fill grey tracks between five sticky-nav dots, activating each dot as its incoming line completes. Fully reversible on scroll back.

## Webflow Setup

Add to the Intercom timeline section container:

```
data-component="intercom-timeline"
```

The SVG connector at the top of the section:

```html
<div
  data-intercom-timeline="svg-line"
  class="services_timeline-svg-wrapper is-fundation w-embed"
>
  <svg viewBox="0 0 530 240" preserveAspectRatio="none" ...>
    <path
      d="M527.5 0V94.0952C527.5 107.35 ..."
      stroke="#E10600"
      stroke-width="1"
      vector-effect="non-scaling-stroke"
    ></path>
  </svg>
</div>
```

The wrapper is positioned by Webflow CSS (`.fundation-line-wrapper { left: 7.5rem }` + `.services_timeline-svg-wrapper { position: absolute; transform: translate(0, -100%) }`) so the SVG sits visually above the first dot.

The cards use the standard sticky-nav structure. Each `.featured-cards_card_wrapper` contains a `.featured-card_nav-wrapper > .featured-card_nav` (sticky `top: 8rem`) with a `.featured-card_nav_icon` and optional `.featured-card_nav_icon-blur` child for the glow effect.

## Behavior

- **Init**:
  1. Sets `position: relative; z-index: 2` on the section so card content sits above body-level lines (which are `z-index: 1`).
  2. **Icons**: Sets all `.featured-card_nav_icon` elements to inactive (`filter: grayscale(1) brightness(0.6)`) and hides their `.featured-card_nav_icon-blur` children (`opacity: 0`).
  3. **SVG stroke draw**: The SVG uses `preserveAspectRatio="none"` + `vector-effect="non-scaling-stroke"`, which breaks direct `stroke-dashoffset` animation (dashes compute in screen space but `getTotalLength()` returns user-space length). Fix: clones the path into an SVG `<mask>` WITHOUT `vector-effect` (so dashes stay in user space), with a thick white stroke (width 20) to cover the 1px visible stroke at all scaling ratios. Animates the mask path's `strokeDashoffset` from full length to `0` via GSAP scrub (`scrub: 1`) triggered on the SVG wrapper (`top 70%` → `bottom 50%`). When progress reaches 98%, dot 0 activates immediately (grayscale → red + glow fade-in). Reverses on scroll back.
  4. **Bridges**: For each consecutive icon pair (icon[i] → icon[i+1]), creates body-level absolutely-positioned divs: a grey track (`var(--base--grey)`) at full height and a red line (`var(--base--red)`) that fills via `scaleY 0→1` scrub. Each bridge uses the start dot's `.featured-cards_card_wrapper` as trigger (`top center`) and the end dot's wrapper as `endTrigger` (`top center`), with `scrub: true`. When progress reaches 98%, the end dot activates. Reverses on scroll back. `LINE_GAP = 16px` clearance above/below each dot prevents lines from striking through them.
  5. **Per-tick repositioning**: `gsap.ticker.add(repositionAll)` recalculates every bridge container's `top`, `left`, and `height` from `getBoundingClientRect()` each frame, keeping lines glued to the dots through every sticky / unstick transition.
- **Resize**: Repositions all bridges and calls `ScrollTrigger.refresh()` to recompute scrub ranges.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **CSS variables**: `var(--base--red)` for line/dot color, `var(--base--grey)` for bridge background tracks.

## DOM Expectations

- One element matching `[data-component='intercom-timeline']` (the section container).
- `[data-intercom-timeline="svg-line"]` containing an SVG with a single `<path>` element — the connector above the first dot.
- 5 `.featured-cards_card_wrapper` elements, each containing a `.featured-card_nav_icon` with an optional `.featured-card_nav_icon-blur` child for the glow effect.
- Bridge lines are appended to `document.body` as absolutely positioned divs with class `global-line global-line--bridge`.
