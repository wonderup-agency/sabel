# noise-effect

## Purpose

Applies a multicolor noise texture overlay to elements, replicating Figma's noise fill effect (Multi mode, size 2.1, density 100%, opacity 15%).

## Webflow Setup

Add to any element in Webflow:

```
data-component="noise-effect"
```

The element can be any block-level element (div, section, etc.). The component will set `position: relative` if the element is statically positioned.

## Behavior

- **Init**: Generates a canvas-based multicolor noise texture and applies it as an absolutely-positioned overlay on each matching element. The noise uses random RGB values per pixel (Multi mode), scaled by the noise size factor (2.1px), at 15% opacity.
- **Resize**: Regenerates the noise overlay to match the new element dimensions.

## Dependencies

None.

## DOM Expectations

- Elements matching `[data-component='noise-effect']`.
- The component creates a child `<div data-noise-overlay>` inside each element. Ensure element content uses appropriate z-index if stacking is needed (the overlay has `pointer-events: none` and `z-index: 1`).
