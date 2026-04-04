# vertical-line

## Purpose

Animates a vertical line element to grow from top to bottom on scroll, used as a visual continuation after the last timeline line.

## Webflow Setup

Add to the vertical line div element:

```
data-component="vertical-line"
```

The element should have its full height set in Webflow. The component scales it from 0 to 1 on the Y axis.

## Behavior

- **Init**: Sets `scaleY: 0` with `transform-origin: top center`. Uses GSAP ScrollTrigger with `scrub: true` to grow the line from 0 to full height as the user scrolls through it.
- **Resize**: Not used — CSS handles responsive sizing.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.

## DOM Expectations

- Elements matching `[data-component='vertical-line']` (`.line_vertical`).
- The element should have a defined height and visible background/border in Webflow.
