---
name: create-page
description: Scaffold a new page bundle and create its documentation
argument-hint: '[name]'
---

# Create Page: $ARGUMENTS

## Step 1 — Scaffold the page bundle

Run the create-page script:

```
npm run create-page -- $ARGUMENTS
```

If the script fails (page already exists, etc.), stop and report the error.

## Step 2 — Read project info

Read `package.json` to get the repository URL and current version for the CDN URL.

## Step 3 — Create the page doc

Create a documentation file at `.claude/rules/pages/$ARGUMENTS.md` with this structure:

````markdown
# <page-name>

## Purpose

<One sentence describing what this page bundle does — fill in a placeholder for now>

## Webflow Setup

Add to the specific Webflow page that needs this bundle:

```html
<script
  src="https://cdn.jsdelivr.net/gh/<owner>/<repo>@v<version>/dist/<page-name>.js"
  defer
  type="module"
></script>
```
````

Local development:

```html
<script src="http://127.0.0.1:8080/<page-name>.js" defer type="module"></script>
```

## Behavior

<What runs on page load — placeholder>

## Dependencies

None.

```

Use the actual repo path from package.json for the CDN URL. Use the current version for the tag.

## Step 3 — Confirm

Tell the user:
- The page file that was created
- The doc file that was created
- The `<script>` tag to add in Webflow
```
