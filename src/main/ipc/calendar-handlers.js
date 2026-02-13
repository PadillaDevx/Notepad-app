import { ipcMain, shell } from 'electron';
import ical from 'ical-generator';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Registra todos los handlers IPC relacionados con calendario
 */
function registerCalendarHandlers() {
  // Exportar recordatorio como archivo .ics
  ipcMain.handle('calendar:export', async (event, reminder) => {
    try {
      const { title, date, body, id } = reminder;

      // Crear calendario con ical-generator
      const calendar = ical.default({ name: 'Mi Notepad App' });

      const eventDate = new Date(date);
      const endDate = new Date(eventDate.getTime() + 30 * 60000); // +30 minutos

      calendar.createEvent({
        start: eventDate,
        end: endDate,
        summary: title,
        description: body || '',
        uid: id || `notepad-${Date.now()}`,
        // Alarma 10 minutos antes
        alarms: [
          {
            type: 'display',
            trigger: 600 // segundos antes del evento
          }
        ]
      });

      // Guardar archivo .ics temporal
      const tmpDir = os.tmpdir();
      const fileName = `recordatorio-${id || Date.now()}.ics`;
      const filePath = path.join(tmpDir, fileName);

      fs.writeFileSync(filePath, calendar.toString());

      // Abrir con la aplicación de calendario predeterminada
      await shell.openPath(filePath);

      return {
        success: true,
        filePath
      };
    } catch (error) {
      console.error('Error exportando a calendario:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Exportar múltiples recordatorios como un solo archivo .ics
  ipcMain.handle('calendar:export-all', async (event, reminders) => {
    try {
      const calendar = ical.default({ name: 'Mi Notepad App' });

      reminders.forEach((reminder) => {
        const { title, date, body, id } = reminder;
        const eventDate = new Date(date);
        const endDate = new Date(eventDate.getTime() + 30 * 60000);

        calendar.createEvent({
          start: eventDate,
          end: endDate,
          summary: title,
          description: body || '',
          uid: id || `notepad-${Date.now()}-${Math.random()}`,
          alarms: [
            {
              type: 'display',
              trigger: 600
            }
          ]
        });
      });

      const tmpDir = os.tmpdir();
      const fileName = `mis-recordatorios-${Date.now()}.ics`;
      const filePath = path.join(tmpDir, fileName);

      fs.writeFileSync(filePath, calendar.toString());

      await shell.openPath(filePath);

      return {
        success: true,
        filePath,
        count: reminders.length
      };
    } catch (error) {
      console.error('Error exportando todos los recordatorios:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('Calendar handlers registrados');
}

export { registerCalendarHandlers };
