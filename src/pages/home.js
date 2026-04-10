/*
Page bundle: home
Add to Webflow → Page Settings → Custom Code → Before </head>:

<link rel="preload" as="script" href="https://cdn.jsdelivr.net/gh/wonderup-agency/starter@v1.1.1/dist/home.js" crossorigin>
<script>
  (function () {
    var base = window.__devBase || (localStorage.dev ? 'http://127.0.0.1:8080' : 'https://cdn.jsdelivr.net/gh/wonderup-agency/starter@v1.1.1/dist')
    var s = document.createElement('script')
    s.src = base + '/home.js'
    s.type = 'module'
    s.defer = true
    document.head.appendChild(s)
  })()
</script>
*/

console.log('%c📄 [home] Page loaded', 'color: #a78bfa; font-weight: bold')
