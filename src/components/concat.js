/*
Component: concat
Webflow attribute: data-component="concat"
*/

const SEPARATOR = ', '

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='concat']
 */
export default function (elements) {
  elements.forEach((element) => {
    const children = [...element.children]
    if (children.length < 2) return

    const pieces = children
      .map((child) => child.textContent.trim())
      .filter((text) => text.length > 0)

    if (pieces.length === 0) return

    const [first, ...rest] = children
    first.textContent = pieces.join(SEPARATOR)
    rest.forEach((child) => child.remove())
  })
}
