/*
Component: noise-effect
Webflow attribute: data-component="noise-effect"
*/

const NOISE_SIZE = 2.1;
const DENSITY = 1.0;
const OPACITY = 0.8;

function applyNoise(element) {
  const rect = element.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

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

      // Fill a step x step block with the same color
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

  const position = getComputedStyle(element).position;
  if (position === 'static') {
    element.style.position = 'relative';
  }

  element.appendChild(canvas);
  return canvas
}

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='noise-effect']
 */
function noiseEffect (elements) {
  const overlays = [];

  elements.forEach((element) => {
    overlays.push({ element, overlay: applyNoise(element) });
  });

  return {
    resize() {
      overlays.forEach(({ element, overlay }) => {
        overlay.remove();
        const newOverlay = applyNoise(element);
        overlays.find((o) => o.element === element).overlay = newOverlay;
      });
    },
  }
}

export { noiseEffect as default };
//# sourceMappingURL=noise-effect-Df6UXccG.js.map
