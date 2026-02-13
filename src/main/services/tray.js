import { app, Tray, Menu, nativeImage } from 'electron';
import path from 'path';

let tray = null;

/**
 * Crea el icono del system tray
 * @param {BrowserWindow} mainWindow - Ventana principal de la aplicación
 */
function createTray(mainWindow) {
  // Para macOS usa Template Image (se adapta automáticamente a dark/light mode)
  // En producción, deberías tener iconos específicos en resources/
  // Por ahora usamos un icono simple
  const iconPath =
    process.platform === 'darwin'
      ? path.join(__dirname, '../../renderer/public/trayIconTemplate.png')
      : path.join(__dirname, '../../renderer/public/trayIcon.png');

  // Crear un icono básico si no existe
  // En producción, agrega tus iconos personalizados en renderer/public/
  try {
    tray = new Tray(iconPath);
  } catch (error) {
    // Fallback: crear un icono simple programáticamente
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar App',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Salir',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Mi Notepad App');
  tray.setContextMenu(contextMenu);

  // Doble clic para mostrar la ventana
  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Click simple en macOS también muestra la ventana
  if (process.platform === 'darwin') {
    tray.on('click', () => {
      mainWindow.show();
      mainWindow.focus();
    });
  }

  console.log('System tray creado');
  return tray;
}

/**
 * Destruye el icono del tray
 */
function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

/**
 * Actualiza el tooltip del tray
 * @param {string} text - Nuevo texto del tooltip
 */
function updateTrayTooltip(text) {
  if (tray) {
    tray.setToolTip(text);
  }
}

export { createTray, destroyTray, updateTrayTooltip };
