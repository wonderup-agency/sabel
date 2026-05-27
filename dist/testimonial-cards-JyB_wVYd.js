/*
Component: testimonial-cards
Webflow attribute: data-component="testimonial-cards"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='testimonial-cards']
 */
function testimonialCards (elements) {
  const VISIBLE_COUNT = 3;
  const CYCLE_DURATION = 3.5;
  const SCALE_STEP = 0.1;
  const X_STEP = 40;
  const EXIT_SCALE = 1.05;
  const EXIT_DURATION = 0.6;
  const SHIFT_DURATION = 1;

  elements.forEach((wrapper) => {
    const cards = Array.from(
      wrapper.querySelectorAll('.testimonials_card-item')
    );
    if (cards.length < 2) return

    let order = cards.map((_, i) => i);

    function positionCards(animate) {
      order.forEach((cardIndex, stackPos) => {
        const card = cards[cardIndex];
        const isVisible = stackPos < VISIBLE_COUNT;

        const scale = isVisible
          ? 1 - stackPos * SCALE_STEP
          : 1 - VISIBLE_COUNT * SCALE_STEP;
        const x = isVisible ? stackPos * X_STEP : VISIBLE_COUNT * X_STEP;
        const zIndex = cards.length - stackPos;
        const opacity = isVisible ? 1 : 0;

        if (animate) {
          gsap.to(card, {
            scale,
            x,
            opacity,
            duration: SHIFT_DURATION,
            ease: 'power2.out',
          });
        } else {
          gsap.set(card, { scale, x, opacity });
        }

        card.style.zIndex = zIndex;
      });
    }

    positionCards(false);

    function cycle() {
      const frontCardIndex = order[0];
      const frontCard = cards[frontCardIndex];

      frontCard.style.zIndex = cards.length + 1;

      gsap.to(frontCard, {
        scale: EXIT_SCALE,
        opacity: 0,
        duration: EXIT_DURATION,
        ease: 'power2.in',
        onComplete() {
          order.push(order.shift());
          gsap.set(frontCard, {
            scale: 1 - VISIBLE_COUNT * SCALE_STEP,
            x: VISIBLE_COUNT * X_STEP,
          });
          positionCards(true);
        },
      });
    }

    let intervalId = setInterval(cycle, CYCLE_DURATION * 1000);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!intervalId)
            intervalId = setInterval(cycle, CYCLE_DURATION * 1000);
        } else {
          clearInterval(intervalId);
          intervalId = null;
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(wrapper);
  });
}

export { testimonialCards as default };
//# sourceMappingURL=testimonial-cards-JyB_wVYd.js.map
