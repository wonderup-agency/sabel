// --------------------------------------------------
// Component Registry
// --------------------------------------------------
// Each entry maps a data-component attribute to a lazy import.
// Components only load when their selector exists on the page.
//
// 3 ways to add a component:
//
// 1. Ask Claude  → "create a component called calculator"
// 2. Terminal    → npm run create-component -- calculator
// 3. Dashboard   → npm start → Create → Component → type "calculator"
//
// All three scaffold the file and add an entry here automatically.
// --------------------------------------------------

export default [
  {
    selector: "[data-component='fin-branch-lines']",
    importFn: () => import('./components/fin-branch-lines.js'),
  },
  {
    selector: "[data-component='impact']",
    importFn: () => import('./components/impact.js'),
  },
  {
    selector: "[data-component='intercom-timeline']",
    importFn: () => import('./components/intercom-timeline.js'),
  },
  {
    selector: "[data-component='navbar']",
    importFn: () => import('./components/navbar.js'),
  },
  {
    selector: "[data-component='scroll-tabs']",
    importFn: () => import('./components/scroll-tabs.js'),
  },
  {
    selector: "[data-component='hero']",
    importFn: () => import('./components/hero.js'),
  },
  {
    selector: "[data-component='steps-timeline']",
    importFn: () => import('./components/steps-timeline.js'),
  },
  {
    selector: "[data-component='services-timeline']",
    importFn: () => import('./components/services-timeline.js'),
  },
  {
    selector: "[data-component='testimonial-cards']",
    importFn: () => import('./components/testimonial-cards.js'),
  },
  {
    selector: "[data-component='logo-marquee']",
    importFn: () => import('./components/logo-marquee.js'),
  },
  {
    selector: "[data-component='horizontal-line']",
    importFn: () => import('./components/horizontal-line.js'),
  },
  {
    selector: "[data-component='vertical-line']",
    importFn: () => import('./components/vertical-line.js'),
  },
  {
    selector: "[data-component='timeline']",
    importFn: () => import('./components/timeline.js'),
  },
  {
    selector: "[data-component='home']",
    importFn: () => import('./components/home.js'),
  },
  {
    selector: "[data-component='map']",
    importFn: () => import('./components/map.js'),
  },
  {
    selector: "[data-component='noise-effect']",
    importFn: () => import('./components/noise-effect.js'),
  },
]
