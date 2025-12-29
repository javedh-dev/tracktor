import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';
import { timestamps } from './audit';

export const reminderTable = table('reminders', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	vehicleId: t
		.text()
		.notNull()
		.references(() => vehicleTable.id, { onDelete: 'cascade' }),
	type: t.text().notNull(),
	dueDate: t.text().notNull(),
	remindSchedule: t.text().notNull(),
	recurrenceType: t.text().notNull().default('none'),
	recurrenceInterval: t.integer().notNull().default(1),
	recurrenceEndDate: t.text(),
	note: t.text(),
	isCompleted: t.integer({ mode: 'boolean' }).notNull().default(false),
	...timestamps
});
