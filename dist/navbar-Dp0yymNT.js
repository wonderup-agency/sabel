/*
Component: navbar
Webflow attribute: data-component="navbar"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='navbar']
 */
function navbar (elements) {
  const nav = elements[0];
  if (!nav) return

  // On the home page, home.js handles the navbar reveal on scroll — skip here
  if (document.querySelector('[data-component="home"]')) return

  gsap.set(nav, { opacity: 0, filter: 'blur(12px)', yPercent: -100 });

  gsap.to(nav, {
    opacity: 1,
    filter: 'blur(0px)',
    yPercent: 0,
    backgroundColor: 'rgba(11, 11, 12, 0.5)',
    duration: 0.8,
    ease: 'power2.out',
    delay: 0.3,
  });
}

export { navbar as default };
//# sourceMappingURL=navbar-Dp0yymNT.js.map
