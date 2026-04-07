# home

## Purpose

Home page animations: hero entrance, nav reveal, scroll-drawn vertical lines (excluding timeline-managed lines), branch SVG lines with cards, and slogan deblur.

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

To show a static inactive track behind the animated line, add `line-background` to the start element:

```html
<div line-start="1" line-background></div>
```

This renders a `#94A3B8` background line at full height that the red animated line draws over.

**Note:** Lines whose `line-end` is inside a `[data-component="timeline"]` container are automatically skipped — those are managed by the timeline component.

## Behavior

- **Init**:
  1. **Global lines**: Queries all `[line-start]` and `[line-end]` elements on the page. Skips pairs where `line-end` is inside a `[data-component="timeline"]` container. For each remaining pair, creates an absolutely positioned 1px-wide div line between the vertical centers. If the start element has a `line-background` attribute, a static `#94A3B8` track is rendered behind the animated line. Uses GSAP ScrollTrigger with `scrub: true` to progressively draw each line (scaleY 0→1). Lines have a red glow (`box-shadow`).
  2. **Nav reveal**: Navbar starts hidden (opacity 0, blurred, translated up). When `[home-animation="section-slogan"]` enters viewport center, nav animates in. Reverses on scroll back.
  3. **Hero entrance**: Staggered deblur + fade-in for `.home-hero_title`, `.home-hero_text`, `[home-animation="logo-1"]`, `[home-animation="logo-2"]`, and the infinite lines element.
  4. **Branch lines**: When `[data-animate="lines-section"]` enters viewport (top 30%), draws all SVG paths with `[data-line="branch"]` (strokeDashoffset animation, 1.2s). After lines finish, fades in `.featured-card_button` cards with stagger. Plays on enter, reverses on scroll back (`onLeaveBack`).
  5. **Slogan**: `[home-animation="slogan"]` deblurs and fades in when it enters viewport (top 60%). Plays once.
- **Resize**: Recalculates global line positions and refreshes ScrollTrigger.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **CSS variable**: `var(--base--red)` for line color and glow.

## DOM Expectations

- One element matching `[data-component='home']` (triggers component loading).
- Any number of `[line-start="N"]` / `[line-end="N"]` pairs throughout the page (excluding timeline-managed ones).
- `.navbar_component` for nav reveal.
- `[home-animation="section-slogan"]` as ScrollTrigger trigger for nav.
- `.home-hero_title`, `.home-hero_text`, `[home-animation="logo-1"]`, `[home-animation="logo-2"]` for hero.
- `[data-animate="lines-section"]` containing `[data-line="branch"]` SVG paths and `.featured-card_button` cards.
- `[home-animation="slogan"]` for slogan reveal.
- Lines are appended to `document.body` as absolutely positioned divs with class `global-line`.
