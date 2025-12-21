import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';

export const notesTable = sqliteTable('notes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	vehicleId: integer('vehicle_id').references(() => vehicleTable.id).notNull(),
	name: text('name').notNull(),
	data: text('data').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});
