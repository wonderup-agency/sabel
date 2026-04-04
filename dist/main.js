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

var components = [
  {
    selector: "[data-component='home']",
    importFn: () => import('./home-BZ_DzM3l.js'),
  },
  {
    selector: "[data-component='map']",
    importFn: () => import('./map-DA2ie7OE.js'),
  },
  {
    selector: "[data-component='noise-effect']",
    importFn: () => import('./noise-effect-Dl0ZilEP.js'),
  },];

function getComponentName(selector) {
  const match = selector.match(/data-component=['"](.*?)['"]/);
  return match ? match[1] : 'unknown'
}

const activeComponents = [];

async function loadComponent({ selector, importFn }) {
  const componentName = getComponentName(selector);
  try {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return
    const module = await importFn();

    if (typeof module.default === 'function') {
      console.log(
        `%c⚡ [main.js] Loading ${componentName}`,
        'color: #a78bfa; font-weight: bold'
      );
      const result = module.default(Array.from(elements));

      if (result && typeof result === 'object') {
        activeComponents.push({ name: componentName, hooks: result });
      }
    } else {
      console.warn(
        `%c⚠️ [main.js] No valid default function found in ${componentName}.js`,
        'color: #fbbf24; font-weight: bold'
      );
    }
  } catch (error) {
    console.error(
      `%c❌ [main.js] Failed to load ${componentName}:`,
      'color: #f87171; font-weight: bold',
      error
    );
  }
}

// Wire up lifecycle hooks
window.addEventListener('resize', () => {
  activeComponents.forEach(({ hooks }) => {
    if (typeof hooks.resize === 'function') hooks.resize();
  });
})
;(async () => {
  try {
    const module = await import('./global-BVb-b-2F.js');
    if (typeof module.default === 'function') {
      console.log(
        '%c🌍 [main.js] Loading global function',
        'color: #a78bfa; font-weight: bold'
      );
      module.default();
    } else {
      console.warn(
        '%c⚠️ [main.js] No valid default function found in global.js',
        'color: #fbbf24; font-weight: bold'
      );
    }
  } catch (error) {
    console.error(
      '%c❌ [main.js] Failed to load global function:',
      'color: #f87171; font-weight: bold',
      error
    );
  }
  await Promise.all(components.map(loadComponent));
})();
//# sourceMappingURL=main.js.map
