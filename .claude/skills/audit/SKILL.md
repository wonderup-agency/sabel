---
name: audit
description: Audit components and pages for orphans, missing docs, stale docs, and doc accuracy
---

# Audit Components & Pages

Run all checks below in order. Collect every issue found, then print a single summary report at the end. **Do not fix anything** — report only.

## Ignored files

Skip these files entirely — do not flag them in any check:

- `src/components/example.js` (scaffold example, not a real component)

---

## Check 1 — Registry & File Sync (Components)

**Goal**: Every entry in `src/components.js` should have a matching file, and every file in `src/components/` should be registered.

1. Read `src/components.js` and extract all registered component paths from the `importFn` fields (e.g., `./components/calculator.js` → `src/components/calculator.js`).
2. Glob for all `.js` files in `src/components/` (recursive), excluding `global.js`.
3. Compare:
   - **Ghost registrations**: entries in `components.js` whose file doesn't exist → issue
   - **Orphan files**: files in `src/components/` that aren't registered in `components.js` → issue

## Check 2 — Registry & File Sync (Pages)

**Goal**: Every `.js` file in `src/pages/` should exist (no broken references from docs).

1. Glob for all `.js` files in `src/pages/` (recursive).
2. Keep this list for the doc checks below.

## Check 3 — Missing Docs

**Goal**: Every component and page should have a matching doc.

1. For each registered component (from Check 1), check if a doc exists at `.claude/rules/components/<name>.md` (where `<name>` matches the file path relative to `src/components/`, without `.js`).
   - Example: `src/components/forms/contact.js` → `.claude/rules/components/forms/contact.md`
   - Missing doc → issue
2. For each page file (from Check 2), check if a doc exists at `.claude/rules/pages/<name>.md` (where `<name>` matches the file path relative to `src/pages/`, without `.js`).
   - Missing doc → issue

## Check 4 — Stale Docs

**Goal**: Every doc should reference a component or page that still exists.

1. Glob for all `.md` files in `.claude/rules/components/` (recursive).
2. For each doc, check if the corresponding component file exists in `src/components/`. If not → stale doc issue.
3. Glob for all `.md` files in `.claude/rules/pages/` (recursive).
4. For each doc, check if the corresponding page file exists in `src/pages/`. If not → stale doc issue.

## Check 5 — Doc Content Validation (Components)

**Goal**: Each component doc should accurately reflect its code.

For each component that has both a file and a doc:

1. Read the component file and extract:
   - The `data-component` attribute value it expects (from the registry selector in `components.js`)
   - Whether it returns a `resize()` hook
   - Any imports (dependencies on other files, libraries, or config)

2. Read the matching doc and verify:
   - The `data-component` value mentioned in the doc matches the registry selector
   - The resize hook status matches (doc says "used" vs code actually returns one)
   - Dependencies listed in the doc match actual imports in the code
   - If any of these are wrong or missing → issue with specifics

## Check 6 — Doc Content Validation (Pages)

**Goal**: Each page doc should accurately reflect its code.

For each page that has both a file and a doc:

1. Read the page file and extract:
   - Any imports (dependencies on components, config, libraries)

2. Read the matching doc and verify:
   - Dependencies listed match actual imports
   - If wrong or missing → issue with specifics

---

## Report

Print a summary grouped by check type. Use this format:

```
## Audit Report

### Registry & File Sync
- ✅ No issues (or list each issue)

### Missing Docs
- ✅ No issues (or list each missing doc)

### Stale Docs
- ✅ No issues (or list each stale doc)

### Doc Content Validation
- ✅ No issues (or list each inaccuracy)

### Summary
X issues found across Y components and Z pages.
```

If zero issues are found across all checks, say:

> Everything looks good — all components and pages are properly registered, documented, and in sync.

---

## Proposed Actions

If any issues were found, add a **Proposed Actions** section after the summary. For each issue, propose a specific fix using the appropriate skill or manual step. Group by action type.

Use this format:

```
### Proposed Actions

| # | Issue | Action |
|---|-------|--------|
| 1 | Ghost registration: `example` | Run `/delete-component example` to remove the registry entry and file |
| 2 | Orphan file: `src/components/old.js` | Run `/delete-component old` to clean up, or register it if it's needed |
| 3 | Missing doc: `src/pages/page-two.js` | Create `.claude/rules/pages/page-two.md` with the standard page doc template |
| 4 | Stale doc: `.claude/rules/components/removed.md` | Delete the doc — the component no longer exists |
| 5 | Doc inaccuracy: `rotate.md` lists no dependencies but code imports `gsap` | Update the doc's Dependencies section to list `gsap` |
```

Rules for proposed actions:

- **Ghost registrations** → suggest `/delete-component` to clean up
- **Orphan files** → suggest `/delete-component` to remove, or registering it if intentional
- **Missing component docs** → suggest creating the doc with the standard template
- **Missing page docs** → suggest creating the doc with the standard page template
- **Stale docs** → suggest deleting the doc file
- **Doc inaccuracies** → describe the specific field to update and the correct value

After the table, ask the user: **"Want me to fix any of these? Reply with the numbers (e.g., 1, 3) or 'all'."**

Do NOT fix anything automatically — wait for the user to confirm which actions to take.
