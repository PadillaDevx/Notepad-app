<script>
  import { notesStore } from '../stores/notes.svelte.js'

  let editorRef = $state(null)
  let currentFont = $state('Indie Flower')
  let isUpdatingFromCheckbox = $state(false)

  const fonts = [
    { name: 'Indie Flower', value: "'Indie Flower', cursive" },
    { name: 'Inter', value: "'Inter', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    { name: 'Courier New', value: "'Courier New', monospace" }
  ]

  const highlightColors = [
    { name: 'Amarillo', color: '#fef08a' },
    { name: 'Verde', color: '#bbf7d0' },
    { name: 'Azul', color: '#bfdbfe' },
    { name: 'Rosa', color: '#fbcfe8' },
    { name: 'Naranja', color: '#fed7aa' }
  ]

  function execCommand(command, value = null) {
    document.execCommand(command, false, value)
    editorRef?.focus()
  }

  function changeFont(font) {
    currentFont = font.name
    execCommand('fontName', font.value)
  }

  function applyHighlight(color) {
    execCommand('hiliteColor', color)
  }

  function handleInput(e) {
    if (!notesStore.activeNote) return

    const content = e.target.innerHTML

    // Auto-convertir [] a checkboxes
    const updatedContent = content.replace(
      /\[\]/g,
      '<input type="checkbox" class="inline-checkbox" />'
    )

    if (updatedContent !== content) {
      e.target.innerHTML = updatedContent
      // Restaurar posición del cursor al final
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(e.target)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
    }

    notesStore.updateNote(notesStore.activeNote.id, { content: e.target.innerHTML })
  }

  function handleEditorClick(e) {
    // Si el click fue en un checkbox, marcar que estamos actualizando y guardar el estado
    if (
      e.target &&
      e.target.type === 'checkbox' &&
      e.target.classList.contains('inline-checkbox')
    ) {
      if (notesStore.activeNote && editorRef) {
        isUpdatingFromCheckbox = true
        // Esperar un momento para que el checkbox cambie su estado
        setTimeout(() => {
          const currentContent = editorRef.innerHTML
          notesStore.updateNote(notesStore.activeNote.id, { content: currentContent })
          // Resetear la bandera después de que el $effect se haya ejecutado
          setTimeout(() => {
            isUpdatingFromCheckbox = false
          }, 50)
        }, 10)
      }
    }
  }

  $effect(() => {
    if (editorRef && notesStore.activeNote && !isUpdatingFromCheckbox) {
      const content = notesStore.activeNote.content || ''
      const currentHTML = editorRef.innerHTML

      // Solo actualizar si realmente cambió la nota activa o si está vacío
      if (currentHTML !== content && !isUpdatingFromCheckbox) {
        // ContentEditable requires direct DOM manipulation
        editorRef.innerHTML = content // eslint-disable-line
      }
    }
  })
</script>

<div class="notebook-container">
  <div class="notebook-paper">
    <!-- Barra de herramientas de formato -->
    <div class="toolbar">
      <div class="toolbar-group">
        <select
          class="font-selector"
          value={currentFont}
          onchange={(e) => changeFont(fonts.find((f) => f.name === e.target.value))}
        >
          {#each fonts as font (font.name)}
            <option value={font.name}>{font.name}</option>
          {/each}
        </select>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button class="toolbar-btn" onclick={() => execCommand('bold')} title="Negrita (Ctrl+B)">
          <strong>B</strong>
        </button>
        <button class="toolbar-btn" onclick={() => execCommand('italic')} title="Cursiva (Ctrl+I)">
          <em>I</em>
        </button>
        <button
          class="toolbar-btn"
          onclick={() => execCommand('underline')}
          title="Subrayado (Ctrl+U)"
        >
          <u>U</u>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <span class="toolbar-label">Marcatextos:</span>
        {#each highlightColors as highlight (highlight.color)}
          <button
            class="color-btn"
            style="background: {highlight.color};"
            onclick={() => applyHighlight(highlight.color)}
            title={highlight.name}
          ></button>
        {/each}
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <span class="toolbar-label-small">Tip: Escribe [] para crear checkbox</span>
      </div>
    </div>

    <div class="note-header">
      <input
        class="note-title"
        placeholder="Título de la nota..."
        value={notesStore.activeNote?.title || ''}
        oninput={(e) => {
          if (notesStore.activeNote) {
            notesStore.updateNote(notesStore.activeNote.id, { title: e.target.value })
          }
        }}
      />
      <input
        class="note-date"
        type="date"
        value={notesStore.activeNote?.date?.split('T')[0] || new Date().toISOString().split('T')[0]}
        onchange={(e) => {
          if (notesStore.activeNote) {
            notesStore.updateNote(notesStore.activeNote.id, { date: e.target.value })
          }
        }}
      />
    </div>

    <div
      bind:this={editorRef}
      class="notebook-editor"
      contenteditable="true"
      role="textbox"
      tabindex="0"
      oninput={handleInput}
      onclick={handleEditorClick}
      onkeydown={handleEditorClick}
      data-placeholder="Escribe aquí tus notas... Usa [] para crear checkboxes"
    ></div>
  </div>
</div>

<style>
  .notebook-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
    background: #f9fafb;
    overflow: hidden;
  }

  :global(.dark) .notebook-container {
    background: #0f172a;
  }

  .notebook-paper {
    width: 100%;
    max-width: 900px;
    height: calc(100vh - 250px);
    background: #ffffff;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.06);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  :global(.dark) .notebook-paper {
    background: #f3ede3;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }

  /* Línea de margen rojo */
  .notebook-paper::before {
    content: '';
    position: absolute;
    left: 60px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--notebook-margin);
    z-index: 3;
  }

  .note-header {
    display: flex;
    gap: 1rem;
    padding: 1.5rem 2rem 1rem 80px;
    border-bottom: 2px solid var(--notebook-line);
    flex-shrink: 0;
    position: relative;
    z-index: 2;
    align-items: center;
  }

  .note-title {
    flex: 1;
    font-family: var(--font-handwritten);
    font-size: 1.4rem;
    font-weight: 600;
    color: #1f2937;
    border: none;
    background: transparent;
    outline: none;
    padding: 0;
  }

  .note-title::placeholder {
    color: #adb5bd;
  }

  .note-date {
    font-family: var(--font-system);
    font-size: 0.82rem;
    color: var(--text-secondary);
    border: 1px solid var(--notebook-line);
    background: white;
    padding: 0.25rem 0.4rem;
    border-radius: 4px;
    outline: none;
    transition: all 0.2s ease;
    cursor: pointer;
    width: fit-content;
    height: fit-content;
  }

  .note-date:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  /* Barra de herramientas de formato */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 2rem 0.75rem 80px;
    border-bottom: 1px solid var(--notebook-line);
    background: rgba(148, 203, 244, 0.05);
    flex-shrink: 0;
    position: relative;
    z-index: 2;
    flex-wrap: wrap;
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: var(--notebook-line);
    opacity: 0.5;
  }

  .font-selector {
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--notebook-line);
    border-radius: 6px;
    background: white;
    color: #1f2937;
    font-size: 0.9rem;
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;
  }

  .font-selector:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }

  .toolbar-btn {
    width: 32px;
    height: 32px;
    border: 1px solid var(--notebook-line);
    border-radius: 6px;
    background: white;
    color: #1f2937;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .toolbar-btn:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    transform: translateY(-1px);
  }

  .toolbar-btn:active {
    transform: translateY(0);
  }

  .color-btn {
    width: 28px;
    height: 28px;
    border: 2px solid #fff;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .color-btn:hover {
    transform: scale(1.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .toolbar-label {
    font-size: 0.85rem;
    color: #1f2937;
    font-weight: 500;
  }

  .toolbar-label-small {
    font-size: 0.8rem;
    color: #6b7280;
    font-style: italic;
  }

  .notebook-editor {
    flex: 1;
    font-family: var(--font-handwritten);
    font-size: 1.3rem;
    color: #1f2937;
    border: none;
    background: transparent;
    padding: 6px 2rem 2rem 80px;
    outline: none;
    overflow-y: auto;
    line-height: 32px;
    background-image: repeating-linear-gradient(
      transparent,
      transparent 31px,
      var(--notebook-line) 31px,
      var(--notebook-line) 32px
    );
    background-attachment: local;
    background-position: 0 6px;
    position: relative;
    z-index: 2;
  }

  .notebook-editor:empty::before {
    content: attr(data-placeholder);
    color: #adb5bd;
    font-style: italic;
  }

  .notebook-editor:focus::before {
    content: '';
  }

  /* Checkboxes inline */
  .notebook-editor :global(.inline-checkbox) {
    margin: 0 0.5rem;
    width: 18px;
    height: 18px;
    cursor: pointer;
    vertical-align: middle;
    accent-color: var(--primary);
    pointer-events: auto;
  }

  /* Scrollbar personalizado */
  .notebook-editor::-webkit-scrollbar {
    width: 10px;
  }

  .notebook-editor::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 0 4px 4px 0;
  }

  .notebook-editor::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 5px;
  }

  .notebook-editor::-webkit-scrollbar-thumb:hover {
    background: var(--primary-dark);
  }

  @media (max-width: 768px) {
    .notebook-container {
      padding: 1rem;
    }

    .notebook-paper {
      height: calc(100vh - 200px);
      max-width: 100%;
    }

    .notebook-paper::before {
      left: 40px;
    }

    .note-header {
      flex-direction: column;
      padding: 1rem 1.5rem 0.75rem 55px;
      gap: 0.5rem;
    }

    .note-title {
      font-size: 1.5rem;
    }

    .notebook-editor {
      padding: 0.5rem 1.5rem 1.5rem 55px;
      font-size: 1.1rem;
      line-height: 28px;
      background-image: repeating-linear-gradient(
        transparent,
        transparent 27px,
        var(--notebook-line) 27px,
        var(--notebook-line) 28px
      );
    }
  }
</style>
