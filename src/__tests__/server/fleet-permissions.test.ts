import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';

const { dbPath } = vi.hoisted(() => ({ dbPath: `/tmp/tracktor-fleet-${crypto.randomUUID()}.db` }));
vi.mock('$lib/config/env.server', () => ({ env: { DB_PATH: dbPath, DISABLE_AUTH: false } }));
import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { createUser, loginUser } from '$server/services/authService';
import {
  createManagedUser,
  updateManagedUser,
  replaceAssignments,
  resetLocalPassword,
  listUsers
} from '$server/services/userService';
import { requireVehicle, vehicleScope, type AccessContext } from '$server/services/access';
import { validateSessionToken } from '$server/utils/session';

const admin: AccessContext = { id: 'admin', username: 'admin', role: 'admin', isActive: true };
const driver: AccessContext = { id: 'driver', username: 'driver', role: 'driver', isActive: true };
let oldFolder: string;

beforeAll(async () => {
  oldFolder = await mkdtemp(join(tmpdir(), 'tracktor-old-migrations-'));
  await cp('src/server/db/migrations', oldFolder, { recursive: true });
  const journalPath = join(oldFolder, 'meta/_journal.json');
  const journal = JSON.parse(await readFile(journalPath, 'utf8'));
  journal.entries = journal.entries.filter(
    (entry: { tag: string }) =>
      !entry.tag.includes('fleet_permissions') && !entry.tag.includes('preserve_existing_admins')
  );
  await writeFile(journalPath, JSON.stringify(journal));
  await migrate(db, { migrationsFolder: oldFolder, migrationsTable: '_migrations' });
  await db.run(
    "INSERT INTO users (id, username, password_hash) VALUES ('legacy', 'legacy', 'old-hash')"
  );
  await migrate(db, {
    migrationsFolder: 'src/server/db/migrations',
    migrationsTable: '_migrations'
  });
  const legacy = await db.query.usersTable.findFirst();
  expect(legacy).toMatchObject({
    id: 'legacy',
    username: 'legacy',
    passwordHash: 'old-hash',
    role: 'admin',
    isActive: true
  });
  await migrate(db, {
    migrationsFolder: 'src/server/db/migrations',
    migrationsTable: '_migrations'
  });
});

beforeEach(async () => {
  await db.delete(schema.sessionsTable);
  await db.delete(schema.vehicleAssignmentsTable);
  await db.delete(schema.uploadsTable);
  await db.delete(schema.usersTable);
  await db.delete(schema.vehicleTable);
  await db
    .insert(schema.usersTable)
    .values([admin, driver].map((user) => ({ ...user, passwordHash: 'test' })));
  await db.insert(schema.vehicleTable).values([
    { id: 'assigned', make: 'Visible', model: 'Tractor', year: 2020 },
    { id: 'hidden', make: 'Secret', model: 'Car', year: 2021 }
  ]);
  await replaceAssignments(admin, driver.id, { vehicleIds: ['assigned'] });
});

afterAll(async () => {
  db.$client.close();
  await rm(dbPath, { force: true });
  await rm(`${dbPath}-shm`, { force: true });
  await rm(`${dbPath}-wal`, { force: true });
  await rm(oldFolder, { recursive: true, force: true });
});

describe('fleet permissions using SQLite', () => {
  it('scopes queries and observes assignment revocation without a new session', async () => {
    const rows = await db
      .select()
      .from(schema.vehicleTable)
      .where(vehicleScope(schema.vehicleTable.id, driver));
    expect(rows.map((row) => row.id)).toEqual(['assigned']);
    await expect(requireVehicle(driver, 'assigned')).resolves.toBeUndefined();
    await expect(requireVehicle(driver, 'hidden')).rejects.toMatchObject({ status: 404 });
    await replaceAssignments(admin, driver.id, { vehicleIds: [] });
    await expect(requireVehicle(driver, 'assigned')).rejects.toMatchObject({ status: 404 });
    await expect(requireVehicle(admin, 'hidden')).resolves.toBeUndefined();
  });

  it('denies driver user management and never exposes password hashes', async () => {
    await expect(listUsers(driver)).rejects.toMatchObject({ status: 403 });
    expect((await listUsers(admin))[0]).not.toHaveProperty('passwordHash');
  });

  it('protects the final active admin and rolls back changes', async () => {
    await expect(updateManagedUser(admin, admin.id, { role: 'driver' })).rejects.toMatchObject({
      status: 409
    });
    await expect(updateManagedUser(admin, admin.id, { isActive: false })).rejects.toMatchObject({
      status: 409
    });
    expect(
      await db.query.usersTable.findFirst({ where: eq(schema.usersTable.id, admin.id) })
    ).toMatchObject({ role: 'admin', isActive: true });
  });

  it('creates drivers by default and invalidates sessions on deactivation/reset', async () => {
    const user = await createManagedUser(admin, { username: 'newdriver', password: 'password' });
    expect(user.role).toBe('driver');
    const login = await loginUser('newdriver', 'password');
    expect((await validateSessionToken(login.sessionToken)).user?.role).toBe('driver');
    await updateManagedUser(admin, user.id, { isActive: false });
    expect((await validateSessionToken(login.sessionToken)).user).toBeNull();
    await expect(loginUser('newdriver', 'password')).rejects.toMatchObject({ status: 401 });
    await updateManagedUser(admin, user.id, { isActive: true });
    const next = await loginUser('newdriver', 'password');
    await resetLocalPassword(admin, user.id, 'replacement');
    expect((await validateSessionToken(next.sessionToken)).user).toBeNull();
    await expect(loginUser('newdriver', 'replacement')).resolves.toBeDefined();
  });

  it('validates assignments atomically', async () => {
    await expect(
      replaceAssignments(admin, driver.id, { vehicleIds: ['missing'] })
    ).rejects.toMatchObject({ status: 404 });
    await expect(requireVehicle(driver, 'assigned')).resolves.toBeUndefined();
  });

  it('allows only one first-admin bootstrap and closes public registration', async () => {
    await expect(createUser('intruder', 'password')).rejects.toMatchObject({ status: 403 });
    await db.delete(schema.vehicleAssignmentsTable);
    await db.delete(schema.usersTable);
    const results = await Promise.allSettled([
      createUser('first', 'password'),
      createUser('second', 'password')
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await db.select().from(schema.usersTable)).toHaveLength(1);
    expect((await db.query.usersTable.findFirst())?.role).toBe('admin');
  });
});
