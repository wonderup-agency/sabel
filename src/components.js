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
