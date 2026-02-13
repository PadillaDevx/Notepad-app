<script>
  import { onMount } from 'svelte'
  import { appStore } from './lib/stores/app.svelte.js'
  import { notesStore } from './lib/stores/notes.svelte.js'
  import { diaryStore } from './lib/stores/diary.svelte.js'
  import { remindersStore } from './lib/stores/reminders.svelte.js'

  // Componentes
  import LoginScreen from './lib/components/LoginScreen.svelte'
  import Header from './lib/components/Header.svelte'
  import NavigationTabs from './lib/components/NavigationTabs.svelte'
  import NotebookEditor from './lib/components/NotebookEditor.svelte'
  import NotesSidebar from './lib/components/NotesSidebar.svelte'

  let authChecked = $state(false)
  let userExists = $state(false)

  onMount(async () => {
    // Aplicar tema inicial
    if (appStore.darkMode) {
      document.documentElement.classList.add('dark')
    }

    // Verificar si existe un usuario registrado
    userExists = await window.api.auth.hasUser()
    authChecked = true

    // Escuchar petición de guardar antes de cerrar la app
    window.api.onSaveBeforeQuit(async () => {
      if (appStore.isAuthenticated) {
        await saveAllData()
      }
    })

    // Ctrl+S / Cmd+S para guardar
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (appStore.isAuthenticated) saveAllData()
      }
    })
  })

  // ─── Auto-save debounced (1.5s después del último cambio) ───
  $effect(() => {
    const v = appStore.dataVersion
    if (v > 0 && appStore.isAuthenticated) {
      const timer = setTimeout(saveAllData, 1500)
      return () => clearTimeout(timer)
    }
  })

  async function saveAllData() {
    try {
      const data = {
        notes: notesStore.toData(),
        diary: diaryStore.toData(),
        reminders: remindersStore.toData()
      }
      await window.api.data.save(data)
    } catch (e) {
      console.error('Error al guardar datos:', e)
    }
  }

  async function handleAuthenticated(username) {
    appStore.setAuthenticated(username)

    // Cargar datos del usuario
    try {
      const result = await window.api.data.load()
      if (result.success && result.data) {
        notesStore.loadFromData(result.data)
        diaryStore.loadFromData(result.data)
        await remindersStore.loadFromData(result.data)
      }
    } catch (e) {
      console.error('Error cargando datos:', e)
    }

    // Crear primera nota si no hay ninguna
    if (notesStore.notes.length === 0) {
      notesStore.addNote('Mi primera nota', '¡Bienvenido a tu Notepad App!')
    }

    appStore.setInitialized()
  }

  async function handleLogout() {
    // Guardar antes de cerrar sesión
    await saveAllData()
    appStore.logout()
    userExists = true
  }
</script>

{#if !authChecked}
  <div class="loading-screen">
    <h1 class="loading">Cargando...</h1>
  </div>
{:else if !appStore.isAuthenticated}
  <LoginScreen
    onAuthenticated={handleAuthenticated}
    initialView={userExists ? 'login' : 'register'}
  />
{:else if appStore.isInitialized}
  <div id="app">
    <Header onsave={saveAllData} onlogout={handleLogout} />

    <NavigationTabs />

    <main>
      {#if appStore.activeTab === 'notes'}
        <div class="notes-layout">
          <NotesSidebar />
          <NotebookEditor />
        </div>
      {/if}

      {#if appStore.activeTab === 'diary'}
        <div class="notebook-container">
          <h2>📖 Diario (Próximamente)</h2>
          <p>Función de diario con páginas y animación en desarrollo...</p>
        </div>
      {/if}

      {#if appStore.activeTab === 'reminders'}
        <div class="notebook-container">
          <h2>🔔 Recordatorios (Próximamente)</h2>
          <p>Función de recordatorios con calendario en desarrollo...</p>
        </div>
      {/if}
    </main>
  </div>
{:else}
  <div class="loading-screen">
    <h1 class="loading">Cargando datos...</h1>
  </div>
{/if}

<style>
  .notebook-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    color: var(--text-primary);
  }

  .notebook-container h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .notebook-container p {
    font-size: 1.2rem;
    opacity: 0.7;
  }

  .notes-layout {
    display: flex;
    height: 100%;
    overflow: hidden;
  }
</style>
