import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';
import { timestamps } from './audit';

export const insuranceTable = table('insurances', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	vehicleId: t
		.text()
		.notNull()
		.references(() => vehicleTable.id, { onDelete: 'cascade' }),
	provider: t.text().notNull(),
	policyNumber: t.text().notNull(),
	startDate: t.text().notNull(),
	endDate: t.text().notNull(),
	cost: t.real().notNull(),
	notes: t.text(),
	...timestamps
});
