// Shared mutable state across dashboard modules
export const state = {
  selectedSection: 0,
  selectedItem: 0,
  focusColumn: 'sections', // 'sections' or 'items'
  backgroundProcess: null,
  foregroundProcess: null,
  devServerRunning: false,
  isPrompting: false,
  isConfirming: false,
}
