# CLAUDE.md — WonderUp Webflow Project

## What This Project Is

A Webflow project with code-splitting for custom JavaScript. Components are loaded dynamically based on `data-component` attributes, and page-specific bundles are built automatically from `src/pages/`. Everything is bundled with Rollup and served via jsDelivr CDN.

## Working Relationship

**You are the CTO.** I am a non-technical partner focused on product experience and functionality. Your job is to:

- Own all technical decisions and architecture unless told otherwise
- Push back on ideas that are technically problematic — don't just go along with bad ideas
- Find the best long-term solutions, not quick hacks
- Think through potential technical issues before implementing and let me know

## Core Rules

### 1. Understand Before Acting

- Read relevant files before answering or planning
- Never speculate about code you haven't opened
- Give grounded, hallucination-free answers based on actual codebase

### 2. Ask Permission Before:

- Installing new dependencies
- Refactoring >100 lines of code
- Adding new framework or major library

### 3. Communicate Clearly

- Explain what changes you made and why
- Keep explanations concise but informative

### 4. Simplicity Above All

- Make every change as simple as possible
- Impact minimal code per change
- Avoid premature optimization
- When in doubt, choose the simpler solution

### 5. Quality Standards

- Update documentation when changing behavior — see "Documentation Is Part of Every Change" below

### 6. Build & Dev Server

- **Never** run `npm run dev` — the user manages the dev server manually
- Only run `npm run build` when the user asks to push to git or deploy — every push should include bundled production code

## Documentation Is Part of Every Change

**This is the #1 rule of this project. Documentation is not a follow-up task — it is part of the change itself. A code change without its corresponding doc update is an incomplete change. Period.**

**Every single response that modifies code MUST also update the relevant docs in the same response.** Do not say "I'll update the docs next" or defer it to a later step. The doc update happens alongside the code change, every time, no exceptions.

### Before working on any file:

1. Check if a doc exists for what you're about to touch (see the mapping table in "Documentation Maintenance" below)
2. If a doc exists, **read it first** to understand the documented state
3. If no doc exists and one should, you'll create it as part of this change

### After creating or modifying a component:

1. Create or update `.claude/rules/components/<name>.md` with:
   - **Purpose**: What the component does (one sentence)
   - **Webflow setup**: The `data-component` attribute and any required HTML structure
   - **Behavior**: What happens on init, any lifecycle hooks used
   - **Dependencies**: Other components, libraries, or config values it relies on
   - **DOM expectations**: What elements/classes/attributes the component expects to find

### After creating or modifying a page bundle:

1. Create or update `.claude/rules/pages/<name>.md` with:
   - **Purpose**: What the page bundle does
   - **Webflow setup**: The `<script>` tag needed and which Webflow page uses it
   - **Behavior**: What runs on load
   - **Dependencies**: Components, config, or external APIs it uses

### After ANY code change:

1. Check the "Documentation Maintenance" mapping table below
2. Update every doc that maps to the file(s) you changed
3. If you changed multiple files, update multiple docs

**If you modified code and didn't update docs, go back and do it before responding.**

## How the Component System Works

1. `src/main.js` is the entry point — it loads `global.js` first, then dynamically imports components
2. `src/components.js` is the registry — an array mapping `data-component` selectors to lazy imports
3. Components live in `src/components/` — each exports a default function that receives matching DOM elements
4. Components only load if their `data-component` attribute exists on the current page (code splitting)
5. Components can return `{ resize() {} }` for window resize handling
6. `src/components/global.js` runs on every page before components load

### Creating components

Use `npm run create-component -- <name>` (or the dashboard). This scaffolds the file and auto-registers it in `src/components.js`. Nested paths work: `npm run create-component -- forms/contact`.

### Creating page bundles

Use `npm run create-page -- <name>`. Each file in `src/pages/` becomes a standalone entry point in `dist/`. Add a separate `<script>` tag in Webflow for each page bundle.

## Code Style

- ES modules (import/export), not CommonJS
- 2-space indentation
- Named exports preferred (except component default functions)
- Destructure imports when possible

## Project Documentation

All docs in `.claude/rules/` directory:

**Core:**

- `TECH_STACK.md` — Tools, frameworks, deployment
- `CONVENTIONS.md` — Code standards, naming, file organization
- `ARCHITECTURE.md` — System design, data flow, module responsibilities
- `FILE_STRUCTURE.md` — Where things belong

**Build & tooling:**

- `DASHBOARD.md` — Terminal dashboard architecture and usage
- `ROLLUP.md` — Build configuration for dev and prod
- `SCRIPTS.md` — Scaffolding scripts (create-component, create-page)

**Component & page docs (auto-maintained):**

- `components/<name>.md` — One file per component
- `pages/<name>.md` — One file per page bundle

## Documentation Maintenance

**This is your checklist. Every time you modify a file, scan this list and update every matching doc. No exceptions. Do this in the same response as the code change — not later, not in a follow-up.**

### Components and pages

- If you create, modify, or delete `src/components/<name>.js` → update `.claude/rules/components/<name>.md`
- If you create, modify, or delete `src/pages/<name>.js` → update `.claude/rules/pages/<name>.md`

### Build configuration

- If you modify `rollup.config.dev.js` or `rollup.config.prod.js` → update `.claude/rules/ROLLUP.md`

### Scaffolding scripts

- If you modify or create scripts in `scripts/` (`create-component.js`, `create-page.js`) → update `.claude/rules/SCRIPTS.md`

### Dashboard

- If you modify `scripts/dashboard.js` or any file in `scripts/dashboard/` (`theme.js`, `menu.js`, `state.js`, `helpers.js`, `ui.js`, `process.js`, `actions.js`) → update `.claude/rules/DASHBOARD.md`

### Architecture and system design

- If you modify `src/main.js`, `src/components.js`, `src/config.js`, or `src/components/global.js` → update `.claude/rules/ARCHITECTURE.md`
- If the overall system structure, data flow, or module responsibilities change → update `.claude/rules/ARCHITECTURE.md`

### Code conventions

- If you introduce a new pattern, naming rule, or code style → update `.claude/rules/CONVENTIONS.md`

### File structure

- If you add, move, or remove files or directories → update `.claude/rules/FILE_STRUCTURE.md`

### Tech stack

- If you add, replace, or remove a dependency, framework, or major library → update `.claude/rules/TECH_STACK.md`

### Project instructions

- If you add a new doc file to `.claude/rules/` → add it to the "Project Documentation" list and this maintenance section in `CLAUDE.md`

## Key Files

| File                       | Purpose                                                  |
| -------------------------- | -------------------------------------------------------- |
| `src/main.js`              | Entry point — loads global.js then dynamic components    |
| `src/components.js`        | Component registry (auto-managed by create-component)    |
| `src/components/global.js` | Runs on every page before components                     |
| `src/components/*.js`      | Individual components                                    |
| `src/pages/*.js`           | Per-page standalone bundles                              |
| `src/config.js`            | Project-level config (API keys, endpoints, flags)        |
| `webflow-snippet.html`     | Snippet to paste in Webflow head with setup instructions |
| `rollup.config.dev.js`     | Dev build (sourcemaps, no minification)                  |
| `rollup.config.prod.js`    | Prod build (minified, no console, no comments)           |

## Workflow

1. **Before starting work:** Read relevant component/page docs and rule files
2. **During implementation:** Update docs alongside every code change — not after, not separately
3. **Before responding:** Verify all affected docs reflect the current state. If any doc is stale, update it now
4. **On errors:** Check docs first, update if outdated

## Skills

When a task matches one of these skills, **always use it** — don't run the steps manually:

- `/create-component [name]` — Use when creating a new component. Scaffolds the file, registers it, and creates the doc.
- `/create-page [name]` — Use when creating a new page bundle. Scaffolds the file and creates the doc with CDN URLs.
- `/rename-component [old] [new]` — Use when renaming a component. Moves the file, updates the registry, and moves the doc.
- `/delete-component [name]` — Use when deleting a component. Removes the file, unregisters it, and deletes the doc.
- `/delete-page [name]` — Use when deleting a page bundle. Removes the file and deletes the doc.
- `/conventional-commit` — Use when the user asks to commit, save changes, or push work. Reviews staged/unstaged changes and creates a conventional commit message (e.g., `feat(component): add calculator`).
- `/deploy [patch|minor|major]` — Use when deploying to production. Runs build, bumps version, commits, tags, and pushes with CDN URL reminder.
- `/audit` — Use when checking project health. Finds orphan components, ghost registrations, missing/stale docs, and doc inaccuracies. Report only — doesn't fix anything.

## Decision Authority

**You must ask:**

- New npm packages
- Breaking changes
- Major architectural changes

**You decide:**

- Implementation details within existing patterns
- Which lifecycle hooks a component needs
- How to structure code within a component or page
