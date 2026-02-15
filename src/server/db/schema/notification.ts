import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';
import { timestamps } from './audit';

export const notificationTable = table('notifications', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	vehicleId: t
		.text()
		.notNull()
		.references(() => vehicleTable.id, { onDelete: 'cascade' }),
	type: t.text().notNull(),
	message: t.text().notNull(),
	source: t.text().notNull(),
	dueDate: t.text().notNull(),
	isRead: t.integer().notNull(),
	...timestamps
});
