import { randomBytes, scrypt, createCipheriv, createDecipheriv } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

interface EncryptedData {
	iv: string;
	salt: string;
	data: string;
}

export async function encrypt(text: string, password: string): Promise<string> {
	const salt = randomBytes(16);
	const iv = randomBytes(16);

	// Derive key from password
	const key = (await scryptAsync(password, salt, 32)) as Buffer;

	// Create cipher
	const cipher = createCipheriv('aes-256-gcm', key, iv);

	// Encrypt the text
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	// Get the authentication tag
	const authTag = cipher.getAuthTag();

	const result: EncryptedData = {
		iv: iv.toString('hex'),
		salt: salt.toString('hex'),
		data: encrypted + ':' + authTag.toString('hex')
	};

	return JSON.stringify(result);
}

export async function decrypt(encryptedText: string, password: string): Promise<string> {
	try {
		const encryptedData: EncryptedData = JSON.parse(encryptedText);

		const salt = Buffer.from(encryptedData.salt, 'hex');
		const iv = Buffer.from(encryptedData.iv, 'hex');

		// Split encrypted data and auth tag
		const [encrypted, authTagHex] = encryptedData.data.split(':');
		const authTag = Buffer.from(authTagHex, 'hex');

		// Derive key from password
		const key = (await scryptAsync(password, salt, 32)) as Buffer;

		// Create decipher
		const decipher = createDecipheriv('aes-256-gcm', key, iv);
		decipher.setAuthTag(authTag);

		// Decrypt the text
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');

		return decrypted;
	} catch (error) {
		throw new Error('Decryption failed: Invalid password or corrupted data');
	}
}
