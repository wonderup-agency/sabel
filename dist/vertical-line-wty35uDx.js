/*
Component: vertical-line
Webflow attribute: data-component="vertical-line"
*/


// Width of the horizontal line in each cap. Kept here so JS can animate
// to the resolved value and tween back to 0 cleanly.
const LINE_CAP_WIDTH = '6rem';

/*
  Build one cap (horizontal line + glow) at either the top or bottom edge
  of a target element. Appends to <body>, positions absolutely at the
  element's edge, and wires a ScrollTrigger that opens/closes the cap.

  direction: 'down' → cap at TOP edge, glow points down.
             'up'   → cap at BOTTOM edge, glow points up.

  options.triggerStart overrides the default scroll trigger point so other
  components (e.g. hero) can sync the cap with their own scroll range.

  Returned reposition() should be called on resize.
*/
function buildLineCap(verticalEl, direction, options = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'global-line global-line-cap';
  wrapper.setAttribute('data-cap-direction', direction);

  const line = document.createElement('div');
  line.className = 'global-line-cap_line';

  const glow = document.createElement('div');
  glow.className = 'global-line-cap_glow';

  wrapper.appendChild(line);
  wrapper.appendChild(glow);
  document.body.appendChild(wrapper);

  gsap.set(wrapper, { xPercent: -50, yPercent: -50 });

  // Use offsetHeight (CSS-defined size) for the bottom edge, because the
  // line's scaleY transform collapses getBoundingClientRect.bottom to top.
  const reposition = () => {
    const rect = verticalEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + window.scrollX;
    const y =
      (direction === 'down' ? rect.top : rect.top + verticalEl.offsetHeight) +
      window.scrollY;
    wrapper.style.left = `${x}px`;
    wrapper.style.top = `${y}px`;
  };
  reposition();

  // Trigger MUST match the host line's scrub range so the cap never lags
  // behind the visible line. Default matches vertical-line's range; host
  // components can override via options.triggerStart.
  const defaultStart = direction === 'down' ? 'top 80%' : 'bottom 20%';
  ScrollTrigger.create({
    trigger: verticalEl,
    start: options.triggerStart || defaultStart,
    onEnter: () => {
      gsap.to(line, {
        width: LINE_CAP_WIDTH,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.to(glow, { opacity: 1, duration: 0.6, ease: 'power3.out' });
    },
    onLeaveBack: () => {
      gsap.to(line, { width: 0, duration: 0.4, ease: 'power2.in' });
      gsap.to(glow, { opacity: 0, duration: 0.4, ease: 'power2.in' });
    },
  });

  return reposition
}

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='vertical-line']
 */
function verticalLine (elements) {
  const repositioners = [];

  elements.forEach((el) => {
    gsap.set(el, { scaleY: 0, transformOrigin: 'top center' });

    gsap.to(el, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true,
      },
    });

    if (el.getAttribute('line-cap-start') === 'True') {
      repositioners.push(buildLineCap(el, 'down'));
    }
    if (el.getAttribute('line-cap-end') === 'True') {
      repositioners.push(buildLineCap(el, 'up'));
    }
  });

  return {
    resize() {
      repositioners.forEach((fn) => fn());
      ScrollTrigger.refresh();
    },
  }
}

export { buildLineCap, verticalLine as default };
//# sourceMappingURL=vertical-line-wty35uDx.js.map
