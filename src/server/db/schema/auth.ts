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

export const oidcIdentitiesTable = table(
  'oidc_identities',
  {
    issuer: t.text().notNull(),
    subject: t.text().notNull(),
    userId: t
      .text()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' })
  },
  (table) => [
    t.primaryKey({ columns: [table.issuer, table.subject] }),
    t.uniqueIndex('oidc_user_issuer_unique').on(table.userId, table.issuer)
  ]
);

export const oidcTransactionsTable = table('oidc_transactions', {
  id: t.text().primaryKey(),
  state: t.text().notNull(),
  nonce: t.text().notNull(),
  codeVerifier: t.text().notNull(),
  expiresAt: t.integer().notNull(),
  userId: t.text().references(() => usersTable.id, { onDelete: 'cascade' }),
  sessionId: t.text().references(() => sessionsTable.id, { onDelete: 'cascade' })
});
