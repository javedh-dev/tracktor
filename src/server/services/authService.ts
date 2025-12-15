import bcrypt from 'bcrypt';
import { AppError } from '../exceptions/AppError';
import { Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import { type ApiResponse } from '$lib/response';
import {
	generateSessionToken,
	createSession,
	validateSessionToken,
	invalidateSession,
	type User
} from '../utils/session';

export const createUser = async (username: string, password: string): Promise<ApiResponse> => {
	// Check if user already exists
	const existingUser = await db.query.usersTable.findFirst({
		where: (users, { eq }) => eq(users.username, username)
	});

	if (existingUser) {
		throw new AppError('Username already exists', Status.BAD_REQUEST);
	}

	const passwordHash = await bcrypt.hash(password, 10);
	const userId = crypto.randomUUID();

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

export const createOrUpdateUser = async (username: string, password: string): Promise<void> => {
	const existingUser = await db.query.usersTable.findFirst({
		where: (users, { eq }) => eq(users.username, username)
	});

	if (!existingUser) {
		const passwordHash = await bcrypt.hash(password, 10);
		const userId = crypto.randomUUID();

		await db.insert(schema.usersTable).values({
			id: userId,
			username: username,
			passwordHash
		});
	} else {
		const passwordHash = await bcrypt.hash(password, 10);
		await db
			.update(schema.usersTable)
			.set({ passwordHash })
			.where(eq(schema.usersTable.username, username));
	}
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

export const updateUserProfile = async (
	userId: string,
	data: { username?: string; currentPassword?: string; newPassword?: string }
): Promise<ApiResponse> => {
	const user = await db.query.usersTable.findFirst({
		where: (users, { eq }) => eq(users.id, userId)
	});

	if (!user) {
		throw new AppError('User not found', Status.NOT_FOUND);
	}

	const updates: { username?: string; passwordHash?: string } = {};

	// Handle username update
	if (data.username && data.username !== user.username) {
		const existingUser = await db.query.usersTable.findFirst({
			where: (users, { eq }) => eq(users.username, data.username!)
		});

		if (existingUser) {
			throw new AppError('Username already exists', Status.BAD_REQUEST);
		}

		updates.username = data.username;
	}

	// Handle password update
	if (data.newPassword) {
		if (!data.currentPassword) {
			throw new AppError('Current password is required to change password', Status.BAD_REQUEST);
		}

		const match = await bcrypt.compare(data.currentPassword, user.passwordHash);
		if (!match) {
			throw new AppError('Current password is incorrect', Status.UNAUTHORIZED);
		}

		updates.passwordHash = await bcrypt.hash(data.newPassword, 10);
	}

	if (Object.keys(updates).length === 0) {
		return {
			success: true,
			message: 'No changes to update',
			data: { id: user.id, username: user.username }
		};
	}

	await db.update(schema.usersTable).set(updates).where(eq(schema.usersTable.id, userId));

	return {
		success: true,
		message: 'Profile updated successfully',
		data: { id: user.id, username: updates.username || user.username }
	};
};
