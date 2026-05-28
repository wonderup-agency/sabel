/*
Component: testimonial-cards
Webflow attribute: data-component="testimonial-cards"
*/

import Swiper from 'swiper'
import { EffectCreative, A11y } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-creative'
import './testimonial-cards.css'

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='testimonial-cards']
 */
export default function (elements) {
  if (!elements.length) return

  const instances = []

  elements.forEach((wrapper) => {
    const slides = wrapper.querySelectorAll('.swiper-slide')
    if (slides.length < 2) return

    const swiper = new Swiper(wrapper, {
      modules: [EffectCreative, A11y],
      effect: 'creative',
      creativeEffect: {
        limitProgress: 3,
        prev: {
          translate: [36, 8, -80],
          scale: 0.9,
          origin: '100% 50%',
        },
        next: {
          translate: [36, 8, -80],
          scale: 0.9,
          origin: '100% 50%',
        },
      },
      loop: true,
      grabCursor: true,
      speed: 800,
      a11y: {
        enabled: true,
      },
    })

    instances.push(swiper)
  })

  return {
    resize() {
      instances.forEach((s) => s.update())
    },
  }
}
