/*
Component: noise-effect
Webflow attribute: data-component="noise-effect"
*/

const NOISE_SIZE = 2.1;
const DENSITY = 1.0;
const OPACITY = 0.15;

const voidElements = new Set([
  'IMG',
  'INPUT',
  'BR',
  'HR',
  'META',
  'LINK',
  'SOURCE',
]);

function wrapElement(element) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: relative;
    display: inline-block;
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
  `;
  // Copy layout-relevant classes/styles
  const computed = getComputedStyle(element);
  wrapper.style.borderRadius = computed.borderRadius;
  wrapper.style.overflow = 'hidden';

  element.parentNode.insertBefore(wrapper, element);
  wrapper.appendChild(element);

  // Make the image fill the wrapper
  element.style.display = 'block';
  element.style.width = '100%';
  element.style.height = '100%';

  return wrapper
}

function createNoiseCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const step = Math.max(1, Math.round(NOISE_SIZE));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (Math.random() > DENSITY) continue
      const r = (Math.random() * 255) | 0;
      const g = (Math.random() * 255) | 0;
      const b = (Math.random() * 255) | 0;

      for (let dy = 0; dy < step && y + dy < height; dy++) {
        for (let dx = 0; dx < step && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas
}

function applyNoise(container) {
  const width = Math.max(1, Math.round(container.offsetWidth));
  const height = Math.max(1, Math.round(container.offsetHeight));

  const canvas = createNoiseCanvas(width, height);
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: ${OPACITY};
    pointer-events: none;
    border-radius: inherit;
    z-index: 1;
  `;
  canvas.setAttribute('data-noise-overlay', '');

  container.appendChild(canvas);
  return canvas
}

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='noise-effect']
 */
function noiseEffect (elements) {
  const entries = [];

  elements.forEach((element) => {
    // Void elements (img, input, etc.) can't have children — wrap them first
    const container = voidElements.has(element.tagName)
      ? wrapElement(element)
      : element;

    const position = getComputedStyle(container).position;
    if (position === 'static') {
      container.style.position = 'relative';
    }

    entries.push({ container, overlay: applyNoise(container) });
  });

  return {
    resize() {
      entries.forEach((entry) => {
        entry.overlay.remove();
        entry.overlay = applyNoise(entry.container);
      });
    },
  }
}

export { noiseEffect as default };
//# sourceMappingURL=noise-effect-CsrJNbsy.js.map
