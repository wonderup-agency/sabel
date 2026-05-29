# home

## Purpose

Home page animations: hero entrance, nav reveal, scroll-drawn vertical lines (excluding timeline-managed lines), branch SVG lines with cards, and slogan deblur.

## Webflow Setup

Add to any element on the home page:

```
data-component="home"
```

Mark line endpoints anywhere in the page with matching numbers:

```html
<div line-start="1"></div>
<!-- ... content between ... -->
<div line-end="1"></div>
```

To show a static inactive track behind the animated line, add `line-background` to the start element:

```html
<div line-start="1" line-background></div>
```

This renders a `#94A3B8` background line at full height that the red animated line draws over.

To override which element controls when the line starts drawing, add `line-trigger` with a CSS selector:

```html
<div line-start="2" line-trigger="[home-animation='section-slogan']"></div>
```

Without `line-trigger`, the ScrollTrigger fires when the `line-start` element itself is centered. With `line-trigger`, the referenced element is used as the trigger instead — useful when you want the line to start drawing earlier, e.g. when a section above is centered rather than the line-start element itself. The line's physical position is still computed from `line-start`.

To swap the endpoint on the smallest screens, add `line-end-mobile` with a CSS selector. It only takes effect on Webflow's **Mobile Portrait** breakpoint (≤479px); on Tablet and Mobile Landscape the line keeps its normal `line-end` (desktop) endpoint:

```html
<div line-start="1" line-end-mobile=".featured-cards_grid"></div>
```

When the override is active, the line ends at the **top edge** of the target element (not its vertical center), so pointing it at a tall container connects the line to the top of that container.

**Note:** Lines whose `line-end` is inside a `[data-component="timeline"]` container are automatically skipped — those are managed by the timeline component. **Exception:** an explicit `line-end-mobile` override is always honored, even when it points into the timeline (it's deliberate author intent), so a hero→featured-grid line still draws on Mobile Portrait.

## Behavior

- **Init**:
  1. **Global lines**: Queries all `[line-start]` and `[line-end]` elements on the page. Resolves the endpoint: by default the matching `[line-end="N"]`, but on **Mobile Portrait** (≤479px) a `line-end-mobile` selector on the start element overrides it. Skips pairs where the resolved `line-end` is inside a `[data-component="timeline"]` container — **unless** the endpoint came from a `line-end-mobile` override, which is always honored. For each remaining pair, creates an absolutely positioned 1px-wide div line. The line's bottom anchors to the endpoint's **vertical center** for normal pairs, or its **top edge** when a `line-end-mobile` override is in effect (so a tall target connects at its top). If the start element has a `line-background` attribute, a static `#94A3B8` track is rendered behind the animated line. Uses GSAP ScrollTrigger with `scrub: true` to progressively draw each line (scaleY 0→1). **Mobile start timing (≤991px)**: the draw starts earlier — `start: 'center 70%'` (the start point at 70% of the viewport, lower on screen) instead of `'center center'` on desktop — so the line begins drawing as it enters rather than at the viewport center. The end aligns to the anchor: `'top center'` for override (top-anchored) lines, `'center center'` otherwise.
  2. **Nav reveal**: Navbar starts hidden (opacity 0, blurred, translated up). When `[home-animation="section-slogan"]` enters viewport center, nav animates in. Reverses on scroll back.
  3. **Hero entrance**: Staggered deblur + fade-in for `.home-hero_title`, `.home-hero_text`, `[home-animation="logo-1"]`, `[home-animation="logo-2"]`, and the infinite lines element.
  4. **Branch lines**: Scrub-controlled animation. The ScrollTrigger starts when `[home-animation="section-slogan"]` is centered in the viewport (falling back to `branchSection top 50%` if not found), and ends when `branchSection bottom` hits 30%. Starting from the slogan center ensures the main vertical line begins drawing while the slogan is still on screen, creating visual continuity. The main vertical line (path starting at y≈0) draws first with `ease: none` so scroll progress maps 1:1 to how far down it's drawn. All branch paths fire together the moment the main line completes (`branchStart = mainDuration`), which is exactly when it visually reaches the branch point. Branches are sorted left-to-right by their end X position (via `getPointAtLength`) and staggered so the leftmost reaches its final state first, progressing right. All 5 branch paths map 1:1 to 5 `.featured-card_button` cards that reveal (fade + y) when the line completes and hide when scroll reverses past that threshold — driven by `onUpdate` on the ScrollTrigger, not scrub, for a proper entrance/exit animation. Reverses automatically on scroll back. **Mobile gating (≤991px)**: the card fade-in/reverse is skipped entirely — cards stay in their natural Webflow state (visible) from the first paint. The SVG path stroke draw still runs because the timeline tweens are independent of the card iteration in `onUpdate`. Decision: the column-stacked mobile layout made the horizontal scroll-driven reveal feel wrong; visible-on-mount is the right default there.
  5. **Slogan**: `[home-animation="slogan"]` deblurs and fades in when it enters viewport (top 60%). Reverses (blurs out) when scrolling back above the trigger, so the animation replays on the next scroll down.
- **Resize**: Recalculates global line positions and refreshes ScrollTrigger.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **CSS variable**: `var(--base--red)` for line color.

## DOM Expectations

- One element matching `[data-component='home']` (triggers component loading).
- Any number of `[line-start="N"]` / `[line-end="N"]` pairs throughout the page (excluding timeline-managed ones). Optional `line-end-mobile` (CSS selector) and `line-trigger` attributes on the start element.
- `.navbar_component` for nav reveal.
- `[home-animation="section-slogan"]` as ScrollTrigger trigger for nav.
- `.home-hero_title`, `.home-hero_text`, `[home-animation="logo-1"]`, `[home-animation="logo-2"]` for hero.
- `[data-animate="lines-section"]` containing `[data-line="branch"]` SVG paths and `.featured-card_button` cards.
- `[home-animation="slogan"]` for slogan reveal.
- Lines are appended to `document.body` as absolutely positioned divs with class `global-line`.
