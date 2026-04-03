import { execSync } from 'node:child_process'
import { T } from './theme.js'
import { state } from './state.js'
import { appendLog, updateHeader, promptInput, promptConfirm } from './ui.js'
import { runBackground, runForeground, killProcess } from './process.js'
import {
  getCurrentVersion,
  bumpVersion,
  getRepoPath,
  copyToClipboard,
} from './helpers.js'

function getBackgroundTaskName() {
  return state.devServerRunning ? 'Dev Server' : 'Tunnel'
}

async function confirmStopBackground(actionLabel) {
  const taskName = getBackgroundTaskName()
  const confirmed = await promptConfirm(
    `${taskName} is running. Stop it to run ${actionLabel}?`,
    `Yes, stop and ${actionLabel.toLowerCase()}`,
    'Cancel'
  )
  if (!confirmed) return false

  killProcess(state.backgroundProcess)
  state.backgroundProcess = null
  state.devServerRunning = false
  updateHeader()
  return true
}

async function restartDevServer() {
  appendLog(`\n{${T.dim}-fg}Restarting Dev Server...{/}\n`)
  killProcess(state.backgroundProcess)
  state.backgroundProcess = null
  state.devServerRunning = false
  updateHeader()
  // Small delay to let the process fully exit before restarting
  await new Promise((r) => setTimeout(r, 500))
  runBackground('npm', ['run', 'dev'])
}

export async function handleAction(key) {
  switch (key) {
    case 'dev':
      if (state.backgroundProcess) {
        if (state.devServerRunning) {
          appendLog(`{${T.dim}-fg}Dev Server is already running.{/}\n`)
          return
        }
        if (!(await confirmStopBackground('Dev Server'))) return
      }
      runBackground('npm', ['run', 'dev'])
      break

    case 'build':
      if (state.backgroundProcess) {
        if (!(await confirmStopBackground('Build'))) return
      }
      await runForeground('npm', ['run', 'build'])
      break

    case 'create-component': {
      const name = await promptInput(
        'Component name (e.g. calculator, forms/contact):',
        /[^a-z/-]/g
      )
      if (name) {
        const code = await runForeground('node', [
          'scripts/create-component.js',
          name,
        ])
        updateHeader()
        if (code === 0) {
          const baseName = name.split('/').pop()
          appendLog(`{${T.green}-fg}Add to your Webflow element:{/}\n`)
          appendLog(`{${T.white}-fg}  data-component="${baseName}"{/}\n`)
        }
        if (state.devServerRunning) await restartDevServer()
      } else {
        appendLog(`{${T.dim}-fg}Cancelled{/}\n`)
      }
      break
    }

    case 'create-page': {
      const name = await promptInput(
        'Page name (e.g. contact, marketing/landing):',
        /[^a-z/-]/g
      )
      if (name) {
        const code = await runForeground('node', [
          'scripts/create-page.js',
          name,
        ])
        updateHeader()
        if (code === 0) {
          const repo = getRepoPath()
          const version = getCurrentVersion()
          const localTag = `<script src="http://127.0.0.1:8080/${name}.js" defer type="module"></script>`
          const cdnTag = repo
            ? `<script src="https://cdn.jsdelivr.net/gh/${repo}@v${version}/dist/${name}.js" defer type="module"></script>`
            : `<script src="https://cdn.jsdelivr.net/gh/<owner>/<repo>@v${version}/dist/${name}.js" defer type="module"></script>`
          appendLog(`{${T.green}-fg}Add to your Webflow page:{/}\n`)
          appendLog(`{${T.white}-fg}  ${localTag}{/}\n`)
          appendLog(`{${T.dim}-fg}  <!-- ${cdnTag} -->{/}\n`)
        }
        if (state.devServerRunning) await restartDevServer()
      } else {
        appendLog(`{${T.dim}-fg}Cancelled{/}\n`)
      }
      break
    }

    case 'lint':
      await runForeground('npm', ['run', 'lint'])
      break

    case 'format':
      await runForeground('npm', ['run', 'format'])
      break

    case 'tunnel':
      if (state.backgroundProcess) {
        if (!state.devServerRunning) {
          appendLog(`{${T.dim}-fg}Tunnel is already running.{/}\n`)
          return
        }
        if (!(await confirmStopBackground('Tunnel'))) return
      }
      runBackground('npm', ['run', 'tunnel'])
      break

    case 'install-package': {
      const input = await promptInput(
        'Package name(s), space-separated (e.g. gsap lenis):'
      )
      if (!input) {
        appendLog(`{${T.dim}-fg}Cancelled{/}\n`)
        break
      }

      const pkgList = input.split(/\s+/).filter(Boolean)
      if (pkgList.length === 0) {
        appendLog(`{${T.red}-fg}No package names provided{/}\n`)
        break
      }

      // Ask dep type for each package
      const regular = []
      const dev = []
      let cancelled = false

      for (const pkg of pkgList) {
        const isRegular = await promptConfirm(
          `Install ${pkg} as:`,
          'Regular dependency',
          'Dev dependency (--save-dev)'
        )
        if (state.isConfirming) {
          // User pressed escape during confirm — shouldn't happen, but guard
          cancelled = true
          break
        }
        if (isRegular) {
          regular.push(pkg)
        } else {
          dev.push(pkg)
        }
      }

      if (cancelled) {
        appendLog(`{${T.dim}-fg}Cancelled{/}\n`)
        break
      }

      // Install regular deps
      let allOk = true
      if (regular.length > 0) {
        const code = await runForeground('npm', ['install', ...regular])
        if (code === 0) {
          appendLog(`{${T.green}-fg}Installed: ${regular.join(', ')}{/}\n`)
        } else {
          allOk = false
        }
      }

      // Install dev deps
      if (dev.length > 0) {
        const code = await runForeground('npm', [
          'install',
          '--save-dev',
          ...dev,
        ])
        if (code === 0) {
          appendLog(`{${T.green}-fg}Installed (dev): ${dev.join(', ')}{/}\n`)
        } else {
          allOk = false
        }
      }

      if (allOk && state.devServerRunning) await restartDevServer()
      break
    }

    case 'uninstall-package': {
      const input = await promptInput(
        'Package name(s) to uninstall, space-separated:'
      )
      if (!input) {
        appendLog(`{${T.dim}-fg}Cancelled{/}\n`)
        break
      }

      const pkgList = input.split(/\s+/).filter(Boolean)
      if (pkgList.length === 0) {
        appendLog(`{${T.red}-fg}No package names provided{/}\n`)
        break
      }

      const confirmed = await promptConfirm(
        `Uninstall ${pkgList.join(', ')}?`,
        'Yes, uninstall',
        'Cancel'
      )
      if (!confirmed) break

      const code = await runForeground('npm', ['uninstall', ...pkgList])
      if (code === 0) {
        appendLog(`{${T.green}-fg}Uninstalled: ${pkgList.join(', ')}{/}\n`)
        if (state.devServerRunning) await restartDevServer()
      }
      break
    }

    case 'update':
      await runForeground('npm', ['update'])
      break

    case 'git-status':
      await runForeground('git', ['status'])
      break

    case 'git-log':
      await runForeground('git', [
        'log',
        '--oneline',
        '--graph',
        '--decorate',
        '-15',
      ])
      break

    case 'git-pull':
      await runForeground('git', ['pull'])
      break

    case 'tag-version': {
      const current = getCurrentVersion()
      const [maj, min, pat] = current.split('.').map(Number)

      const patchV = `${maj}.${min}.${pat + 1}`
      const minorV = `${maj}.${min + 1}.0`
      const majorV = `${maj + 1}.0.0`

      const choice = await promptInput(
        `Current: v${current} — Type: patch (${patchV}), minor (${minorV}), or major (${majorV})`
      )
      if (!choice) {
        appendLog(`{${T.dim}-fg}Cancelled{/}\n`)
        break
      }

      const type = choice.toLowerCase().trim()
      if (!['patch', 'minor', 'major'].includes(type)) {
        appendLog(
          `{${T.red}-fg}Invalid choice "${type}". Use: patch, minor, or major{/}\n`
        )
        break
      }

      const newVersion = bumpVersion(type)
      appendLog(
        `{${T.green}-fg}Bumped version: v${current} → v${newVersion}{/}\n`
      )

      try {
        execSync('git add package.json', { stdio: 'ignore' })
        execSync(`git commit -m "v${newVersion}"`, { stdio: 'ignore' })
        execSync(`git tag v${newVersion}`, { stdio: 'ignore' })
        appendLog(`{${T.green}-fg}Created commit and tag v${newVersion}{/}\n`)
      } catch (err) {
        appendLog(`{${T.red}-fg}Git error: ${err.message}{/}\n`)
      }
      break
    }

    case 'git-push': {
      const confirmed = await promptConfirm(
        'Push commits to remote?',
        'Yes, push',
        'Cancel'
      )
      if (!confirmed) break
      await runForeground('git', ['push'])
      break
    }

    case 'git-push-tags': {
      const confirmed = await promptConfirm(
        'Push commits and tags to remote?',
        'Yes, push all',
        'Cancel'
      )
      if (!confirmed) break
      await runForeground('git', ['push', '--follow-tags'])

      // Show Webflow CDN reminder
      const version = getCurrentVersion()
      const repo = getRepoPath()
      appendLog(`\n{${T.lilac}-fg}── Webflow Reminder ──{/}\n`)
      appendLog(
        `{${T.white}-fg}Update your Webflow script tag to v${version}{/}\n`
      )
      if (repo) {
        const jsUrl = `https://cdn.jsdelivr.net/gh/${repo}@v${version}/dist/main.js`
        const cssUrl = `https://cdn.jsdelivr.net/gh/${repo}@v${version}/dist/styles.css`
        appendLog(`{${T.dim}-fg}JS:  ${jsUrl}{/}\n`)
        appendLog(`{${T.dim}-fg}CSS: ${cssUrl}{/}\n`)
        if (copyToClipboard(`${jsUrl}\n${cssUrl}`)) {
          appendLog(`{${T.green}-fg}Copied CDN URLs to clipboard{/}\n`)
        }
      } else {
        appendLog(
          `{${T.dim}-fg}(Could not detect repo URL from package.json){/}\n`
        )
      }
      break
    }
  }
}
