# timeline

## Purpose

Scroll-activated timeline with two kinds of red lines per dot: a **trail** (grows upward from the dot while its nav is sticky, like a trail showing where the dot has been in page coords) and a **bridge** (red fills a grey track from dot[i] down to dot[i+1] during the transition phase when dot[i] unsticks). Bullets activate when the bridge reaches them. Also handles the parallax background and `[data-scroll-to]` smooth-scroll links.

## Webflow Setup

Add to the timeline section container:

```
data-component="timeline"
```

The component finds bullets by the class `.featured-card_nav_icon` (one per card, inside `.featured-card_nav-wrapper > .featured-card_nav`). The nav must keep its sticky styling (`position: sticky; top: 8rem`) — the line geometry is computed from that exact `top` value.

The first line uses the bottom of `.featured-cards_grid`'s first child as its origin (the row of card buttons feeds the first line down into bullet #1). This first line is hidden on viewports ≤ 991px.

No `.line_start` / `.line_end` markers are needed — the previous attribute-based pairing has been removed.

## Behavior

- **Init**:
  1. Sets `position: relative; z-index: 2` on the timeline container so its content sits above body-level lines (`z-index: 1`).
  2. Finds `.featured-card_nav_icon` bullets inside the container and sets them to inactive: `filter: grayscale(1) brightness(0.6)`, with `.featured-card_nav_icon-blur` child hidden.
  3. Builds an ordered list of pairs:
     - **Grid-start pair** (optional): bottom of `.featured-cards_grid`'s first child → `icon[0]`. Hidden on viewports ≤ 991px.
     - **Icon pairs**: `icon[i]` → `icon[i+1]` for each consecutive pair.
       Each pair's "end" bullet is the one that activates when the line completes.
  4. **Trails (one per icon)** — a red-only line that grows upward from the dot while its nav is sticky. No grey track, no GSAP scrub — just a container whose height is recomputed every frame:
     - **Top**: `icon[i].naturalCenterPageY` — the icon's center in page coords at its original layout position. Derived from the wrapper (which is never sticky) so it's correct regardless of current scroll position.
     - **Bottom**: `icon[i].currentCenterPageY − LINE_GAP` — the icon's center right now minus a gap to avoid overlapping the dot.
     - While the icon is in its natural position (not yet sticky), `bottom ≈ top`, so height ≈ 0 and the trail is hidden.
     - While sticky, the icon's page Y increases with scroll, so the trail grows (the dot "leaves a trail above").
     - After unstick, the icon's page Y is fixed (pinned to wrapper bottom), so the trail stays at max height and scrolls off-screen naturally.
     - Appended to `document.body` with class `global-line global-line--trail`.
  5. **Bridges (one per consecutive pair + grid-start)** — a grey track always connecting two dots, with a red line filling via `scaleY 0→1` scrub:
     - Grey track div at full height (`background: var(--base--grey)`).
     - Red div at full height (`transform-origin: top center`, `scaleY: 0`).
     - Container spans from `startEl` center + `LINE_GAP` to `endEl` center − `LINE_GAP`. Recomputed every frame.
     - `LINE_GAP = 16px` clearance around each dot to prevent the line from striking through.
     - Appended to `document.body` with class `global-line global-line--bridge`.
  6. **Bridge scrub ranges** — red fills during the TRANSITION phase (after startEl unsticks, before endEl becomes sticky):
     - **Icon bridge start**: `scrollAtUnstick(icon[i])` — the moment `icon[i]`'s sticky nav can no longer fit at `top: 8rem` and starts scrolling up.
     - **Icon bridge end**: `scrollAtSticky(icon[i+1])` — the moment `icon[i+1]`'s nav reaches `top: 8rem`.
     - **Grid-start bridge start**: `gridStart.bottomPageY − 8rem` (when the grid's bottom edge passes `top: 8rem`).
     - **Grid-start bridge end**: `scrollAtSticky(icon[0])` (when `icon[0]` becomes sticky).
       Both `scrollAtSticky` and `scrollAtUnstick` derive positions from the wrapper element (never sticky itself), so they return correct values regardless of the nav's current sticky/pinned state.
       Reverses on scroll back (`scrub: true`). `invalidateOnRefresh: true` recomputes on resize.
  7. **Bullet activation** — each bridge's `onUpdate` watches scrub progress: when it crosses `PROGRESS_THRESHOLD = 0.98`, the END bullet animates to active state (`filter: grayscale(0) brightness(1)` + `.featured-card_nav_icon-blur` opacity 1). Reverses below threshold.
  8. **Per-tick repositioning** — `gsap.ticker.add(repositionAll)` runs every frame. Each bridge and trail container's `top`, `left`, and `height` are recalculated from `getBoundingClientRect()`. This keeps lines connected to dots through all sticky/flow/transition states without precomputed page coords.
  9. **Parallax background**: if a `[data-timeline="bg"]` element exists inside the container, applies a scrubbed `fromTo` tween tied to the container's scroll range (`top bottom` → `bottom top`). Starts at `yPercent: -100` and ends at `yPercent: 0`. Sets `xPercent: -50` to preserve CSS horizontal centering.
  10. **Scroll-to links**: finds all `[data-scroll-to]` elements on the page, sets each `href` to `#<value>`, and adds a click handler that smooth-scrolls to the target element by ID.
- **Resize**: Recomputes each trail's `naturalCenterY` (via the wrapper-based helper), repositions all lines, and calls `ScrollTrigger.refresh()` to recompute scrub ranges.

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **CSS variables**: `var(--base--red)` for trail and bridge red color, and bullet color; `var(--base--grey)` for the static bridge background track.
- **CSS contract**: `.featured-card_nav` must have `position: sticky; top: 8rem`. The component reads this as a constant (`STICKY_TOP_PX = 8 * 16`); changing the CSS without updating the constant will misalign the trail timing.

## DOM Expectations

- One element matching `[data-component='timeline']` (the section container).
- `.featured-card_nav_icon` elements inside the container — one per card, each containing an optional `.featured-card_nav_icon-blur` child for the glow effect. Each must be inside a `.featured-card_nav` (the sticky nav) inside a `.featured-card_nav-wrapper` (the sticky containing block).
- Optional `.featured-cards_grid` inside the container — its first child element is used as the origin of the first line (the grid-start pair). Hidden on viewports ≤ 991px.
- Lines are appended to `document.body` as absolutely positioned divs with class `global-line`.
- `<a data-scroll-to="section-id">` elements anywhere on the page. The value must match an `id` attribute on the target section (e.g., `id="transformation-blueprint"`).
- Optional `[data-timeline="bg"]` element inside the container — absolutely-positioned background image that receives a parallax tween. Expected to be horizontally centered via `left: 50%; transform: translate(-50%)`.
