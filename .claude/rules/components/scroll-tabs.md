# scroll-tabs

## Purpose

Scroll-activated tabbed content with a sticky frame: as the user scrolls, tabs activate sequentially with progress lines, dot indicators toggle, button text turns white, and content panels crossfade. Fully reversible on scroll back. Disabled on mobile (≤991px) where panels stack naturally.

## Webflow Setup

Add to the scroll-tabs component wrapper:

```
data-component="scroll-tabs"
```

Inside the component, add these attributes:

| Attribute          | Value       | Element                                           | Purpose                          |
| ------------------ | ----------- | ------------------------------------------------- | -------------------------------- |
| `data-scroll-tabs` | `frame`     | `.scroll-tabs-frame`                              | Sticky container (tabs + panels) |
| `data-scroll-tabs` | `button`    | Each `button.scroll-tabs_buttons_button`          | Tab label (grey/white toggle)    |
| `data-scroll-tabs` | `dot`       | Each `.scroll-tabs_icon` (buttons area only)      | Red dot (grayscale toggle)       |
| `data-scroll-tabs` | `dot-blur`  | Each `.scroll-tabs_icon-blur` (buttons area only) | Dot glow effect                  |
| `data-scroll-tabs` | `line-fill` | Each `.scroll-tabs_buttons_line-fill`             | Progress line (scaleX 0→1)       |
| `data-scroll-tabs` | `panel`     | Each `.scroll-tabs_panels_item`                   | Content panel (crossfade)        |

The number of buttons must equal the number of panels (paired by DOM order).

For CMS collection lists, set attributes on the collection item template once — Webflow replicates them across all items.

**Note on `dot-blur`**: The `data-scroll-tabs="dot-blur"` attribute also exists on `.scroll-tabs_icon-blur` elements inside `.scroll-tabs_mobile-name` (within panels). The component scopes its query to `.scroll-tabs_buttons_wrapper` to only target the 6 button-area blurs, ignoring the 6 panel-area blurs which are decorative on mobile.

**Important CSS requirements:**

- `.scroll-tabs-frame` and its ancestors (`.container-large`, `.padding-global`) must NOT have `overflow: hidden` — this breaks sticky positioning.
- `.scroll-tabs_panels_item` elements must use `grid-area: 1 / 1` to stack on top of each other on desktop (already set).

## Behavior

- **Init**:
  1. **Breakpoint check**: If viewport is ≤991px, skips all setup — CSS handles mobile layout (panels stacked, tabs hidden via `.scroll-tabs_buttons_wrapper`, `.scroll-tabs_mobile-name` shown).
  2. **Section height**: Sets the component root height to `(N + 1) * 66vh` where N = number of tabs, creating scroll space for the sticky frame.
  3. **Sticky frame**: Sets `position: sticky` on the frame. Sticky top is computed as `max(navHeight, (viewportHeight - frameHeight) / 2)` — this centers the frame vertically on tall monitors and falls back to sticking below the navbar on shorter screens where the frame wouldn't fit centered. Navbar height is auto-detected from `.navbar_component`.
  4. **Initial state**: First tab is active (dot red + glow, button white, panel visible). All other tabs start inactive (dot greyed out, button inherited color, panel hidden, line empty).
  5. **Scroll progress**: A single ScrollTrigger spans the entire component (`start: 'top top'`, `end: 'bottom bottom'`). Progress is divided into N equal segments, one per tab. Within each segment, the tab's `line-fill` animates `scaleX` from 0 to 1 proportional to local progress.
  6. **Tab activation**: When a tab boundary is crossed:
     - **Forward**: Completed tabs keep their line at 100%, dot stays red, text stays white (accumulates). New tab activates with 0.3s transitions.
     - **Backward**: Future tabs deactivate — dot goes grey, text returns to original color, line resets to 0. Previous panel crossfades back in.
  7. **Panel crossfade**: Active panel fades in (opacity 0→1, 0.3s). The `.scroll-tabs_panels_image` inside the entering panel simultaneously animates from `scale: 0.96, y: 8` to `scale: 1, y: 0` (duration 0.45s, `power2.out`) for a soft zoom-in feel. Previous panel fades out and gets `visibility: hidden` + `pointer-events: none` after the fade. In-progress tweens on both panels and their images are killed before starting new ones to handle fast scrolling.
  8. **Click to scroll**: Each tab button has a click handler that computes the target scroll position from the ScrollTrigger's start/end range and calls `window.scrollTo({ behavior: 'smooth' })`, which Lenis intercepts for smooth scrolling. Click handler is a no-op on mobile (guarded by ScrollTrigger existence check).

  Text merging like `position + name` is now handled by the standalone `concat` component — wrap the relevant fields inside any panel in `<div data-component="concat">` in Webflow.

- **Resize**: Checks breakpoint on every resize. If crossing the 991px threshold:
  - **Desktop → Mobile**: Kills the ScrollTrigger, clears all GSAP inline styles (`height`, `position`, `sticky`, `opacity`, `visibility`, `filter`, `transform`, `color`) — including any `transform` left on `.scroll-tabs_panels_image` elements — so CSS takes over mobile layout.
  - **Mobile → Desktop**: Runs full setup (height, sticky, initial states, ScrollTrigger).
  - On desktop resizes: recalculates sticky top (viewport height may have changed) and calls `ScrollTrigger.refresh()` to recompute scroll ranges.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **Lenis** (via global.js): Intercepts `window.scrollTo` for smooth click-to-scroll behavior.

## DOM Expectations

- One or more elements matching `[data-component='scroll-tabs']` (the component wrapper, e.g. `.scroll-tabs_component`).
- One `[data-scroll-tabs="frame"]` inside each component (`.scroll-tabs-frame`).
- One `.scroll-tabs_buttons_wrapper` inside each component — used to scope `dot-blur` queries.
- Equal number of `[data-scroll-tabs="button"]`, `[data-scroll-tabs="dot"]`, `[data-scroll-tabs="line-fill"]`, and `[data-scroll-tabs="panel"]` elements — paired by DOM order.
- `[data-scroll-tabs="dot-blur"]` elements exist in both the buttons area (6) and panels area (6, inside `.scroll-tabs_mobile-name`). Only the buttons-area blurs are animated by JS.
- Optional `.navbar_component` anywhere on the page — used to compute sticky offset. Falls back to `top: 0` if not found.
- On mobile (≤991px): `.scroll-tabs_buttons_wrapper` is hidden via CSS, `.scroll-tabs_mobile-name` is shown, panels use normal flow (no `grid-area: 1 / 1` stacking).
