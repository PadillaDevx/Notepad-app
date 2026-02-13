import schedule from 'node-schedule';
import { Notification } from 'electron';

// Almacenar jobs programados en memoria
const scheduledJobs = new Map();

/**
 * Programa una notificación para una fecha específica
 * @param {string} id - ID único del recordatorio
 * @param {Date} date - Fecha y hora de la notificación
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo/mensaje de la notificación
 * @param {Function} onClick - Callback cuando se hace clic en la notificación
 */
function scheduleReminder(id, date, title, body, onClick) {
  // Cancelar job existente si se está reprogramando
  if (scheduledJobs.has(id)) {
    scheduledJobs.get(id).cancel();
  }

  // Solo programar si la fecha es futura
  if (date <= new Date()) {
    console.warn(`No se puede programar recordatorio ${id} - la fecha ya pasó`);
    return false;
  }

  const job = schedule.scheduleJob(date, () => {
    const notification = new Notification({
      title: title,
      body: body,
      silent: false,
      urgency: 'normal'
    });

    notification.show();

    if (onClick && typeof onClick === 'function') {
      notification.on('click', onClick);
    }

    // Limpiar job completado
    scheduledJobs.delete(id);
  });

  if (job) {
    scheduledJobs.set(id, job);
    console.log(`Recordatorio programado: ${id} para ${date.toISOString()}`);
    return true;
  }

  return false;
}

/**
 * Cancela una notificación programada
 * @param {string} id - ID del recordatorio a cancelar
 */
function cancelReminder(id) {
  if (scheduledJobs.has(id)) {
    scheduledJobs.get(id).cancel();
    scheduledJobs.delete(id);
    console.log(`Recordatorio cancelado: ${id}`);
    return true;
  }
  return false;
}

/**
 * Cancela todas las notificaciones programadas
 */
function cancelAllReminders() {
  scheduledJobs.forEach((job, id) => {
    job.cancel();
    console.log(`Recordatorio cancelado: ${id}`);
  });
  scheduledJobs.clear();
}

/**
 * Obtiene los IDs de todos los recordatorios programados
 * @returns {Array<string>} - Array con los IDs de los recordatorios activos
 */
function getScheduledReminderIds() {
  return Array.from(scheduledJobs.keys());
}

/**
 * Reprograma múltiples recordatorios (útil al cargar archivo .jnote)
 * @param {Array} reminders - Array de objetos con {id, date, title, body}
 * @param {Function} onClickCallback - Callback global para todos los clicks
 */
function rescheduleReminders(reminders, onClickCallback) {
  // Cancelar todos los existentes
  cancelAllReminders();

  let scheduled = 0;
  const now = new Date();

  reminders.forEach((reminder) => {
    const date = new Date(reminder.date);
    if (date > now && !reminder.completed) {
      const success = scheduleReminder(
        reminder.id,
        date,
        reminder.title,
        reminder.body || reminder.text || '',
        () => {
          if (onClickCallback) {
            onClickCallback(reminder.id);
          }
        }
      );
      if (success) scheduled++;
    }
  });

  console.log(`Reprogramados ${scheduled} recordatorios de ${reminders.length} totales`);
  return scheduled;
}

export {
  scheduleReminder,
  cancelReminder,
  cancelAllReminders,
  getScheduledReminderIds,
  rescheduleReminders
};
