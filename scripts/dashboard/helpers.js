import {
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  existsSync,
} from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

export function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
    }).trim()
  } catch {
    return 'unknown'
  }
}

export function countFiles(dir, ext = '.js') {
  try {
    const files = readdirSync(dir, { recursive: true })
    return files.filter((f) => f.endsWith(ext)).length
  } catch {
    return 0
  }
}

export function getLastBuildTime() {
  try {
    const distPath = join('dist', 'main.js')
    if (!existsSync(distPath)) return 'never'
    const stat = statSync(distPath)
    const diff = Date.now() - stat.mtimeMs
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  } catch {
    return 'never'
  }
}

export function getCurrentVersion() {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
    return pkg.version || '0.0.0'
  } catch {
    return '0.0.0'
  }
}

export function bumpVersion(type) {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
  const [major, minor, patch] = (pkg.version || '0.0.0').split('.').map(Number)

  let newVersion
  if (type === 'major') newVersion = `${major + 1}.0.0`
  else if (type === 'minor') newVersion = `${major}.${minor + 1}.0`
  else newVersion = `${major}.${minor}.${patch + 1}`

  pkg.version = newVersion
  writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
  return newVersion
}

export function getRepoPath() {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
    const url = pkg.repository?.url || ''
    // Extract "owner/repo" from git+https://github.com/owner/repo or similar
    const match = url.match(/github\.com\/([^/]+\/[^/.]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export function copyToClipboard(text) {
  try {
    if (process.platform === 'win32') {
      execSync('clip', { input: text, stdio: ['pipe', 'ignore', 'ignore'] })
    } else if (process.platform === 'darwin') {
      execSync('pbcopy', { input: text, stdio: ['pipe', 'ignore', 'ignore'] })
    } else {
      execSync('xclip -selection clipboard', {
        input: text,
        stdio: ['pipe', 'ignore', 'ignore'],
      })
    }
    return true
  } catch {
    return false
  }
}

export function getComponentCount() {
  try {
    const content = readFileSync('src/components.js', 'utf-8')
    const matches = content.match(/importFn:/g)
    return matches ? matches.length : 0
  } catch {
    return 0
  }
}
