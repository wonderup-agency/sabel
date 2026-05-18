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
    selector: "[data-component='pricing-calculator']",
    importFn: () => import('./index-BkbH5_Bb.js'),
  },
  {
    selector: "[data-component='cta']",
    importFn: () => import('./cta-C7Xzok-O.js'),
  },
  {
    selector: "[data-component='concat']",
    importFn: () => import('./concat-Dkmqe4_q.js'),
  },
  {
    selector: "[data-component='fin-branch-lines']",
    importFn: () => import('./fin-branch-lines-AcoQOKq7.js'),
  },
  {
    selector: "[data-component='impact']",
    importFn: () => import('./impact-CdKTc8it.js'),
  },
  {
    selector: "[data-component='intercom-timeline']",
    importFn: () => import('./intercom-timeline-CuLobBDH.js'),
  },
  {
    selector: "[data-component='navbar']",
    importFn: () => import('./navbar-BNSckQtX.js'),
  },
  {
    selector: "[data-component='scroll-tabs']",
    importFn: () => import('./scroll-tabs-Dn4EmTPa.js'),
  },
  {
    selector: "[data-component='hero']",
    importFn: () => import('./hero-o735dp5v.js'),
  },
  {
    selector: "[data-component='steps-timeline']",
    importFn: () => import('./steps-timeline-CXaJ_VgZ.js'),
  },
  {
    selector: "[data-component='services-timeline']",
    importFn: () => import('./services-timeline-DvYxQeSX.js'),
  },
  {
    selector: "[data-component='testimonial-cards']",
    importFn: () => import('./testimonial-cards-CgisRjBk.js'),
  },
  {
    selector: "[data-component='logo-marquee']",
    importFn: () => import('./logo-marquee-BfMYFzKA.js'),
  },
  {
    selector: "[data-component='horizontal-line']",
    importFn: () => import('./horizontal-line-b-uTqDLx.js'),
  },
  {
    selector: "[data-component='vertical-line']",
    importFn: () => import('./vertical-line-DnCc4Moi.js'),
  },
  {
    selector: "[data-component='timeline']",
    importFn: () => import('./timeline-DzvIxXoV.js'),
  },
  {
    selector: "[data-component='home']",
    importFn: () => import('./home-CI2VQXJB.js'),
  },
  {
    selector: "[data-component='map']",
    importFn: () => import('./map-DugobWli.js'),
  },
  {
    selector: "[data-component='noise-effect']",
    importFn: () => import('./noise-effect-6vKdCfkA.js'),
  },
];

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
});
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const module = await import('./global-C5GtwVv2.js');
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
});
//# sourceMappingURL=main.js.map
