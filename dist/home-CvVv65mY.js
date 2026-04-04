/*
Component: home
Webflow attribute: data-component="home"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='home']
 */
function home () {
  // ---------------------------------------------------------------------------
  // Global Lines — vertical lines between line-start / line-end pairs
  // ---------------------------------------------------------------------------
  const lineWidth = 1;
  const globalLines = [];

  function getCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + rect.height / 2 + window.scrollY,
    }
  }

  function initGlobalLines() {
    const starts = document.querySelectorAll('[line-start]');
    const ends = document.querySelectorAll('[line-end]');

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

      const line = document.createElement('div');
      line.style.cssText = `
        width: 100%;
        height: 100%;
        background: var(--base--red);
        transform-origin: top center;
        transform: scaleY(0);
        box-shadow: 0 0 6px 1px var(--base--red);
      `;

      container.appendChild(line);
      document.body.appendChild(container);

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

      globalLines.push({ container, line, startEl, endEl });
    });
  }

  function repositionLines() {
    globalLines.forEach(({ container, startEl, endEl }) => {
      const startPos = getCenter(startEl);
      const endPos = getCenter(endEl);
      container.style.left = `${startPos.x - lineWidth / 2}px`;
      container.style.top = `${startPos.y}px`;
      container.style.height = `${endPos.y - startPos.y}px`;
    });
    ScrollTrigger.refresh();
  }

  initGlobalLines();

  return {
    resize() {
      repositionLines();
    },
  }
}

export { home as default };
//# sourceMappingURL=home-CvVv65mY.js.map
