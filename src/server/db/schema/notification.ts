import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { vehicleTable } from './vehicle';
import { timestamps, idColumn } from './audit';

export const notificationTable = table(
  'notifications',
  {
    ...idColumn,
    vehicleId: t
      .text()
      .notNull()
      .references(() => vehicleTable.id, { onDelete: 'cascade' }),
    type: t.text().notNull(),
    channel: t.text().notNull().default('information'),
    notificationKey: t.text(),
    message: t.text().notNull(),
    source: t.text().notNull(),
    dueDate: t.text().notNull(),
    isRead: t.integer({ mode: 'boolean' }).notNull().default(false),
    clearedAt: t.text(),
    ...timestamps
  },
  (table) => ({
    vehicleIdIdx: t.index('idx_notifications_vehicle_id').on(table.vehicleId),
    notificationKeyIdx: t
      .uniqueIndex('idx_notifications_notification_key')
      .on(table.notificationKey)
  })
);
