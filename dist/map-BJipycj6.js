/*
Component: map
Webflow attribute: data-component="map"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='map']
 */
function map (elements) {
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

export { map as default };
//# sourceMappingURL=map-BJipycj6.js.map
