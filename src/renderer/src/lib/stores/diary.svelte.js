import { appStore } from './app.svelte.js';

/**
 * Store del diario con Svelte 5 runes
 */
class DiaryStore {
  // Entradas del diario
  entries = $state([]);

  // Índice de página actual
  currentPageIndex = $state(0);

  // Entrada actual (derived)
  currentPage = $derived(this.entries[this.currentPageIndex]);

  // Número total de páginas
  totalPages = $derived(this.entries.length);

  /**
   * Genera un ID único para una entrada
   */
  generateId() {
    return `diary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Agrega una nueva página/entrada
   */
  addEntry(content = '') {
    const newEntry = {
      id: this.generateId(),
      date: new Date().toISOString(),
      content,
      createdAt: new Date().toISOString()
    };

    this.entries.push(newEntry);
    this.currentPageIndex = this.entries.length - 1;
    appStore.markDirty();

    return newEntry;
  }

  /**
   * Actualiza una entrada
   */
  updateEntry(id, content) {
    const entry = this.entries.find((e) => e.id === id);
    if (entry) {
      entry.content = content;
      appStore.markDirty();
    }
  }

  /**
   * Navega a la página siguiente
   */
  nextPage() {
    if (this.currentPageIndex < this.entries.length - 1) {
      this.currentPageIndex++;
      return true;
    }
    return false;
  }

  /**
   * Navega a la página anterior
   */
  previousPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      return true;
    }
    return false;
  }

  /**
   * Va a una página específica
   */
  goToPage(index) {
    if (index >= 0 && index < this.entries.length) {
      this.currentPageIndex = index;
      return true;
    }
    return false;
  }

  /**
   * Verifica si la entrada actual está llena (límite de caracteres)
   */
  isCurrentPageFull(maxChars = 1000) {
    return this.currentPage && this.currentPage.content.length >= maxChars;
  }

  /**
   * Carga entradas desde datos descifrados
   */
  loadFromData(data) {
    this.entries = data.diary || [];
    this.currentPageIndex = this.entries.length > 0 ? this.entries.length - 1 : 0;
  }

  /**
   * Exporta entradas para guardar
   */
  toData() {
    return this.entries;
  }

  /**
   * Reinicia el estado
   */
  reset() {
    this.entries = [];
    this.currentPageIndex = 0;
  }
}

export const diaryStore = new DiaryStore();
