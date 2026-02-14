import { appStore } from './app.svelte.js';

/**
 * Store de notas con Svelte 5 runes
 */
class NotesStore {
  // Lista de notas
  notes = $state([]);

  // ID de nota activa
  activeNoteId = $state(null);

  // Nota activa (derived)
  activeNote = $derived(this.notes.find((n) => n.id === this.activeNoteId));

  /**
   * Genera un ID único para una nota
   */
  generateId() {
    return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Agrega una nueva nota
   */
  addNote(title = 'Nueva nota', content = '') {
    const newNote = {
      id: this.generateId(),
      title,
      content,
      date: new Date().toISOString(),
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.notes.push(newNote);
    this.activeNoteId = newNote.id;
    appStore.markDirty();

    return newNote;
  }

  /**
   * Actualiza una nota existente
   */
  updateNote(id, updates) {
    const note = this.notes.find((n) => n.id === id);
    if (note) {
      Object.assign(note, updates, { updatedAt: new Date().toISOString() });
      appStore.markDirty();
    }
  }

  /**
   * Elimina una nota
   */
  deleteNote(id) {
    const index = this.notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notes.splice(index, 1);
      if (this.activeNoteId === id) {
        this.activeNoteId = this.notes[0]?.id || null;
      }
      appStore.markDirty();
    }
  }

  /**
   * Selecciona una nota
   */
  selectNote(id) {
    this.activeNoteId = id;
  }

  /**
   * Agrega una imagen a una nota
   */
  addImage(noteId, imagePath) {
    const note = this.notes.find((n) => n.id === noteId);
    if (note) {
      note.images = note.images || [];
      note.images.push({
        path: imagePath,
        addedAt: new Date().toISOString()
      });
      note.updatedAt = new Date().toISOString();
      appStore.markDirty();
    }
  }

  /**
   * Carga notas desde datos descifrados
   */
  loadFromData(data) {
    this.notes = data.notes || [];
    this.activeNoteId = this.notes[0]?.id || null;
  }

  /**
   * Exporta notas para guardar (snapshot plano, sin proxies reactivos)
   */
  toData() {
    return $state.snapshot(this.notes);
  }

  /**
   * Reinicia el estado
   */
  reset() {
    this.notes = [];
    this.activeNoteId = null;
  }
}

export const notesStore = new NotesStore();
