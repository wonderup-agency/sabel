# logo-marquee

## Purpose

Infinite right-to-left scrolling marquee for logo rows, using GSAP to seamlessly loop duplicated logo lists.

## Webflow Setup

Add to the logo container element:

```
data-component="logo-marquee"
```

The element must have `overflow: hidden` and `display: flex` set in Webflow (already the case on `.testimonials_logo-main-wrap`). Inside it, place two identical `.testimonials_logo-wrapper` elements containing the same logos — Webflow's duplicate collection list technique.

Add this custom CSS to the element (via Webflow custom code) for soft edge fading:

```css
.testimonials_logo-main-wrap {
  mask-image: linear-gradient(
    to right,
    transparent,
    black 10%,
    black 90%,
    transparent
  );
}
```

Adjust `10%` / `90%` to control fade width.

## Behavior

- **Init**: For each matching element, measures the width of one `.testimonials_logo-wrapper` plus the container's CSS gap. Animates both wrappers with `gsap.to({ x: -totalWidth })` using `ease: 'none'` and `repeat: -1`. Because both lists are identical, the animation reset is visually seamless. Scroll speed is constant at 50px/s.
- **Resize**: Kills the current tween, resets positions, recalculates widths, and creates a new tween to account for layout changes.

## Dependencies

- **GSAP** (global): `gsap` — loaded via Webflow's GSAP integration.

## DOM Expectations

- Elements matching `[data-component='logo-marquee']` (`.testimonials_logo-main-wrap`).
- At least two `.testimonials_logo-wrapper` children inside (duplicate collection lists with identical logo content).
- The container must have `overflow: hidden` to clip the scrolling content.
