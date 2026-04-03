# Dashboard (`npm start`)

Interactive terminal dashboard built with **neo-blessed**. Launched via `scripts/dashboard.js`.

## File structure

```
scripts/
  dashboard.js              Entry point: key bindings + initialization
  dashboard/
    theme.js                Color constants (T for tags, S for styles)
    menu.js                 Menu sections definition
    state.js                Shared mutable state object
    helpers.js              Data functions (git branch, file counts, build time, versioning)
    ui.js                   Screen, widgets, render functions, prompts
    process.js              Process spawning (background/foreground), kill logic
    actions.js              Action handlers (maps menu keys to commands)
```

## Architecture

### Color system (theme.js)

Blessed has two separate color contexts:

- **Tag colors (`T`)**: Used inside content strings like `{magenta-fg}text{/}`. Only named colors work (`magenta`, `light-magenta`, `gray`, `white`, `light-green`, `light-red`, `black`). Hex and 256-color numbers do NOT work in tags.
- **Style colors (`S`)**: Used in `style: { fg: 134 }` objects. 256-color numbers work here.

Never use hex colors anywhere. Never use 256-color numbers in content tags.

### State (state.js)

Single mutable object shared across all modules:

- `selectedSection` — which section is highlighted in the left column (default 0 = Core)
- `selectedItem` — which item is highlighted in the right column (default 0 = first item)
- `focusColumn` — which column has focus: `'sections'` (left) or `'items'` (right)
- `backgroundProcess` — long-running child process (dev server, tunnel), or null
- `foregroundProcess` — quick action child process (build, lint, etc.), or null
- `devServerRunning` — whether the dev server specifically is the background task
- `isPrompting` — text input box is open
- `isConfirming` — confirm prompt is showing

All key handlers in dashboard.js must check these flags to avoid conflicts.

### Two-column menu (ui.js)

The menu area is split into two side-by-side panels:

- **Section panel (left, 30% width)**: Lists all section titles. The selected section is highlighted. When focus is on sections, the selection has a purple background. When focus is on items, the selected section shows a lilac arrow indicator instead.
- **Item panel (right, 70% width)**: Shows items for the currently selected section. The panel label updates to show the current section title. When focus is on items, the selected item has a purple background. When focus is on sections, items are shown without selection highlighting.

**Border colors indicate focus**: The focused panel's border is lilac (`S.lilac`), the unfocused panel's border is purple (`S.purple`).

### Navigation model (dashboard.js)

Two-column navigation replaces the old accordion:

- **Up/Down (or k/j)**: Navigate within the current focus column. In sections, moves between section headers and resets item selection to 0. In items, moves between items within the current section (wraps around).
- **Right (or l)**: Moves focus from sections to items. Sets `selectedItem` to 0.
- **Left (or h)**: Moves focus from items back to sections.
- **Enter**: On a section, moves focus to items (same as Right). On an item, executes the action.

The right column updates instantly as you navigate sections — no need to press Enter to see a section's items.

### Process model (process.js)

Two types of processes:

- **Background (`runBackground`)**: Dev server, tunnel. Runs without blocking the menu. Output streams to log panel only when no foreground task is active. Does NOT await — fire and forget.
- **Foreground (`runForeground`)**: Build, lint, format, create-component, create-page, install, update, git status/log/pull, push. Blocks menu interaction while running. Awaited by handleAction.

On Windows, `killProcess` uses `taskkill /T /F` for tree killing since Node's `kill()` doesn't kill child processes.

### Key binding flow (dashboard.js)

All global key handlers are registered with `screen.key()` in dashboard.js. Every handler checks the state flags before acting:

- `isConfirming` — confirm prompt owns the keyboard
- `isPrompting` — text input owns the keyboard
- `foregroundProcess` — blocks menu navigation (not scrolling)

The confirm and input prompts register their OWN handlers that run alongside the global ones. The global handlers return early when prompts are active.

### Confirm prompt (ui.js → promptConfirm)

Temporarily replaces item panel content with a yes/no choice. Uses `screen.on('keypress', handler)` / `screen.removeListener('keypress', handler)` — NOT `screen.key()`/`screen.unkey()` which are unreliable in blessed (handlers accumulate and are never properly removed).

**Critical timing considerations:**

1. **Handler registration is deferred with `process.nextTick()`** — the Enter keypress that triggers the confirm from the menu would otherwise also immediately accept it (blessed fires all listeners synchronously in the same event cycle).
2. **State reset (`isConfirming = false`) is deferred with `process.nextTick()`** — when the user accepts/cancels, the cleanup sets `isConfirming = false` on next tick so the global Enter handler still sees `isConfirming === true` during the current keypress cycle and skips.
3. **A `resolved` guard** prevents double-resolve if cleanup is called multiple times.

### Text input prompt (ui.js → promptInput)

Creates a neo-blessed textbox as a child of the item panel (bottom-anchored). Uses neo-blessed's built-in `readInput()` with `submit`/`cancel` events.

Accepts an optional `allowedPattern` regex (e.g., `/[^a-z/-]/g`). When provided, a `keypress` handler runs on `nextTick` after blessed's `_listener` adds the character to `value`, then strips any disallowed characters. Component and page name inputs only allow lowercase letters, dashes, and slashes.

The terminal cursor is shown via raw ANSI (`\x1b[?25h`) when the input opens and hidden again on cleanup. The render event hides the cursor on every render EXCEPT when `isPrompting` is true.

### Cursor management (ui.js)

VS Code's terminal ignores blessed's `hideCursor()` method. We write `\x1b[?25l` (hide) and `\x1b[?25h` (show) directly to stdout. The cursor is hidden after every render via `screen.on('render')`, except during text input. On process exit, cursor is restored.

### Action conflict handling (actions.js)

When a background task is running and the user selects a conflicting action:

- **Build while dev/tunnel running**: Shows confirm prompt, kills bg process if accepted, then runs build.
- **Dev while tunnel running (or vice versa)**: Same confirm pattern.
- **Dev while dev already running**: Shows "already running" message, no confirm.
- **Tunnel while tunnel already running**: Same.
- **Lint/Format while dev running**: Just runs — safe, dev auto-rebuilds on file changes.
- **Create component/page while dev running**: Runs the scaffolding, then automatically restarts the dev server so Rollup picks up the new entry point.
- **Install/Uninstall while dev running**: Runs the npm command, then automatically restarts the dev server so Rollup picks up the change.
- **Other workflow items while dev running**: Update, git status/log/pull, push, tag — all just run, no conflict.
- **Push / Push + Tags**: Always show confirm prompt regardless of background state.

The `confirmStopBackground()` helper handles the confirm → kill → state cleanup flow.

### Package actions (actions.js)

The Packages section contains npm dependency management:

- **Install**: Multi-step action. Prompts for package name(s) (space-separated). For each package, asks whether to install as regular or dev dependency via confirm prompt. Batches packages by dep type and runs `npm install` (regular) and `npm install --save-dev` (dev) as separate foreground tasks. If the dev server is running, restarts it afterward.
- **Uninstall**: Prompts for package name(s) (space-separated), shows a confirm prompt, then runs `npm uninstall <packages>`. If the dev server is running, restarts it afterward.
- **Update**: Simple foreground `npm update`.

### Workflow actions (actions.js)

The Workflow section contains git operations:

- **Git Status / Git Log / Git Pull**: Simple foreground git commands. Log shows last 15 commits with `--oneline --graph --decorate`.
- **Tag Version**: Multi-step action that reads current version from package.json, prompts for bump type (patch/minor/major) via `promptInput`, bumps package.json with `bumpVersion()`, then runs `git add package.json`, `git commit`, and `git tag` via synchronous `execSync`. Does NOT push — user must explicitly push afterward.
- **Push**: Confirm prompt → `git push`.
- **Push + Tags**: Confirm prompt → `git push --follow-tags` → appends a Webflow CDN reminder to the log panel showing the new versioned JS and CSS URLs. The repo path for the CDN URL is read dynamically from `package.json`'s `repository.url` via `getRepoPath()`.

### Auto-clipboard (actions.js + helpers.js)

Only **Push + Tags** copies to clipboard — the versioned CDN URLs (JS + CSS).

**Create Component** and **Create Page** log their copy-pastable output directly to the log panel instead of copying to clipboard.

`copyToClipboard(text)` in helpers.js detects the platform and pipes to `clip` (Windows), `pbcopy` (macOS), or `xclip` (Linux). Fails silently if unavailable.

### Version helpers (helpers.js)

- `getCurrentVersion()` — reads `version` from package.json (falls back to `0.0.0`).
- `bumpVersion(type)` — calculates new version for `major`/`minor`/`patch`, writes it to package.json, returns the new version string.
- `getRepoPath()` — extracts `owner/repo` from `package.json`'s `repository.url` (matches `github.com/owner/repo` pattern). Returns `null` if not found.
- `copyToClipboard(text)` — copies text to system clipboard. Returns `true` on success, `false` on failure.

### Log scrolling (dashboard.js + ui.js)

- `Shift+Up/Down`: scroll 3 lines
- `PageUp/PageDown`: scroll 10 lines
- Mouse scrolling: enabled via `mouse: true` on log panel

## Menu sections

Two-column layout — left column shows all sections, right column shows items for the selected section. Navigation updates the right column instantly as you move through sections.

1. **Core** — Dev Server, Build
2. **Create** — Component, Page
3. **Packages** — Install, Uninstall, Update
4. **Workflow** — Git Status, Git Log, Git Pull, Tag Version, Push, Push + Tags
5. **Utilities** — Lint, Format, Tunnel

## Layout

```
+---------------------------------------------+
| Header (3 rows): brand, git info, stats      |
+-------------+-------------------------------+
| Sections    | Items (for selected section)  |
| (30% width) | (70% width)                   |
|             |                               |
|  ▸ Core     |  ▸ Dev Server                 |
|    Create   |    Build                      |
|    Workflow  |                               |
|    Utilities |                               |
|             | [Input prompt at bottom]       |
+-------------+-------------------------------+
| Log panel (remaining, full width)            |
| Command output — scrollable                  |
+---------------------------------------------+
| Status bar (2 rows): keybinding hints        |
+---------------------------------------------+
```

## How to add a new menu item

1. **menu.js**: Add entry to the appropriate section in `MENU_SECTIONS` with `label`, `key`, and `description`.
2. **actions.js**: Add a `case` in `handleAction()` for the new key. Decide if it's foreground (`await runForeground(...)`) or background (`runBackground(...)`). If background, add conflict handling.
3. No changes needed in dashboard.js or ui.js.

## How to add a new background task type

1. Add menu item + action as above using `runBackground()`.
2. In actions.js, add duplicate-detection logic (like the dev/tunnel checks).
3. In process.js `runBackground()`, the `devServerRunning` flag is set based on `args.includes('dev')`. If the new task needs its own flag, add it to state.js and update the relevant checks.

## Known neo-blessed quirks

- `screen.key()`/`screen.unkey()` is unreliable for temporary handlers. Use `screen.on('keypress')` / `screen.removeListener('keypress')` instead.
- Tag colors only accept named colors, not hex or 256-numbers.
- Style objects accept 256-color numbers but not hex reliably.
- `hideCursor()` doesn't work in VS Code terminal — use raw ANSI escape codes.
- Blessed fires all listeners for a keypress synchronously, so `process.nextTick()` is needed to defer state changes that would affect other listeners in the same cycle.
- The `artificial` cursor option in screen config draws a visible cursor character — do not use it.
- `keys: true` on boxes makes them focusable and can show unwanted cursors — avoid unless needed.
