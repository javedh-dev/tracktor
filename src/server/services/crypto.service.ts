import {
  randomBytes,
  scrypt,
  scryptSync,
  pbkdf2Sync,
  createCipheriv,
  createDecipheriv
} from 'crypto';
import { promisify } from 'util';
import { env } from '$lib/config/env.server';

const scryptAsync = promisify(scrypt);

const LEGACY_PBKDF2_ITERATIONS = 100_000;
const LEGACY_KEY_LENGTH = 32;
const LEGACY_ALGORITHM = 'aes-256-gcm';
const LEGACY_IV_LENGTH = 16;
const LEGACY_AUTH_TAG_LENGTH = 16;
const LEGACY_SALT_LENGTH = 64;

interface EncryptedPayload {
  iv: string;
  salt: string;
  data: string;
}

function isEncryptedPayload(obj: unknown): obj is EncryptedPayload {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'iv' in obj &&
    'salt' in obj &&
    'data' in obj &&
    typeof (obj as Record<string, unknown>).iv === 'string' &&
    typeof (obj as Record<string, unknown>).salt === 'string' &&
    typeof (obj as Record<string, unknown>).data === 'string'
  );
}

function requireAppSecret(): string {
  if (!env.APP_SECRET) {
    throw new Error(
      'APP_SECRET is not set. Refusing to store or read credentials without encryption.'
    );
  }
  return env.APP_SECRET;
}

function tryParseJson(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function isLegacyPbkdf2Format(str: string): boolean {
  const parts = str.split('.');
  return parts.length === 4;
}

// ==================== Password-based encryption (data export/import) ====================

export async function encrypt(text: string, password: string): Promise<string> {
  const salt = randomBytes(16);
  const iv = randomBytes(16);

  const key = (await scryptAsync(password, salt, 32)) as Buffer;

  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  const result: EncryptedPayload = {
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    data: encrypted + ':' + authTag.toString('hex')
  };

  return JSON.stringify(result);
}

export async function decrypt(encryptedText: string, password: string): Promise<string> {
  try {
    const encryptedData: EncryptedPayload = JSON.parse(encryptedText);

    const salt = Buffer.from(encryptedData.salt, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');

    const [encrypted, authTagHex] = encryptedData.data.split(':');
    const authTag = Buffer.from(authTagHex, 'hex');

    const key = (await scryptAsync(password, salt, 32)) as Buffer;

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: Invalid password or corrupted data', { cause: error });
  }
}

// ==================== APP_SECRET-based encryption (provider credentials) ====================

export function encryptWithSecret(data: unknown): string {
  const secret = requireAppSecret();
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data);

  const salt = randomBytes(16);
  const iv = randomBytes(16);
  const key = scryptSync(secret, salt, 32);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    data: encrypted + ':' + authTag.toString('hex')
  };

  return JSON.stringify(payload);
}

export function decryptWithSecret(encryptedData: string): unknown {
  // Legacy plaintext (stored before APP_SECRET enforcement): JSON without envelope shape
  const parsed = tryParseJson(encryptedData);
  if (parsed && !isEncryptedPayload(parsed)) {
    return parsed;
  }

  const secret = requireAppSecret();

  // New scrypt-based format (JSON envelope)
  if (parsed && isEncryptedPayload(parsed)) {
    return decryptWithSecretInternal(parsed, secret);
  }

  // Legacy PBKDF2 format (4 base64 parts: salt.iv.authTag.data)
  if (isLegacyPbkdf2Format(encryptedData)) {
    return decryptLegacyPbkdf2(encryptedData, secret);
  }

  throw new Error('Unrecognized encrypted payload format');
}

function decryptWithSecretInternal(payload: EncryptedPayload, secret: string): unknown {
  const salt = Buffer.from(payload.salt, 'hex');
  const iv = Buffer.from(payload.iv, 'hex');
  const [encrypted, authTagHex] = payload.data.split(':');
  const authTag = Buffer.from(authTagHex, 'hex');

  const key = scryptSync(secret, salt, 32);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}

function decryptLegacyPbkdf2(encryptedData: string, secret: string): unknown {
  const [saltBase64, ivBase64, authTagBase64, encrypted] = encryptedData.split('.');

  const salt = Buffer.from(saltBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  const key = pbkdf2Sync(secret, salt, LEGACY_PBKDF2_ITERATIONS, LEGACY_KEY_LENGTH, 'sha256');

  const decipher = createDecipheriv(LEGACY_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}
