# concat

## Purpose

Generic DOM utility: joins the trimmed text of all element children of a wrapper into the first child's text content (separator: `, `), then removes the rest. Useful for stitching CMS field values together (e.g. `position` + `name`) without per-component merge logic.

## Webflow Setup

Add to any wrapper element whose children should be joined:

```
data-component="concat"
```

The wrapper's children are the pieces to join. Each child can be any tag — only its text matters.

```html
<div data-component="concat">
  <p>Designer</p>
  <p>Jane Doe</p>
  <p>Acme Inc.</p>
</div>
```

After init, the DOM becomes:

```html
<div data-component="concat">
  <p>Designer, Jane Doe, Acme Inc.</p>
</div>
```

The first child element is preserved (its tag, classes, and styles stay intact) — only its text content is replaced. All other children are removed.

## Behavior

- **Init**: For each matching element, reads `element.children` (element children only — text nodes / whitespace between children are ignored). If fewer than 2 children, no-op. Trims each child's `textContent`, drops empty pieces, joins the remaining pieces with `, `, writes the result into the first child's `textContent`, and removes every other child. If all pieces are empty after trimming, no-op (the first child is left untouched).
- **Resize**: Not used.

## Dependencies

None.

## DOM Expectations

- Elements matching `[data-component='concat']` — any tag works (div, p, span, etc.).
- The wrapper should have 2+ element children for the merge to do anything. Wrappers with 0 or 1 children are skipped silently.
- Children can be any tag; only their `textContent` is read. Nested elements inside a child are flattened to text via `textContent`.
