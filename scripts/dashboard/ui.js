import blessed from 'neo-blessed'
import { T, S } from './theme.js'
import { MENU_SECTIONS } from './menu.js'
import { state } from './state.js'
import {
  getGitBranch,
  getComponentCount,
  countFiles,
  getLastBuildTime,
} from './helpers.js'

// ── ANSI cursor control ─────────────────────────────────────────────
const HIDE_CURSOR = '\x1b[?25l'
const SHOW_CURSOR = '\x1b[?25h'

// ── Screen ──────────────────────────────────────────────────────────
export const screen = blessed.screen({
  smartCSR: true,
  title: 'Wonderup Starter',
  fullUnicode: true,
})

process.stdout.write(HIDE_CURSOR)
screen.on('render', () => {
  if (!state.isPrompting) process.stdout.write(HIDE_CURSOR)
})
process.on('exit', () => process.stdout.write(SHOW_CURSOR))

// ── Header ──────────────────────────────────────────────────────────
const header = blessed.box({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: 3,
  tags: true,
  style: { bg: S.dark },
})

export function updateHeader() {
  const branch = getGitBranch()
  const components = getComponentCount()
  const pages = countFiles('src/pages')
  const lastBuild = getLastBuildTime()
  const serverStatus = state.devServerRunning
    ? `{${T.green}-fg}● running{/}`
    : `{${T.dim}-fg}○ stopped{/}`

  header.setContent(
    `{bold}{${T.lilac}-fg} ■ Wonderup Starter{/}` +
      `\n {${T.dim}-fg}Branch:{/} {${T.white}-fg}${branch}{/}` +
      `  {${T.dim}-fg}Components:{/} {${T.white}-fg}${components}{/}` +
      `  {${T.dim}-fg}Pages:{/} {${T.white}-fg}${pages}{/}` +
      `  {${T.dim}-fg}Build:{/} {${T.white}-fg}${lastBuild}{/}` +
      `  {${T.dim}-fg}Dev:{/} ${serverStatus}`
  )
}

// ── Section panel (left column) ─────────────────────────────────────
const sectionPanel = blessed.box({
  parent: screen,
  top: 3,
  left: 0,
  width: '30%',
  height: '40%',
  border: { type: 'line' },
  style: {
    border: { fg: S.purple },
  },
  tags: true,
})

// ── Item panel (right column) ───────────────────────────────────────
const itemPanel = blessed.box({
  parent: screen,
  top: 3,
  left: '30%',
  width: '70%',
  height: '40%',
  border: { type: 'line' },
  style: {
    border: { fg: S.purple },
  },
  tags: true,
})

export function renderMenu() {
  // Update border colors to indicate focus
  sectionPanel.style.border.fg =
    state.focusColumn === 'sections' ? S.lilac : S.purple
  itemPanel.style.border.fg = state.focusColumn === 'items' ? S.lilac : S.purple

  // Left panel: sections
  let left = ''
  for (let i = 0; i < MENU_SECTIONS.length; i++) {
    const section = MENU_SECTIONS[i]
    const isActive = i === state.selectedSection

    if (isActive && state.focusColumn === 'sections') {
      left += `{${T.purple}-bg}{${T.white}-fg} ▸ ${section.title} {/}\n`
    } else if (isActive) {
      left += ` {${T.lilac}-fg}▸ ${section.title}{/}\n`
    } else {
      left += `   {${T.white}-fg}${section.title}{/}\n`
    }
  }
  sectionPanel.setContent(left)

  // Right panel: items for selected section
  const section = MENU_SECTIONS[state.selectedSection]
  itemPanel.setLabel(` {${T.lilac}-fg}${section.title}{/} `)

  let right = ''
  for (let i = 0; i < section.items.length; i++) {
    const item = section.items[i]
    const isActive = i === state.selectedItem && state.focusColumn === 'items'

    if (isActive) {
      right += `{${T.purple}-bg}{${T.white}-fg} ▸ ${item.label} {/}`
      right += ` {${T.dim}-fg}${item.description}{/}\n`
    } else {
      right += `   {${T.white}-fg}${item.label}{/}`
      right += `  {${T.dim}-fg}${item.description}{/}\n`
    }
  }
  itemPanel.setContent(right)
}

// ── Log panel ───────────────────────────────────────────────────────
const logPanel = blessed.box({
  parent: screen,
  top: '40%+3',
  left: 0,
  width: '100%',
  height: '60%-5',
  border: { type: 'line' },
  style: {
    border: { fg: S.purple },
  },
  tags: true,
  label: ` {${T.lilac}-fg}Output{/} `,
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    style: { bg: S.purple },
  },
  mouse: true,
})

export function appendLog(text) {
  const current = logPanel.getContent()
  logPanel.setContent(current + text)
  logPanel.setScrollPerc(100)
  screen.render()
}

export function clearLog() {
  logPanel.setContent('')
  screen.render()
}

export function scrollLog(lines) {
  logPanel.scroll(lines)
  screen.render()
}

// ── Status bar ──────────────────────────────────────────────────────
const statusBar = blessed.box({
  parent: screen,
  bottom: 0,
  left: 0,
  width: '100%',
  height: 2,
  tags: true,
  style: { bg: S.dark },
})

export function updateStatusBar(message) {
  let hint
  if (state.foregroundProcess) {
    hint = `{${T.dim}-fg}Ctrl+C: stop task{/}  {${T.dim}-fg}Ctrl+C×2: exit{/}`
  } else if (state.backgroundProcess) {
    hint = `{${T.dim}-fg}↑/↓: navigate{/}  {${T.dim}-fg}←/→: switch{/}  {${T.dim}-fg}Enter: select{/}  {${T.dim}-fg}Shift+↑/↓: scroll{/}  {${T.dim}-fg}Ctrl+C: stop bg{/}`
  } else {
    hint = `{${T.dim}-fg}↑/↓: navigate{/}  {${T.dim}-fg}←/→: switch{/}  {${T.dim}-fg}Enter: select{/}  {${T.dim}-fg}Shift+↑/↓: scroll{/}  {${T.dim}-fg}Ctrl+C: exit{/}`
  }

  const msg = message ? `\n {${T.lilac}-fg}${message}{/}` : ''
  statusBar.setContent(` ${hint}${msg}`)
}

// ── Confirm prompt (replaces item panel temporarily) ─────────────────
export function promptConfirm(message, confirmLabel, cancelLabel = 'Cancel') {
  return new Promise((resolve) => {
    state.isConfirming = true
    let confirmIndex = 0
    let resolved = false
    const options = [confirmLabel, cancelLabel]

    function render() {
      let content = `\n {${T.lilac}-fg}{bold}${message}{/bold}{/}\n\n`
      options.forEach((opt, i) => {
        if (i === confirmIndex) {
          content += ` {${T.purple}-bg}{${T.white}-fg} ▸ ${opt} {/}\n`
        } else {
          content += `   {${T.dim}-fg}${opt}{/}\n`
        }
      })
      itemPanel.setContent(content)
      screen.render()
    }

    function cleanup(result) {
      if (resolved) return
      resolved = true
      screen.removeListener('keypress', onKeypress)
      // Defer state reset to next tick so global key handlers still see
      // isConfirming === true during the current keypress event cycle
      process.nextTick(() => {
        state.isConfirming = false
        renderMenu()
        screen.render()
      })
      resolve(result)
    }

    function onKeypress(ch, key) {
      if (!key) return
      const name = key.name
      if (name === 'up' || name === 'down') {
        confirmIndex = confirmIndex === 0 ? 1 : 0
        render()
      } else if (name === 'return' || name === 'enter') {
        cleanup(confirmIndex === 0)
      } else if (name === 'escape') {
        cleanup(false)
      }
    }

    // Defer handler registration so the Enter that triggered the confirm
    // doesn't also immediately accept it
    render()
    process.nextTick(() => {
      screen.on('keypress', onKeypress)
    })
  })
}

// ── Input prompt ────────────────────────────────────────────────────
export function promptInput(label, allowedPattern) {
  return new Promise((resolve) => {
    state.isPrompting = true

    const inputBox = blessed.textbox({
      parent: itemPanel,
      bottom: 0,
      left: 0,
      width: '100%-2',
      height: 3,
      border: { type: 'line' },
      style: {
        border: { fg: S.lilac },
        bg: S.dark,
        fg: S.white,
      },
      label: ` {${T.lilac}-fg}${label}{/} `,
      tags: true,
    })

    // Strip disallowed characters after each keypress.
    // Uses nextTick because blessed's _listener adds the char to value
    // in the same keypress cycle — we clean up right after.
    if (allowedPattern) {
      inputBox.on('keypress', () => {
        process.nextTick(() => {
          const filtered = inputBox.value.replace(allowedPattern, '')
          if (filtered !== inputBox.value) {
            inputBox.value = filtered
            screen.render()
          }
        })
      })
    }

    function cleanup(value) {
      state.isPrompting = false
      process.stdout.write(HIDE_CURSOR)
      inputBox.destroy()
      screen.render()
      if (!value || !value.trim()) {
        resolve(null)
      } else {
        resolve(value.trim())
      }
    }

    inputBox.on('submit', (value) => cleanup(value))
    inputBox.on('cancel', () => cleanup(null))

    process.stdout.write(SHOW_CURSOR)
    screen.render()
    inputBox.readInput()
  })
}
