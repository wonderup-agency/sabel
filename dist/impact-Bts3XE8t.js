/*
Component: impact
Webflow attribute: data-component="impact"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='impact']
 */
function impact (elements) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[impact] GSAP or ScrollTrigger not loaded');
    return
  }

  elements.forEach((section) => {
    const tracks = section.querySelectorAll('[data-impact="line-track"]');
    if (!tracks.length) return

    tracks.forEach((track) => {
      const fill = track.querySelector('[data-impact="line-fill"]');
      if (!fill) return

      gsap.set(fill, { scaleY: 0, transformOrigin: 'top center' });

      const st = ScrollTrigger.create({
        trigger: track,
        start: 'top 70%',
        end: 'bottom 50%',
      });

      let current = 0;
      gsap.ticker.add(() => {
        const target = st.progress;
        const diff = target - current;
        if (Math.abs(diff) < 0.0001) return
        current += diff * 0.08;
        gsap.set(fill, { scaleY: current });
      });
    });
  });
}

export { impact as default };
//# sourceMappingURL=impact-Bts3XE8t.js.map
