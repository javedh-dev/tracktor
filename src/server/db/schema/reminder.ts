import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';
import { timestamps, idColumn, recurrenceColumns } from './audit';

export const reminderTable = table(
  'reminders',
  {
    ...idColumn,
    vehicleId: t
      .text()
      .notNull()
      .references(() => vehicleTable.id, { onDelete: 'cascade' }),
    type: t.text().notNull(),
    dueDate: t.text().notNull(),
    remindSchedule: t.text().notNull(),
    ...recurrenceColumns,
    recurrenceEndDate: t.text(),
    note: t.text(),
    isCompleted: t.integer({ mode: 'boolean' }).notNull().default(false),
    ...timestamps
  },
  (table) => ({
    vehicleIdIdx: t.index('idx_reminders_vehicle_id').on(table.vehicleId)
  })
);
