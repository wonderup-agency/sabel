# steps-timeline

## Purpose

Scroll-activated timeline with segmented red lines drawing top-to-bottom between step cards, a glowing drop-shadow that follows the "current" card, and icon state toggling (inactive → active checkbox images that accumulate).

## Webflow Setup

Add to the steps section container:

```
data-component="steps-timeline"
```

Inside the section, mark each card with:

```html
<div data-steps-timeline="item" class="steps_item">...</div>
```

Each card should contain a `.steps-checkboxes_item-icon-wrapper` with two stacked `.steps-checkboxes_item-icon` images using `grid-area: 1 / 1`. The **second image is the OFF state** (visible by default due to DOM order). The **first image is the ON state** (hidden behind the second).

## Behavior

- **Init**:
  1. **Line segments**: Creates N absolutely positioned 1px-wide red line divs on `document.body` (one per card):
     - **Segment 0**: From above the first card's top edge (200px on desktop, 32px on screens ≤767px) down to the first card's top edge.
     - **Segments 1–N-1**: From card[i-1]'s bottom edge to card[i]'s top edge (the gap between cards).
     - X position: 40px to the right of the cards' left edge.
     - Each segment draws via `scaleY 0→1` with GSAP ScrollTrigger `scrub: true`. Fully reversible on scroll back.
  2. **Drop-shadow glow**: Uses `filter: drop-shadow(0 0 100px rgba(225, 6, 0, 0.5))` to avoid interfering with the cards' existing inset `box-shadow`. Only one card glows at a time:
     - When segment 0 completes (line reaches card[0] top): shadow fades in on card[0].
     - When segment i completes (line reaches card[i] top): shadow crossfades (0.3s) from card[i-1] to card[i].
     - Shadow stays on the current card while the line draws through the gap — only transfers when the line touches the next card's top.
     - Last card keeps its shadow after the final segment completes.
     - On scroll reversal: shadow transfers back when the line retracts from a card's top (progress drops below 0.98).
  3. **Icon toggle**: When the line reaches a card's top, the second `.steps-checkboxes_item-icon` (OFF state) fades out (0.3s) to reveal the first image (ON state). Icons **accumulate** — multiple cards can show the ON state simultaneously. Icons revert to OFF when the line retracts from that card's top (same threshold as shadow: progress drops below 0.98).
  4. **Per-tick repositioning**: `gsap.ticker.add(repositionAll)` recalculates every line segment's `top`, `left`, and `height` from `getBoundingClientRect()` each frame.
- **Resize**: Repositions all line segments and calls `ScrollTrigger.refresh()`.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **CSS variable**: `var(--base--red)` for line color.

## DOM Expectations

- One element matching `[data-component='steps-timeline']` (the section container).
- Any number of `[data-steps-timeline="item"]` children (`.steps-checkboxes_item` cards) inside a `.steps-checkboxes_list` flex container.
- Each card contains a `.steps-checkboxes_item-icon-wrapper` with two `.steps-checkboxes_item-icon` images stacked via `grid-area: 1 / 1`. Second image = OFF state (visible by default), first image = ON state.
- Line segments are appended to `document.body` as absolutely positioned divs with class `global-line global-line--steps`.
- The section gets `z-index: 2` so cards render above the lines (`z-index: 1`).
