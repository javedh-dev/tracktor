import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { db } from '../db/index';
import { sessionsTable, usersTable } from '../db/schema/index';
import { eq } from 'drizzle-orm';

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(token: string, userId: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
	};

	await db.insert(sessionsTable).values({
		id: session.id,
		userId: session.userId,
		expiresAt: Math.floor(session.expiresAt.getTime() / 1000)
	});

	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const result = await db
		.select({
			session: {
				id: sessionsTable.id,
				userId: sessionsTable.userId,
				expiresAt: sessionsTable.expiresAt
			},
			user: {
				id: usersTable.id,
				username: usersTable.username
			}
		})
		.from(sessionsTable)
		.innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
		.where(eq(sessionsTable.id, sessionId))
		.limit(1);

	if (result.length < 1) {
		return { session: null, user: null };
	}

	const { session, user } = result[0];
	const expiresAt = new Date(session.expiresAt * 1000);

	if (Date.now() >= expiresAt.getTime()) {
		await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
		return { session: null, user: null };
	}

	// Refresh session if it expires in less than 15 days
	if (Date.now() >= expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(sessionsTable)
			.set({ expiresAt: Math.floor(newExpiresAt.getTime() / 1000) })
			.where(eq(sessionsTable.id, session.id));

		return {
			session: {
				id: session.id,
				userId: session.userId,
				expiresAt: newExpiresAt
			},
			user: {
				id: user.id,
				username: user.username
			}
		};
	}

	return {
		session: {
			id: session.id,
			userId: session.userId,
			expiresAt
		},
		user: {
			id: user.id,
			username: user.username
		}
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

export interface User {
	id: string;
	username: string;
}

export interface SessionValidationResult {
	session: Session | null;
	user: User | null;
}
