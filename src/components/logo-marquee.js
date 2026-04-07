/*
Component: logo-marquee
Webflow attribute: data-component="logo-marquee"
*/

const SPEED = 50 // pixels per second

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='logo-marquee']
 */
export default function (elements) {
  const tweens = []

  elements.forEach((el) => {
    const lists = el.querySelectorAll('.testimonials_logo-wrapper')
    if (lists.length < 2) return

    const listWidth = lists[0].offsetWidth
    const gap = parseFloat(getComputedStyle(el).gap) || 0
    const totalWidth = listWidth + gap
    const duration = totalWidth / SPEED

    const tween = gsap.to(lists, {
      x: -totalWidth,
      duration,
      ease: 'none',
      repeat: -1,
    })

    tweens.push({ el, tween, lists })
  })

  return {
    resize() {
      tweens.forEach(({ el, tween, lists }) => {
        tween.kill()

        const listWidth = lists[0].offsetWidth
        const gap = parseFloat(getComputedStyle(el).gap) || 0
        const totalWidth = listWidth + gap
        const duration = totalWidth / SPEED

        gsap.set(lists, { x: 0 })

        const newTween = gsap.to(lists, {
          x: -totalWidth,
          duration,
          ease: 'none',
          repeat: -1,
        })

        // Update reference for future resizes
        tweens.splice(
          tweens.findIndex((t) => t.el === el),
          1,
          { el, tween: newTween, lists }
        )
      })
    },
  }
}
