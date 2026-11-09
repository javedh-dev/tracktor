import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { timestamps } from './audit';
import { vehicleTable } from './vehicle';

// Users table for username/password authentication
export const usersTable = table('users', {
  id: t.text().primaryKey(),
  username: t.text().notNull().unique(),
  passwordHash: t.text().notNull(),
  role: t
    .text({ enum: ['admin', 'driver'] })
    .notNull()
    .default('driver'),
  isActive: t.integer({ mode: 'boolean' }).notNull().default(true),
  ...timestamps
});

// Sessions table for session management
export const sessionsTable = table('sessions', {
  id: t.text().primaryKey(),
  userId: t
    .text()
    .notNull()
    .references(() => usersTable.id),
  expiresAt: t.integer().notNull(),
  ...timestamps
});

// A driver's assignments grant access to operational data for these vehicles.
export const vehicleAssignmentsTable = table(
  'vehicle_assignments',
  {
    userId: t
      .text()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    vehicleId: t
      .text()
      .notNull()
      .references(() => vehicleTable.id, { onDelete: 'cascade' })
  },
  (table) => [t.primaryKey({ columns: [table.userId, table.vehicleId] })]
);

export const uploadsTable = table('uploads', {
  filename: t.text().primaryKey(),
  userId: t.text().references(() => usersTable.id, { onDelete: 'set null' }),
  createdAt: t.integer().notNull()
});
