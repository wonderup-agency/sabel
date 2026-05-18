# services-timeline

## Purpose

Scroll-activated timeline with a chained waterfall animation: SVG path stroke draws → icon-to-icon red bridges fill over gray tracks → icons activate sequentially. All fully reversible on scroll back. The vertical line-track at the top of the section is handled by the `hero` component.

## Webflow Setup

Add to the services timeline section container:

```
data-component="services-timeline"
```

The SVG connector between the line-track and the first icon:

```html
<div
  data-services-timeline="svg-line"
  class="services_timeline-svg-wrapper w-embed"
>
  <svg viewBox="0 0 530 240" ...>
    <path
      d="..."
      stroke="#E10600"
      stroke-width="1"
      vector-effect="non-scaling-stroke"
    ></path>
  </svg>
</div>
```

The SVG wrapper is absolutely positioned at the top of `.services_timeline_list`, translated up by 100% of its own height.

## Behavior

- **Init**:
  1. **Icons**: Resolves `--base--grey-2` (inactive) and `--base--red` (active) from the first icon's computed style (with `#4c6280` / `#E10600` fallbacks). Sets all `.services_timeline_item-header-icon` elements to the inactive color via `background-color`, explicitly clears `filter` to `none` (so any leftover Webflow filter on the class doesn't carry over), and hides their `.services_timeline_item-header-icon-blur` glow children (`opacity: 0`). Icons are colored divs (typically Webflow mask-image setups) — color is applied to `background-color`, not via filter.
  2. **SVG stroke draw**: The SVG uses `preserveAspectRatio="none"` + `vector-effect="non-scaling-stroke"`, which breaks direct `stroke-dashoffset` animation (dashes compute in screen space but `getTotalLength()` returns user-space length). Fix: clones the path into an SVG `<mask>` WITHOUT `vector-effect` (so dashes stay in user space), with a thick white stroke (width 20) to cover the 1px visible stroke at all scaling ratios. Animates the mask path's `strokeDashoffset` from full length to `0` via GSAP scrub (`scrub: 1`) triggered on the SVG wrapper (`top 70%` → `bottom 50%`). When progress reaches 98%, icon 1 activates immediately (background-color tweens grey-2 → red + glow fade-in). Reverses on scroll back.
  3. **Bridges**: For each consecutive icon pair (icon[i] → icon[i+1]), creates body-level absolutely positioned divs: a gray track (`var(--base--grey-2)`) at full height and a red line (`var(--base--red)`) that fills via `scaleY 0→1` scrub. Each bridge's ScrollTrigger uses the start item as trigger (`top center`) and the end item as `endTrigger` (`top center`), with `scrub: true`. When progress reaches 98%, the end icon activates (background-color tweens grey-2 → red over 0.3s). Reverses on scroll back. `LINE_GAP = 16px` clearance above/below each icon prevents lines from striking through the dots.
  4. **Per-tick repositioning**: `gsap.ticker.add(repositionAll)` recalculates every bridge container's `top`, `left`, and `height` from `getBoundingClientRect()` each frame, keeping lines connected to icons through all layout states.
- **Resize**: Repositions all bridges and calls `ScrollTrigger.refresh()` to recompute scrub ranges.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **CSS variables**: `var(--base--red)` for line color and the active icon, `var(--base--grey-2, #4c6280)` for the inactive icon color and bridge background tracks. Both vars are read from the icon's computed style at init; hex fallbacks (`#E10600` / `#4c6280`) cover cases where the Webflow variable isn't defined on the cascading chain.

## DOM Expectations

- One element matching `[data-component='services-timeline']` (the section container).
- `[data-services-timeline="svg-line"]` containing an SVG with a single `<path>` element — the connector between the line-track and the first icon.
- 6 `.services_timeline_item` elements, each containing a `.services_timeline_item-header-icon` with an optional `.services_timeline_item-header-icon-blur` child for the glow effect.
- Bridge lines are appended to `document.body` as absolutely positioned divs with class `global-line global-line--bridge`.
