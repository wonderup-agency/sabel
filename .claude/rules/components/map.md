# map

## Purpose

Renders an SVG world map with real geographic country outlines and animated glow points that fade in on scroll and pulse continuously.

## Webflow Setup

Add to the map container element in the testimonials section:

```
data-component="map"
```

The element should be a block-level container (div) with appropriate sizing. The SVG will fill 100% width and height using `xMidYMid meet` (contain behavior) so the full map is always visible without cropping.

## Behavior

- **Init**: Injects an inline SVG world map into each matching element. Uses `world-map-country-shapes` package for real geographic outlines (211 countries, Robinson projection). Countries are filled with dark red (`#2a0a0a`). Glow points are placed at 33 city locations representing actual client/team locations — Oceania (Sydney, Melbourne, Brisbane, Auckland, Wellington, Christchurch), Asia (Makati, Tokyo, Kuala Lumpur, Singapore, Hong Kong, Jakarta, New Delhi, Pune), Middle East (Dubai, Israel), Europe (Krakow, London, Dublin, Amsterdam, Stockholm, Copenhagen, Paris, Prague, Bern, Warwick, Dover), Africa (Durban), South America (Novo Hamburgo), and North America (Victoria BC, New York, San Francisco, Chicago). Coordinates are computed from the Robinson projection to match the country outlines. Uses GSAP ScrollTrigger to fade in points with a staggered random animation when the section enters the viewport (top 80%). After entrance, points continuously pulse (breathing effect) with varying radius and opacity.
- **Resize**: Not used — SVG scales responsively via `viewBox` and `preserveAspectRatio`.

## Dependencies

- **world-map-country-shapes** (npm): SVG path data for 211 countries. Bundled by Rollup.
- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration. Falls back to showing all points immediately if GSAP is unavailable.

## DOM Expectations

- Elements matching `[data-component='map']`.
- The component appends a child `<svg>` element with viewBox `0 0 2000 1001`.
- Points use a `<filter id="point-glow">` for the glow effect.
- GSAP and ScrollTrigger must be registered globally before the component loads (they are, via Webflow script tags).
