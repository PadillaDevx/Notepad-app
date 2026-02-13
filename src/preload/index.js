import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Autenticación
  auth: {
    hasUser: () => ipcRenderer.invoke('auth:has-user'),
    register: (username, password) => ipcRenderer.invoke('auth:register', username, password),
    login: (username, password) => ipcRenderer.invoke('auth:login', username, password),
    resetPassword: (backupCode, newPassword) =>
      ipcRenderer.invoke('auth:reset-password', backupCode, newPassword),
    getAutofill: () => ipcRenderer.invoke('auth:get-autofill'),
    setAutofill: (enabled, username, password) =>
      ipcRenderer.invoke('auth:set-autofill', enabled, username, password)
  },

  // Datos del usuario (guardado automático)
  data: {
    load: () => ipcRenderer.invoke('data:load'),
    save: (data) => ipcRenderer.invoke('data:save', data)
  },

  // File operations (import/export .jnote)
  file: {
    new: () => ipcRenderer.invoke('file:new'),
    open: (masterPassword) => ipcRenderer.invoke('file:open', masterPassword),
    save: (data, masterPassword) => ipcRenderer.invoke('file:save', data, masterPassword),
    saveAs: (data, masterPassword) => ipcRenderer.invoke('file:save-as', data, masterPassword),
    markDirty: () => ipcRenderer.invoke('file:mark-dirty'),
    getState: () => ipcRenderer.invoke('file:get-state')
  },

  // Notifications
  notification: {
    schedule: (reminder) => ipcRenderer.invoke('notification:schedule', reminder),
    cancel: (reminderId) => ipcRenderer.invoke('notification:cancel', reminderId),
    rescheduleAll: (reminders) => ipcRenderer.invoke('notification:reschedule-all', reminders),
    onClicked: (callback) => {
      ipcRenderer.on('notification:clicked', (event, reminderId) => callback(reminderId))
    }
  },

  // Calendar export
  calendar: {
    export: (reminder) => ipcRenderer.invoke('calendar:export', reminder),
    exportAll: (reminders) => ipcRenderer.invoke('calendar:export-all', reminders)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
