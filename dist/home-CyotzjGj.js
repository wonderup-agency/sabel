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

      console.log(`[global-line] Creating line ${id}: start=`, startEl, 'end=', endEl);

      gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: startEl,
          endTrigger: endEl,
          start: 'center center',
          end: 'center center',
          scrub: true,
          onUpdate: id === '2' ? (self) => {
            console.log(`[line 2] progress: ${self.progress.toFixed(2)}, direction: ${self.direction}`);
            if (self.progress >= 0.99) {
              console.log('[line 2] HIT 0.99 — calling initBranchLines');
              initBranchLines();
            }
          } : undefined,
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

  // ---------------------------------------------------------------------------
  // Branch Lines — SVG paths + cards that animate when global line 2 finishes
  // ---------------------------------------------------------------------------
  // Prepare branch lines immediately — hide paths and cards on load
  const branchSection = document.querySelector('[data-animate="lines-section"]');
  const branchPaths = branchSection?.querySelectorAll('[data-line="branch"]');
  const branchCards = branchSection?.querySelectorAll('.featured-card_button');

  if (branchPaths) {
    branchPaths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
    });
  }
  if (branchCards) {
    gsap.set(branchCards, { autoAlpha: 0, y: 20 });
  }

  let branchPlayed = false;

  function initBranchLines() {
    console.log('[branch-lines] initBranchLines called, branchPlayed:', branchPlayed);
    if (branchPlayed) return
    branchPlayed = true;

    if (!branchSection || !branchPaths) return

    const tl = gsap.timeline();

    tl.to(allPaths, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'power2.out',
    });

    tl.fromTo(
      cards,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.05,
      },
      '-=0.3'
    );
  }

  return {
    resize() {
      repositionLines();
    },
  }
}

export { home as default };
//# sourceMappingURL=home-CyotzjGj.js.map
