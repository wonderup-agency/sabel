/*
Component: horizontal-line
Webflow attribute: data-component="horizontal-line"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='horizontal-line']
 */
function horizontalLine (elements) {
  elements.forEach((el) => {
    gsap.set(el, { scaleX: 0, transformOrigin: 'center center' });

    // Find the preceding vertical-line to chain after it
    const verticalLine = document.querySelector(
      '[data-component="vertical-line"]'
    );

    if (verticalLine) {
      // Get the vertical line's ScrollTrigger and chain after it completes
      ScrollTrigger.create({
        trigger: verticalLine,
        start: 'bottom 50%',
        onEnter() {
          gsap.to(el, {
            scaleX: 1,
            duration: 0.8,
            ease: 'power2.out',
          });
        },
        onLeaveBack() {
          gsap.to(el, {
            scaleX: 0,
            duration: 0.5,
            ease: 'power2.in',
          });
        },
      });
    } else {
      // Fallback: animate on own scroll position
      gsap.to(el, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'top 50%',
          scrub: true,
        },
      });
    }
  });
}

export { horizontalLine as default };
//# sourceMappingURL=horizontal-line-BfmiVRYV.js.map
