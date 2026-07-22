import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';
import { timestamps, idColumn, recurrenceColumns } from './audit';

export const pollutionCertificateTable = table(
  'pollution_certificates',
  {
    ...idColumn,
    vehicleId: t
      .text()
      .notNull()
      .references(() => vehicleTable.id, { onDelete: 'cascade' }),
    certificateNumber: t.text().notNull(),
    issueDate: t.text().notNull(),
    expiryDate: t.text(),
    ...recurrenceColumns,
    testingCenter: t.text().notNull(),
    notes: t.text(),
    attachment: t.text(),
    ...timestamps
  },
  (table) => ({
    vehicleIdIdx: t.index('idx_pollution_certificates_vehicle_id').on(table.vehicleId)
  })
);
