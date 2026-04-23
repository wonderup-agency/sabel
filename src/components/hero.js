/*
Component: hero
Webflow attribute: data-component="hero"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='hero']
 */
export default function (elements) {
  elements.forEach((el) => {
    const track = el.querySelector('[data-hero="line-track"]')
    const fill = el.querySelector('[data-hero="line-fill"]')
    if (!track || !fill) return

    gsap.set(fill, { scaleY: 0, transformOrigin: 'top center' })

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top 80%',
      end: 'bottom 50%',
    })

    let current = 0
    gsap.ticker.add(() => {
      const target = st.progress
      const diff = target - current
      if (Math.abs(diff) < 0.0001) return
      current += diff * 0.08
      gsap.set(fill, { scaleY: current })
    })
  })
}
