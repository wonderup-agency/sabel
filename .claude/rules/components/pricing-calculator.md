# pricing-calculator

## Purpose

Self-building interactive pricing calculator for the Pricing page. Renders the entire qualifier zone (Intercom setup + migration + team size), builder zone (toggleable components grouped by pillar, optional migration card with platform select + ticket-volume slider, retainer tier picker), sticky right-hand price panel (currency switcher, total, breakdown, CTAs), and a reveal-gate modal — all from a single empty container in Webflow. Prices are calculated in real time as the user toggles, counts, and changes complexity. Final prices stay hidden until the user submits the modal form (name + company), which posts the full configuration to a Vercel webhook.

## Webflow Setup

Add a single empty container with this attribute on the Pricing page (the calculator owns everything inside the container):

```html
<div data-component="pricing-calculator"></div>
```

The container should sit inside your normal page layout (e.g. inside `.padding-global > .container-large`). The hero is **not** rendered by this component — build the hero separately in Webflow above this container.

The reveal-gate modal is appended to `document.body` (outside the container) so it overlays the navbar and any other page chrome.

## Behavior

- **Init** (per matching container):
  1. Initialises state from `CONFIG` (in `config.js`): all components disabled by default, default counts/complexity per component, default migration values, no retainer selected, currency from `localStorage('sabelCurrency')` or `'AUD'` if absent, prices hidden until reveal.
  2. Builds the static shell once: scoping grid (left column with both zones, right aside with the price panel), then re-renders the components list and price panel on every state change.
  3. **Qualifier wiring**: the `Setup` radios (`new` / `existing`), the `Migration required` checkbox (toggling this re-renders the builder to show/hide the Migration card), and the team-size pill group (kept in scope for the submission payload but does not affect price).
  4. **Builder wiring** (re-rendered on every state change):
     - Components are grouped by `pillar` in array order, each rendered as a card with toggle + (when enabled) counter + Simple/Moderate/Complex pill picker.
     - Migration card renders only when migration is enabled — has a platform `<select>` and a 0–2,000,000 ticket-volume slider. Slider input updates the price panel + the card's own price label live without re-rendering the rest of the builder (avoids dropping focus mid-drag).
     - Retainer card renders 5 tiers as clickable pills; only one selectable at a time. A "Remove retainer" button appears once a tier is selected.
  5. **Price panel**:
     - Total displays `$ —` (muted) until prices are revealed; afterward shows the project subtotal in the selected currency.
     - Breakdown lists each enabled component (with count) and migration if enabled, then a project subtotal row, then optional retainer rows (monthly + first-quarter commitment).
     - Currency pill (`USD / AUD / EUR / GBP`) switches between FX rates and persists to `localStorage('sabelCurrency')`.
     - Primary CTA reads "Calculate my engagement" before reveal (opens the modal) and "Book a discovery call" after (opens `bookingUrl` in a new tab). Secondary "Download estimate (PDF)" button is hidden before reveal.
     - Changing setup or migration after reveal **un-reveals** the price (forces re-submission with current state).
  6. **Modal (reveal gate)**:
     - Built once and appended to `document.body`. Two text inputs (name + company), both required.
     - On open: calls `getLenis().stop()` from `global.js` and sets `document.body.style.overflow = 'hidden'` to lock page scroll. On close: reverses both. Locks idempotently.
     - On submit: validates fields client-side, builds a JSON payload (full state — components, migration, retainer, pricing, contact, meta) and POSTs it to `submissionEndpoint`. On success: stores contact, sets `priceRevealed = true`, closes modal, re-renders. On failure: shows inline error, allows retry. Network errors are caught and shown to the user.
     - Closes on backdrop click, ESC key, or the `×` button.
  7. **PDF download (lazy-loaded)**:
     - First click on "Download estimate (PDF)" injects the jsPDF UMD bundle from `CONFIG.jspdfCdnUrl` (single load, cached in `jspdfLoadPromise` to handle rapid clicks). Subsequent clicks reuse `window.jspdf.jsPDF`.
     - Generates an A4 PDF mirroring the price-panel breakdown (header, setup details, components with hours, migration if enabled, project subtotal, retainer if selected, footer disclaimer).
     - On generation failure: alerts the user, restores button state.

- **Resize**: Not used — CSS handles responsive layout (two-column grid collapses to one column at 991px to match the rest of the site).

## Dependencies

- **`./config.js`**: All pricing data (hourly rate, FX rates, complexity multipliers, components, migration tiers, retainer tiers, booking URL, submission endpoint, jsPDF CDN URL). Edit this file to change prices.
- **`../global.js`**: Imports the named export `getLenis()` to pause Lenis when the modal opens. Returns `null` if `global.js` hasn't initialised yet — the lock falls back to `body.overflow: hidden` only.
- **jsPDF (lazy-loaded from CDN)**: `CONFIG.jspdfCdnUrl` (default: `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`). Only loaded when the user clicks "Download estimate (PDF)". Not bundled — does not affect initial page weight.
- **Submission endpoint**: `CONFIG.submissionEndpoint` (default: `https://sabel-webhook.vercel.app/api/calculator-submit`). The endpoint validates and forwards the payload to the Sabel inbox via Resend.
- **CSS variables** (Webflow): `--base--black`, `--base--white`, `--base--red`, `--base--grey`, `--_typography---family--body` (DM Sans), `--_typography---family--taglines` (DM Mono). Each is wrapped with a fallback so the calculator still renders if a variable is missing. Component-specific tones (card surface `#161618`, border `#2A3547`, etc.) are hard-coded inside the calculator's local variable namespace (`--pc-*`).

## DOM Expectations

- One element matching `[data-component='pricing-calculator']`. The container must be empty — its `innerHTML` is replaced on init.
- The calculator's CSS is scoped under `[data-component='pricing-calculator']`, so styles do not leak to the rest of the page. The modal's selectors are global (`.pc-modal-*`) because the modal is appended to `document.body`.
- No specific width is required — the inner two-column grid auto-fits the container width and collapses to a single column below 991px.

## Editing prices and adding components

All numeric data lives in `src/components/pricing-calculator/config.js`:

- **Components**: edit the `components` array. Each entry needs `id`, `pillar` (group label), `name`, `desc`, `learnMore`, `unitLabel` (singular form — pluralised automatically), `baseHours`, `defaultCount`, `maxCount`, `defaultComplexity` (`Simple` / `Moderate` / `Complex`), `addable`, `defaultEnabled`. Hours are multiplied by `count` and `complexity` multiplier, then by `hourlyRate` for USD price.
- **Currencies / FX**: edit `fx` and `currencySymbol` to add or change currencies. The currency pill renders in the order the buttons appear in `index.js` (USD, AUD, EUR, GBP) — to add a new one, edit both `config.js` and the `<button data-currency="…">` block in the price-panel shell HTML.
- **Migration tiers**: edit `migration.tiers`. Order ASCENDING by `qty`. The component computes the largest tier `i` where `qty >= tier[i].qty`, then adds `(qty − tier[i].qty) × tier[i+1].perTicket` (or the same tier's rate if at the top).
- **Retainer tiers**: edit `retainerTiers`. The `pricing` object holds prices in each currency directly (no FX conversion is applied — these are quoted client prices, not USD \* FX).
- **Endpoints / URLs**: `bookingUrl`, `submissionEndpoint`, `jspdfCdnUrl`.

## Notes

- Currency selection persists across visits via `localStorage('sabelCurrency')`. Falls back to `AUD` on first visit or in private browsing.
- Validation is client-side only — the webhook should re-validate.
- The submission payload includes the full state at submit time, but if the user changes their setup or migration toggle afterward, the price re-hides until they re-submit.
- The component does not animate on load (instant render) — Webflow owns the hero entrance above it.
