---
name: create-component
description: Scaffold a new component and create its documentation
argument-hint: '[name]'
---

# Create Component: $ARGUMENTS

## Step 1 — Scaffold the component

Run the create-component script:

```
npm run create-component -- $ARGUMENTS
```

If the script fails (component already exists, etc.), stop and report the error.

## Step 2 — Create the component doc

Create a documentation file at `.claude/rules/components/$ARGUMENTS.md` with this structure:

```markdown
# <component-name>

## Purpose

<One sentence describing what this component does — fill in a placeholder for now>

## Webflow Setup

Add to any element in Webflow:
```

data-component="<component-name>"

```

## Behavior

- **Init**: <What happens when the component loads>
- **Resize**: <Whether the resize hook is used — default: not used>

## Dependencies

None.

## DOM Expectations

Elements matching `[data-component='<component-name>']`.
```

Use the actual component name (the last segment of the path, e.g., `forms/contact` → `contact` for the data attribute, `forms/contact` for the doc path).

## Step 3 — Confirm

Tell the user:

- The component file that was created
- The doc file that was created
- The `data-component` attribute to add in Webflow
