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

**Note:** Lines whose `line-end` is inside a `[data-component="timeline"]` container are automatically skipped — those are managed by the timeline component.

## Behavior

- **Init**:
  1. **Global lines**: Queries all `[line-start]` and `[line-end]` elements on the page. Skips pairs where `line-end` is inside a `[data-component="timeline"]` container. For each remaining pair, creates an absolutely positioned 1px-wide div line between the vertical centers. If the start element has a `line-background` attribute, a static `#94A3B8` track is rendered behind the animated line. Uses GSAP ScrollTrigger with `scrub: true` to progressively draw each line (scaleY 0→1).
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
- Any number of `[line-start="N"]` / `[line-end="N"]` pairs throughout the page (excluding timeline-managed ones).
- `.navbar_component` for nav reveal.
- `[home-animation="section-slogan"]` as ScrollTrigger trigger for nav.
- `.home-hero_title`, `.home-hero_text`, `[home-animation="logo-1"]`, `[home-animation="logo-2"]` for hero.
- `[data-animate="lines-section"]` containing `[data-line="branch"]` SVG paths and `.featured-card_button` cards.
- `[home-animation="slogan"]` for slogan reveal.
- Lines are appended to `document.body` as absolutely positioned divs with class `global-line`.
