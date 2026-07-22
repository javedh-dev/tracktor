import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';
import { timestamps, idColumn } from './audit';

export const fuelLogTable = table(
  'fuel_logs',
  {
    ...idColumn,
    vehicleId: t
      .text()
      .notNull()
      .references(() => vehicleTable.id, { onDelete: 'cascade' }),
    date: t.text().notNull(),
    odometer: t.integer(),
    fuelAmount: t.real(),
    rate: t.real(),
    cost: t.real().notNull(),
    filled: t.integer({ mode: 'boolean' }).notNull(),
    missedLast: t.integer({ mode: 'boolean' }).notNull(),
    notes: t.text(),
    attachment: t.text(),
    ...timestamps
  },
  (table) => ({
    vehicleIdIdx: t.index('idx_fuel_logs_vehicle_id').on(table.vehicleId)
  })
);
