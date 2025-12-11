import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { timestamps } from './audit';

export const authTable = table('auth', {
	id: t.integer().primaryKey(),
	hash: t.text().notNull(),
	...timestamps
});
