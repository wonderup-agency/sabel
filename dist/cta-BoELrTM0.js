/*
Component: cta
Webflow attribute: data-component="cta"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='cta']
 */
function cta (elements) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[cta] GSAP or ScrollTrigger not loaded');
    return
  }

  elements.forEach((section) => {
    const topH = section.querySelector(
      '[data-cta="line-top-horizontal"] .cta_line-fill'
    );
    const topV = section.querySelector(
      '[data-cta="line-top-vertical"] .cta_line-fill'
    );
    const bottomV = section.querySelector(
      '[data-cta="line-bottom-vertical"] .cta_line-fill'
    );
    const bottomH = section.querySelector(
      '[data-cta="line-bottom-horizontal"] .cta_line-fill'
    );

    if (!topH || !topV || !bottomV || !bottomH) return

    gsap.set([topH, bottomH], { scaleX: 0, scaleY: 1 });
    gsap.set([topV, bottomV], { scaleX: 1, scaleY: 0 });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'bottom 60%',
          scrub: 1,
        },
      })
      .to(topH, { scaleX: 1, ease: 'none', duration: 1 }, 0)
      .to(topV, { scaleY: 1, ease: 'none', duration: 1 }, 0)
      .to(bottomV, { scaleY: 1, ease: 'none', duration: 1 }, 1)
      .to(bottomH, { scaleX: 1, ease: 'none', duration: 1 }, 2);
  });
}

export { cta as default };
//# sourceMappingURL=cta-BoELrTM0.js.map
