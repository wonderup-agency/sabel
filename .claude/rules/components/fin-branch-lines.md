# fin-branch-lines

## Purpose

Scroll-activated SVG branching animation for the Fin page's featured-cards section, plus an optional CTA-style top-lines animation. A main vertical line draws top-to-bottom, then branch paths fan out left-to-right and reveal a row of cards as each branch line completes. If `data-cta` line elements are present at the top of the section, they animate in parallel (horizontal + vertical) as the section enters the viewport. Fully reversible on scroll back. Per-instance scoped — does not interfere with the homepage's equivalent animation handled by `home.js`.

This is a deliberate variant of the homepage's branch-lines logic (in `src/components/home.js`'s "Branch Lines" block), kept as a separate component because the Fin SVG uses a different `viewBox` origin and the homepage version's main-path detection (`y < 1`) doesn't apply.

## Webflow Setup

Add to the section container that wraps both the SVG and the cards grid (replaces the wrong `data-component="timeline"` attribute that was originally on this section):

```
data-component="fin-branch-lines"
```

Inside the section, the SVG must use `[data-animate="lines-section"]` and contain one or more `[data-line="branch"]` paths:

```html
<section
  data-component="fin-branch-lines"
  class="section_featured-cards is-fin"
>
  <svg data-animate="lines-section" viewBox="0 404.619 1051 225.381" ...>
    <path data-line="branch" d="M525.5 404.619 L525.5 536.619"></path>
    <!-- ... 5 more branch paths -->
  </svg>
  <div class="featured-cards_grid">
    <a class="featured-card_button">...</a>
    <!-- ... 4 more cards -->
  </div>
</section>
```

The "main" path is auto-detected as the topmost one (smallest starting Y in its `d` attribute). All other `[data-line="branch"]` paths are treated as branches and sorted left-to-right by their endpoint X coordinate. Branches map 1:1 to `.featured-card_button` cards in left-to-right order.

If the SVG, paths, or cards are missing, the component skips that instance silently.

## Behavior

- **Init** (per matching section):
  1. **CTA top lines (optional)**: Queries `[data-cta="line-top-horizontal"] .cta_line-fill` and `[data-cta="line-top-vertical"] .cta_line-fill` inside the section. If both exist, sets initial state (`scaleX: 0` on horizontal, `scaleY: 0, transformOrigin: '50% 0%'` on vertical) and builds a ScrollTrigger timeline (`start: 'top 85%'`, `end: 'top 30%'`, `scrub: 1`) that animates both in parallel to their full scale. `transformOrigin` is set by JS (not CSS class) since the fill element may not have the `origin-top` class present in the CTA section. If either element is missing, this step is skipped silently.
  2. Queries the section's `[data-animate="lines-section"]` SVG and the `[data-line="branch"]` paths inside it. Cards are queried scoped to the section (`.featured-card_button`).
  3. For each path, computes `getTotalLength()` and sets `strokeDasharray` + `strokeDashoffset` to the length so the path is initially invisible.
  4. Identifies the main path (topmost — smallest starting Y in its `d`) and sorts the remaining paths left-to-right by their `getPointAtLength(totalLength).x`.
  5. Sets all cards to `autoAlpha: 0, y: 20`.
  6. Builds a GSAP timeline with `scrub: true` triggered on the SVG (`top 50%` → `bottom 30%`):
     - Main path animates `strokeDashoffset → 0` with `duration: 0.5, ease: 'none'` at time `0` so scroll progress maps 1:1 to how far down the line is drawn.
     - Branch paths animate together starting at `branchStart = mainDuration` (the moment the main line visually reaches the branch point), staggered by `0.2` with `duration: 0.3, ease: 'none'`.
  7. `onUpdate` watches scroll progress against precomputed `completionProgress` thresholds for each branch. When `self.progress >= threshold` for branch `i`, card `i` reveals (`autoAlpha: 1, y: 0`, 0.5s). When scroll reverses past that threshold, the card hides (`autoAlpha: 0, y: 20`, 0.3s). In-flight tweens are killed before starting new ones to handle fast scrolling.
- **Resize**: Not used — ScrollTrigger recalculates on resize itself; SVG scaling is handled by `viewBox`.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.

## Why this is separate from `home.js`'s branch lines

Two reasons:

1. **Different `viewBox` origin**: the homepage SVG uses `viewBox="0 0 1051 630"` (trunk starts at `y=0`), while the Fin SVG uses `viewBox="0 404.619 1051 225.381"` (trunk starts at `y=404.619`). The homepage code's main-path detection (`y < 1`) misses the Fin trunk. This component uses "smallest starting Y" instead, which works for both — but the homepage code is left untouched to avoid risking regression on the live homepage.
2. **Scope safety**: `home.js` runs only when `data-component="home"` is on the page (homepage only), so there's no interference with this component on the Fin page.

If a third page ever needs this animation, consider unifying these into a single `branch-lines` component using the topmost-Y detection.

## DOM Expectations

- One element matching `[data-component='fin-branch-lines']` (the section container that wraps both the SVG and the cards grid).
- **Optional** `[data-cta="line-top-horizontal"]` and `[data-cta="line-top-vertical"]` wrappers at the top of the section, each containing a `.cta_line-fill` child. These use the same CSS classes as the CTA section's lines. The vertical fill does NOT need the `origin-top` CSS class — `transformOrigin` is set via JS.
- Inside the section, one `[data-animate="lines-section"]` SVG containing `[data-line="branch"]` paths.
- Inside the section, `.featured-card_button` cards — one per branch path, in left-to-right DOM order.
- The main path is the topmost one (smallest starting Y in its `d`). All other `[data-line="branch"]` paths are treated as branches and mapped 1:1 to cards in left-to-right order.
