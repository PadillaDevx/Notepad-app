import { appStore } from './app.svelte.js';

/**
 * Store de recordatorios con Svelte 5 runes
 */
class RemindersStore {
  // Lista de recordatorios
  reminders = $state([]);

  // Filtro activo
  filter = $state('all'); // 'all' | 'pending' | 'completed'

  // Recordatorios filtrados (derived)
  filteredReminders = $derived.by(() => {
    if (this.filter === 'pending') {
      return this.reminders.filter((r) => !r.completed);
    }
    if (this.filter === 'completed') {
      return this.reminders.filter((r) => r.completed);
    }
    return this.reminders;
  });

  // Recordatorios pendientes (derived)
  pendingReminders = $derived(this.reminders.filter((r) => !r.completed));

  /**
   * Genera un ID único para un recordatorio
   */
  generateId() {
    return `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Agrega un nuevo recordatorio
   */
  async addReminder(title, date, body = '', priority = 'normal') {
    const newReminder = {
      id: this.generateId(),
      title,
      date: new Date(date).toISOString(),
      body,
      priority, // 'low' | 'normal' | 'high'
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.reminders.push(newReminder);
    appStore.markDirty();

    // Programar notificación
    if (window.api && new Date(date) > new Date()) {
      await window.api.notification.schedule(newReminder);
    }

    return newReminder;
  }

  /**
   * Actualiza un recordatorio
   */
  async updateReminder(id, updates) {
    const reminder = this.reminders.find((r) => r.id === id);
    if (reminder) {
      const oldDate = reminder.date;
      Object.assign(reminder, updates);
      appStore.markDirty();

      // Si cambió la fecha, reprogramar notificación
      if (updates.date && updates.date !== oldDate && window.api) {
        await window.api.notification.cancel(id);
        if (!reminder.completed && new Date(reminder.date) > new Date()) {
          await window.api.notification.schedule(reminder);
        }
      }
    }
  }

  /**
   * Marca un recordatorio como completado/pendiente
   */
  async toggleCompleted(id) {
    const reminder = this.reminders.find((r) => r.id === id);
    if (reminder) {
      reminder.completed = !reminder.completed;
      appStore.markDirty();

      // Si se marca como completado, cancelar notificación
      if (reminder.completed && window.api) {
        await window.api.notification.cancel(id);
      } else if (!reminder.completed && window.api && new Date(reminder.date) > new Date()) {
        // Si se desmarca como completado, reprogramar si la fecha es futura
        await window.api.notification.schedule(reminder);
      }
    }
  }

  /**
   * Elimina un recordatorio
   */
  async deleteReminder(id) {
    const index = this.reminders.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.reminders.splice(index, 1);
      appStore.markDirty();

      // Cancelar notificación
      if (window.api) {
        await window.api.notification.cancel(id);
      }
    }
  }

  /**
   * Cambia el filtro activo
   */
  setFilter(filter) {
    this.filter = filter;
  }

  /**
   * Exporta un recordatorio al calendario del sistema
   */
  async exportToCalendar(id) {
    const reminder = this.reminders.find((r) => r.id === id);
    if (reminder && window.api) {
      return await window.api.calendar.export(reminder);
    }
    return { success: false, error: 'Recordatorio no encontrado' };
  }

  /**
   * Exporta todos los recordatorios al calendario
   */
  async exportAllToCalendar() {
    if (window.api) {
      return await window.api.calendar.exportAll(this.pendingReminders);
    }
    return { success: false, error: 'API no disponible' };
  }

  /**
   * Reprograma todas las notificaciones (al cargar archivo)
   */
  async rescheduleAll() {
    if (window.api) {
      return await window.api.notification.rescheduleAll(this.pendingReminders);
    }
  }

  /**
   * Carga recordatorios desde datos descifrados
   */
  async loadFromData(data) {
    this.reminders = data.reminders || [];
    // Reprogramar notificaciones
    await this.rescheduleAll();
  }

  /**
   * Exporta recordatorios para guardar
   */
  toData() {
    return this.reminders;
  }

  /**
   * Reinicia el estado
   */
  reset() {
    this.reminders = [];
    this.filter = 'all';
  }
}

export const remindersStore = new RemindersStore();
