/*
Component: steps-timeline
Webflow attribute: data-component="steps-timeline"
*/

const LINE_WIDTH = 1;
const LINE_COLOR = 'var(--base--red)';
const LINE_X_OFFSET = 60;
const LINE_START_OFFSET_DEFAULT = 200;
const LINE_START_OFFSET_MOBILE = 0;
const MOBILE_BREAKPOINT = 767;

function getStartOffset(desktop) {
  return window.innerWidth <= MOBILE_BREAKPOINT
    ? LINE_START_OFFSET_MOBILE
    : desktop
}
const SHADOW_BLUR = 100;
const SHADOW_COLOR = '225, 6, 0';
const SHADOW_OPACITY = 0.5;
const ACTIVATE_THRESHOLD = 0.98;
const TRANSITION_DURATION = 0.3;

const SHADOW_ON = `drop-shadow(0 0 ${SHADOW_BLUR}px rgba(${SHADOW_COLOR}, ${SHADOW_OPACITY}))`;
const SHADOW_OFF = `drop-shadow(0 0 0px rgba(${SHADOW_COLOR}, 0))`;

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='steps-timeline']
 */
function stepsTimeline (elements) {
  const allSegments = [];

  elements.forEach((section) => {
    section.style.zIndex = '2';

    const items = [...section.querySelectorAll('[data-steps-timeline="item"]')];
    if (!items.length) return
    console.log('test');
    const iconWrappers = items.map((item) =>
      item.querySelector('[data-steps-timeline="icon-wrapper"]')
    );

    const parsedOffset = parseFloat(section.dataset.startOffset);
    const startOffsetDesktop = Number.isFinite(parsedOffset)
      ? parsedOffset
      : LINE_START_OFFSET_DEFAULT;

    let activeShadowIndex = -1;
    const iconStates = items.map(() => false);

    items.forEach((item) => {
      gsap.set(item, { filter: SHADOW_OFF });
      const icons = item.querySelectorAll('.steps-checkboxes_item-icon');
      if (icons.length >= 2) {
        gsap.set(icons[0], { opacity: 0 });
        gsap.set(icons[1], { opacity: 1 });
      }
    });

    // --- Shadow ---
    function moveShadowTo(newIndex) {
      if (newIndex === activeShadowIndex) return
      if (activeShadowIndex >= 0) {
        gsap.to(items[activeShadowIndex], {
          filter: SHADOW_OFF,
          duration: TRANSITION_DURATION,
          ease: 'power2.out',
        });
      }
      if (newIndex >= 0) {
        gsap.to(items[newIndex], {
          filter: SHADOW_ON,
          duration: TRANSITION_DURATION,
          ease: 'power2.out',
        });
      }
      activeShadowIndex = newIndex;
    }

    // --- Icons ---
    function activateIcon(cardIndex) {
      if (iconStates[cardIndex]) return
      iconStates[cardIndex] = true;
      const icons = items[cardIndex].querySelectorAll(
        '.steps-checkboxes_item-icon'
      );
      if (icons.length >= 2) {
        gsap.to(icons[0], {
          opacity: 1,
          duration: TRANSITION_DURATION,
          ease: 'power2.out',
        });
        gsap.to(icons[1], {
          opacity: 0,
          duration: TRANSITION_DURATION,
          ease: 'power2.out',
        });
      }
    }

    function deactivateIcon(cardIndex) {
      if (!iconStates[cardIndex]) return
      iconStates[cardIndex] = false;
      const icons = items[cardIndex].querySelectorAll(
        '.steps-checkboxes_item-icon'
      );
      if (icons.length >= 2) {
        gsap.to(icons[0], {
          opacity: 0,
          duration: TRANSITION_DURATION,
          ease: 'power2.out',
        });
        gsap.to(icons[1], {
          opacity: 1,
          duration: TRANSITION_DURATION,
          ease: 'power2.out',
        });
      }
    }

    // --- Line segments ---
    for (let i = 0; i < items.length; i++) {
      const lineEl = document.createElement('div');
      lineEl.className = 'global-line global-line--steps';
      lineEl.style.cssText = `
        position: absolute;
        width: ${LINE_WIDTH}px;
        background: ${LINE_COLOR};
        pointer-events: none;
        z-index: 1;
        transform-origin: top center;
        transform: scaleY(0);
      `;
      document.body.appendChild(lineEl);

      let reachedCard = false;

      const stConfig = {
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const nowReached = self.progress >= ACTIVATE_THRESHOLD;

          if (nowReached && !reachedCard) {
            reachedCard = true;
            activateIcon(i);
            moveShadowTo(i);
          } else if (!nowReached && reachedCard) {
            reachedCard = false;
            deactivateIcon(i);
            moveShadowTo(i > 0 ? i - 1 : -1);
          }
        },
      };

      if (i === 0) {
        stConfig.trigger = items[0];
        stConfig.start = () => `top-=${getStartOffset(startOffsetDesktop)} 80%`;
        stConfig.end = 'top 60%';
      } else {
        stConfig.trigger = items[i - 1];
        stConfig.start = 'bottom 60%';
        stConfig.endTrigger = items[i];
        stConfig.end = 'top 60%';
      }

      gsap.to(lineEl, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: stConfig,
      });

      allSegments.push({
        lineEl,
        index: i,
        items,
        iconWrappers,
        startOffsetDesktop,
      });
    }
  });

  // --- Per-frame repositioning ---
  function repositionAll() {
    allSegments.forEach(
      ({ lineEl, index, items, iconWrappers, startOffsetDesktop }) => {
        const firstCard = items[0];
        const iconWrapper = iconWrappers[index];
        let xPos;
        if (iconWrapper) {
          const iconRect = iconWrapper.getBoundingClientRect();
          xPos = iconRect.left + iconRect.width / 2 + window.scrollX;
        } else {
          xPos =
            firstCard.getBoundingClientRect().left +
            LINE_X_OFFSET +
            window.scrollX;
        }

        let topY, bottomY;
        if (index === 0) {
          const cardTop = firstCard.getBoundingClientRect().top + window.scrollY;
          topY = cardTop - getStartOffset(startOffsetDesktop);
          bottomY = cardTop;
        } else {
          topY =
            items[index - 1].getBoundingClientRect().bottom + window.scrollY;
          bottomY = items[index].getBoundingClientRect().top + window.scrollY;
        }

        const height = bottomY - topY;
        if (height <= 0) {
          lineEl.style.display = 'none';
          return
        }

        lineEl.style.display = '';
        lineEl.style.left = `${xPos}px`;
        lineEl.style.top = `${topY}px`;
        lineEl.style.height = `${height}px`;
      }
    );
  }

  if (allSegments.length) {
    gsap.ticker.add(repositionAll);
    repositionAll();
  }

  return {
    resize() {
      repositionAll();
      ScrollTrigger.refresh();
    },
  }
}

export { stepsTimeline as default };
//# sourceMappingURL=steps-timeline-ixokOxs-.js.map
