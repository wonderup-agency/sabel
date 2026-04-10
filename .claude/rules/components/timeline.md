# timeline

## Purpose

Scroll-activated timeline with vertical lines between paired markers and bullet indicators that activate progressively as lines complete drawing.

## Webflow Setup

Add to the timeline section container:

```
data-component="timeline"
```

Inside the container, place a `.featured-cards_grid` with card buttons, then a `.featured-cards_list` with card wrappers containing bullet indicators (`.featured-card_nav_icon`) and line markers (`.line_start` / `.line_end`).

The **first line** starts automatically from the first child of `.featured-cards_grid` — no marker element needed in the grid. Subsequent lines chain between bullets using `.line_start` / `.line_end` pairs inside each `.featured-card_nav_icon`:

```html
<div class="featured-card_nav_icon">
  <div class="line_end"></div>
  <div class="line_start" line-background></div>
  <div class="featured-card_nav_icon-blur"></div>
</div>
```

Lines are paired by **DOM order**. The grid's first child is prepended as start[0], then all `.line_start` elements follow. Each start[i] pairs with end[i].

To show a static inactive track behind the animated line, add `line-background` to the start element.

## Behavior

- **Init**:
  1. Sets `position: relative; z-index: 2` on the timeline container so its content sits above body-level lines (`z-index: 1`).
  2. Finds all `.featured-card_nav_icon` bullets inside the container. Sets them to inactive state: `filter: grayscale(1) brightness(0.6)`, with `.featured-card_nav_icon-blur` child hidden (opacity 0).
  3. Finds `.featured-cards_grid` inside the container and prepends its first child as the origin of the first line. Then collects all `.line_start` / `.line_end` elements. Pairs them by DOM order (start[0] → end[0], start[1] → end[1], etc.).
  4. Creates absolutely positioned 1px-wide div lines between each pair. The grid-start line (index 0) is hidden (`display: none`) on viewports ≤ 991px and shown on wider viewports. with GSAP ScrollTrigger `scrub: true` (scaleY 0→1). Lines are offset 1px to the right. The first line (grid start) anchors to the **bottom center** of the first grid child; all other lines anchor to the center of their start element. A 20px `clip-path` inset clears space around bullets at both ends — except for the grid-start line, which only clips the bottom (no bullet at the top). Position measurement compensates for any active GSAP y-transform on the element (via `gsap.getProperty(el, 'y')`) so the line stays anchored to the element's natural resting position even if it has an entrance animation (e.g. the home component's card entrance animates cards from `y: 20` to `y: 0`).
  5. The grid-start line's ScrollTrigger is **disabled on creation** and only enabled once the first grid child has settled into its resting position (opacity ≥ 1 and `gsap.getProperty(el, 'y') === 0`). This prevents the line from drawing before the card entrance animation has finished when the user scrolls fast. Polling runs via `requestAnimationFrame` until settled, then enables the trigger and calls `ScrollTrigger.refresh()`.
  6. Each line's ScrollTrigger has an `onUpdate` callback: when progress reaches ≥0.98, the corresponding bullet animates to active state (`filter: grayscale(0) brightness(1)` + `.featured-card_nav_icon-blur` child fades to full opacity). When scrolling back below threshold, bullet reverts to inactive (`filter: grayscale(1) brightness(0.6)`, blur child hidden).
  7. Bullets map to lines by sorted order: bullet[0] ↔ line[0], bullet[1] ↔ line[1], etc.
  8. **Parallax background**: If a `[data-timeline="bg"]` element exists inside the container, applies a scrubbed `fromTo` tween tied to the container's scroll range (`top bottom` → `bottom top`). Starts at `yPercent: -100` (100% of its height above natural position) and ends at `yPercent: 0` (natural CSS-defined position). This creates a "far back / slower" parallax feel — the element drifts down as the user scrolls, partially counteracting the natural upward scroll — and lands exactly at its original position so it never overflows into the next section. The tween also sets `xPercent: -50` explicitly to preserve the `.featured-cards_blob-wrapper` CSS `transform: translate(-50%)` horizontal centering, since GSAP takes over transform management.
  9. **Scroll-to links**: Finds all `[data-scroll-to]` elements on the page. Sets each element's `href` to `#<value>` and adds a click handler that smooth-scrolls to the target element by ID.
- **Resize**: Recalculates line positions, refreshes ScrollTrigger, and hides/shows the grid-start line based on viewport width (hidden at ≤ 991px).

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **CSS variable**: `var(--base--red)` for active line and bullet color.

## DOM Expectations

- One element matching `[data-component='timeline']` (the section container).
- `.featured-card_nav_icon` elements inside the container (the bullet indicators), each containing an optional `.featured-card_nav_icon-blur` child for the glow effect.
- `.featured-cards_grid` inside the container — its first child element is the origin of the first line (no `.line_start` needed in the grid).
- `.line_start` / `.line_end` elements inside the `.featured-cards_list` card nav bullets, paired by DOM order.
- Lines are appended to `document.body` as absolutely positioned divs with class `global-line`.
- `<a data-scroll-to="section-id">` elements anywhere on the page. The value must match an `id` attribute on the target section (e.g., `id="transformation-blueprint"`).
- Optional `[data-timeline="bg"]` element inside the container — absolutely-positioned background image that receives a parallax tween (starts 100% of its height above its natural position and drifts down to rest at 0 across the section's scroll range). Expected to be horizontally centered via `left: 50%; transform: translate(-50%)` — GSAP re-applies `xPercent: -50` to preserve centering when it takes over the transform.
