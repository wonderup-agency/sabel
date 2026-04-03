import { MENU_SECTIONS } from './dashboard/menu.js'
import { state } from './dashboard/state.js'
import {
  screen,
  updateHeader,
  renderMenu,
  updateStatusBar,
  appendLog,
  scrollLog,
} from './dashboard/ui.js'
import { T } from './dashboard/theme.js'
import { killProcess } from './dashboard/process.js'
import { handleAction } from './dashboard/actions.js'

// ── Key bindings ─────────────────────────────────────────────────────
let lastCtrlC = 0

screen.key(['C-c'], () => {
  if (state.isPrompting || state.isConfirming) return

  if (state.foregroundProcess) {
    killProcess(state.foregroundProcess)
    state.foregroundProcess = null
    return
  }

  if (state.backgroundProcess) {
    killProcess(state.backgroundProcess)
    state.backgroundProcess = null
    state.devServerRunning = false
    updateHeader()
    appendLog(`\n{${T.dim}-fg}Background task stopped{/}\n`)
    updateStatusBar('')
    screen.render()
    return
  }

  const now = Date.now()
  if (now - lastCtrlC < 1000) {
    if (state.backgroundProcess) killProcess(state.backgroundProcess)
    process.exit(0)
  }
  lastCtrlC = now
  updateStatusBar('Press Ctrl+C again to exit')
  screen.render()

  setTimeout(() => {
    if (!state.foregroundProcess) {
      updateStatusBar('')
      screen.render()
    }
  }, 1500)
})

screen.key(['up', 'k'], () => {
  if (state.foregroundProcess || state.isPrompting || state.isConfirming) return

  if (state.focusColumn === 'sections') {
    state.selectedSection =
      (state.selectedSection - 1 + MENU_SECTIONS.length) % MENU_SECTIONS.length
    state.selectedItem = 0
  } else {
    const items = MENU_SECTIONS[state.selectedSection].items
    state.selectedItem = (state.selectedItem - 1 + items.length) % items.length
  }
  renderMenu()
  screen.render()
})

screen.key(['down', 'j'], () => {
  if (state.foregroundProcess || state.isPrompting || state.isConfirming) return

  if (state.focusColumn === 'sections') {
    state.selectedSection = (state.selectedSection + 1) % MENU_SECTIONS.length
    state.selectedItem = 0
  } else {
    const items = MENU_SECTIONS[state.selectedSection].items
    state.selectedItem = (state.selectedItem + 1) % items.length
  }
  renderMenu()
  screen.render()
})

screen.key(['right', 'l'], () => {
  if (state.foregroundProcess || state.isPrompting || state.isConfirming) return
  if (state.focusColumn === 'sections') {
    state.focusColumn = 'items'
    state.selectedItem = 0
    renderMenu()
    screen.render()
  }
})

screen.key(['left', 'h'], () => {
  if (state.foregroundProcess || state.isPrompting || state.isConfirming) return
  if (state.focusColumn === 'items') {
    state.focusColumn = 'sections'
    renderMenu()
    screen.render()
  }
})

screen.key(['enter'], () => {
  if (state.foregroundProcess || state.isPrompting || state.isConfirming) return

  if (state.focusColumn === 'sections') {
    // Enter on a section moves focus to its items
    state.focusColumn = 'items'
    state.selectedItem = 0
    renderMenu()
    screen.render()
  } else {
    // Enter on an item executes the action
    const item = MENU_SECTIONS[state.selectedSection].items[state.selectedItem]
    handleAction(item.key).catch((err) => {
      appendLog(`\n{${T.red}-fg}Error: ${err.message}{/}\n`)
    })
  }
})

screen.key(['q'], () => {
  if (state.foregroundProcess || state.isPrompting || state.isConfirming) return
  if (state.backgroundProcess) killProcess(state.backgroundProcess)
  process.exit(0)
})

// Scroll log panel with shift+up/down or page up/down
screen.key(['S-up'], () => {
  if (state.isPrompting || state.isConfirming) return
  scrollLog(-3)
})

screen.key(['S-down'], () => {
  if (state.isPrompting || state.isConfirming) return
  scrollLog(3)
})

screen.key(['pageup'], () => {
  if (state.isPrompting || state.isConfirming) return
  scrollLog(-10)
})

screen.key(['pagedown'], () => {
  if (state.isPrompting || state.isConfirming) return
  scrollLog(10)
})

// ── Initial render ───────────────────────────────────────────────────
updateHeader()
renderMenu()
updateStatusBar('')
screen.render()
