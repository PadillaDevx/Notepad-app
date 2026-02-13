import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { app, safeStorage } from 'electron'
import Store from 'electron-store'
import { encrypt, decrypt } from './encryption.js'

const store = new Store.default({ name: 'secure-config' })

const USERDATA_FILE = 'userdata.jnote'
const SCRYPT_N = 16384
const KEY_LEN = 32
const SALT_LEN = 16
const BACKUP_CODE_LEN = 8

// ─── Utilidades internas ────────────────────────────────────────────

function userdataPath() {
  return path.join(app.getPath('userData'), USERDATA_FILE)
}

function generateBackupCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(BACKUP_CODE_LEN)
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('')
}

function hashPw(password, existingSaltHex) {
  const salt = existingSaltHex ? Buffer.from(existingSaltHex, 'hex') : crypto.randomBytes(SALT_LEN)
  const hash = crypto.scryptSync(password, salt, KEY_LEN, { N: SCRYPT_N })
  return { hash: hash.toString('hex'), salt: salt.toString('hex') }
}

// ─── Credentials via safeStorage (OS Keychain) ─────────────────────

function safeSet(key, value) {
  if (safeStorage.isEncryptionAvailable()) {
    store.set(key, safeStorage.encryptString(JSON.stringify(value)).toString('base64'))
  } else {
    store.set(key, JSON.stringify(value))
  }
}

function safeGet(key) {
  const raw = store.get(key)
  if (!raw) return null
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return JSON.parse(safeStorage.decryptString(Buffer.from(raw, 'base64')))
    }
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function safeDelete(key) {
  store.delete(key)
}

function loadCreds() {
  return safeGet('credentials')
}

function saveCreds(data) {
  safeSet('credentials', data)
}

// ─── DEK (Data Encryption Key) ─────────────────────────────────────

function generateDEK() {
  const dek = crypto.randomBytes(32).toString('hex')
  safeSet('dataEncryptionKey', dek)
  return dek
}

function getDEK() {
  return safeGet('dataEncryptionKey')
}

// ─── Auth API ───────────────────────────────────────────────────────

export function hasUser() {
  return loadCreds() !== null
}

export function register(username, password) {
  if (hasUser()) throw new Error('Ya existe un usuario registrado')

  const backupCode = generateBackupCode()
  const { hash: pwHash, salt: pwSalt } = hashPw(password)
  const { hash: bkHash, salt: bkSalt } = hashPw(backupCode)

  saveCreds({
    username,
    passwordHash: pwHash,
    passwordSalt: pwSalt,
    backupHash: bkHash,
    backupSalt: bkSalt,
    autofill: false,
    createdAt: new Date().toISOString()
  })

  // Generar DEK y crear archivo de datos vacío
  const dek = generateDEK()
  const emptyData = { notes: [], diary: [], reminders: [] }
  fs.writeFileSync(userdataPath(), encrypt(emptyData, dek))

  return { success: true, backupCode }
}

export function login(username, password) {
  const creds = loadCreds()
  if (!creds) throw new Error('No hay usuario registrado')

  if (creds.username !== username) {
    throw new Error('Usuario o contraseña incorrectos')
  }

  const { hash } = hashPw(password, creds.passwordSalt)
  if (hash !== creds.passwordHash) {
    throw new Error('Usuario o contraseña incorrectos')
  }

  return { success: true, username: creds.username }
}

export function resetPassword(backupCode, newPassword) {
  const creds = loadCreds()
  if (!creds) throw new Error('No hay usuario registrado')

  const { hash } = hashPw(backupCode.toUpperCase(), creds.backupSalt)
  if (hash !== creds.backupHash) {
    throw new Error('Código de respaldo incorrecto')
  }

  // Nueva contraseña + nuevo código de respaldo
  const newBackupCode = generateBackupCode()
  const { hash: newPwHash, salt: newPwSalt } = hashPw(newPassword)
  const { hash: newBkHash, salt: newBkSalt } = hashPw(newBackupCode)

  creds.passwordHash = newPwHash
  creds.passwordSalt = newPwSalt
  creds.backupHash = newBkHash
  creds.backupSalt = newBkSalt
  creds.autofill = false

  saveCreds(creds)

  // Limpiar autorelleno
  safeDelete('autofillUsername')
  safeDelete('autofillPassword')

  return { success: true, backupCode: newBackupCode }
}

export function setAutofill(enabled, username, password) {
  const creds = loadCreds()
  if (!creds) throw new Error('No hay usuario registrado')

  creds.autofill = enabled
  saveCreds(creds)

  if (enabled) {
    safeSet('autofillUsername', username)
    safeSet('autofillPassword', password)
  } else {
    safeDelete('autofillUsername')
    safeDelete('autofillPassword')
  }

  return { success: true }
}

export function getAutofillData() {
  const creds = loadCreds()
  if (!creds || !creds.autofill) return null

  const username = safeGet('autofillUsername')
  const password = safeGet('autofillPassword')
  if (!username || !password) return null

  return { username, password }
}

// ─── Data API ───────────────────────────────────────────────────────

export function loadUserData() {
  const dek = getDEK()
  if (!dek) return null

  const fp = userdataPath()
  if (!fs.existsSync(fp)) return null

  try {
    return decrypt(fs.readFileSync(fp), dek)
  } catch {
    return null
  }
}

export function saveUserData(data) {
  const dek = getDEK()
  if (!dek) throw new Error('Clave de cifrado no encontrada')

  fs.writeFileSync(userdataPath(), encrypt(data, dek))
  return { success: true }
}
