import bcrypt from 'bcrypt';
import { AppError } from '../exceptions/AppError';
import { Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import { type ApiResponse } from '$lib/response';
import { generateSessionToken, createSession, validateSessionToken, invalidateSession, type User } from '../utils/session';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';

// Generate a unique user ID
function generateUserId(): string {
	const bytes = new Uint8Array(15);
	crypto.getRandomValues(bytes);
	return encodeBase32LowerCaseNoPadding(bytes);
}

export const createUser = async (username: string, password: string): Promise<ApiResponse> => {
	// Check if user already exists
	const existingUser = await db.query.usersTable.findFirst({
		where: (users, { eq }) => eq(users.username, username)
	});

	if (existingUser) {
		throw new AppError('Username already exists', Status.BAD_REQUEST);
	}

	const passwordHash = await bcrypt.hash(password, 10);
	const userId = generateUserId();

	await db.insert(schema.usersTable).values({
		id: userId,
		username,
		passwordHash
	});

	return {
		success: true,
		message: 'User created successfully',
		data: { userId, username }
	};
};

export const loginUser = async (username: string, password: string): Promise<ApiResponse> => {
	const user = await db.query.usersTable.findFirst({
		where: (users, { eq }) => eq(users.username, username)
	});

	if (!user) {
		throw new AppError('Invalid username or password', Status.UNAUTHORIZED);
	}

	const match = await bcrypt.compare(password, user.passwordHash);
	if (!match) {
		throw new AppError('Invalid username or password', Status.UNAUTHORIZED);
	}

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id);

	return {
		success: true,
		message: 'Login successful',
		data: {
			sessionToken,
			user: {
				id: user.id,
				username: user.username
			}
		}
	};
};

export const logoutUser = async (sessionId: string): Promise<ApiResponse> => {
	await invalidateSession(sessionId);
	return {
		success: true,
		message: 'Logout successful'
	};
};

export const validateSession = async (sessionToken: string): Promise<{ user: User | null }> => {
	const result = await validateSessionToken(sessionToken);
	return { user: result.user };
};

export const getUsersCount = async (): Promise<ApiResponse> => {
	const users = await db.select().from(schema.usersTable);
	return {
		success: true,
		data: {
			count: users.length,
			hasUsers: users.length > 0
		}
	};
};

// Legacy PIN functions (keep for backward compatibility during migration)
export const setPin = async (pin: string): Promise<ApiResponse> => {
	const hash = await bcrypt.hash(pin, 10);

	const existingAuth = await db.query.authTable.findFirst({
		where: (auth, { eq }) => eq(auth.id, 1)
	});

	if (existingAuth) {
		await db.update(schema.authTable).set({ hash: hash }).where(eq(schema.authTable.id, 1));
		return {
			success: true,
			message: 'PIN updated successfully.'
		};
	} else {
		await db.insert(schema.authTable).values({ id: 1, hash: hash });
		return {
			success: true,
			message: 'PIN set successfully.'
		};
	}
};

export const verifyPin = async (pin: string): Promise<ApiResponse> => {
	const auth = await db.query.authTable.findFirst({
		where: (auth, { eq }) => eq(auth.id, 1)
	});
	if (!auth) {
		throw new AppError('PIN is not set yet. Please set PIN first.', Status.BAD_REQUEST);
	}
	const match = await bcrypt.compare(pin, auth.hash);
	if (match) {
		return {
			data: { message: 'PIN verified successfully.' },
			success: true
		};
	} else {
		throw new AppError(
			'Incorrect PIN provided. Please try again with correct PIN',
			Status.UNAUTHORIZED
		);
	}
};

export const getPinStatus = async (): Promise<ApiResponse> => {
	const auth = await db.query.authTable.findFirst({
		where: (auth, { eq }) => eq(auth.id, 1)
	});
	return {
		data: {
			exists: !!auth
		},
		success: true
	};
};
