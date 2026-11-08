import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '$server/db/schema';
import { readFile } from 'node:fs/promises';

const state = vi.hoisted(() => ({ db: undefined as any }));
vi.mock('$server/db/index', () => ({
  get db() {
    return state.db;
  }
}));
import { createUser, getUsersCount } from '$server/services/authService';

let client: ReturnType<typeof createClient>;
beforeEach(async () => {
  client = createClient({ url: ':memory:' });
  await client.executeMultiple(
    await readFile('src/server/db/migrations/20251213112213_add_user_auth.sql', 'utf8')
  );
  state.db = drizzle(client, { schema, casing: 'snake_case' });
});
afterEach(() => client.close());

it('accepts the first account and rejects subsequent registration server-side (#260)', async () => {
  expect(await getUsersCount()).toMatchObject({ hasUsers: false });
  await createUser('owner', 'long-password');
  await expect(createUser('intruder', 'other-password')).rejects.toMatchObject({ status: 403 });
  expect((await client.execute('SELECT username FROM users')).rows).toHaveLength(1);
});

it('allows exactly one winner for concurrent first-account requests', async () => {
  const results = await Promise.allSettled([
    createUser('owner-a', 'long-password'),
    createUser('owner-b', 'long-password')
  ]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(results.find((result) => result.status === 'rejected')).toMatchObject({
    reason: { status: 403 }
  });
  expect((await client.execute('SELECT id FROM users')).rows).toHaveLength(1);
});
