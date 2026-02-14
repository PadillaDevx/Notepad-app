<script>
  import { appStore } from '../stores/app.svelte.js'
</script>

<nav>
  <button
    class="tab-button"
    class:active={appStore.activeTab === 'notes'}
    onclick={() => appStore.setActiveTab('notes')}
  >
    <span class="tab-icon"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><path d="M12 20h9" /><path
          d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        /></svg
      ></span
    >
    <span class="tab-label">Notas</span>
  </button>

  <button
    class="tab-button"
    class:active={appStore.activeTab === 'diary'}
    onclick={() => appStore.setActiveTab('diary')}
  >
    <span class="tab-icon"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        /></svg
      ></span
    >
    <span class="tab-label">Diario</span>
  </button>

  <button
    class="tab-button"
    class:active={appStore.activeTab === 'reminders'}
    onclick={() => appStore.setActiveTab('reminders')}
  >
    <span class="tab-icon"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path
          d="M13.73 21a2 2 0 01-3.46 0"
        /></svg
      ></span
    >
    <span class="tab-label">Recordatorios</span>
  </button>
</nav>

<style>
  nav {
    display: flex;
    justify-content: center;
    background: #0b276b;
    border-bottom: none;
    padding: 0.5rem 2rem 0;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 12px 12px 0 0;
    background: rgba(0, 0, 0, 0.15);
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    min-width: 140px;
    justify-content: center;
  }

  .tab-button:hover:not(.active) {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
  }

  .tab-button.active {
    background: #1c4f9c;
    color: white;
    font-weight: 600;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.25),
      inset 0 1px 1px rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    z-index: 1;
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #1c4f9c;
  }

  .tab-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .tab-icon svg {
    width: 18px;
    height: 18px;
  }

  .tab-label {
    position: relative;
    user-select: none;
  }

  @media (max-width: 768px) {
    nav {
      padding: 0.5rem 1rem 0;
      gap: 0.25rem;
    }

    .tab-button {
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
      min-width: auto;
    }

    .tab-label {
      display: none;
    }

    .tab-icon {
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    }

    .tab-icon svg {
      width: 22px;
      height: 22px;
    }
  }
</style>
