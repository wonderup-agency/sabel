/*
Component: home
Webflow attribute: data-component="home"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='home']
 */
function home (elements) {
  // Init: runs when the component loads
  elements.forEach((element) => {
    console.log(element);
  });

  // Return lifecycle hooks (optional)
  return {
    // Runs on window resize
    resize() {},
  }
}

export { home as default };
//# sourceMappingURL=home-d6CuS55a.js.map
