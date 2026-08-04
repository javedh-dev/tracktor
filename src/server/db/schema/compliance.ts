import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';
import { timestamps, idColumn, recurrenceColumns } from './audit';

export const complianceDocumentTable = table(
  'compliance_documents',
  {
    ...idColumn,
    vehicleId: t
      .text()
      .notNull()
      .references(() => vehicleTable.id, { onDelete: 'cascade' }),
    type: t.text().notNull(),
    otherLabel: t.text(),
    documentNumber: t.text().notNull(),
    issuer: t.text().notNull(),
    startDate: t.text().notNull(),
    endDate: t.text(),
    ...recurrenceColumns,
    cost: t.real(),
    notes: t.text(),
    attachment: t.text(),
    ...timestamps
  },
  (table) => ({
    vehicleIdIdx: t.index('idx_compliance_documents_vehicle_id').on(table.vehicleId),
    typeIdx: t.index('idx_compliance_documents_type').on(table.type)
  })
);
