import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { timestamps } from './audit';

export const configTable = table('configs', {
	key: t.text().notNull().primaryKey(),
	value: t.text().notNull(),
	description: t.text(),
	...timestamps
});
