<script>
  import { appStore } from '../stores/app.svelte.js'
</script>

<header>
  <div class="header-left">
    <h1>📝 Mi Notepad App</h1>
    {#if appStore.username}
      <span class="file-badge">👤 {appStore.username}</span>
    {/if}
  </div>

  <div class="header-right">
    <button class="theme-toggle" onclick={() => appStore.toggleDarkMode()} title="Cambiar tema">
      <span class="theme-icon">
        {#if appStore.darkMode}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
            />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
              clip-rule="evenodd"
            />
          </svg>
        {/if}
      </span>
    </button>
  </div>
</header>

<style>
  header {
    background: #0b276b;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-left h1 {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
  }

  .file-badge {
    font-size: 0.85rem;
    opacity: 0.95;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.35rem 0.9rem;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    white-space: nowrap;
  }

  .header-right {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .theme-toggle {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.15);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 2px rgba(255, 255, 255, 0.2);
  }

  .theme-toggle:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px) rotate(15deg);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 2px rgba(255, 255, 255, 0.3);
  }

  .theme-toggle:active {
    transform: translateY(0) rotate(0deg);
    box-shadow:
      0 1px 4px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .theme-icon {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-icon svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  @media (max-width: 768px) {
    header {
      padding: 0.8rem 1rem;
    }

    .header-left h1 {
      font-size: 1.1rem;
    }

    .file-badge {
      display: none;
    }

    .theme-toggle {
      width: 38px;
      height: 38px;
    }
  }
</style>
