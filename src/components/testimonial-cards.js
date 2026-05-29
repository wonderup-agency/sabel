/*
Component: testimonial-cards
Webflow attribute: data-component="testimonial-cards"
*/

import Swiper from 'swiper'
import { EffectCreative, A11y } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-creative'
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
      modules: [EffectCreative, A11y],
      effect: 'creative',
      creativeEffect: {
        // Active card sits at rest (rightmost, fully visible). Every inactive
        // card behind it shifts left and scales down — the further back it is,
        // the more it shrinks (translate/scale grow linearly with position).
        limitProgress: 2, // active + 2 cards behind visible
        prev: {
          translate: [40, 0, 0],
          scale: 0.9,
          origin: 'center center',
        },
        next: {
          translate: [40, 0, 0],
          scale: 0.9,
          origin: 'center center',
        },
      },
      loop: true,
      grabCursor: true,
      speed: 800,
      a11y: {
        enabled: true,
      },
    })

    instances.push({ swiper, slides })
  })

  return {
    resize() {
      instances.forEach(({ swiper, slides }) => {
        equalizeHeights(slides)
        swiper.update()
      })
    },
  }
}
