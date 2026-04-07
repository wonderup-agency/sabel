# File Structure

```
├── src/
│   ├── main.js                    Entry point — loads global.js then components
│   ├── components.js              Component registry (auto-managed by create-component)
│   ├── config.js                  Shared project config (API keys, endpoints, flags)
│   ├── components/
│   │   ├── global.js              Runs on every page before components load
│   │   ├── home.js                Home page animations (nav, infinity, lines)
│   │   ├── map.js                 SVG world map with animated glow points
│   │   ├── horizontal-line.js      Horizontal line grows center-to-sides on scroll
│   │   ├── logo-marquee.js        Infinite RTL scrolling logo marquee
│   │   ├── noise-effect.js        Dark monochrome noise texture overlay
│   │   ├── testimonial-cards.js   Animated card stack cycling testimonials
│   │   ├── timeline.js            Scroll-activated timeline with lines and bullets
│   │   └── vertical-line.js       Vertical line grows top-to-bottom on scroll
│   └── pages/
│       └── .gitkeep               Per-page standalone bundles go here
│
├── dist/                          Build output (committed to git, cleaned by prod build)
│   ├── main.js                    Bundled entry point
│   ├── styles.css                 Extracted CSS
│   └── *.js                       Page bundles and code-split chunks
│
├── scripts/
│   ├── dashboard.js               Dashboard entry point
│   ├── create-component.js        Scaffolds component + registers in components.js
│   ├── create-page.js             Scaffolds page bundle in src/pages/
│   └── dashboard/
│       ├── theme.js               Color constants (tag colors + style colors)
│       ├── menu.js                Menu sections and flat item list
│       ├── state.js               Shared mutable state
│       ├── helpers.js             Git branch, file counts, versioning utilities
│       ├── ui.js                  Screen, widgets, render functions, prompts
│       ├── process.js             Process spawning and kill logic
│       └── actions.js             Action handlers for menu items
│
├── .claude/
│   ├── CLAUDE.md                  Project instructions for Claude
│   ├── skills/                    Claude skill definitions
│   └── rules/
│       ├── ARCHITECTURE.md        System design and data flow
│       ├── CONVENTIONS.md         Code standards and patterns
│       ├── DASHBOARD.md           Dashboard architecture
│       ├── FILE_STRUCTURE.md      This file
│       ├── ROLLUP.md              Build configuration
│       ├── SCRIPTS.md             Scaffolding scripts (create-component, create-page)
│       ├── TECH_STACK.md          Tools and frameworks
│       ├── components/            Component documentation (one .md per component)
│       └── pages/                 Page bundle documentation (one .md per page)
│
├── rollup.config.dev.js           Dev build config (sourcemaps, no minification)
├── rollup.config.prod.js          Prod build config (minified, no console)
├── eslint.config.js               ESLint flat config
├── .prettierignore                Excludes dist/ from Prettier formatting
├── package.json                   Dependencies, scripts, project metadata
├── webflow-snippet.html           Copy-paste snippet for Webflow head section
├── CLAUDE.md                      Project instructions for Claude
├── CHANGELOG.md                   Release notes
└── README.md                      Project documentation
```

## Where things go

| What                   | Where                                                         |
| ---------------------- | ------------------------------------------------------------- |
| New component          | `src/components/<name>.js` (use `npm run create-component`)   |
| Component subdirectory | `src/components/<group>/<name>.js` (e.g., `forms/contact.js`) |
| Component registration | `src/components.js` (auto-managed by create-component)        |
| Global site-wide code  | `src/components/global.js`                                    |
| Page-specific bundle   | `src/pages/<name>.js` (use `npm run create-page`)             |
| Nested page bundle     | `src/pages/<section>/<name>.js` (e.g., `blog/post.js`)        |
| Project config         | `src/config.js`                                               |
| CSS                    | Import in any JS file — extracts to `dist/styles.css`         |
| Node scripts           | `scripts/`                                                    |
| Dashboard modules      | `scripts/dashboard/`                                          |
| Component docs         | `.claude/rules/components/<name>.md`                          |
| Page docs              | `.claude/rules/pages/<name>.md`                               |
| Architecture docs      | `.claude/rules/`                                              |
