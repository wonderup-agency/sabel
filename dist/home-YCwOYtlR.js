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
    // Split the combined path into two separate subpaths
    const fullD = infinityPath.getAttribute('d');
    const subpaths = fullD.split(/(?=M)/).filter(Boolean);

    // Hide the original path
    infinityPath.style.display = 'none';

    // Create individual <path> elements for each half of the 8
    const paths = subpaths.map((d) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.setAttribute('stroke', 'var(--base--red)');
      p.setAttribute('fill', 'none');
      infinityPath.parentNode.appendChild(p);
      return p
    });

    // Set up snake animation on each path independently
    const pathData = paths.map((p) => {
      const len = p.getTotalLength();
      const seg = len * 0.4;
      gsap.set(p, {
        strokeDasharray: `${seg} ${len - seg}`,
        strokeDashoffset: 0,
      });
      return { el: p, length: len, seg }
    });

    // One single line flowing — stagger the start so they feel independent
    const loopTl = gsap.timeline({ repeat: -1 });
    pathData.forEach(({ el, length }, i) => {
      loopTl.to(
        el,
        {
          strokeDashoffset: -length,
          duration: 4,
          ease: 'none',
          repeat: -1,
        },
        i * 0.8
      );
    });

    // Pin hero — infinity loops while pinned
    ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: '+=50%',
      pin: true,
      onLeave() {
        loopTl.kill();
        // Complete: fill both paths fully
        pathData.forEach(({ el, length }) => {
          gsap.to(el, {
            strokeDasharray: `${length} 0`,
            duration: 0.8,
            ease: 'power2.out',
          });
        });
        // After the fill completes, reveal nav and init lines
        gsap.delayedCall(0.8, () => {
          if (nav) {
            gsap.to(nav, { yPercent: 0, duration: 0.6, ease: 'power2.out' });
          }
          initGlobalLines();
        });
      },
      onEnterBack() {
        // Restore snake animation
        pathData.forEach(({ el, length, seg }) => {
          gsap.set(el, {
            strokeDasharray: `${seg} ${length - seg}`,
            strokeDashoffset: 0,
          });
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
//# sourceMappingURL=home-YCwOYtlR.js.map
