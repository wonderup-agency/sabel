# testimonial-cards

## Purpose

Animated card stack that cycles through testimonial cards with a fan-right stacking effect and scale-up fade-out transitions.

## Webflow Setup

Add to the testimonials card wrapper element:

```
data-component="testimonial-cards"
```

The element should be `.testimonials_cards-wrapper` containing a `.testimonials_card-list` grid with `.testimonials_card-item` children stacked via `grid-area: 1 / 1`.

## Behavior

- **Init**: For each card, merges the `[data-custom="client-name"]` text into `[data-custom="client-position"]` (appended with ", " separator) and removes the client-name element. Then positions cards in a fan stack — front card at full scale/opacity, cards behind shift right and scale down linearly. Only 3 cards are visible at a time. Every 5 seconds, the front card scales up slightly and fades out, all other cards shift forward in the stack, and the exiting card moves to the back. Loops infinitely. An `IntersectionObserver` (threshold 0.1) watches the wrapper — the cycle interval is cleared when the wrapper leaves the viewport and restarted when it re-enters, so off-screen testimonials don't run animations in the background.
- **Resize**: Not used — card sizing is handled by CSS.

## Dependencies

- **GSAP** (global): `gsap` — loaded via Webflow's GSAP integration.

## DOM Expectations

- Elements matching `[data-component='testimonial-cards']` (`.testimonials_cards-wrapper`).
- `.testimonials_card-item` children inside a `.testimonials_card-list` grid.
- Each card may contain `[data-custom="client-position"]` and `[data-custom="client-name"]` elements. On init, client-name text is appended to client-position and the client-name element is removed.
- Cards must use `grid-area: 1 / 1` to stack on top of each other (already set in Webflow).
