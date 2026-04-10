# home

## Purpose

Page-specific bundle for the home page.

## Webflow Setup

Add to the home page in Webflow → Page Settings → Custom Code → Before `</head>`:

```html
<link
  rel="preload"
  as="script"
  href="https://cdn.jsdelivr.net/gh/wonderup-agency/starter@v1.1.1/dist/home.js"
  crossorigin
/>
<script>
  ;(function () {
    var base =
      window.__devBase ||
      (localStorage.dev
        ? 'http://127.0.0.1:8080'
        : 'https://cdn.jsdelivr.net/gh/wonderup-agency/starter@v1.1.1/dist')
    var s = document.createElement('script')
    s.src = base + '/home.js'
    s.type = 'module'
    s.defer = true
    document.head.appendChild(s)
  })()
</script>
```

## Behavior

Logs a load confirmation to the console on page load.

## Dependencies

None.
