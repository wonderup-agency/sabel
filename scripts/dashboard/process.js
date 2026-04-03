import { spawn, execSync } from 'node:child_process'
import { T } from './theme.js'
import { state } from './state.js'
import {
  screen,
  appendLog,
  clearLog,
  updateHeader,
  updateStatusBar,
} from './ui.js'

function stripAnsiForBlessed(str) {
  return str.replace(/\{/g, '\\{').replace(/\}/g, '\\}')
}

export function runBackground(cmd, args) {
  return new Promise((resolve) => {
    clearLog()
    appendLog(`{${T.lilac}-fg}$ ${cmd} ${args.join(' ')}{/}\n\n`)

    const proc = spawn(cmd, args, {
      shell: true,
      cwd: process.cwd(),
      env: { ...process.env, FORCE_COLOR: '1' },
    })

    state.backgroundProcess = proc
    state.devServerRunning = args.includes('dev')
    updateHeader()
    updateStatusBar('Background task running...')
    screen.render()

    proc.stdout.on('data', (data) => {
      if (!state.foregroundProcess)
        appendLog(stripAnsiForBlessed(data.toString()))
    })

    proc.stderr.on('data', (data) => {
      if (!state.foregroundProcess)
        appendLog(stripAnsiForBlessed(data.toString()))
    })

    proc.on('close', (code) => {
      state.backgroundProcess = null
      state.devServerRunning = false
      updateHeader()

      if (code === 0) {
        appendLog(`\n{${T.green}-fg}✓ Background task done{/}\n`)
      } else if (code !== null) {
        appendLog(
          `\n{${T.red}-fg}✗ Background task exited with code ${code}{/}\n`
        )
      } else {
        appendLog(`\n{${T.dim}-fg}Background task stopped{/}\n`)
      }

      updateStatusBar('')
      screen.render()
      resolve(code)
    })

    proc.on('error', (err) => {
      state.backgroundProcess = null
      state.devServerRunning = false
      updateHeader()
      appendLog(`\n{${T.red}-fg}Error: ${err.message}{/}\n`)
      updateStatusBar('')
      screen.render()
      resolve(1)
    })
  })
}

export function runForeground(cmd, args) {
  return new Promise((resolve) => {
    clearLog()
    appendLog(`{${T.lilac}-fg}$ ${cmd} ${args.join(' ')}{/}\n\n`)

    const proc = spawn(cmd, args, {
      shell: true,
      cwd: process.cwd(),
      env: { ...process.env, FORCE_COLOR: '1' },
    })

    state.foregroundProcess = proc
    updateStatusBar('Running...')
    screen.render()

    proc.stdout.on('data', (data) => {
      appendLog(stripAnsiForBlessed(data.toString()))
    })

    proc.stderr.on('data', (data) => {
      appendLog(stripAnsiForBlessed(data.toString()))
    })

    proc.on('close', (code) => {
      state.foregroundProcess = null

      if (code === 0) {
        appendLog(`\n{${T.green}-fg}✓ Done{/}\n`)
      } else if (code !== null) {
        appendLog(`\n{${T.red}-fg}✗ Exited with code ${code}{/}\n`)
      } else {
        appendLog(`\n{${T.dim}-fg}Stopped{/}\n`)
      }

      updateStatusBar('')
      screen.render()
      resolve(code)
    })

    proc.on('error', (err) => {
      state.foregroundProcess = null
      appendLog(`\n{${T.red}-fg}Error: ${err.message}{/}\n`)
      updateStatusBar('')
      screen.render()
      resolve(1)
    })
  })
}

export function killProcess(proc) {
  if (!proc) return
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' })
    } catch {
      proc.kill('SIGTERM')
    }
  } else {
    proc.kill('SIGTERM')
  }
}
