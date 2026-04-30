/*
Component: vertical-line
Webflow attribute: data-component="vertical-line"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='vertical-line']
 */
export default function (elements) {
  elements.forEach((el) => {
    gsap.set(el, { scaleY: 0, transformOrigin: 'top center' })

    gsap.to(el, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true,
      },
    })
  })
}
