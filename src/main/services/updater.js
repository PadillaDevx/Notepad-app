import { autoUpdater } from 'electron-updater'
import { dialog, shell } from 'electron'
import { is } from '@electron-toolkit/utils'

/**
 * Configura y arranca el auto-updater.
 * - Windows / Linux: descarga e instala automáticamente.
 * - macOS (sin code-sign): notifica y abre la página de descargas.
 */
export function setupAutoUpdater() {
  // No buscar actualizaciones en desarrollo
  if (is.dev) return

  // Configurar comportamiento
  autoUpdater.autoDownload = process.platform !== 'darwin' // macOS sin firma no puede auto-instalar
  autoUpdater.autoInstallOnAppQuit = true

  // ── Actualización disponible ──
  autoUpdater.on('update-available', (info) => {
    if (process.platform === 'darwin') {
      // macOS sin firma: mostrar aviso con link de descarga
      dialog
        .showMessageBox({
          type: 'info',
          title: 'Actualización disponible',
          message: `Mi Notepad v${info.version} está disponible.`,
          detail: 'Se abrirá la página de descarga para que instales la nueva versión.',
          buttons: ['Descargar', 'Más tarde'],
          defaultId: 0
        })
        .then(({ response }) => {
          if (response === 0) {
            shell.openExternal('https://github.com/PadillaDevx/Notepad-app/releases/latest')
          }
        })
    }
    // Windows/Linux: la descarga inicia automáticamente
  })

  // ── Descarga completada (Windows / Linux) ──
  autoUpdater.on('update-downloaded', (info) => {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Actualización lista',
        message: `Mi Notepad v${info.version} se ha descargado.`,
        detail: '¿Deseas reiniciar la app ahora para aplicar la actualización?',
        buttons: ['Reiniciar ahora', 'Más tarde'],
        defaultId: 0
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
  })

  // ── Errores silenciosos ──
  autoUpdater.on('error', (err) => {
    console.log('Auto-updater error:', err?.message)
  })

  // Buscar actualizaciones al iniciar (esperar 5 segundos para no bloquear el arranque)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {})
  }, 5000)
}
