# noise-effect

## Purpose

Applies an animated dark film-grain noise overlay to elements. Uses a canvas-generated texture with CSS keyframe animation for a subtle flickering grain effect. The overlay uses `mix-blend-mode: screen` so the dark noise only darkens dark areas and becomes invisible over white/light content (e.g. white headings remain pure white).

## Webflow Setup

Add to any element in Webflow:

```
data-component="noise-effect"
```

The element can be any block-level element (div, section, etc.). The component will set `position: relative` on the parent if it is statically positioned. If the matched element is an `<img>` (a void element that can't contain children), the overlay is applied to its parent instead.

## Behavior

- **Init**: Generates a single 256×256 canvas noise texture (dark monochrome, pixel values 0–40). Injects a `@keyframes noise-shift` rule into `<head>`. Applies the texture as a tiled, absolutely-positioned overlay on each matching element (or its parent, if the matched element is an `<img>`) with `mix-blend-mode: screen` — screen blending with a dark texture leaves light pixels unchanged and only darkens dark pixels, so white text/UI underneath stays pure white. If the parent's computed position is `static`, it is set to `relative` so the overlay can anchor correctly. The overlay animates `background-position` in 4 steps over 0.3s on infinite loop, creating a film-grain flicker at 33% opacity (fades in over 5s on load).
- **Resize**: Not used — the tiled background and absolute positioning handle responsive sizing automatically.

## Dependencies

None.

## DOM Expectations

- Elements matching `[data-component='noise-effect']`.
- The component creates a child `<div data-noise-overlay>` inside each element. Ensure element content uses appropriate z-index if stacking is needed (the overlay has `pointer-events: none` and `z-index: 99999`).
- A `<style>` element is injected into `<head>` with the `noise-shift` keyframes (once, shared across all instances).
