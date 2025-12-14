import { sql } from 'drizzle-orm';
import * as t from 'drizzle-orm/sqlite-core';

export const timestamps = {
	created_at: t
		.text()
		.$defaultFn(() => sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: t
		.text()
		.$onUpdateFn(() => sql`CURRENT_TIMESTAMP`)
		.notNull()
};
