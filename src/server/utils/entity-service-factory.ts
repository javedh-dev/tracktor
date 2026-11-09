import { type AccessContext, requireVehicle, vehicleScope } from '$server/services/access';
import { requireAttachableFile } from '$server/services/fileService';
import { db } from '$server/db';
import { and, eq } from 'drizzle-orm';
import { AppError, Status } from '$server/exceptions/AppError';

interface EntityServiceOptions<TAdd, TUpdate> {
  table: any;
  entityName: string;
  sanitize?: (data: TAdd | TUpdate) => TAdd | TUpdate;
}

export function createOwnedEntityService<TAdd, TUpdate = Partial<TAdd>>(
  options: EntityServiceOptions<TAdd, TUpdate>
) {
  const { table, entityName, sanitize } = options;

  return {
    add: async (access: AccessContext, vehicleId: string, data: TAdd) => {
      await requireVehicle(access, vehicleId);
      await requireAttachableFile(access, (data as { attachment?: unknown }).attachment);
      const payload = sanitize ? sanitize(data) : data;
      const rows = (await db
        .insert(table)
        .values({ ...payload, vehicleId, id: undefined })
        .returning()) as any[];
      return rows[0];
    },

    getById: async (access: AccessContext, vehicleId: string, id: string) => {
      const rows = await db
        .select()
        .from(table)
        .where(
          and(
            eq(table.id, id),
            eq(table.vehicleId, vehicleId),
            vehicleScope(table.vehicleId, access)
          )
        )
        .limit(1);
      const record = rows[0];
      if (!record) {
        throw new AppError(`No ${entityName} found for id: ${id}`, Status.NOT_FOUND);
      }
      return record;
    },

    update: async (access: AccessContext, vehicleId: string, id: string, data: TUpdate) => {
      const rows = await db
        .select()
        .from(table)
        .where(
          and(
            eq(table.vehicleId, vehicleId),
            eq(table.id, id),
            vehicleScope(table.vehicleId, access)
          )
        )
        .limit(1);
      const existing = rows[0];
      if (!existing) {
        throw new AppError(`No ${entityName} found for id: ${id}`, Status.NOT_FOUND);
      }
      await requireAttachableFile(access, (data as { attachment?: unknown }).attachment);
      const payload = sanitize ? sanitize(data) : data;
      const updated = (await db
        .update(table)
        .set(payload as any)
        .where(and(eq(table.id, id), vehicleScope(table.vehicleId, access)))
        .returning()) as any[];
      return updated[0];
    },

    remove: async (access: AccessContext, vehicleId: string, id: string) => {
      const rows = await db
        .select()
        .from(table)
        .where(
          and(
            eq(table.vehicleId, vehicleId),
            eq(table.id, id),
            vehicleScope(table.vehicleId, access)
          )
        )
        .limit(1);
      if (!rows[0]) {
        throw new AppError(`No ${entityName} found for id: ${id}`, Status.NOT_FOUND);
      }
      const deleted = await db
        .delete(table)
        .where(
          and(
            eq(table.id, id),
            eq(table.vehicleId, vehicleId),
            vehicleScope(table.vehicleId, access)
          )
        )
        .returning({ id: table.id });
      if (!deleted.length) throw new AppError(`${entityName} not found`, Status.NOT_FOUND);
      return deleted[0];
    }
  };
}
