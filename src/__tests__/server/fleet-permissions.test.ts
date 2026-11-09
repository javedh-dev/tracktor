import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';

const { dbPath } = vi.hoisted(() => ({ dbPath: `/tmp/tracktor-fleet-${crypto.randomUUID()}.db` }));
vi.mock('$lib/config/env.server', () => ({
  env: { DB_PATH: dbPath, DISABLE_AUTH: false, BASE_URL: '' },
  serverEnv: { UPLOADS_DIR: '/tmp', CORS_ORIGINS: ['http://client.test'] }
}));
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
import { getAllVehicles, getVehicleSummary, deleteVehicle } from '$server/services/vehicleService';
import {
  getFuelLogs,
  getFuelLogById,
  addFuelLog,
  updateFuelLog,
  deleteFuelLog
} from '$server/services/fuelLogService';
import { getMaintenanceLogs } from '$server/services/maintenanceLogService';
import { getComplianceDocuments } from '$server/services/complianceService';
import { getReminders } from '$server/services/reminderService';
import { getDashboardSummary } from '$server/services/dashboardService';
import {
  getUniqueVehicleMakes,
  getUniqueServiceCenters,
  getUniqueComplianceIssuers
} from '$server/services/autocompleteService';
import { getAllNotifications, markNotificationAsRead } from '$server/services/notificationService';
import { requireReadableFile } from '$server/services/fileService';
import { buildExportData, importDataSet } from '$server/services/data-transfer.service';
import { handleCors } from '$server/middlewares/cors';
import { handleAuth } from '$server/middlewares/auth';
import { GET as fuelDetail } from '../../routes/api/vehicles/[id]/fuel-logs/[logId]/+server';
import { POST as importRoute } from '../../routes/api/data/import/+server';
import { load as vehicleLoader } from '../../routes/(app)/garage/[id]/+page.server';
import { validateSessionToken } from '$server/utils/session';

const admin: AccessContext = { id: 'admin', username: 'admin', role: 'admin', isActive: true };
const driver: AccessContext = { id: 'driver', username: 'driver', role: 'driver', isActive: true };
let oldFolder: string;

beforeAll(async () => {
  oldFolder = await mkdtemp(join(tmpdir(), 'tracktor-old-migrations-'));
  await cp('src/server/db/migrations', oldFolder, { recursive: true });
  const journalPath = join(oldFolder, 'meta/_journal.json');
  const journal = JSON.parse(await readFile(journalPath, 'utf8'));
  journal.entries = journal.entries.slice(
    0,
    journal.entries.findIndex((entry: { tag: string }) => entry.tag.includes('fleet_permissions'))
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
  await db.delete(schema.oidcTransactionsTable);
  await db.delete(schema.oidcIdentitiesTable);
  await db.delete(schema.notificationTable);
  await db.delete(schema.reminderTable);
  await db.delete(schema.complianceDocumentTable);
  await db.delete(schema.maintenanceLogTable);
  await db.delete(schema.fuelLogTable);
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
  for (const vehicleId of ['assigned', 'hidden']) {
    await db.insert(schema.fuelLogTable).values({
      id: `fuel-${vehicleId}`,
      vehicleId,
      date: '2026-01-01',
      odometer: 100,
      fuelAmount: 10,
      cost: vehicleId === 'assigned' ? 10 : 1000,
      filled: true,
      missedLast: false,
      attachment: `${vehicleId}.pdf`
    });
    await db.insert(schema.maintenanceLogTable).values({
      id: `maintenance-${vehicleId}`,
      vehicleId,
      date: '2026-01-02',
      odometer: 101,
      cost: 20,
      serviceCenter: vehicleId
    });
    await db.insert(schema.complianceDocumentTable).values({
      id: `compliance-${vehicleId}`,
      vehicleId,
      type: 'insurance',
      startDate: '2026-01-01',
      documentNumber: vehicleId,
      issuer: vehicleId
    });
    await db.insert(schema.reminderTable).values({
      id: `reminder-${vehicleId}`,
      vehicleId,
      type: 'other',
      dueDate: '2026-12-01',
      remindSchedule: 'on_due_date'
    });
    await db.insert(schema.notificationTable).values({
      id: `notification-${vehicleId}`,
      vehicleId,
      type: 'reminder',
      source: 'manual',
      message: vehicleId,
      dueDate: '2026-12-01'
    });
  }
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

describe('resource isolation across services and transport', () => {
  it('filters every fleet list, summary, and autocomplete before returning data', async () => {
    expect((await getAllVehicles(driver)).map((row) => row.id)).toEqual(['assigned']);
    for (const read of [
      getFuelLogs,
      getMaintenanceLogs,
      getComplianceDocuments,
      getReminders,
      getAllNotifications
    ]) {
      expect((await read(driver)).map((row) => row.vehicleId)).toEqual(['assigned']);
    }
    expect((await getDashboardSummary(driver)).fleet).toMatchObject({
      totalVehicles: 1,
      totalExpenses: 30
    });
    expect(await getUniqueVehicleMakes(driver)).toEqual(['Visible']);
    expect(await getUniqueServiceCenters(driver)).toEqual(['assigned']);
    expect(await getUniqueComplianceIssuers(driver)).toEqual(['assigned']);
    await replaceAssignments(admin, driver.id, { vehicleIds: [] });
    expect((await getDashboardSummary(driver)).fleet.totalVehicles).toBe(0);
    expect(await getFuelLogs(driver)).toEqual([]);
  });

  it('permits operational CRUD but denies unrelated records and mismatched parents', async () => {
    const created = await addFuelLog(driver, 'assigned', {
      date: '2026-02-01',
      odometer: null,
      fuelAmount: null,
      rate: null,
      notes: null,
      attachment: null,
      cost: 15,
      filled: true,
      missedLast: false
    });
    await expect(
      updateFuelLog(driver, 'assigned', created.id, { cost: 16 })
    ).resolves.toMatchObject({ cost: 16 });
    await expect(getFuelLogById(driver, 'assigned', 'fuel-hidden')).rejects.toMatchObject({
      status: 404
    });
    await expect(getFuelLogById(admin, 'assigned', 'fuel-hidden')).rejects.toMatchObject({
      status: 404
    });
    await expect(
      addFuelLog(driver, 'hidden', {
        date: '2026-02-01',
        odometer: null,
        fuelAmount: null,
        rate: null,
        notes: null,
        attachment: null,
        cost: 1,
        filled: false,
        missedLast: false
      })
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      markNotificationAsRead(driver, 'assigned', 'notification-hidden')
    ).rejects.toMatchObject({ status: 404 });
    await expect(deleteFuelLog(driver, 'assigned', created.id)).resolves.toMatchObject({
      id: created.id
    });
    await expect(deleteVehicle(driver, 'assigned')).rejects.toMatchObject({ status: 403 });
    await expect(getVehicleSummary(driver, 'hidden')).rejects.toMatchObject({ status: 404 });
  });

  it('protects attachment downloads and prevents attaching another vehicle’s file', async () => {
    await expect(requireReadableFile(driver, 'assigned.pdf')).resolves.toBeUndefined();
    await expect(requireReadableFile(driver, 'hidden.pdf')).rejects.toMatchObject({ status: 404 });
    await db
      .insert(schema.uploadsTable)
      .values({ filename: 'pending.pdf', userId: driver.id, createdAt: Date.now() });
    await expect(requireReadableFile(driver, 'pending.pdf')).resolves.toBeUndefined();
    await expect(requireReadableFile(driver, 'orphan.pdf')).rejects.toMatchObject({ status: 404 });
    await expect(requireReadableFile(admin, 'orphan.pdf')).resolves.toBeUndefined();
    await expect(
      updateFuelLog(driver, 'assigned', 'fuel-assigned', { attachment: 'hidden.pdf' })
    ).rejects.toMatchObject({ status: 404 });
    await replaceAssignments(admin, driver.id, { vehicleIds: [] });
    await expect(requireReadableFile(driver, 'assigned.pdf')).rejects.toMatchObject({
      status: 404
    });
  });

  it('denies destructive import/export before touching any data', async () => {
    await expect(buildExportData(driver, false)).rejects.toMatchObject({ status: 403 });
    await expect(importDataSet(driver, {})).rejects.toMatchObject({ status: 403 });
    await expect(
      importRoute({ locals: { user: driver } } as Parameters<typeof importRoute>[0])
    ).rejects.toMatchObject({ status: 403 });
    expect(await db.select().from(schema.vehicleTable)).toHaveLength(2);
  });

  it('enforces nested access through the real route and SSR loader', async () => {
    await expect(
      fuelDetail({
        locals: { user: driver },
        params: { id: 'assigned', logId: 'fuel-hidden' }
      } as Parameters<typeof fuelDetail>[0])
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      vehicleLoader({ locals: { user: driver }, params: { id: 'hidden' } } as Parameters<
        typeof vehicleLoader
      >[0])
    ).rejects.toMatchObject({ status: 404 });
  });

  it('keeps only exact public auth paths and populates SSR identities', async () => {
    const event = (path: string) => ({
      url: new URL(`http://localhost${path}`),
      request: new Request(`http://localhost${path}`),
      cookies: { get: () => undefined },
      locals: {}
    });
    const resolve = vi.fn(async () => new Response('ok'));
    const response = await handleAuth({
      event: event('/api/auth/profile') as never,
      resolve
    } as never);
    expect(response.status).toBe(401);
    expect(resolve).not.toHaveBeenCalled();
    expect(
      (await handleAuth({ event: event('/api/auth') as never, resolve } as never)).status
    ).toBe(200);
    expect(
      (await handleAuth({ event: event('/api/auth-anything') as never, resolve } as never)).status
    ).toBe(401);
  });
});

it('serializes concurrent attempts to demote the final administrators', async () => {
  await db
    .insert(schema.usersTable)
    .values({ id: 'other-admin', username: 'otheradmin', role: 'admin', passwordHash: 'test' });
  const results = await Promise.allSettled([
    updateManagedUser(admin, admin.id, { role: 'driver' }),
    updateManagedUser({ ...admin, id: 'other-admin' }, 'other-admin', { role: 'driver' })
  ]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  const users = await listUsers(admin);
  expect(users.filter((user) => user.role === 'admin' && user.isActive)).toHaveLength(1);
});

it('preserves matching vehicle assignments during admin export/import', async () => {
  const exported = await buildExportData(admin, false);
  await importDataSet(admin, exported.data as Parameters<typeof importDataSet>[1]);
  await expect(requireVehicle(driver, 'assigned')).resolves.toBeUndefined();
  await expect(requireVehicle(driver, 'hidden')).rejects.toMatchObject({ status: 404 });
});

it('allows PATCH management requests in configured CORS preflights', async () => {
  const response = await handleCors({
    event: {
      request: new Request('http://localhost/api/users/driver', {
        method: 'OPTIONS',
        headers: { origin: 'http://client.test' }
      })
    },
    resolve: vi.fn()
  } as never);
  expect(response.headers.get('Access-Control-Allow-Methods')).toContain('PATCH');
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://client.test');
});
