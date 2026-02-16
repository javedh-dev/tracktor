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
	isEnabled: t.integer({ mode: 'boolean' }).notNull().default(true),
	isDefault: t.integer({ mode: 'boolean' }).notNull().default(false),
	...timestamps
});
