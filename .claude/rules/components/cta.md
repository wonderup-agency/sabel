# cta

## Purpose

Scroll-activated three-phase line animation for the CTA section: top horizontal + top vertical lines draw together, then the bottom vertical fills, then the bottom horizontal completes. Driven by a single smoothed-scrub timeline so the whole sequence reverses cleanly on scroll back.

## Webflow Setup

Add to the CTA section container:

```
data-component="cta"
```

Inside the section, the four lines must each have a fill child and the data attributes shown below. The fill children must keep their existing `transform-origin` (set in CSS via `.origin-top` / `.origin-bottom`, plus the default center origin for horizontals):

```html
<section data-component="cta" class="section_cta">
  <!-- ...content... -->
  <div class="cta_graphics">
    <div class="cta_padding-global">
      <div class="cta_lines-container">
        <div class="cta_lines-group">
          <div data-cta="line-top-horizontal" class="cta_horizontal-line">
            <div class="cta_line-fill"></div>
          </div>
          <div data-cta="line-top-vertical" class="cta_vertical-line">
            <div class="cta_line-fill origin-top"></div>
          </div>
        </div>
        <div class="cta_lines-group">
          <div data-cta="line-bottom-vertical" class="cta_vertical-line">
            <div class="cta_line-fill origin-bottom"></div>
          </div>
          <div data-cta="line-bottom-horizontal" class="cta_horizontal-line">
            <div class="cta_line-fill"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

If any of the four `.cta_line-fill` children are missing, the component skips that section silently.

## Behavior

- **Init** (per matching section):
  1. Resolves the four fill elements scoped to the section: `[data-cta="line-top-horizontal"] .cta_line-fill`, `[data-cta="line-top-vertical"] .cta_line-fill`, `[data-cta="line-bottom-vertical"] .cta_line-fill`, `[data-cta="line-bottom-horizontal"] .cta_line-fill`. Skips the section if any are missing.
  2. Resets initial state immediately so lines never flash fully drawn: horizontals get `scaleX: 0, scaleY: 1`, verticals get `scaleX: 1, scaleY: 0`. Transform origins remain whatever the CSS set (center for horizontals, top for `origin-top`, bottom for `origin-bottom`).
  3. Builds a single GSAP timeline of total duration `3` driven by a ScrollTrigger on the section root with `start: 'top 85%'` (top of section is 15% above the viewport bottom), `end: 'bottom 60%'` (bottom of section reaches 40% from viewport bottom), and `scrub: 1` (~1s smoothed lag for a buttery feel matching Lenis-driven sections):
     - `0 → 1`: top horizontal `scaleX 0→1` AND top vertical `scaleY 0→1` in parallel (`ease: 'none'`).
     - `1 → 2`: bottom vertical `scaleY 0→1` (`ease: 'none'`).
     - `2 → 3`: bottom horizontal `scaleX 0→1` (`ease: 'none'`).
  4. Scroll progress 0–1 maps linearly to timeline 0–3, so the four lines complete in equal-thirds of the scroll range. Reverses automatically on scroll back via scrub.
- **Resize**: Not used — ScrollTrigger recalculates ranges on resize itself; CSS handles responsive sizing of the lines.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **Lenis** (via `global.js`): drives the scroll position that ScrollTrigger reads, giving smoothed-scrub a continuous source signal.
- **CSS variable**: `var(--base--red)` for the line fill color (set in Webflow on `.cta_line-fill`).
- **CSS contract**: `.cta_line-fill.origin-top` must keep `transform-origin: 50% 0`, `.cta_line-fill.origin-bottom` must keep `transform-origin: 50% 100%`. Horizontal fills use the default center origin.

## DOM Expectations

- One element matching `[data-component='cta']` (the section container).
- Inside the section, four line wrappers with `data-cta` attributes (`line-top-horizontal`, `line-top-vertical`, `line-bottom-vertical`, `line-bottom-horizontal`), each containing a single `.cta_line-fill` child. If any are missing, the section is skipped.
