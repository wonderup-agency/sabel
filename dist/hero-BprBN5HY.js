import { prepareLineFill, setLineReveal } from './vertical-line-BWXSTkK4.js';

/*
Component: hero
Webflow attribute: data-component="hero"
*/


/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='hero']
 */
function hero (elements) {
  // On mobile (≤991px) the line begins drawing a touch earlier — as soon as
  // the track enters the viewport — instead of waiting for 'top 80%'.
  const isMobile = window.matchMedia('(max-width: 991px)').matches;
  const startPoint = isMobile ? 'top 90%' : 'top 80%';

  elements.forEach((el) => {
    const track = el.querySelector('[data-hero="line-track"]');
    const fill = el.querySelector('[data-hero="line-fill"]');
    if (!track || !fill) return

    // Bake optional end fades into the fill and reveal it via clip. Same
    // opt-in attributes as before (line-cap-start / line-cap-end), read from
    // the track. No injected node, no CSS mask.
    prepareLineFill(fill, {
      start: track.getAttribute('line-cap-start') === 'True',
      end: track.getAttribute('line-cap-end') === 'True',
    });

    const st = ScrollTrigger.create({
      trigger: track,
      start: startPoint,
      end: 'bottom 50%',
    });

    // Gate the scale tracking until the track's opacity transition completes
    // the first time. Once activated, stays activated — the fill will scale
    // up and down naturally with st.progress as the user scrolls (collapses
    // to 0 if they return to the hero top). Resetting on every fade-out
    // would cause "draws, erases, draws" flickering when Lenis's smoothing
    // oscillates window.scrollY around the visibility threshold in
    // global.js.
    const OPACITY_TRANSITION_MS = 600;
    let current = 0;
    let opacityReady = false;
    let readyTimer = null;

    const tryEnableScale = () => {
      if (opacityReady) return
      const visible = document.documentElement.classList.contains(
        'global-lines-visible'
      );
      clearTimeout(readyTimer);
      if (visible) {
        readyTimer = setTimeout(() => {
          opacityReady = true;
          observer.disconnect();
        }, OPACITY_TRANSITION_MS);
      }
    };

    const observer = new MutationObserver(tryEnableScale);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    tryEnableScale();

    gsap.ticker.add(() => {
      if (!opacityReady) return
      const target = st.progress;
      const diff = target - current;
      if (Math.abs(diff) < 0.0001) return
      current += diff * 0.08;
      setLineReveal(fill, current);
    });
  });

  return {
    resize() {
      ScrollTrigger.refresh();
    },
  }
}

export { hero as default };
//# sourceMappingURL=hero-BprBN5HY.js.map
