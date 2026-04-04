/*
Component: global-line
Webflow attribute: data-component="global-line"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='global-line']
 */
function globalLine () {
  const lines = [];

  function getCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + rect.height / 2 + window.scrollY,
    }
  }

  const lineWidth = 2;

  function createLines() {
    // Find all line-start elements and group by number
    const starts = document.querySelectorAll('[line-start]');
    const ends = document.querySelectorAll('[line-end]');

    // Build a map of end elements by their number
    const endMap = {};
    ends.forEach((el) => {
      endMap[el.getAttribute('line-end')] = el;
    });

    starts.forEach((startEl) => {
      const id = startEl.getAttribute('line-start');
      const endEl = endMap[id];
      if (!endEl) return

      const startPos = getCenter(startEl);
      const endPos = getCenter(endEl);

      // Create the line container (absolute, full height between points)
      const container = document.createElement('div');
      container.className = 'global-line';
      container.style.cssText = `
        position: absolute;
        left: ${startPos.x - lineWidth / 2}px;
        top: ${startPos.y}px;
        width: ${lineWidth}px;
        height: ${endPos.y - startPos.y}px;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
      `;

      // The inner line that gets scaled for the draw animation
      const line = document.createElement('div');
      line.style.cssText = `
        width: 100%;
        height: 100%;
        background: var(--base--red);
        transform-origin: top center;
        transform: scaleY(0);
      `;

      container.appendChild(line);
      document.body.appendChild(container);

      // Animate with ScrollTrigger scrub
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.to(line, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: startEl,
            endTrigger: endEl,
            start: 'center center',
            end: 'center center',
            scrub: true,
          },
        });
      } else {
        // Fallback: show lines immediately
        line.style.transform = 'scaleY(1)';
      }

      lines.push({ container, line, startEl, endEl });
    });
  }

  function repositionLines() {
    lines.forEach(({ container, startEl, endEl }) => {
      const startPos = getCenter(startEl);
      const endPos = getCenter(endEl);
      container.style.left = `${startPos.x - lineWidth / 2}px`;
      container.style.top = `${startPos.y}px`;
      container.style.height = `${endPos.y - startPos.y}px`;
    });
    ScrollTrigger.refresh();
  }

  createLines();

  return {
    resize() {
      repositionLines();
    },
  }
}

export { globalLine as default };
//# sourceMappingURL=global-line-DKHN-d_i.js.map
