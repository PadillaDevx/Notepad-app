<script>
  import { onMount } from 'svelte'
  import Swal from 'sweetalert2'
  import logoSrc from '../../assets/logo.png'

  let { onAuthenticated, initialView = 'login' } = $props()

  let view = $state(null)
  let username = $state('')
  let password = $state('')
  let confirmPassword = $state('')
  let backupCode = $state('')
  let newPassword = $state('')
  let autofill = $state(false)
  let loading = $state(false)
  let error = $state('')
  let showPassword = $state(false)

  onMount(async () => {
    view = initialView

    if (initialView === 'login') {
      const data = await window.api.auth.getAutofill()
      if (data) {
        username = data.username
        password = data.password
        autofill = true
      }
    }
  })

  // ─── Handlers ──────────────────────────────────────────

  async function handleLogin() {
    if (!username.trim() || !password) {
      error = 'Completa todos los campos'
      return
    }

    loading = true
    error = ''

    try {
      const result = await window.api.auth.login(username.trim(), password)
      if (result.success) {
        await window.api.auth.setAutofill(autofill, username.trim(), password)
        onAuthenticated(result.username)
      } else {
        error = result.error || 'Credenciales incorrectas'
      }
    } catch (e) {
      error = e.message || 'Error al iniciar sesión'
    }

    loading = false
  }

  async function handleRegister() {
    if (!username.trim() || !password || !confirmPassword) {
      error = 'Completa todos los campos'
      return
    }
    if (password.length < 4) {
      error = 'La contraseña debe tener al menos 4 caracteres'
      return
    }
    if (password !== confirmPassword) {
      error = 'Las contraseñas no coinciden'
      return
    }

    loading = true
    error = ''

    try {
      const result = await window.api.auth.register(username.trim(), password)
      if (result.success) {
        await Swal.fire({
          title: 'Código de Respaldo',
          html: `
            <p style="margin-bottom: 16px; color: #555;">Guarda este código en un lugar seguro.<br>Lo necesitarás si olvidas tu contraseña.</p>
            <div style="font-size: 2rem; letter-spacing: 6px; font-weight: bold; padding: 20px; background: linear-gradient(135deg, #e8f0fe, #f0f4ff); border-radius: 12px; font-family: 'Courier New', monospace; color: #0b276b; border: 2px dashed #0b276b40; user-select: all;">${result.backupCode}</div>
            <p style="margin-top: 16px; font-size: 0.85rem; color: #888;"><svg style="width:14px;height:14px;vertical-align:-2px;margin-right:4px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#e8a300" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Este código solo se muestra una vez</p>
          `,
          icon: 'warning',
          confirmButtonText: 'Ya lo guardé',
          confirmButtonColor: '#0b276b',
          allowOutsideClick: false,
          allowEscapeKey: false
        })
        onAuthenticated(username.trim())
      } else {
        error = result.error || 'Error al registrar'
      }
    } catch (e) {
      error = e.message || 'Error al registrar'
    }

    loading = false
  }

  async function handleReset() {
    if (!backupCode.trim() || !newPassword) {
      error = 'Completa todos los campos'
      return
    }
    if (newPassword.length < 4) {
      error = 'La nueva contraseña debe tener al menos 4 caracteres'
      return
    }

    loading = true
    error = ''

    try {
      const result = await window.api.auth.resetPassword(backupCode.trim(), newPassword)
      if (result.success) {
        await Swal.fire({
          title: 'Contraseña Restablecida',
          html: `
            <p style="margin-bottom: 16px; color: #555;">Tu nuevo código de respaldo es:</p>
            <div style="font-size: 2rem; letter-spacing: 6px; font-weight: bold; padding: 20px; background: linear-gradient(135deg, #e8f0fe, #f0f4ff); border-radius: 12px; font-family: 'Courier New', monospace; color: #0b276b; border: 2px dashed #0b276b40; user-select: all;">${result.backupCode}</div>
            <p style="margin-top: 16px; font-size: 0.85rem; color: #888;"><svg style="width:14px;height:14px;vertical-align:-2px;margin-right:4px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#e8a300" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Guárdalo en un lugar seguro</p>
          `,
          icon: 'success',
          confirmButtonText: 'Ya lo guardé',
          confirmButtonColor: '#0b276b',
          allowOutsideClick: false,
          allowEscapeKey: false
        })
        view = 'login'
        username = ''
        password = ''
        backupCode = ''
        newPassword = ''
      } else {
        error = result.error || 'Código incorrecto'
      }
    } catch (e) {
      error = e.message || 'Error al restablecer'
    }

    loading = false
  }

  function switchView(newView) {
    view = newView
    error = ''
    if (newView === 'register') {
      password = ''
      confirmPassword = ''
    } else if (newView === 'reset') {
      backupCode = ''
      newPassword = ''
    }
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Enter' && !loading) {
      if (view === 'login') handleLogin()
      else if (view === 'register') handleRegister()
      else if (view === 'reset') handleReset()
    }
  }}
/>

<div class="auth-container">
  <div class="auth-card">
    <!-- Logo -->
    <div class="auth-logo">
      <img src={logoSrc} alt="Mi Notepad" class="logo-img" />
      <h1>Mi Notepad</h1>
    </div>

    <!-- ─── LOGIN ─── -->
    {#if view === 'login'}
      <h2>
        <svg
          class="icon-heading"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline
            points="10 17 15 12 10 7"
          /><line x1="15" y1="12" x2="3" y2="12" /></svg
        >Iniciar Sesión
      </h2>

      <div class="form-group">
        <label for="login-user">Usuario</label>
        <div class="input-icon-wrapper">
          <svg
            class="input-icon"
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
          <input
            id="login-user"
            type="text"
            bind:value={username}
            placeholder="Tu nombre de usuario"
            disabled={loading}
            autocomplete="username"
            class="input-with-icon"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="login-pass">Contraseña</label>
        <div class="password-field">
          <svg
            class="input-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path
              d="M7 11V7a5 5 0 0110 0v4"
            /></svg
          >
          <input
            id="login-pass"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            placeholder="Tu contraseña"
            disabled={loading}
            autocomplete="current-password"
            class="input-with-icon"
          />
          <button
            class="toggle-pw"
            type="button"
            onclick={() => (showPassword = !showPassword)}
            tabindex="-1"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {#if showPassword}
              <svg
                class="icon-pw"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path
                  d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
                /><path
                  d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
                /><line x1="1" y1="1" x2="23" y2="23" /></svg
              >
            {:else}
              <svg
                class="icon-pw"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
                  cx="12"
                  cy="12"
                  r="3"
                /></svg
              >
            {/if}
          </button>
        </div>
      </div>

      <label class="autofill-check">
        <input type="checkbox" bind:checked={autofill} />
        <span>Recordar credenciales</span>
      </label>

      {#if error}<p class="error-msg">{error}</p>{/if}

      <button class="btn-primary" onclick={handleLogin} disabled={loading}>
        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
      </button>

      <div class="auth-links">
        <button class="link-btn" onclick={() => switchView('reset')}
          >¿Olvidaste tu contraseña?</button
        >
        <button class="link-btn" onclick={() => switchView('register')}
          >¿No tienes cuenta? <strong>Regístrate</strong></button
        >
      </div>

      <!-- ─── REGISTER ─── -->
    {:else if view === 'register'}
      <h2>
        <svg
          class="icon-heading"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line
            x1="20"
            y1="8"
            x2="20"
            y2="14"
          /><line x1="23" y1="11" x2="17" y2="11" /></svg
        >Crear Cuenta
      </h2>

      <div class="form-group">
        <label for="reg-user">Usuario</label>
        <div class="input-icon-wrapper">
          <svg
            class="input-icon"
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
          <input
            id="reg-user"
            type="text"
            bind:value={username}
            placeholder="Elige un nombre de usuario"
            disabled={loading}
            class="input-with-icon"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="reg-pass">Contraseña</label>
        <div class="input-icon-wrapper">
          <svg
            class="input-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path
              d="M7 11V7a5 5 0 0110 0v4"
            /></svg
          >
          <input
            id="reg-pass"
            type="password"
            bind:value={password}
            placeholder="Mínimo 4 caracteres"
            disabled={loading}
            class="input-with-icon"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="reg-confirm">Confirmar Contraseña</label>
        <div class="input-icon-wrapper">
          <svg
            class="input-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path
              d="M7 11V7a5 5 0 0110 0v4"
            /></svg
          >
          <input
            id="reg-confirm"
            type="password"
            bind:value={confirmPassword}
            placeholder="Repite la contraseña"
            disabled={loading}
            class="input-with-icon"
          />
        </div>
      </div>

      {#if error}<p class="error-msg">{error}</p>{/if}

      <button class="btn-primary" onclick={handleRegister} disabled={loading}>
        {loading ? 'Registrando...' : 'Crear Cuenta'}
      </button>

      <div class="auth-links">
        <button class="link-btn" onclick={() => switchView('login')}
          >¿Ya tienes cuenta? <strong>Inicia sesión</strong></button
        >
      </div>

      <!-- ─── RESET ─── -->
    {:else if view === 'reset'}
      <h2>
        <svg
          class="icon-heading"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><polyline points="23 4 23 10 17 10" /><path
            d="M20.49 15a9 9 0 11-2.12-9.36L23 10"
          /></svg
        >Restablecer Contraseña
      </h2>
      <p class="subtitle">Ingresa tu código de respaldo y una nueva contraseña</p>

      <div class="form-group">
        <label for="reset-code">Código de Respaldo</label>
        <div class="input-icon-wrapper">
          <svg
            class="input-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path
              d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
            /></svg
          >
          <input
            id="reset-code"
            type="text"
            bind:value={backupCode}
            placeholder="Ej: GHJ78K2P"
            disabled={loading}
            class="backup-input input-with-icon"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="reset-pass">Nueva Contraseña</label>
        <div class="input-icon-wrapper">
          <svg
            class="input-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path
              d="M7 11V7a5 5 0 0110 0v4"
            /></svg
          >
          <input
            id="reset-pass"
            type="password"
            bind:value={newPassword}
            placeholder="Mínimo 4 caracteres"
            disabled={loading}
            class="input-with-icon"
          />
        </div>
      </div>

      {#if error}<p class="error-msg">{error}</p>{/if}

      <button class="btn-primary" onclick={handleReset} disabled={loading}>
        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
      </button>

      <div class="auth-links">
        <button class="link-btn" onclick={() => switchView('login')}
          >← Volver al inicio de sesión</button
        >
      </div>
    {/if}
  </div>
</div>

<style>
  /* ─── Container ─── */
  .auth-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #0b276b 0%, #1c4f9c 50%, #2563eb 100%);
    padding: 1rem;
  }

  .auth-card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem 2.5rem 2rem;
    width: 100%;
    max-width: 400px;
    box-shadow:
      0 25px 60px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    animation: slideUp 0.4s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ─── Logo ─── */
  .auth-logo {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .logo-img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin-bottom: 0.5rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  }

  .auth-logo h1 {
    font-family: 'Inter', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #0b276b;
    margin: 0;
  }

  /* ─── Headings ─── */
  h2 {
    font-family: 'Inter', sans-serif;
    font-size: 1.15rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1.5rem;
    text-align: center;
  }

  .subtitle {
    text-align: center;
    color: #666;
    font-size: 0.85rem;
    margin: -1rem 0 1.5rem;
    font-family: 'Inter', sans-serif;
  }

  /* ─── Form ─── */
  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    color: #555;
    margin-bottom: 0.35rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    color: #1a1a1a;
    background: #f8fafc;
    transition:
      border-color 0.2s,
      background 0.2s;
    outline: none;
    box-sizing: border-box;
  }

  .form-group input:focus {
    border-color: #2563eb;
    background: white;
  }

  .form-group input:disabled {
    opacity: 0.6;
  }

  .form-group input::placeholder {
    color: #a0aec0;
  }

  /* ─── Input with icon wrapper ─── */
  .input-icon-wrapper {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: #94a3b8;
    pointer-events: none;
    z-index: 1;
  }

  .input-with-icon {
    padding-left: 2.5rem !important;
  }

  /* ─── Heading icons ─── */
  .icon-heading {
    width: 20px;
    height: 20px;
    vertical-align: -3px;
    margin-right: 0.35rem;
    color: #0b276b;
  }

  /* ─── Password toggle ─── */
  .password-field {
    position: relative;
  }

  .password-field input {
    padding-right: 2.8rem;
  }

  .password-field .input-icon {
    left: 12px;
  }

  .toggle-pw {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    display: flex;
    align-items: center;
    color: #94a3b8;
    transition: color 0.2s;
  }

  .toggle-pw:hover {
    color: #475569;
  }

  .icon-pw {
    width: 20px;
    height: 20px;
  }

  /* ─── Backup code input ─── */
  .backup-input {
    text-transform: uppercase;
    letter-spacing: 4px;
    font-weight: 600;
    text-align: center;
    font-family: 'Courier New', monospace !important;
  }

  /* ─── Autofill checkbox ─── */
  .autofill-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    color: #555;
  }

  .autofill-check input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #0b276b;
    cursor: pointer;
  }

  /* ─── Error ─── */
  .error-msg {
    color: #dc2626;
    font-size: 0.85rem;
    margin: 0 0 1rem;
    text-align: center;
    font-family: 'Inter', sans-serif;
    background: #fef2f2;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid #fecaca;
  }

  /* ─── Primary button ─── */
  .btn-primary {
    width: 100%;
    padding: 0.8rem;
    background: linear-gradient(135deg, #0b276b, #1c4f9c);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      opacity 0.2s,
      transform 0.1s;
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-primary:active:not(:disabled) {
    transform: scale(0.98);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ─── Links ─── */
  .auth-links {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }

  .link-btn {
    background: none;
    border: none;
    color: #2563eb;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0;
  }

  .link-btn:hover {
    text-decoration: underline;
  }

  .link-btn strong {
    font-weight: 600;
  }
</style>
