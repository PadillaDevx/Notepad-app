# 📝 Mi Notepad App

Una aplicación multiplataforma de notas, diario y recordatorios construida con **Electron + Svelte 5**, con cifrado AES-256-GCM, contraseña maestra almacenada en el Keychain del sistema, y estilo de libreta clásica.

## ✨ Características

- 🔐 **Cifrado Militar**: Archivos `.jnote` protegidos con AES-256-GCM + scrypt
- 🔑 **Contraseña Maestra**: Guardada seguramente en Keychain (macOS), DPAPI (Windows), libsecret (Linux)
- 📓 **Estilo Libreta**: Líneas azules horizontales y márgenes rojos
- 🔔 **Notificaciones Nativas**: Recordatorios programados
- 📅 **Integración con Calendario**: Exporta a archivos `.ics` universales
- 🌙 **Tema Oscuro**: Toggle entre modo claro y oscuro
- 💾 **Sistema de Archivos Propietario**: Solo abre con la app

## 🚀 Comenzar

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

### Build

```bash
npm run build           # Build para producción
npm run build:mac       # macOS (.dmg)
npm run build:win       # Windows (.exe)
npm run build:linux     # Linux (.AppImage, .deb)
```

## 🏗️ Arquitectura

```
src/
├── main/                    # Proceso principal Electron
│   ├── index.js             # Entry point, ventana, tray
│   ├── services/            # Servicios backend
│   │   ├── encryption.js    # AES-256-GCM
│   │   ├── scheduler.js     # node-schedule
│   │   └── tray.js          # System tray
│   └── ipc/                 # IPC handlers
│       ├── auth-handlers.js
│       ├── file-handlers.js
│       ├── notification-handlers.js
│       └── calendar-handlers.js
├── preload/
│   └── index.js             # contextBridge API
└── renderer/
    └── src/
        ├── App.svelte       # Componente raíz
        ├── assets/global.css
        └── lib/stores/      # Svelte 5 runes
            ├── app.svelte.js
            ├── notes.svelte.js
            ├── diary.svelte.js
            └── reminders.svelte.js
```

## 🔒 Seguridad

- **Cifrado**: AES-256-GCM (Authenticated Encryption)
- **Derivación de clave**: scrypt (N=16384, memory-hard)
- **Formato binario**: `[JNOT(4B)][Ver(1B)][Salt(16B)][IV(12B)][Tag(16B)][Data]`
- **Context Isolation**: `true` con `contextBridge`
- **Node Integration**: `false`

## 📦 Tecnologías

- Electron + Svelte 5 (runes)
- electron-vite (HMR)
- Node.js crypto (AES-256-GCM)
- electron-store
- node-schedule
- ical-generator
- SweetAlert2

## 📝 Uso

1. Primera vez: crea una contraseña maestra
2. Edita notas con estilo de libreta
3. Usa "Guardar Como" para crear archivos `.jnote` cifrados
4. Navega entre Notas, Diario (próximamente) y Recordatorios (próximamente)

## 🎨 Estilo

El editor mantiene el diseño clásico de libreta con líneas azules (32px), márgenes rojos verticales, y fuente "Indie Flower" de Google Fonts.

## 🔔 Recordatorios (Próximamente)

- Notificaciones programadas con `node-schedule`
- Exportación a calendario como archivos `.ics`
- Al cerrar, la app se minimiza al tray para mantener notificaciones activas

## 📄 Licencia

ISC

---

**Autor**: Janmxgaming
