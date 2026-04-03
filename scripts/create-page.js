import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, basename, join } from 'node:path'
import pc from 'picocolors'

const rawArg = process.argv[2]

if (!rawArg) {
  console.log()
  console.log(pc.red('Missing page name.'))
  console.log()
  console.log(`Usage: ${pc.cyan('npm run create-page -- <path/name>')}`)
  console.log()
  console.log('Examples:')
  console.log(`  ${pc.dim('$')} npm run create-page -- contact`)
  console.log(`  ${pc.dim('$')} npm run create-page -- marketing/landing`)
  console.log()
  process.exit(1)
}

const arg = rawArg.replace(/\s+/g, '-').toLowerCase()
const name = basename(arg)
const pagePath = join('src', 'pages', `${arg}.js`)

// Check if file already exists
if (existsSync(pagePath)) {
  console.log()
  console.log(pc.red(`Page file already exists: ${pc.bold(pagePath)}`))
  console.log()
  process.exit(1)
}

// Build CDN URL
let repoPath = null
let version = null
try {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
  version = pkg.version || '0.0.0'
  const url = pkg.repository?.url || ''
  const match = url.match(/github\.com\/([^/]+\/[^/.]+)/)
  repoPath = match ? match[1] : null
} catch {}

const cdnBase = repoPath
  ? `https://cdn.jsdelivr.net/gh/${repoPath}`
  : `https://cdn.jsdelivr.net/gh/<owner>/<repo>`

// Create page file
const template = `/*
<!--
Page specific bundle: ${name}
Local: http://127.0.0.1:8080/${arg}.js
Production: ${cdnBase}@v${version}/dist/${arg}.js
-->
<script src="http://127.0.0.1:8080/${arg}.js" defer type="module"></script>
*/

console.log('%c📄 [${name}] Page loaded', 'color: #a78bfa; font-weight: bold')
`

mkdirSync(dirname(pagePath), { recursive: true })
writeFileSync(pagePath, template)

const localTag = `<script src="http://127.0.0.1:8080/${arg}.js" defer type="module"></script>`
const cdnTag = `<script src="${cdnBase}@v${version}/dist/${arg}.js" defer type="module"></script>`

console.log()
console.log(pc.green(`${pc.bold('✓')} Created ${pc.bold(pagePath)}`))
console.log()
console.log(`Add to your Webflow page:`)
console.log()
console.log(`  ${pc.cyan(localTag)}`)
console.log(`  ${pc.dim(`<!-- ${cdnTag} -->`)}`)
console.log()
