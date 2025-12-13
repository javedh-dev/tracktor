import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { timestamps } from './audit';

// Users table for username/password authentication
export const usersTable = table('users', {
	id: t.text().primaryKey(),
	username: t.text().notNull().unique(),
	passwordHash: t.text().notNull(),
	...timestamps
});

// Sessions table for session management
export const sessionsTable = table('sessions', {
	id: t.text().primaryKey(),
	userId: t.text().notNull().references(() => usersTable.id),
	expiresAt: t.integer().notNull(),
	...timestamps
});

// Keep the old auth table for migration purposes (can be removed later)
export const authTable = table('auth', {
	id: t.integer().primaryKey(),
	hash: t.text().notNull(),
	...timestamps
});
