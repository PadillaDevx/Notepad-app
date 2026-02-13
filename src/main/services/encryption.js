import crypto from 'node:crypto';

const MAGIC = Buffer.from('JNOT');
const VERSION = 1;
const SCRYPT_COST = 16384; // N parameter for scrypt
const KEY_LENGTH = 32; // 256 bits for AES-256
const IV_LENGTH = 12; // Recommended for GCM
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Cifra datos JSON en formato .jnote
 * @param {Object} jsonData - Objeto JavaScript con los datos a cifrar
 * @param {string} password - Contraseña maestra para el cifrado
 * @returns {Buffer} - Archivo .jnote cifrado
 */
export function encrypt(jsonData, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derivar clave desde la contraseña usando scrypt (memory-hard, resistente a GPU)
  const key = crypto.scryptSync(password, salt, KEY_LENGTH, { N: SCRYPT_COST });

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(jsonData), 'utf8');

  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Ensamblar archivo .jnote con estructura binaria propietaria
  return Buffer.concat([
    MAGIC, // 4 bytes: "JNOT"
    Buffer.from([VERSION]), // 1 byte: versión del formato
    salt, // 16 bytes: salt para derivación de clave
    iv, // 12 bytes: initialization vector
    authTag, // 16 bytes: tag de autenticación GCM
    encrypted // variable: datos cifrados
  ]);
}

/**
 * Descifra un archivo .jnote
 * @param {Buffer} fileBuffer - Buffer del archivo .jnote
 * @param {string} password - Contraseña maestra para descifrar
 * @returns {Object} - Objeto JavaScript con los datos descifrados
 * @throws {Error} - Si el archivo no es válido o la contraseña es incorrecta
 */
export function decrypt(fileBuffer, password) {
  // Validar magic bytes
  if (fileBuffer.length < 49 || fileBuffer.subarray(0, 4).toString() !== 'JNOT') {
    throw new Error('No es un archivo .jnote válido');
  }

  // Extraer componentes del archivo
  let offset = 5; // Saltar magic (4) + version (1)
  const salt = fileBuffer.subarray(offset, (offset += SALT_LENGTH));
  const iv = fileBuffer.subarray(offset, (offset += IV_LENGTH));
  const authTag = fileBuffer.subarray(offset, (offset += TAG_LENGTH));
  const data = fileBuffer.subarray(offset);

  // Derivar clave desde la contraseña
  const key = crypto.scryptSync(password, salt, KEY_LENGTH, { N: SCRYPT_COST });

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    if (error.message.includes('Unsupported state or unable to authenticate data')) {
      throw new Error('Contraseña incorrecta o archivo corrupto');
    }
    throw new Error(`Error al descifrar: ${error.message}`);
  }
}

/**
 * Valida si un Buffer es un archivo .jnote válido
 * @param {Buffer} fileBuffer - Buffer a validar
 * @returns {boolean} - true si es un archivo .jnote válido
 */
export function isValidJNoteFile(fileBuffer) {
  return (
    fileBuffer &&
    Buffer.isBuffer(fileBuffer) &&
    fileBuffer.length >= 49 &&
    fileBuffer.subarray(0, 4).toString() === 'JNOT'
  );
}
