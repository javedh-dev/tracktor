import { describe, it, expect, beforeAll } from 'vitest';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from '../server/db/index';
import { usersTable } from '../server/db/schema/index';
import { createUser } from '../server/services/authService';
import { AppError } from '../server/exceptions/AppError';

// Exercises the actual createUser() fix against a real temporary SQLite DB, migrated with
// the project's real migration files via the same drizzle-orm/libsql migrator the app uses
// at startup (src/server/db/init.ts). This is not a reimplementation — it imports and runs
// the real authService.createUser().
beforeAll(async () => {
  await migrate(db, {
    migrationsFolder: 'src/server/db/migrations',
    migrationsTable: '_migrations'
  });
});

describe('createUser registration gate (fix for open-registration finding)', () => {
  it('allows exactly one of two concurrent first-run registrations, and rejects the other', async () => {
    const results = await Promise.allSettled([
      createUser('owner-a', 'password123'),
      createUser('owner-b', 'password123')
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const rejection = rejected[0] as PromiseRejectedResult;
    expect(rejection.reason).toBeInstanceOf(AppError);
    expect((rejection.reason as AppError).status).toBe(409);

    const rows = await db.select({ id: usersTable.id }).from(usersTable);
    expect(rows).toHaveLength(1);
  });

  it('rejects a further registration once a user already exists (the original vulnerability)', async () => {
    await expect(createUser('intruder', 'password123')).rejects.toMatchObject({
      status: 409
    });

    const rows = await db.select({ id: usersTable.id }).from(usersTable);
    expect(rows).toHaveLength(1); // still just the one account from the first test
  });
});
