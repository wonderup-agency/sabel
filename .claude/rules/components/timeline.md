# timeline

## Purpose

Scroll-activated timeline that lights up a row of sticky dots and draws connecting red lines between them as the user scrolls. The very first line grows in from the bottom of the `.featured-cards_grid` (the row of card-buttons above the dots) down into `icon[0]`; subsequent lines bridge each consecutive pair of dots. Also handles the parallax background and `[data-scroll-to]` smooth-scroll links.

## Webflow Setup

Add to the timeline section container:

```
data-component="timeline"
```

The component finds dots by the class `.featured-card_nav_icon` (one per card, inside `.featured-card_nav-wrapper > .featured-card_nav`). The nav must keep its sticky styling (`position: sticky; top: 8rem`).

If a `.featured-cards_grid` exists inside the section (the row of `.featured-card_button` cards above the dots), the component draws a "first bridge" from its bottom edge down to `icon[0]`.

## Behavior

- **Init**:
  1. Sets `position: relative; z-index: 2` on the timeline container so its content sits above body-level lines (`z-index: 1`).
  2. Finds `.featured-card_nav_icon` dots inside the container. Resolves `--base--grey-2` (inactive) and `--base--red` (active) from the first icon's computed style (with `#4c6280` / `#E10600` fallbacks). Sets all dots to the inactive color via `background-color`, explicitly clears `filter` to `none` (so any leftover Webflow filter on the class doesn't carry over), and hides each `.featured-card_nav_icon-blur` child. Dots are colored divs (typically Webflow mask-image setups) — color is applied to `background-color`, not via filter.
  3. **Activation (two triggers per dot)** — each dot has TWO independent ScrollTriggers tied to its `.featured-card_nav-wrapper` (the non-sticky containing block):
     - **Activate trigger** at `top 50%` with only an `onEnter` handler. Fires when the wrapper's top edge crosses the 50% line of the viewport (forward scroll). The dot's `background-color` snaps to `--base--red` and its `.featured-card_nav_icon-blur` glow snaps to `opacity: 1`. There is intentionally no `onLeaveBack` on this trigger so that refresh-induced state flips (which happen whenever a lazy-loaded image or settling font pushes the trigger ahead of the current scroll) cannot deactivate the dot.
     - **Deactivate trigger** at `top 55%` (5vh BELOW the activation point) with only an `onLeaveBack` handler. The 5vh gap is an explicit hysteresis zone so Lenis micro-jitter and small layout shifts around the activation point can't flicker the dot off. `onLeaveBack` additionally guards on `self.direction !== -1`: during a refresh-induced state change, `direction` stays at the user's last scroll direction (1 if they were scrolling forward) so the deactivation is ignored. Genuine back-scrolls have `direction === -1` and reset the dot to grey-2 + blur opacity 0.
     Each dot also keeps a local `isActive` flag to make `activate` / `deactivate` idempotent.
  4. **Inter-dot bridges** (one per consecutive pair) — a grey track always connecting two dots, with a red line filling via `scaleY 0 → 1` scrub:
     - Grey track div at full height (`background: var(--base--grey-2)`).
     - Red div at full height with `transform-origin: top center` and initial `scaleY: 0`.
     - Container spans from `startEl` center + `LINE_GAP` to `endEl` center − `LINE_GAP`. Recomputed every frame.
     - `LINE_GAP = 16px` clearance around each dot to prevent the line from striking through.
     - ScrollTrigger: `trigger: startWrapper, start: 'top 40%', endTrigger: endWrapper, end: 'top 50%', scrub: true, invalidateOnRefresh: true`. The start is 10vh AFTER the start dot's activation (so the dot lights up clearly first), and the end aligns exactly with the next dot's activation (so the line reaches 100% the same instant the next dot turns red).
     - Appended to `document.body` with class `global-line global-line--bridge`.
  5. **First bridge** (only when `.featured-cards_grid` exists) — from the bottom edge of the grid down to `icon[0]`. Visually distinct from the inter-dot bridges:
     - The grey track is NOT pre-painted full-height — at init it starts at `scaleY: 0` and grows in over the FIRST 20% of the scrub. This avoids a full-length grey track appearing all at once when the user enters the section.
     - The red line scales `0 → 1` over the FULL scrub (linearly follows scroll), exactly like the inter-dot bridges.
     - Implemented as a GSAP timeline driven by a single ScrollTrigger: `trigger: grid, start: 'bottom 50%', endTrigger: icon[0]Wrapper, end: 'top 50%', scrub: true, invalidateOnRefresh: true`. Two tweens on that timeline: `bg → scaleY: 1, duration: 0.2` and `line → scaleY: 1, duration: 1`, both at position 0.
     - Same timeline also fades in the rest of the timeline (see step 6) so the dots and other bridges don't pop in visible while the first bridge is still drawing.
     - Container CSS only sets positioning + overflow:hidden; the visible content is the bg + line children.
     - Appended to `document.body` with class `global-line global-line--bridge global-line--first`.
  6. **Entrance fade-in for the rest of the timeline** — driven by the same first-bridge timeline. All dots and all inter-dot bridge containers are set to `opacity: 0` at init, then a `tl.to(fadeTargets, { opacity: 1, duration: 0.5 }, 0.3)` runs from 30% to 80% of the first bridge scrub. By the time the first bridge completes (and `icon[0]` activates) all other dots and bridges are fully visible.
  7. **Per-tick repositioning** — `gsap.ticker.add(repositionAll)` runs every frame. Each bridge container's `top`, `left`, and `height` are recalculated from `getBoundingClientRect()`. For inter-dot bridges, top = `iconCenter(startIcon).pageY + LINE_GAP` and bottom = `iconCenter(endIcon).pageY − LINE_GAP`. For the first bridge (identified by `isFirst: true`), top = `grid.getBoundingClientRect().bottom + scrollY` and bottom = `iconCenter(icon[0]).pageY − LINE_GAP`. This keeps lines connected to dots through all sticky / flow / pinned transitions without precomputed page coords.
  8. **Parallax background**: if a `[data-timeline="bg"]` element exists inside the container, applies a scrubbed `fromTo` tween tied to the container's scroll range (`top bottom` → `bottom top`). Starts at `yPercent: -100` and ends at `yPercent: 0`. Sets `xPercent: -50` to preserve CSS horizontal centering.
  9. **Scroll-to links**: finds all `[data-scroll-to]` elements on the page, sets each `href` to `#<value>`, and adds a click handler that calls `scrollIntoView({ behavior: 'smooth' })` on the target element.
- **Resize**: Repositions all lines and calls `ScrollTrigger.refresh()` to recompute scrub ranges.

## Debug markers

Every ScrollTrigger in the component has `markers: true`. Color legend (also logged to the console at init):

- **lime** — activation trigger (fires at `top 50%`, only `onEnter`).
- **orange** — deactivation trigger (fires at `top 55%`, only `onLeaveBack` with `direction` guard).
- **cyan** — bridge start (`top 40%` for inter-dot bridges, `bottom 50%` of `.featured-cards_grid` for the first bridge).
- **magenta** — bridge end (`top 50%` — same scroll position as the next dot's activation).

## Dependencies

- **GSAP** (global): `gsap`, `ScrollTrigger` — loaded via Webflow's GSAP integration.
- **CSS variables**: `var(--base--red)` for the bridge red color and the active dot; `var(--base--grey-2, #4c6280)` for the inactive dot color and the static bridge background track. Both are read from the dot's computed style at init; hex fallbacks (`#E10600` / `#4c6280`) cover cases where the Webflow variable isn't defined on the cascading chain.
- **CSS contract**: `.featured-card_nav` must have `position: sticky; top: 8rem`. The sticky positioning is what gives the dots their "pinned in viewport while scrolling through the card" behavior; the component does not read the `8rem` value itself, but the visual rhythm of "dot stays put while you scroll through its content" depends on it.

## DOM Expectations

- One element matching `[data-component='timeline']` (the section container).
- `.featured-card_nav_icon` elements inside the container — one per card, each containing an optional `.featured-card_nav_icon-blur` child for the glow effect. Each must be inside a `.featured-card_nav` (the sticky nav) inside a `.featured-card_nav-wrapper` (the sticky containing block).
- Optional `.featured-cards_grid` inside the container — when present, the first bridge is drawn from its bottom edge down to `icon[0]`. When absent, no first bridge is built.
- Lines are appended to `document.body` as absolutely positioned divs with class `global-line global-line--bridge` (and additionally `global-line--first` for the first bridge).
- `<a data-scroll-to="section-id">` elements anywhere on the page. The value must match an `id` attribute on the target section (e.g., `id="transformation-blueprint"`).
- Optional `[data-timeline="bg"]` element inside the container — absolutely-positioned background image that receives a parallax tween. Expected to be horizontally centered via `left: 50%; transform: translate(-50%)`.
