<script>
  import { appStore } from '../stores/app.svelte.js'

  let { onsave, onlogout } = $props()
  let showUserMenu = $state(false)
  let saving = $state(false)

  async function handleSave() {
    saving = true
    try {
      await onsave?.()
    } finally {
      setTimeout(() => (saving = false), 600)
    }
  }

  function handleLogout() {
    showUserMenu = false
    onlogout?.()
  }

  function toggleUserMenu() {
    showUserMenu = !showUserMenu
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if showUserMenu}
  <div class="menu-overlay" onclick={() => (showUserMenu = false)}></div>
{/if}

<header>
  <div class="header-left">
    <h1>
      <svg
        class="icon-h"
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
      > Mi Notepad
    </h1>
    {#if appStore.username}
      <div class="user-menu-container">
        <button class="user-badge" onclick={toggleUserMenu} title="Menú de usuario">
          <svg
            class="icon-sm"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle
              cx="12"
              cy="7"
              r="4"
            /></svg
          >
          {appStore.username}
        </button>
        {#if showUserMenu}
          <div class="user-dropdown">
            <button class="dropdown-item logout" onclick={handleLogout}>
              <svg
                class="icon-sm"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline
                  points="16 17 21 12 16 7"
                /><line x1="21" y1="12" x2="9" y2="12" /></svg
              >
              Cerrar sesión
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="header-right">
    <button class="save-btn" onclick={handleSave} title="Guardar (Ctrl+S)" class:saved={saving}>
      {#if saving}
        <svg
          class="icon-btn"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
        >
      {:else}
        <svg
          class="icon-btn"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline
            points="17 21 17 13 7 13 7 21"
          /><polyline points="7 3 7 8 15 8" /></svg
        >
      {/if}
    </button>
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
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .icon-h {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .icon-sm {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    vertical-align: middle;
  }

  .icon-btn {
    width: 20px;
    height: 20px;
  }

  .user-menu-container {
    position: relative;
  }

  .user-badge {
    font-size: 0.85rem;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.35rem 0.9rem;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .user-badge:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .user-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    background: #1a1a2e;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    min-width: 160px;
    z-index: 1000;
    animation: dropIn 0.15s ease;
  }

  @keyframes dropIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.7rem 1rem;
    background: none;
    border: none;
    color: white;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }

  .dropdown-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .dropdown-item.logout:hover {
    background: rgba(220, 53, 69, 0.3);
  }

  .menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
  }

  .header-right {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .save-btn {
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
    font-size: 1.2rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 2px rgba(255, 255, 255, 0.2);
  }

  .save-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  .save-btn:active {
    transform: translateY(0);
  }

  .save-btn.saved {
    background: rgba(40, 167, 69, 0.4);
    border-color: rgba(40, 167, 69, 0.6);
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

    .theme-toggle {
      width: 38px;
      height: 38px;
    }
  }
</style>
