# Webflow JavaScript Starter Template

Starter template for Webflow projects at Wonderup Agency. Bundles custom JavaScript and CSS with Rollup, supports local development with watch mode, and deploys to production via jsDelivr CDN.

## Features

- **Rollup**: Bundles JavaScript with tree-shaking and module support.
- **PostCSS**: Processes CSS with modern features (nesting, autoprefixer via postcss-preset-env).
- **Dynamic Component Loading**: Modular JavaScript components loaded based on data attributes.
- **Component Lifecycle**: Optional resize hook for responsive recalculations.
- **Global Initialization**: `src/components/global.js` runs on every page before components load.
- **Per-Page Bundles**: Standalone entry points for page-specific code.
- **Interactive Dashboard**: Terminal UI (`npm start`) for managing all project tasks.
- **ESLint + Prettier**: Code linting and formatting.
- **Production Builds**: Minified and optimized output with extracted CSS.
- **CDN Integration**: Seamless deployment to jsDelivr for production use in Webflow.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- A Webflow project
- A GitHub repository for your project

## Getting Started

1. **Create or Update Repository**
   - If starting fresh, use this template to create a new repository for your project on GitHub, and change the owner from your account to "wonderup-agency" to proceed with the next steps.
   - If working on an existing repository, ensure you have the latest changes by running:
     ```bash
     git pull origin main
     ```
   - Update the `"name"`, `"author"`, `"description"`, and `"repository"` fields in `package.json` to reflect your project's name and GitHub repository URL.

2. **Install Dependencies**
   - Clone the repository to your local machine (if not already done).
   - Run the following command to install all required dependencies:
     ```bash
     npm install
     ```

3. **Local Development**
   - Start the dashboard:
     ```bash
     npm start
     ```
     Select **Dev Server** to start Rollup in watch mode and the local HTTP server. You can also run the dev server directly with `npm run dev`.
   - Copy the code from `webflow-snippet.html` and paste it into your Webflow project's **Project Settings → Custom Code → Head**. Follow the instructions in the file to set up local asset URLs.

4. **Write Your Code**
   - Create new components from the dashboard (**Create → Component**) or using the CLI:
     ```bash
     npm run create-component -- calculator
     npm run create-component -- forms/contact
     ```
   - The script creates the component file and automatically registers it in `src/components.js`.
   - For code that should run on every page, edit `src/components/global.js`.
   - CSS can be imported directly in any JS file — PostCSS processes it with modern features (nesting, autoprefixer).
   - Test your changes locally — Rollup rebuilds automatically on file changes.

5. **Build for Production**
   - From the dashboard, select **Build**, or run:
     ```bash
     npm run build
     ```
   - This will:
     - Lint code with ESLint.
     - Format code with Prettier.
     - Bundle and minify JavaScript with Rollup and Terser.
     - Extract and minify CSS into `dist/styles.css`.
     - Remove comments and console.logs from the output.

6. **Deploy Changes**
   - Commit your changes to the repository:
     ```bash
     git add .
     git commit -m "Your commit message"
     ```
   - Push the changes to GitHub (or use the dashboard's **Push** option):
     ```bash
     git push origin main
     ```

7. **Update Webflow**
   - In your Webflow project's **Project Settings → Custom Code → Head**, update the snippet to use the production CDN URL from jsDelivr. Replace `your-repo` with your repository name.
   - Uncomment and update the CSS `<link>` tag for production (see `webflow-snippet.html` for details).

## Working with Claude

This project is fully set up for [Claude Code](https://claude.com/claude-code). You can manage components, pages, builds, deployments, and project health entirely through conversation — no terminal commands needed.

> Everything below can also be done manually (CLI commands) or through the dashboard (`npm start`). Claude is just another way to work.

### Creating components

Ask Claude to create a component:

```
"Create a calculator component"
"Create a forms/contact component"
```

Claude runs `/create-component`, which scaffolds the file, registers it in `src/components.js`, and creates documentation in `.claude/rules/components/`.

In Webflow, add `data-component="calculator"` to the target element — the component loads automatically on pages where that attribute exists.

### Creating page bundles

Ask Claude to create a page-specific bundle:

```
"Create a pricing page bundle"
"Create a blog/post page bundle"
```

Claude runs `/create-page`, which scaffolds the file in `src/pages/` and creates documentation with the CDN URLs you need for Webflow.

### Renaming and deleting

```
"Rename the calculator component to price-calculator"
"Delete the example component"
"Delete the pricing page bundle"
```

Claude handles file moves, registry updates, and documentation cleanup automatically.

### Committing and deploying

```
"Commit my changes"
"Deploy a patch release"
"Deploy a minor release"
```

- **Commit**: Claude reviews all changes and creates a conventional commit message (e.g., `feat(component): add calculator`).
- **Deploy**: Claude builds production assets, bumps the version, commits, tags, and pushes — then reminds you of the updated CDN URLs for Webflow.

### Auditing project health

```
"Audit the project"
```

Claude checks for orphan component files, ghost registrations in `src/components.js`, missing or stale documentation, and doc inaccuracies. Report only — it won't auto-fix anything without your approval.

### How Claude tracks component state

Claude maintains documentation files alongside the code:

- `.claude/rules/components/<name>.md` — one file per component (purpose, Webflow setup, behavior, dependencies, DOM expectations)
- `.claude/rules/pages/<name>.md` — one file per page bundle (purpose, Webflow setup, behavior, dependencies)

These docs are read before any work and updated after every change, so Claude always knows the current state of the project. You never need to maintain them yourself.

### Quick reference

| Task               | What to say                          |
| ------------------ | ------------------------------------ |
| Create component   | "Create a `<name>` component"        |
| Create page bundle | "Create a `<name>` page"             |
| Rename component   | "Rename `<old>` to `<new>`"          |
| Delete component   | "Delete the `<name>` component"      |
| Delete page        | "Delete the `<name>` page"           |
| Commit             | "Commit my changes"                  |
| Deploy             | "Deploy a patch/minor/major release" |
| Audit              | "Audit the project"                  |

## Dashboard

Run `npm start` to open the interactive terminal dashboard. It provides a menu-driven interface for all project tasks:

| Section       | Options                                                       |
| ------------- | ------------------------------------------------------------- |
| **Core**      | Dev Server, Build                                             |
| **Create**    | Component, Page                                               |
| **Packages**  | Install, Uninstall, Update                                    |
| **Workflow**  | Git Status, Git Log, Git Pull, Tag Version, Push, Push + Tags |
| **Utilities** | Lint, Format, Tunnel                                          |

The dashboard shows the current git branch, component count, last build time, and version in the header. Command output streams to the log panel at the bottom.

## Component System

Components are modular JavaScript files that target DOM elements via `data-component` attributes.

### Global Initialization

`src/components/global.js` runs on every page before any components load. Use it for site-wide setup (analytics, global event listeners, etc.). It exports a default function that takes no arguments:

```js
export default function () {
  // Runs on every page
}
```

### Creating Components

Use the dashboard (**Create → Component**) or the CLI to scaffold new components:

```bash
npm run create-component -- calculator
npm run create-component -- forms/contact
```

The script creates the file and automatically registers it in `src/components.js`. You just need to add `data-component="calculator"` to the target element in Webflow.

Component registrations live in `src/components.js` (imported by `main.js`):

```js
export default [
  {
    selector: "[data-component='calculator']",
    importFn: () => import('./components/calculator.js'),
  },
]
```

### Component Lifecycle

Components receive an array of matching elements and can optionally return lifecycle hooks:

```js
/**
 * @param {HTMLElement[]} elements - All elements matching the component selector
 */
export default function (elements) {
  // Init: runs when the component loads
  elements.forEach((el) => {
    // Setup logic here
  })

  // Return lifecycle hooks (optional — omit if not needed)
  return {
    // Runs on window resize
    resize() {},
  }
}
```

- **Init**: The function body runs when the component loads (only if matching elements exist on the page).
- **resize()**: Called on `window.resize` events. Use for responsive recalculations.

If your component doesn't need lifecycle hooks, simply omit the return statement.

## Per-Page Bundles

For page-specific code that doesn't belong in the global component system, create files in `src/pages/` using the dashboard (**Create → Page**) or the CLI:

```bash
npm run create-page -- pricing
npm run create-page -- blog/post
```

Each file becomes a standalone bundle:

```
src/pages/pricing.js    → dist/pricing.js
src/pages/blog/post.js  → dist/blog/post.js
```

Add a separate `<script>` tag in Webflow for each page that needs it:

```html
<script
  src="https://cdn.jsdelivr.net/gh/wonderup-agency/your-repo@main/dist/pricing.js"
  defer
  type="module"
></script>
```

Page bundles can import from `src/components/` if needed but are completely independent from the `data-component` loading system.

## Configuration

Edit `src/config.js` to store project-level configuration (API keys, endpoints, feature flags, etc.):

```js
const config = {
  apiEndpoint: 'https://api.example.com',
}
export default config
```

Import it in any component or page:

```js
import config from '../config.js'
```

## Versioning & Releases

For production, use tagged releases instead of `@main` for instant cache invalidation and rollback.

### Using the Dashboard

The easiest way to version is through the dashboard (`npm start`):

1. Select **Tag Version** — it shows the current version and prompts for bump type (patch, minor, or major).
2. It bumps the version in `package.json`, creates a commit, and creates a git tag.
3. Select **Push + Tags** to push the commit and tag to GitHub. The dashboard will show the updated CDN URLs to use in Webflow.

### Using the CLI

```bash
# Bump version and create git tag
npm version patch    # 1.0.0 → 1.0.1
npm version minor    # 1.0.0 → 1.1.0
npm version major    # 1.0.0 → 2.0.0

# Push code and tags to GitHub
git push origin main --tags
```

### CDN URLs

Then use the tagged URL in Webflow:

```
https://cdn.jsdelivr.net/gh/wonderup-agency/your-repo@v1.0.1/dist/main.js
https://cdn.jsdelivr.net/gh/wonderup-agency/your-repo@v1.0.1/dist/styles.css
```

- `@main` — always latest (cached aggressively by jsDelivr, may take time to update)
- `@v1.0.1` — pinned version (instantly available, never changes)

## Project Structure

- `src/main.js`: Entry point — loads `global.js` then dynamically loads components.
- `src/components.js`: Component registry (auto-managed by `npm run create-component`).
- `src/components/global.js`: Global initialization, runs on every page.
- `src/components/`: Directory for modular JavaScript components.
- `src/pages/`: Directory for per-page standalone entry points.
- `src/config.js`: Project-level configuration.
- `scripts/dashboard.js`: Interactive terminal dashboard (`npm start`).
- `scripts/create-component.js`: CLI tool for scaffolding new components.
- `scripts/create-page.js`: CLI tool for scaffolding new page bundles.
- `dist/`: Output directory for bundled and minified assets.
- `webflow-snippet.html`: Snippet for Webflow with local/production setup instructions.
- `rollup.config.dev.js`: Rollup configuration for development.
- `rollup.config.prod.js`: Rollup configuration for production builds.
- `eslint.config.js`: ESLint configuration.

## Scripts

- `npm start`: Opens the interactive dashboard.
- `npm run dev`: Starts Rollup watch + HTTP server in one command.
- `npm run dev:build`: Starts Rollup in watch mode only.
- `npm run dev:server`: Runs the local HTTP server only.
- `npm run build`: Builds production-ready assets (linted, formatted, minified).
- `npm run lint`: Runs ESLint on source files.
- `npm run format`: Formats all code with Prettier.
- `npm run create-component -- <name>`: Scaffolds a new component and registers it.
- `npm run create-page -- <name>`: Scaffolds a new page bundle.
- `npm run tunnel`: Opens a Cloudflare tunnel to the local server.

## Notes

- The `webflow-snippet.html` file includes fallback logic to load CDN assets if the local server is unavailable during development.

## License

This project is licensed under the ISC License. See the `package.json` for details.
