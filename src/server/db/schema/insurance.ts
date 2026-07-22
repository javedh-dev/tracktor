import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';
import { timestamps, idColumn, recurrenceColumns } from './audit';

export const insuranceTable = table(
  'insurances',
  {
    ...idColumn,
    vehicleId: t
      .text()
      .notNull()
      .references(() => vehicleTable.id, { onDelete: 'cascade' }),
    provider: t.text().notNull(),
    policyNumber: t.text().notNull(),
    startDate: t.text().notNull(),
    endDate: t.text(),
    ...recurrenceColumns,
    cost: t.real().notNull(),
    notes: t.text(),
    attachment: t.text(),
    ...timestamps
  },
  (table) => ({
    vehicleIdIdx: t.index('idx_insurances_vehicle_id').on(table.vehicleId)
  })
);
