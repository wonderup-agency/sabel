/*
Component: home
Webflow attribute: data-component="home"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='home']
 */
function home () {
  // ---------------------------------------------------------------------------
  // Nav — hidden on load, revealed later
  // ---------------------------------------------------------------------------
  const nav = document.querySelector('.navbar_component');
  if (nav) {
    gsap.set(nav, { yPercent: -100 });
  }

  // ---------------------------------------------------------------------------
  // Infinity SVG — continuous loop until scroll, then complete on pin release
  // ---------------------------------------------------------------------------
  const infinitySvg = document.querySelector('[home-hero="infinite-line"] svg');
  const infinityPath = infinitySvg?.querySelector('path');
  const heroSection = document.querySelector('.section_home-hero');

  if (infinityPath && heroSection) {
    const pathLength = infinityPath.getTotalLength();

    gsap.set(infinityPath, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });

    // Continuous loop: draw then erase
    const loopTl = gsap.timeline({ repeat: -1 });
    loopTl.to(infinityPath, {
      strokeDashoffset: 0,
      duration: 3,
      ease: 'none',
    });
    loopTl.to(infinityPath, {
      strokeDashoffset: -pathLength,
      duration: 3,
      ease: 'none',
    });

    // Pin hero — infinity loops while pinned
    ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: '+=50%',
      pin: true,
      onLeave() {
        loopTl.kill();
        gsap.to(infinityPath, {
          strokeDashoffset: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete() {
            if (nav) {
              gsap.to(nav, { yPercent: 0, duration: 0.6, ease: 'power2.out' });
            }
            initGlobalLines();
          },
        });
      },
      onEnterBack() {
        gsap.set(infinityPath, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });
        loopTl.restart();
        if (nav) {
          gsap.to(nav, { yPercent: -100, duration: 0.4, ease: 'power2.in' });
        }
      },
    });
  } else {
    if (nav) {
      gsap.to(nav, { yPercent: 0, duration: 0.6, ease: 'power2.out', delay: 0.3 });
    }
    initGlobalLines();
  }

  // ---------------------------------------------------------------------------
  // Global Lines — vertical lines between line-start / line-end pairs
  // ---------------------------------------------------------------------------
  const lineWidth = 1;
  const globalLines = [];
  let linesInitialized = false;

  function getCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + rect.height / 2 + window.scrollY,
    }
  }

  function initGlobalLines() {
    if (linesInitialized) return
    linesInitialized = true;

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

  return {
    resize() {
      repositionLines();
    },
  }
}

export { home as default };
//# sourceMappingURL=home-ChHn_rDX.js.map
