import components from './components.js'

function getComponentName(selector) {
  const match = selector.match(/data-component=['"](.*?)['"]/)
  return match ? match[1] : 'unknown'
}

const activeComponents = []

async function loadComponent({ selector, importFn }) {
  const componentName = getComponentName(selector)
  try {
    const elements = document.querySelectorAll(selector)
    if (elements.length === 0) return
    const module = await importFn()

    if (typeof module.default === 'function') {
      console.log(
        `%c⚡ [main.js] Loading ${componentName}`,
        'color: #a78bfa; font-weight: bold'
      )
      const result = module.default(Array.from(elements))

      if (result && typeof result === 'object') {
        activeComponents.push({ name: componentName, hooks: result })
      }
    } else {
      console.warn(
        `%c⚠️ [main.js] No valid default function found in ${componentName}.js`,
        'color: #fbbf24; font-weight: bold'
      )
    }
  } catch (error) {
    console.error(
      `%c❌ [main.js] Failed to load ${componentName}:`,
      'color: #f87171; font-weight: bold',
      error
    )
  }
}

// Wire up lifecycle hooks.
//
// iOS Safari fires `resize` every time the address bar shows/hides during a
// scroll. That's a HEIGHT-only change, but several components' resize() hooks
// call ScrollTrigger.refresh() — a heavy synchronous recalc that interrupts
// native momentum scroll and makes it "stick" mid-flick. So on mobile we ignore
// resizes where the viewport WIDTH didn't change (the address-bar case); real
// layout changes (orientation flip, desktop window resize) still pass through.
// We also debounce so a burst of resize events collapses into a single refresh.
const RESIZE_MOBILE_MAX = 991
const RESIZE_DEBOUNCE_MS = 200
let lastViewportWidth = window.innerWidth
let resizeTimer = null

function runResizeHooks() {
  activeComponents.forEach(({ hooks }) => {
    if (typeof hooks.resize === 'function') hooks.resize()
  })
}

window.addEventListener('resize', () => {
  const width = window.innerWidth
  // Mobile + width unchanged = browser chrome toggling. Ignore it.
  if (width <= RESIZE_MOBILE_MAX && width === lastViewportWidth) return
  lastViewportWidth = width
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(runResizeHooks, RESIZE_DEBOUNCE_MS)
})
async function init() {
  try {
    const module = await import('./components/global.js')
    if (typeof module.default === 'function') {
      console.log(
        '%c🌍 [main.js] Loading global function',
        'color: #a78bfa; font-weight: bold'
      )
      module.default()
    } else {
      console.warn(
        '%c⚠️ [main.js] No valid default function found in global.js',
        'color: #fbbf24; font-weight: bold'
      )
    }
  } catch (error) {
    console.error(
      '%c❌ [main.js] Failed to load global function:',
      'color: #f87171; font-weight: bold',
      error
    )
  }
  await Promise.all(components.map(loadComponent))
}

// As a dynamically-injected ES module loaded from the CDN, main.js can execute
// either before OR after DOMContentLoaded depending on network speed. Registering
// a DOMContentLoaded listener after the event already fired means it never runs —
// that's why "sometimes" no JS loads at all. Guard on readyState instead.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
