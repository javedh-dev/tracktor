import crypto from 'crypto';
import { env } from '$lib/config/env.server';
import logger from '$server/config/logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

/**
 * Derives a key from the APP_SECRET using PBKDF2
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
	return crypto.pbkdf2Sync(secret, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param data - The data to encrypt (object will be JSON stringified)
 * @returns Encrypted string in format: salt.iv.authTag.encryptedData (all base64)
 */
export function encrypt(data: any): string {
	if (!env.APP_SECRET) {
		logger.warn('APP_SECRET is not set. Data will not be encrypted.');
		return JSON.stringify(data);
	}

	try {
		const plaintext = typeof data === 'string' ? data : JSON.stringify(data);

		// Generate random salt and IV
		const salt = crypto.randomBytes(SALT_LENGTH);
		const iv = crypto.randomBytes(IV_LENGTH);

		// Derive key from secret
		const key = deriveKey(env.APP_SECRET, salt);

		// Create cipher
		const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

		// Encrypt data
		let encrypted = cipher.update(plaintext, 'utf8', 'base64');
		encrypted += cipher.final('base64');

		// Get auth tag
		const authTag = cipher.getAuthTag();

		// Combine salt, iv, authTag, and encrypted data
		return `${salt.toString('base64')}.${iv.toString('base64')}.${authTag.toString('base64')}.${encrypted}`;
	} catch (error) {
		logger.error('Encryption failed', { error });
		throw new Error('Failed to encrypt data');
	}
}

/**
 * Decrypts data encrypted with the encrypt function
 * @param encryptedData - The encrypted string from encrypt()
 * @returns Decrypted data (parsed as JSON if possible)
 */
export function decrypt(encryptedData: string): any {
	if (!env.APP_SECRET) {
		logger.warn('APP_SECRET is not set. Attempting to parse data as JSON.');
		try {
			return JSON.parse(encryptedData);
		} catch {
			return encryptedData;
		}
	}

	try {
		// Split the encrypted data
		const parts = encryptedData.split('.');
		if (parts.length !== 4) {
			// Try to parse as unencrypted JSON (for backward compatibility)
			logger.warn('Data is not in encrypted format. Attempting to parse as JSON.');
			return JSON.parse(encryptedData);
		}

		const [saltBase64, ivBase64, authTagBase64, encrypted] = parts;

		// Convert from base64
		const salt = Buffer.from(saltBase64, 'base64');
		const iv = Buffer.from(ivBase64, 'base64');
		const authTag = Buffer.from(authTagBase64, 'base64');

		// Derive key from secret
		const key = deriveKey(env.APP_SECRET, salt);

		// Create decipher
		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(authTag);

		// Decrypt data
		let decrypted = decipher.update(encrypted, 'base64', 'utf8');
		decrypted += decipher.final('utf8');

		// Try to parse as JSON
		try {
			return JSON.parse(decrypted);
		} catch {
			return decrypted;
		}
	} catch (error) {
		logger.error('Decryption failed', { error });
		throw new Error('Failed to decrypt data');
	}
}

/**
 * Re-encrypts data with a new secret (useful for key rotation)
 */
export function reEncrypt(encryptedData: string, oldSecret: string): string {
	const originalSecret = env.APP_SECRET;

	try {
		// Temporarily set old secret
		(env as any).APP_SECRET = oldSecret;
		const decrypted = decrypt(encryptedData);

		// Restore original secret and re-encrypt
		(env as any).APP_SECRET = originalSecret;
		return encrypt(decrypted);
	} catch (error) {
		// Restore original secret on error
		(env as any).APP_SECRET = originalSecret;
		throw error;
	}
}
