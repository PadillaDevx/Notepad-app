import { ipcMain } from 'electron'
import * as authService from '../services/auth-service.js'

/**
 * Registra todos los handlers IPC de autenticación y datos
 */
function registerAuthHandlers() {
  // ─── Auth ───────────────────────────────────────────────
  ipcMain.handle('auth:has-user', () => {
    return authService.hasUser()
  })

  ipcMain.handle('auth:register', (_event, username, password) => {
    try {
      return authService.register(username, password)
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('auth:login', (_event, username, password) => {
    try {
      return authService.login(username, password)
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('auth:reset-password', (_event, backupCode, newPassword) => {
    try {
      return authService.resetPassword(backupCode, newPassword)
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // ─── Autofill ───────────────────────────────────────────
  ipcMain.handle('auth:get-autofill', () => {
    return authService.getAutofillData()
  })

  ipcMain.handle('auth:set-autofill', (_event, enabled, username, password) => {
    try {
      return authService.setAutofill(enabled, username, password)
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // ─── Data persistence ──────────────────────────────────
  ipcMain.handle('data:load', () => {
    try {
      const data = authService.loadUserData()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('data:save', (_event, data) => {
    try {
      return authService.saveUserData(data)
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  console.log('Auth handlers registrados')
}

export { registerAuthHandlers }
