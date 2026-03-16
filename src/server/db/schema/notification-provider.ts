import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { timestamps } from './audit';

export const notificationProviderTable = table('notification_providers', {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: t.text().notNull(),
  type: t.text().notNull(), // 'email', 'sms', 'push', etc.
  config: t.text().notNull(), // JSON string with provider-specific configuration
  channels: t.text().notNull().default('["reminder","alert","information"]'),
  isEnabled: t.integer({ mode: 'boolean' }).notNull().default(true),
  ...timestamps
});
