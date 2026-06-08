/*
Component: title-animation
Webflow attribute: data-title-animation="True"  (REQUIRED value, case-insensitive)

Only elements whose attribute value is "True" animate — any other value (or no
value) is ignored, so a stray attribute never blurs text you didn't intend.

Put the attribute on the PARENT — typically a Rich Text element (.w-richtext).
The component finds the text blocks inside it (h1–h6, p, li, blockquote),
splits each into words, and reveals them as one continuous deblur + lift wave.
If the attribute sits directly on a single heading/paragraph (no block children),
that element is animated as-is.

Word-by-word deblur + lift reveal. Mirrors the site's existing deblur feel
(see home.js hero/slogan): blur(12px) + y(20px) + opacity 0 → blur(0) + y(0) +
opacity 1, power2.out, staggered per word across the whole block.

Containers in the hero / above the fold animate on load (after fonts.ready);
those below the fold animate when they scroll into view (ScrollTrigger), once,
non-reversing.

Anti-FOUC: the hidden initial state is shipped in title-animation.css gated on
`html.ta-armed`, a class added by the Webflow head snippet BEFORE first paint
(and skipped under prefers-reduced-motion). No JS → no class → text stays sharp
and readable, fully indexable.
*/

import './title-animation.css'

// Feel tuned to match the site's existing deblur (home.js).
const CONFIG = {
  blur: 12, // px — initial blur
  y: 20, // px — initial lift from below (transform, not layout)
  duration: 1.6, // s per word
  stagger: 0.14, // s between words
  ease: 'power2.out',
  from: 'start', // GSAP stagger origin: start | end | center | random
  start: 'top 80%', // ScrollTrigger start for below-the-fold headings
  heroThreshold: 0.9, // fraction of viewport height — top above this = animate on load
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Block-level text elements to animate inside a Rich Text container.
const BLOCK_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, li, blockquote'

const TEXT_NODE = 3
const ELEMENT_NODE = 1

/**
 * Split a text block into word spans. Recurses into inline children (<strong>,
 * <a>, <em>, …) so their words deblur too, while keeping the wrapper elements
 * intact (bold/link styling preserved). <br> is left untouched. The full
 * original text is set on aria-label so screen readers read the block once and
 * never the fragments.
 *
 * @param {HTMLElement} block
 * @returns {HTMLElement[]} the created [data-word] spans
 */
function splitWords(block) {
  const words = []
  const original = block.textContent.replace(/\s+/g, ' ').trim()
  if (!original) return words
  block.setAttribute('aria-label', original)
  walk(block, words)
  return words
}

function walk(node, words) {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === TEXT_NODE) {
      replaceTextNode(node, child, words)
    } else if (child.nodeType === ELEMENT_NODE) {
      if (child.tagName === 'BR') return
      // Don't cross into block-level descendants — those are only animated when
      // they're an explicit Rich Text target. This keeps the attribute from
      // pulling in unrelated paragraphs/headings nested below it.
      if (child.matches(BLOCK_SELECTOR)) return
      walk(child, words) // recurse into inline elements only (<strong>, <a>, …)
    }
  })
}

function replaceTextNode(parent, textNode, words) {
  const text = textNode.textContent
  if (!text.trim()) return // pure whitespace between nodes — leave as-is

  const frag = document.createDocumentFragment()
  // Split on whitespace but keep the separators as their own tokens so spacing
  // and punctuation are preserved exactly.
  text.split(/(\s+)/).forEach((tok) => {
    if (tok === '') return
    if (/^\s+$/.test(tok)) {
      frag.appendChild(document.createTextNode(tok))
      return
    }
    const span = document.createElement('span')
    span.setAttribute('data-word', '')
    span.setAttribute('aria-hidden', 'true')
    span.textContent = tok
    frag.appendChild(span)
    words.push(span)
  })

  parent.replaceChild(frag, textNode)
}

export default function (elements) {
  const gsap = window.gsap
  const ScrollTrigger = window.ScrollTrigger

  if (!elements.length) return
  if (!gsap) {
    // GSAP missing — make sure nothing stays hidden by the CSS guard.
    document.documentElement.classList.remove('ta-armed')
    return
  }

  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger)

  elements.forEach((el) => {
    // Only a real Rich Text (.w-richtext) fans out to its inner text blocks.
    // Any other element animates just its own text — so the attribute never
    // animates text it doesn't directly own.
    const blocks = el.matches('.w-richtext')
      ? el.querySelectorAll(BLOCK_SELECTOR)
      : []
    const targets = blocks.length ? Array.from(blocks) : [el]

    // One flat, reading-order list so the whole container deblurs as a single
    // continuous wave (stagger flows across blocks, not restarting per block).
    const words = targets.flatMap((block) => splitWords(block))
    if (!words.length) return

    // Reduced motion: reveal instantly, no tween.
    if (reduced) {
      gsap.set(el, { opacity: 1 })
      gsap.set(words, { opacity: 1, y: 0, filter: 'blur(0px)' })
      return
    }

    // Hidden initial state (the CSS guard already kept the container at
    // opacity 0 before paint; now GSAP owns each word).
    gsap.set(words, {
      opacity: 0,
      y: CONFIG.y,
      filter: `blur(${CONFIG.blur}px)`,
    })
    gsap.set(el, { opacity: 1 })

    const animate = () =>
      gsap.to(words, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: CONFIG.duration,
        ease: CONFIG.ease,
        stagger: { each: CONFIG.stagger, from: CONFIG.from },
      })

    const isHero =
      el.getBoundingClientRect().top < window.innerHeight * CONFIG.heroThreshold

    if (isHero || !ScrollTrigger) {
      animate()
    } else {
      ScrollTrigger.create({
        trigger: el,
        start: CONFIG.start,
        toggleActions: 'play none none none',
        once: true,
        onEnter: animate,
      })
    }
  })

  // Every heading is now under GSAP's control — drop the global guard so it
  // never lingers on the page.
  document.documentElement.classList.remove('ta-armed')
}
