import { db } from '$server/db';
import { and, eq } from 'drizzle-orm';
import { AppError, Status } from '$server/exceptions/AppError';
import { performDelete, validateVehicleExists } from './serviceUtils';

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
    add: async (vehicleId: string, data: TAdd) => {
      await validateVehicleExists(vehicleId);
      const payload = sanitize ? sanitize(data) : data;
      const rows = (await db
        .insert(table)
        .values({ ...payload, vehicleId, id: undefined })
        .returning()) as any[];
      return rows[0];
    },

    getById: async (id: string) => {
      const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
      const record = rows[0];
      if (!record) {
        throw new AppError(`No ${entityName} found for id: ${id}`, Status.NOT_FOUND);
      }
      return record;
    },

    update: async (vehicleId: string, id: string, data: TUpdate) => {
      const rows = await db
        .select()
        .from(table)
        .where(and(eq(table.vehicleId, vehicleId), eq(table.id, id)))
        .limit(1);
      const existing = rows[0];
      if (!existing) {
        throw new AppError(`No ${entityName} found for id: ${id}`, Status.NOT_FOUND);
      }
      const payload = sanitize ? sanitize(data) : data;
      const updated = (await db
        .update(table)
        .set(payload as any)
        .where(eq(table.id, id))
        .returning()) as any[];
      return updated[0];
    },

    remove: async (id: string) => {
      return performDelete(table, id, entityName);
    },

    removeScoped: async (vehicleId: string, id: string) => {
      const rows = await db
        .select()
        .from(table)
        .where(and(eq(table.vehicleId, vehicleId), eq(table.id, id)))
        .limit(1);
      const existing = rows[0];
      if (!existing) {
        throw new AppError(`No ${entityName} found for id: ${id}`, Status.NOT_FOUND);
      }
      return performDelete(table, id, entityName);
    }
  };
}
