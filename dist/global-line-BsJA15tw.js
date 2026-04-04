/*
Component: global-line
Webflow attribute: data-component="global-line"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='global-line']
 */
function globalLine (elements) {
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

export { globalLine as default };
//# sourceMappingURL=global-line-BsJA15tw.js.map
