import { ipcMain } from 'electron';
import {
  scheduleReminder,
  cancelReminder,
  rescheduleReminders
} from '../services/scheduler.js';

/**
 * Registra todos los handlers IPC relacionados con notificaciones
 * @param {BrowserWindow} mainWindow - Ventana principal para enviar eventos
 */
function registerNotificationHandlers(mainWindow) {
  // Programar un recordatorio
  ipcMain.handle('notification:schedule', (event, reminder) => {
    try {
      const { id, date, title, body } = reminder;
      const reminderDate = new Date(date);

      const success = scheduleReminder(id, reminderDate, title, body, () => {
        // Callback cuando se hace click en la notificación
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('notification:clicked', id);
      });

      return { success };
    } catch (error) {
      console.error('Error programando notificación:', error);
      return { success: false, error: error.message };
    }
  });

  // Cancelar un recordatorio
  ipcMain.handle('notification:cancel', (event, reminderId) => {
    try {
      const success = cancelReminder(reminderId);
      return { success };
    } catch (error) {
      console.error('Error cancelando notificación:', error);
      return { success: false, error: error.message };
    }
  });

  // Reprogramar múltiples recordatorios (útil al abrir un archivo)
  ipcMain.handle('notification:reschedule-all', (event, reminders) => {
    try {
      const count = rescheduleReminders(reminders, (reminderId) => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('notification:clicked', reminderId);
      });

      return { success: true, count };
    } catch (error) {
      console.error('Error reprogramando notificaciones:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('Notification handlers registrados');
}

export { registerNotificationHandlers };
