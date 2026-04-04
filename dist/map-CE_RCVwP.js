/*
Component: map
Webflow attribute: data-component="map"
*/

// Simplified low-poly world map paths (continents as geometric shapes)
const continents = [
  // North America
  'M 80 95 L 95 75 L 115 68 L 140 65 L 165 58 L 195 55 L 220 58 L 235 68 L 240 80 L 250 90 L 248 105 L 240 115 L 230 125 L 220 135 L 205 140 L 195 148 L 180 155 L 170 165 L 155 170 L 140 168 L 125 160 L 115 150 L 105 140 L 95 130 L 85 120 L 80 110 Z',
  // South America
  'M 175 185 L 190 180 L 205 185 L 215 195 L 220 210 L 225 230 L 222 250 L 218 270 L 210 285 L 200 295 L 190 300 L 180 295 L 172 280 L 168 265 L 165 245 L 162 225 L 165 205 L 170 195 Z',
  // Europe
  'M 365 58 L 380 55 L 400 52 L 415 55 L 425 60 L 430 68 L 428 78 L 420 85 L 410 90 L 395 92 L 380 90 L 370 85 L 362 78 L 358 68 Z',
  // Africa
  'M 370 115 L 385 108 L 400 105 L 420 108 L 435 115 L 440 130 L 442 150 L 440 170 L 435 190 L 425 205 L 415 215 L 405 220 L 395 218 L 385 210 L 378 200 L 372 185 L 368 165 L 365 145 L 365 130 Z',
  // Asia
  'M 430 50 L 460 42 L 495 38 L 530 35 L 565 38 L 595 42 L 625 48 L 650 55 L 665 65 L 670 78 L 668 90 L 660 100 L 645 108 L 625 115 L 600 118 L 575 120 L 550 122 L 530 125 L 510 128 L 490 125 L 470 118 L 455 108 L 442 95 L 435 82 L 430 68 Z',
  // India / Southeast Asia
  'M 540 130 L 555 128 L 570 132 L 580 142 L 585 155 L 580 168 L 570 175 L 555 172 L 545 162 L 538 150 L 535 140 Z',
  // Indonesia / Oceania
  'M 595 165 L 610 160 L 630 158 L 648 162 L 660 170 L 665 180 L 658 188 L 645 192 L 625 190 L 608 185 L 598 178 Z',
  // Australia
  'M 620 210 L 645 200 L 670 198 L 695 202 L 710 212 L 715 228 L 708 242 L 695 252 L 675 258 L 655 255 L 638 248 L 625 238 L 618 225 Z',
  // Japan / Korea region
  'M 640 68 L 650 62 L 660 65 L 665 75 L 660 85 L 650 88 L 642 82 L 638 75 Z',
  // UK / Iceland
  'M 348 55 L 358 50 L 365 52 L 362 60 L 355 63 L 348 60 Z',
  // Middle East
  'M 430 95 L 445 90 L 460 92 L 470 100 L 468 112 L 458 118 L 445 120 L 435 115 L 430 105 Z',
];

// Glow point locations [x, y] on 750x330 viewBox
const points = [
  // North America
  [135, 85],   // San Francisco
  [155, 90],   // Denver
  [180, 88],   // Chicago
  [200, 92],   // New York
  [160, 105],  // Dallas
  [145, 115],  // LA / Phoenix
  // Europe
  [380, 60],   // London
  [395, 62],   // Paris
  [405, 58],   // Berlin
  [415, 65],   // Rome
  [388, 55],   // Amsterdam
  [400, 68],   // Zurich
  [420, 55],   // Stockholm
  [410, 75],   // Vienna
  // Middle East
  [455, 100],  // Dubai
  [445, 108],  // Saudi
  // Asia
  [540, 70],   // Beijing
  [560, 75],   // Shanghai
  [575, 85],   // Tokyo area
  [555, 95],   // Hong Kong
  [565, 140],  // Bangkok
  [580, 150],  // Singapore
  [548, 145],  // Mumbai
  // Oceania
  [650, 170],  // Jakarta
  [660, 225],  // Sydney
  [680, 235],  // Melbourne
  // South America
  [200, 210],  // Sao Paulo
  [190, 235],  // Buenos Aires
  // Africa
  [395, 135],  // Lagos
  [420, 180],  // Nairobi
];

function createMapSVG() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 750 330');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.style.cssText = 'width:100%;height:100%;display:block;';

  // Defs — glow filter
  const defs = document.createElementNS(svgNS, 'defs');

  // Glow filter for points
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', 'point-glow');
  filter.setAttribute('x', '-300%');
  filter.setAttribute('y', '-300%');
  filter.setAttribute('width', '700%');
  filter.setAttribute('height', '700%');
  const blur = document.createElementNS(svgNS, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '3');
  blur.setAttribute('result', 'blur');
  const merge = document.createElementNS(svgNS, 'feMerge');
  const mergeBlur = document.createElementNS(svgNS, 'feMergeNode');
  mergeBlur.setAttribute('in', 'blur');
  const mergeSource = document.createElementNS(svgNS, 'feMergeNode');
  mergeSource.setAttribute('in', 'SourceGraphic');
  merge.appendChild(mergeBlur);
  merge.appendChild(mergeSource);
  filter.appendChild(blur);
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  // Continent paths
  const continentGroup = document.createElementNS(svgNS, 'g');
  continents.forEach((d) => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', '#2a0a0a');
    path.setAttribute('stroke', 'none');
    continentGroup.appendChild(path);
  });
  svg.appendChild(continentGroup);

  // Glow points
  const pointsGroup = document.createElementNS(svgNS, 'g');
  pointsGroup.setAttribute('filter', 'url(#point-glow)');

  points.forEach(([cx, cy]) => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', '2.5');
    circle.setAttribute('fill', '#E10600');
    circle.classList.add('map-point');
    circle.style.opacity = '0';
    pointsGroup.appendChild(circle);
  });
  svg.appendChild(pointsGroup);

  return svg
}

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='map']
 */
function map (elements) {
  elements.forEach((el) => {
    // Inject the SVG map
    const svg = createMapSVG();
    el.appendChild(svg);

    const allPoints = svg.querySelectorAll('.map-point');

    // GSAP scroll-triggered entrance + breathing pulse
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      // Points fade in staggered on scroll
      gsap.to(allPoints, {
        opacity: 1,
        duration: 0.6,
        stagger: { each: 0.06, from: 'random' },
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      // Continuous breathing pulse after entrance
      gsap.to(allPoints, {
        attr: { r: 3.5 },
        opacity: 0.6,
        duration: 1.8,
        stagger: { each: 0.12, from: 'random', repeat: -1, yoyo: true },
        ease: 'sine.inOut',
        delay: 1.5,
      });
    } else {
      // Fallback: show all points immediately
      allPoints.forEach((p) => { p.style.opacity = '1'; });
    }
  });

  return {
    resize() {},
  }
}

export { map as default };
//# sourceMappingURL=map-CE_RCVwP.js.map
