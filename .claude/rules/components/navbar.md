# navbar

## Purpose

Animates the navbar in on page load (deblur + slide down + fade) on all non-home pages. On the home page, defers to the `home` component which handles a scroll-triggered navbar reveal instead.

## Webflow Setup

Add to the navbar element:

```
data-component="navbar"
```

This attribute should be on `.navbar_component` on **every page**. The component auto-detects the home page and skips itself.

The navbar must have `opacity: 0` set in Webflow's element styles (already the case) so it starts hidden before JS runs.

## Behavior

- **Init**: Checks if `[data-component="home"]` exists on the page. If yes, returns immediately (home.js owns the navbar animation on the home page). Otherwise, sets the navbar to hidden state (`opacity: 0`, `blur(12px)`, `yPercent: -100`) via GSAP, then animates it in with a 0.8s deblur + slide down + fade transition after a 0.3s delay. Also applies `rgba(11, 11, 12, 0.5)` semi-transparent background.
- **Resize**: Not used.

## Dependencies

- **GSAP** (global): `gsap` — loaded via Webflow's GSAP integration.

## DOM Expectations

- One element matching `[data-component='navbar']` (`.navbar_component`).
- On the home page: `[data-component="home"]` must exist somewhere on the page for the skip detection to work.
