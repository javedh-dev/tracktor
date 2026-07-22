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

export const idColumn = {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
};

export const recurrenceColumns = {
  recurrenceType: t.text().notNull().default('none'),
  recurrenceInterval: t.integer().notNull().default(1)
};
