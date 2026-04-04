# horizontal-line

## Purpose

Animates a horizontal line element to grow from center to both sides, triggered after the vertical-line completes.

## Webflow Setup

Add to the horizontal line div element:

```
data-component="horizontal-line"
```

The element should have its full width set in Webflow. The component scales it from 0 to 1 on the X axis from center.

## Behavior

- **Init**: Sets `scaleX: 0` with `transform-origin: center center`. Looks for a `[data-component="vertical-line"]` element on the page. When the vertical line's bottom edge passes the viewport center (scroll trigger), the horizontal line animates to `scaleX: 1`. Reverses when scrolling back up. Falls back to scrub-based animation if no vertical-line exists.
- **Resize**: Not used — CSS handles responsive sizing.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **vertical-line component** (optional): chains after its completion for sequenced animation.

## DOM Expectations

- Elements matching `[data-component='horizontal-line']` (`.footer_top-line`).
- The element should have a defined width and visible background/border in Webflow.
- Optionally, a `[data-component="vertical-line"]` element on the page for sequenced triggering.
