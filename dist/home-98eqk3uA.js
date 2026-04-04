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

  // ---------------------------------------------------------------------------
  // Hero — staggered entrance on load
  // ---------------------------------------------------------------------------
  const heroTitle = document.querySelector('.home-hero_title');
  const heroBy = document.querySelector('.home-hero_text');
  const heroLogo1 = document.querySelector('[home-animation="logo-1"]');
  const heroLogo2 = document.querySelector('[home-animation="logo-2"]');

  const heroItems = [heroTitle, heroBy, heroLogo1, heroLogo2].filter(Boolean);

  if (heroItems.length) {
    gsap.set(heroItems, { opacity: 0, y: 20, filter: 'blur(12px)' });

    gsap.to(heroItems, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power2.out',
      stagger: 0.25,
      delay: 0.3,
    });
  }

  // ---------------------------------------------------------------------------
  // Branch Lines — SVG paths + cards in the featured section
  // ---------------------------------------------------------------------------
  const branchSection = document.querySelector('[data-animate="lines-section"]');
  if (branchSection) {
    const allPaths = branchSection.querySelectorAll('[data-line="branch"]');
    const cards = branchSection.querySelectorAll('.featured-card_button');

    // Hide paths and cards on load
    allPaths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
    });
    gsap.set(cards, { autoAlpha: 0, y: 20 });

    // Animate when section enters viewport
    const tl = gsap.timeline({
      paused: true,
      scrollTrigger: {
        trigger: branchSection,
        start: 'top 70%',
        once: true,
        onEnter: () => tl.play(),
      },
    });

    tl.to(allPaths, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'power2.out',
    });

    tl.to(cards, {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.05,
    }, '-=0.3');
  }

  // ---------------------------------------------------------------------------
  // Slogan — deblur reveal
  // ---------------------------------------------------------------------------
  const sloganTitle = document.querySelector('[home-animation="slogan"]');
  if (sloganTitle) {
    gsap.set(sloganTitle, { filter: 'blur(12px)', opacity: 0 });

    gsap.to(sloganTitle, {
      filter: 'blur(0px)',
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sloganTitle,
        start: 'top 60%',
        once: true,
      },
    });
  }

  return {
    resize() {
      repositionLines();
    },
  }
}

export { home as default };
//# sourceMappingURL=home-98eqk3uA.js.map
