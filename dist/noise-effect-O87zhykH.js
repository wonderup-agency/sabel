/*
Component: noise-effect
Webflow attribute: data-component="noise-effect"
*/

const OPACITY = 0.33;
const TEXTURE_SIZE = 256;

let noiseDataUrl = null;
let styleInjected = false;

function generateNoiseTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 40;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png')
}

function injectKeyframes() {
  if (styleInjected) return
  const style = document.createElement('style');
  style.textContent = `
    @keyframes noise-shift {
      0% { background-position: 0 0; }
      25% { background-position: -${TEXTURE_SIZE}px ${TEXTURE_SIZE / 2}px; }
      50% { background-position: ${TEXTURE_SIZE / 2}px -${TEXTURE_SIZE}px; }
      75% { background-position: -${TEXTURE_SIZE / 2}px ${TEXTURE_SIZE / 3}px; }
      100% { background-position: ${TEXTURE_SIZE}px 0; }
    }
  `;
  document.head.appendChild(style);
  styleInjected = true;
}

function applyNoise(element) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    border-radius: inherit;
    z-index: 99999;
    background-image: url(${noiseDataUrl});
    background-repeat: repeat;
    animation: noise-shift 0.3s steps(4) infinite;
    transition: opacity 5s ease;
    mix-blend-mode: screen;
  `;
  overlay.setAttribute('data-noise-overlay', '');

  const isVoid = element instanceof HTMLImageElement;
  const parent = isVoid ? element.parentElement : element;

  const position = getComputedStyle(parent).position;
  if (position === 'static') {
    parent.style.position = 'relative';
  }
  // parent.style.isolation = 'isolate'

  parent.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = OPACITY;
  });
  return { overlay, parent }
}

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='noise-effect']
 */
function noiseEffect (elements) {
  noiseDataUrl = generateNoiseTexture();
  injectKeyframes();

  elements.forEach((element) => {
    applyNoise(element);
  });
}

export { noiseEffect as default };
//# sourceMappingURL=noise-effect-O87zhykH.js.map
