# Scaffolding Scripts

Node scripts in `scripts/` that scaffold new components and pages. Both are also accessible from the dashboard.

## create-component (`scripts/create-component.js`)

**Usage**: `npm run create-component -- <name>`

**What it does:**

1. Normalizes the name (lowercase, spaces → hyphens)
2. Checks if the file already exists at `src/components/<name>.js` — exits if so
3. Checks if the `data-component` name is already registered in `src/components.js` — exits if so
4. Creates the component file with a default-export scaffold (receives `elements` array, includes `resize` lifecycle hook)
5. Auto-registers the component in `src/components.js` by prepending a new `{ selector, importFn }` entry to the array
6. Prints the `data-component="<name>"` attribute to add in Webflow

**Nested paths**: `npm run create-component -- forms/contact` creates `src/components/forms/contact.js` and registers with `data-component="contact"` (basename only).

**Scaffold output:**

```js
/*
Component: name
Webflow attribute: data-component="name"
*/

/**
 * @param {HTMLElement[]} elements - All elements matching [data-component='name']
 */
export default function (elements) {
  // Init: runs when the component loads
  elements.forEach((element) => {
    console.log(element)
  })

  // Return lifecycle hooks (optional)
  return {
    // Runs on window resize
    resize() {},
  }
}
```

## create-page (`scripts/create-page.js`)

**Usage**: `npm run create-page -- <name>`

**What it does:**

1. Normalizes the name (lowercase, spaces → hyphens)
2. Checks if the file already exists at `src/pages/<name>.js` — exits if so
3. Reads `package.json` for the repo path and current version (used for CDN URL)
4. Creates the page file with a comment block containing both localhost and CDN `<script>` tags for easy copy-paste into Webflow
5. Prints both script tags to the terminal (local active, CDN commented out)

**Nested paths**: `npm run create-page -- blog/post` creates `src/pages/blog/post.js`.

**Scaffold output:**

```js
/*
<!--
Page specific bundle: name
Local: http://127.0.0.1:8080/name.js
Production: https://cdn.jsdelivr.net/gh/owner/repo@vX.X.X/dist/name.js
-->
<script src="http://127.0.0.1:8080/name.js" defer type="module"></script>
*/

console.log('%c📄 [name] Page loaded', 'color: #a78bfa; font-weight: bold')
```

The comment block includes:

- **Page name** and reference URLs (local + production) inside an HTML comment
- **Local script tag** — ready to copy-paste into Webflow for dev
- Production URL is for reference only — swap the script `src` when deploying

## Shared behavior

- Both scripts use `picocolors` for terminal output
- Input is sanitized: spaces become hyphens, forced lowercase
- Both exit with code 1 on missing args or duplicate files
- Directories are created recursively (`mkdirSync` with `{ recursive: true }`)
