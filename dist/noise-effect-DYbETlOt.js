/*
Component: noise-effect
Webflow attribute: data-component="noise-effect"
*/

const NOISE_SIZE = 2.1;
const DENSITY = 1.0;
const OPACITY = 0.8;
function createNoiseCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(width / NOISE_SIZE));
  canvas.height = Math.max(1, Math.ceil(height / NOISE_SIZE));
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() <= DENSITY) {
      // Multi-color noise: random R, G, B channels independently
      data[i] = Math.random() * 255;
      data[i + 1] = Math.random() * 255;
      data[i + 2] = Math.random() * 255;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas
}

function applyNoise(element) {
  const rect = element.getBoundingClientRect();
  const canvas = createNoiseCanvas(rect.width, rect.height);

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute;
    inset: 0;
    opacity: ${OPACITY};
    pointer-events: none;
    background-image: url(${canvas.toDataURL('image/png')});
    background-size: ${canvas.width * NOISE_SIZE}px ${canvas.height * NOISE_SIZE}px;
    background-repeat: repeat;
    image-rendering: pixelated;
    border-radius: inherit;
    z-index: 1;
  `;
  overlay.setAttribute('data-noise-overlay', '');

  const position = getComputedStyle(element).position;
  if (position === 'static') {
    element.style.position = 'relative';
  }

  element.appendChild(overlay);
  return overlay
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
//# sourceMappingURL=noise-effect-DYbETlOt.js.map
