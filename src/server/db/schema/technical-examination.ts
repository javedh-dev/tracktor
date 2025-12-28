import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';
import { timestamps } from './audit';

export const technicalExaminationTable = table('technical_examinations', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	vehicleId: t
		.text()
		.notNull()
		.references(() => vehicleTable.id, { onDelete: 'cascade' }),
	enabled: t.integer({ mode: 'boolean' }).notNull().default(true),
	intervalMonths: t.integer().notNull().default(24),
	lastExamDate: t.text(),
	nextExamDate: t.text(),
	examinationType: t.text(),
	examinationCenter: t.text(),
	certificationNumber: t.text(),
	notes: t.text(),
	...timestamps
});
