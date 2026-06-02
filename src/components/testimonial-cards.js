/*
Component: testimonial-cards
Webflow attribute: data-component="testimonial-cards"
*/

import Swiper from 'swiper'
import { EffectCards, Autoplay, A11y } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'
import './testimonial-cards.css'

// Force every slide to the height of the tallest one so the stacked cards
// line up exactly — testimonials vary in text length, and without this the
// longer cards behind poke out below the active one (the "uneven" look).
function equalizeHeights(slides) {
  slides.forEach((slide) => (slide.style.height = ''))
  const max = slides.reduce(
    (tallest, slide) => Math.max(tallest, slide.offsetHeight),
    0
  )
  slides.forEach((slide) => (slide.style.height = `${max}px`))
}

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='testimonial-cards']
 */
export default function (elements) {
  if (!elements.length) return

  const instances = []

  elements.forEach((wrapper) => {
    const slides = Array.from(wrapper.querySelectorAll('.swiper-slide'))
    if (slides.length < 2) return

    equalizeHeights(slides)

    const swiper = new Swiper(wrapper, {
      modules: [EffectCards, Autoplay, A11y],
      effect: 'cards',
      // Kept close to Swiper's default cards demo so drag feels natural.
      // Only deviation: rotation off (the fan tilt) so the stack stays on a
      // straight horizontal baseline, and shadows off (cards are already dark).
      cardsEffect: {
        rotate: false,
        slideShadows: false,
        perSlideOffset: 16, // px each card behind peeks out (default 8)
      },
      loop: true,
      grabCursor: true,
      // Cycles on its own; keeps going after a manual click/drag.
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      a11y: {
        enabled: true,
      },
    })

    // Tap anywhere on the deck advances to the next card. `allowClick` is
    // false right after a drag, so a swipe never counts as a click.
    swiper.on('click', (s) => {
      if (s.allowClick) s.slideNext()
    })

    instances.push({ swiper, wrapper })
  })

  return {
    resize() {
      instances.forEach(({ swiper, wrapper }) => {
        // Re-query so loop-generated duplicate slides are equalized too.
        equalizeHeights(Array.from(wrapper.querySelectorAll('.swiper-slide')))
        swiper.update()
      })
    },
  }
}
