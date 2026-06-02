/*
Component: logo-marquee
Webflow attribute: data-component="logo-marquee"
*/

const SPEED = 50; // pixels per second

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='logo-marquee']
 */
function logoMarquee (elements) {
  const tweens = [];

  elements.forEach((el) => {
    const lists = el.querySelectorAll('.testimonials_logo-wrapper');
    if (lists.length < 2) return

    const listWidth = lists[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(el).gap) || 0;
    const totalWidth = listWidth + gap;
    const duration = totalWidth / SPEED;

    const tween = gsap.to(lists, {
      x: -totalWidth,
      duration,
      ease: 'none',
      repeat: -1,
    });

    tweens.push({ el, tween, lists, width: el.offsetWidth });
  });

  return {
    resize() {
      tweens.forEach((entry) => {
        const { el, tween, lists } = entry;

        // Mobile browsers fire `resize` on every address-bar show/hide while
        // scrolling — but that only changes viewport height. The marquee only
        // depends on width, so skip the rebuild when width is unchanged.
        // Otherwise the tween resets to x:0 on every scroll (visible jump).
        const currentWidth = el.offsetWidth;
        if (currentWidth === entry.width) return
        entry.width = currentWidth;

        tween.kill();

        const listWidth = lists[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(el).gap) || 0;
        const totalWidth = listWidth + gap;
        const duration = totalWidth / SPEED;

        gsap.set(lists, { x: 0 });

        entry.tween = gsap.to(lists, {
          x: -totalWidth,
          duration,
          ease: 'none',
          repeat: -1,
        });
      });
    },
  }
}

export { logoMarquee as default };
//# sourceMappingURL=logo-marquee-CNRHOngp.js.map
