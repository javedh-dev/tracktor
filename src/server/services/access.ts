import { and, eq, inArray, type AnyColumn } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$server/db';
import { vehicleAssignmentsTable, vehicleTable } from '$server/db/schema';
import { AppError, Status } from '$server/exceptions/AppError';
import { env } from '$lib/config/env.server';
import type { User } from '$server/utils/session';

export type AccessContext = User;

/** Only background jobs and explicitly auth-disabled requests use this context. */
export const SYSTEM_ACCESS: AccessContext = {
  id: 'system',
  username: 'system',
  role: 'admin',
  isActive: true
};

export function requireAccess(access: AccessContext | undefined): asserts access is AccessContext {
  if (!access?.isActive) throw new AppError('Not authenticated', Status.UNAUTHORIZED);
}

export function requestAccess(event: Pick<RequestEvent, 'locals'>): AccessContext {
  if (env.DISABLE_AUTH) return SYSTEM_ACCESS;
  requireAccess(event.locals.user);
  return event.locals.user;
}

export function requireAdmin(access: AccessContext): void {
  requireAccess(access);
  if (access.role !== 'admin')
    throw new AppError('Administrator access required', Status.FORBIDDEN);
}

/** Apply in SQL before selecting rows, aggregates, or nested resources. */
export function vehicleScope(column: AnyColumn, access: AccessContext) {
  requireAccess(access);
  return access.role === 'admin'
    ? undefined
    : inArray(
        column,
        db
          .select({ id: vehicleAssignmentsTable.vehicleId })
          .from(vehicleAssignmentsTable)
          .where(eq(vehicleAssignmentsTable.userId, access.id))
      );
}

export async function requireVehicle(access: AccessContext, vehicleId: string): Promise<void> {
  const [vehicle] = await db
    .select({ id: vehicleTable.id })
    .from(vehicleTable)
    .where(and(eq(vehicleTable.id, vehicleId), vehicleScope(vehicleTable.id, access)))
    .limit(1);
  if (!vehicle) throw new AppError('Vehicle not found', Status.NOT_FOUND);
}
