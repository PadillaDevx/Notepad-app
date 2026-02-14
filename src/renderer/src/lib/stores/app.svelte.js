/**
 * Estado global de la aplicación
 * Usa Svelte 5 runes para reactividad
 */

class AppStore {
  // Tab activo
  activeTab = $state('notes'); // 'notes' | 'diary' | 'reminders'

  // Estado del archivo actual
  currentFile = $state({
    path: null,
    name: null,
    isDirty: false
  });

  // Auth state
  username = $state(null);
  isAuthenticated = $state(false);

  // Flag de inicialización
  isInitialized = $state(false);

  // Tema oscuro – se inicializa desde localStorage o del tema del SO
  darkMode = $state(this._getInitialTheme());

  /**
   * Determina el tema inicial: localStorage > preferencia del SO
   */
  _getInitialTheme() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mi-notepad-dark-mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  // Contador de versión de datos - se incrementa en cada cambio, dispara auto-save
  dataVersion = $state(0);

  /**
   * Cambia el tab activo
   */
  setActiveTab(tab) {
    this.activeTab = tab;
  }

  /**
   * Actualiza información del archivo actual
   */
  setCurrentFile(path, name) {
    this.currentFile.path = path;
    this.currentFile.name = name;
    this.currentFile.isDirty = false;
  }

  /**
   * Marca los datos como modificados (incrementa dataVersion para auto-save)
   */
  markDirty() {
    this.currentFile.isDirty = true;
    this.dataVersion++;
  }

  /**
   * Limpia el estado del archivo
   */
  clearFile() {
    this.currentFile.path = null;
    this.currentFile.name = null;
    this.currentFile.isDirty = false;
  }

  /**
   * Marca al usuario como autenticado
   */
  setAuthenticated(username) {
    this.username = username;
    this.isAuthenticated = true;
  }

  /**
   * Cierra la sesión del usuario
   */
  logout() {
    this.username = null;
    this.isAuthenticated = false;
    this.isInitialized = false;
  }

  /**
   * Marca la app como inicializada
   */
  setInitialized() {
    this.isInitialized = true;
  }

  /**
   * Toggle tema oscuro y guardar preferencia
   */
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', this.darkMode);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('mi-notepad-dark-mode', String(this.darkMode));
    }
  }
}

// Exportar instancia única
export const appStore = new AppStore();
