<script>
  import { notesStore } from '../stores/notes.svelte.js'

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  function truncateText(text, maxLength = 50) {
    if (!text) return 'Sin contenido...'
    // Crear un elemento temporal para decodificar HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = text

    // Reemplazar saltos de línea y elementos de bloque con espacios
    tempDiv.querySelectorAll('br, div, p, input[type="checkbox"]').forEach((el) => {
      if (el.tagName === 'INPUT') {
        el.replaceWith(' ☐ ')
      } else {
        el.replaceWith(' ' + (el.textContent || '') + ' ')
      }
    })

    const plainText = tempDiv.textContent || tempDiv.innerText || ''
    // Colapsar múltiples espacios y limpiar
    const cleaned = plainText.replace(/\s+/g, ' ').trim()
    if (!cleaned) return 'Sin contenido...'
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned
  }

  function handleAddNote() {
    notesStore.addNote('Nueva nota', '')
  }

  function handleSelectNote(noteId) {
    notesStore.selectNote(noteId)
  }

  function handleDeleteNote(noteId, event) {
    event.stopPropagation()
    if (confirm('¿Estás seguro de eliminar esta nota?')) {
      notesStore.deleteNote(noteId)
    }
  }
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <h2>📝 Mis Notas</h2>
    <button class="btn-add" onclick={handleAddNote} title="Agregar nueva nota">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>

  <div class="notes-list">
    {#if notesStore.notes.length === 0}
      <div class="empty-state">
        <p>No hay notas aún</p>
        <p class="empty-hint">Haz clic en + para crear una</p>
      </div>
    {:else}
      {#each notesStore.notes as note (note.id)}
        <div
          class="note-item"
          class:active={note.id === notesStore.activeNoteId}
          role="button"
          tabindex="0"
          onclick={() => handleSelectNote(note.id)}
          onkeydown={(e) => e.key === 'Enter' && handleSelectNote(note.id)}
        >
          <div class="note-header-item">
            <h3>{note.title || 'Sin título'}</h3>
            <button
              class="btn-delete"
              onclick={(e) => handleDeleteNote(note.id, e)}
              title="Eliminar nota"
            >
              🗑️
            </button>
          </div>
          <p class="note-preview">{truncateText(note.content)}</p>
          <span class="note-date">{formatDate(note.date)}</span>
        </div>
      {/each}
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: 280px;
    background: var(--bg-tertiary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }

  .sidebar-header {
    padding: 1.25rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--border-color);
    background: rgba(255, 255, 255, 0.6);
  }

  :global(.dark) .sidebar-header {
    background: rgba(15, 23, 42, 0.8);
  }

  .sidebar-header h2 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
  }

  .btn-add {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(to bottom, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
  }

  .btn-add svg {
    width: 20px;
    height: 20px;
  }

  .btn-add:hover {
    transform: translateY(-2px) rotate(90deg);
    box-shadow:
      0 4px 12px rgba(37, 99, 235, 0.4),
      inset 0 1px 2px rgba(255, 255, 255, 0.4);
  }

  .btn-add:active {
    transform: translateY(0) rotate(90deg);
  }

  .notes-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6c757d;
  }

  .empty-state p {
    margin: 0.5rem 0;
  }

  .empty-hint {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .note-item {
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: var(--bg-main);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .note-item:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
    border-color: rgba(37, 99, 235, 0.3);
  }

  .note-item.active {
    background: #eff6ff;
    border-color: var(--primary);
    box-shadow: 0 3px 12px rgba(37, 99, 235, 0.3);
  }

  :global(.dark) .note-item.active {
    background: var(--bg-main);
    border-color: var(--primary);
  }

  .note-header-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  .note-header-item h3 {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-delete {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.25rem;
    opacity: 0;
    transition: all 0.2s ease;
  }

  .note-item:hover .btn-delete {
    opacity: 0.6;
  }

  .btn-delete:hover {
    opacity: 1 !important;
    transform: scale(1.2);
  }

  .note-preview {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0.5rem 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .note-date {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  /* Scrollbar */
  .notes-list::-webkit-scrollbar {
    width: 6px;
  }

  .notes-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .notes-list::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    .sidebar {
      width: 240px;
    }

    .sidebar-header {
      padding: 1rem 0.75rem;
    }

    .sidebar-header h2 {
      font-size: 1rem;
    }
  }
</style>
