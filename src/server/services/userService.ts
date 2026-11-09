import bcrypt from 'bcrypt';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '$server/db';
import {
  usersTable,
  sessionsTable,
  vehicleAssignmentsTable,
  vehicleTable
} from '$server/db/schema';
import { AppError, Status } from '$server/exceptions/AppError';
import { requireAdmin, type AccessContext } from './access';
import {
  createManagedUserSchema,
  updateManagedUserSchema,
  assignmentSchema,
  passwordSchema
} from '$lib/domain/auth';

const publicColumns = {
  id: usersTable.id,
  username: usersTable.username,
  role: usersTable.role,
  isActive: usersTable.isActive
};

export async function listUsers(access: AccessContext) {
  requireAdmin(access);
  const users = await db.select(publicColumns).from(usersTable);
  const assignments = await db.select().from(vehicleAssignmentsTable);
  return users.map((user) => ({
    ...user,
    vehicleIds: assignments.filter((a) => a.userId === user.id).map((a) => a.vehicleId)
  }));
}

export async function createManagedUser(access: AccessContext, input: unknown) {
  requireAdmin(access);
  const data = createManagedUserSchema.parse(input);
  const passwordHash = await bcrypt.hash(data.password, 10);
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, data.username));
    if (existing.length) throw new AppError('Username already exists', Status.CONFLICT);
    const [user] = await tx
      .insert(usersTable)
      .values({ id: crypto.randomUUID(), username: data.username, passwordHash, role: data.role })
      .returning(publicColumns);
    return user;
  });
}

export async function updateManagedUser(access: AccessContext, id: string, input: unknown) {
  requireAdmin(access);
  const data = updateManagedUserSchema.parse(input);
  return db.transaction(async (tx) => {
    const [user] = await tx
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning(publicColumns);
    if (!user) throw new AppError('User not found', Status.NOT_FOUND);
    const admins = await tx
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.role, 'admin'), eq(usersTable.isActive, true)))
      .limit(1);
    if (!admins.length)
      throw new AppError('At least one active administrator is required', Status.CONFLICT);
    if (data.isActive === false) await tx.delete(sessionsTable).where(eq(sessionsTable.userId, id));
    return user;
  });
}

export async function resetLocalPassword(access: AccessContext, id: string, input: unknown) {
  requireAdmin(access);
  const passwordHash = await bcrypt.hash(passwordSchema.parse(input), 10);
  await db.transaction(async (tx) => {
    const rows = await tx
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });
    if (!rows.length) throw new AppError('User not found', Status.NOT_FOUND);
    await tx.delete(sessionsTable).where(eq(sessionsTable.userId, id));
  });
}

export async function replaceAssignments(access: AccessContext, userId: string, input: unknown) {
  requireAdmin(access);
  const vehicleIds = [...new Set(assignmentSchema.parse(input).vehicleIds)];
  await db.transaction(async (tx) => {
    const user = await tx
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (!user.length) throw new AppError('User not found', Status.NOT_FOUND);
    const vehicles = vehicleIds.length
      ? await tx
          .select({ id: vehicleTable.id })
          .from(vehicleTable)
          .where(inArray(vehicleTable.id, vehicleIds))
      : [];
    if (vehicles.length !== vehicleIds.length)
      throw new AppError('Vehicle not found', Status.NOT_FOUND);
    await tx.delete(vehicleAssignmentsTable).where(eq(vehicleAssignmentsTable.userId, userId));
    if (vehicleIds.length)
      await tx
        .insert(vehicleAssignmentsTable)
        .values(vehicleIds.map((vehicleId) => ({ userId, vehicleId })));
  });
  return { userId, vehicleIds };
}
