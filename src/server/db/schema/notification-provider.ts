import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { timestamps, idColumn } from './audit';

export const notificationProviderTable = table('notification_providers', {
  ...idColumn,
  name: t.text().notNull(),
  type: t.text().notNull(),
  config: t.text().notNull(),
  channels: t.text().notNull().default('["reminder","alert","information"]'),
  isEnabled: t.integer({ mode: 'boolean' }).notNull().default(true),
  ...timestamps
});
