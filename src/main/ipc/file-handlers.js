import { ipcMain, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { encrypt, decrypt, isValidJNoteFile } from '../services/encryption.js';

// Estado del archivo actual
let currentFilePath = null;
let hasUnsavedChanges = false;

/**
 * Registra todos los handlers IPC relacionados con archivos .jnote
 */
function registerFileHandlers() {
  // Nuevo archivo
  ipcMain.handle('file:new', () => {
    currentFilePath = null;
    hasUnsavedChanges = false;
    return {
      success: true,
      filePath: null
    };
  });

  // Abrir archivo
  ipcMain.handle('file:open', async (event, masterPassword) => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Abrir archivo de notas',
        filters: [{ name: 'JNote Files', extensions: ['jnote'] }],
        properties: ['openFile']
      });

      if (result.canceled || !result.filePaths.length) {
        return { success: false, canceled: true };
      }

      const filePath = result.filePaths[0];
      const fileBuffer = fs.readFileSync(filePath);

      if (!isValidJNoteFile(fileBuffer)) {
        throw new Error('El archivo seleccionado no es un archivo .jnote válido');
      }

      const data = decrypt(fileBuffer, masterPassword);

      currentFilePath = filePath;
      hasUnsavedChanges = false;

      return {
        success: true,
        filePath,
        fileName: path.basename(filePath),
        data
      };
    } catch (error) {
      console.error('Error abriendo archivo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Guardar archivo (en la ruta actual)
  ipcMain.handle('file:save', async (event, data, masterPassword) => {
    try {
      if (!currentFilePath) {
        // Si no hay ruta actual, mostrar diálogo "Guardar como"
        return await ipcMain.emit('file:save-as', event, data, masterPassword);
      }

      const encrypted = encrypt(data, masterPassword);
      fs.writeFileSync(currentFilePath, encrypted);

      hasUnsavedChanges = false;

      return {
        success: true,
        filePath: currentFilePath,
        fileName: path.basename(currentFilePath)
      };
    } catch (error) {
      console.error('Error guardando archivo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Guardar como (mostrar diálogo)
  ipcMain.handle('file:save-as', async (event, data, masterPassword) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Guardar archivo de notas',
        defaultPath: 'mis-notas.jnote',
        filters: [{ name: 'JNote Files', extensions: ['jnote'] }]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
      }

      const encrypted = encrypt(data, masterPassword);
      fs.writeFileSync(result.filePath, encrypted);

      currentFilePath = result.filePath;
      hasUnsavedChanges = false;

      return {
        success: true,
        filePath: result.filePath,
        fileName: path.basename(result.filePath)
      };
    } catch (error) {
      console.error('Error en guardar como:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Marcar como modificado (dirty flag)
  ipcMain.handle('file:mark-dirty', () => {
    hasUnsavedChanges = true;
    return { success: true };
  });

  // Obtener estado del archivo
  ipcMain.handle('file:get-state', () => {
    return {
      filePath: currentFilePath,
      fileName: currentFilePath ? path.basename(currentFilePath) : null,
      hasUnsavedChanges
    };
  });

  console.log('File handlers registrados');
}

/**
 * Obtiene la ruta del archivo actual
 */
function getCurrentFilePath() {
  return currentFilePath;
}

/**
 * Verifica si hay cambios sin guardar
 */
function getHasUnsavedChanges() {
  return hasUnsavedChanges;
}

export { registerFileHandlers, getCurrentFilePath, getHasUnsavedChanges };
