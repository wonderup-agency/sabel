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
  // Infinity SVG — loop, converge on scroll, then vertical exit
  // ---------------------------------------------------------------------------
  const infinitySvg = document.querySelector('[home-hero="infinite-line"] svg');
  const infinityPath = infinitySvg?.querySelector('path');
  const heroSection = document.querySelector('.section_home-hero');

  if (infinityPath && heroSection) {
    // Merge the two subpaths into one continuous path tracing the full 8
    const fullD = infinityPath.getAttribute('d');
    const subpaths = fullD.split(/(?=M)/).filter(Boolean);
    if (subpaths.length === 2) {
      const merged =
        subpaths[0].replace(/Z\s*$/, '') +
        subpaths[1].replace(/^M[\d.\s]+/, '');
      infinityPath.setAttribute('d', merged);
    }

    // Hide original, create two clones for independent animation
    infinityPath.style.display = 'none';
    const mergedD = infinityPath.getAttribute('d');

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    ;[line1, line2].forEach((p) => {
      p.setAttribute('d', mergedD);
      p.setAttribute('stroke', 'var(--base--red)');
      p.setAttribute('fill', 'none');
      p.setAttribute('filter', 'url(#line-glow)');
      infinityPath.parentNode.appendChild(p);
    });

    // Add glow filter to SVG for line tips
    const defs =
      infinitySvg.querySelector('defs') ||
      infinitySvg.insertBefore(
        document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
        infinitySvg.firstChild
      );
    defs.insertAdjacentHTML(
      'beforeend',
      `<filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="dot-glow">
        <stop offset="0%" stop-color="var(--base--red)" stop-opacity="1"/>
        <stop offset="40%" stop-color="var(--base--red)" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="var(--base--red)" stop-opacity="0"/>
      </radialGradient>`
    );

    // Glowing dot at center of the 8 (335, 141)
    const centerDot = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );
    centerDot.setAttribute('cx', '335');
    centerDot.setAttribute('cy', '141');
    centerDot.setAttribute('r', '20');
    centerDot.setAttribute('fill', 'url(#dot-glow)');
    infinityPath.parentNode.appendChild(centerDot);
    gsap.set(centerDot, { scale: 0, transformOrigin: 'center center', opacity: 0 });

    // Create vertical exit path (top to bottom through center of the 8)
    // viewBox is 0 0 670 282, center is ~335, 141
    const verticalPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    verticalPath.setAttribute('d', 'M335 0 L335 282');
    verticalPath.setAttribute('stroke', 'var(--base--red)');
    verticalPath.setAttribute('fill', 'none');
    verticalPath.setAttribute('filter', 'url(#line-glow)');
    infinityPath.parentNode.appendChild(verticalPath);
    const vertLength = verticalPath.getTotalLength();
    gsap.set(verticalPath, {
      strokeDasharray: vertLength,
      strokeDashoffset: vertLength,
      opacity: 0,
    });

    const pathLength = line1.getTotalLength();
    const seg = pathLength * 0.2;
    const gap = pathLength - seg;

    gsap.set([line1, line2], { strokeDasharray: `${seg} ${gap}` });
    const offset2 = pathLength * 0.65;
    gsap.set(line1, { strokeDashoffset: 0 });
    gsap.set(line2, { strokeDashoffset: -offset2 });

    // Auto loop (reversed direction)
    function createLoop() {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(
        line1,
        { strokeDashoffset: pathLength, duration: 6, ease: 'none' },
        0
      );
      tl.to(
        line2,
        { strokeDashoffset: -offset2 + pathLength, duration: 6, ease: 'none' },
        0
      );
      return tl
    }

    let loopTl = createLoop();
    let loopKilled = false;

    // Convergence + vertical exit timeline (played on scroll threshold)
    function playConvergence() {
      // Center crossing is at pathLength/2 — segments shrink to zero there
      const centerPos = pathLength / 2;
      const tl = gsap.timeline();

      // 1. Both segments converge to center and shrink to nothing
      tl.to(line1, {
        strokeDashoffset: -centerPos,
        strokeDasharray: `0 ${pathLength}`,
        duration: 1.2,
        ease: 'power2.inOut',
      }, 0);
      tl.to(line2, {
        strokeDashoffset: -centerPos,
        strokeDasharray: `0 ${pathLength}`,
        duration: 1.2,
        ease: 'power2.inOut',
      }, 0);

      // 2. Glow dot grows at center as lines converge
      tl.to(centerDot, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }, 0.7);

      // 3. Fade in vertical path, shrink dot
      tl.to(verticalPath, { opacity: 1, duration: 0.1 }, 1.2);
      tl.to(centerDot, {
        scale: 0.3,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in',
      }, 1.3);

      // 4. Draw vertical line top to bottom
      tl.to(verticalPath, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, 1.3);

      // 4. Reveal nav
      tl.call(() => {
        if (nav) {
          gsap.to(nav, { yPercent: 0, duration: 0.6, ease: 'power2.out' });
        }
      });

      return tl
    }

    let convergeTl = null;

    ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: '+=120%',
      pin: true,
      onUpdate(self) {
        if (self.progress > 0.35 && !loopKilled) {
          loopKilled = true;
          loopTl.kill();
          convergeTl = playConvergence();
        }
      },
      onLeave() {
        // Init global lines after pin releases so positions are correct
        initGlobalLines();
      },
      onEnterBack() {
        // Kill convergence if still playing
        if (convergeTl) {
          convergeTl.kill();
          convergeTl = null;
        }
        loopKilled = false;
        linesInitialized = false;
        // Clean up global lines
        globalLines.forEach(({ container }) => container.remove());
        globalLines.length = 0;

        // Reset infinity
        gsap.set([line1, line2], {
          opacity: 1,
          strokeDasharray: `${seg} ${gap}`,
        });
        gsap.set(line1, { strokeDashoffset: 0 });
        gsap.set(line2, { strokeDashoffset: -offset2 });
        gsap.set(verticalPath, {
          opacity: 0,
          strokeDashoffset: vertLength,
        });
        gsap.set(centerDot, { scale: 0, opacity: 0 });
        loopTl.restart();
        if (nav) {
          gsap.to(nav, { yPercent: -100, duration: 0.4, ease: 'power2.in' });
        }
      },
    });
  } else {
    if (nav) {
      gsap.to(nav, {
        yPercent: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.3,
      });
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

  return {
    resize() {
      repositionLines();
    },
  }
}

export { home as default };
//# sourceMappingURL=home-BUG6I33v.js.map
