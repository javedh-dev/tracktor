import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq, getTableColumns } from 'drizzle-orm';
import { createOwnedEntityService } from '../utils/entity-service-factory';
import type { z } from 'zod';
import { maintenanceSchema } from '$lib/domain/maintenance';

type MaintenanceLogPayload = Omit<z.infer<typeof maintenanceSchema>, 'id' | 'vehicleId'>;
type MaintenanceLogUpdatePayload = Partial<MaintenanceLogPayload>;

const { add, getById, update, remove } = createOwnedEntityService<
  MaintenanceLogPayload,
  MaintenanceLogUpdatePayload
>({
  table: schema.maintenanceLogTable,
  entityName: 'Maintenance log'
});

export const addMaintenanceLog = add;
export const getMaintenanceLogById = getById;
export const updateMaintenanceLog = update;
export const deleteMaintenanceLog = remove;

export const getMaintenanceLogs = async (vehicleId?: string) => {
  if (vehicleId) {
    const rows = await db.query.maintenanceLogTable.findMany({
      where: (logs, { eq }) => eq(logs.vehicleId, vehicleId),
      orderBy: (logs, { asc }) => [asc(logs.date), asc(logs.odometer)]
    });
    return rows.map((r) => ({ ...r, date: new Date(r.date) }));
  }

  // Fleet mode: no cross-row derived metrics here (unlike fuel mileage), but
  // logs are still ordered per-vehicle so any future odometer-based
  // computation can rely on grouped, chronologically ordered rows.
  const rows = await db
    .select({
      ...getTableColumns(schema.maintenanceLogTable),
      vehicleMake: schema.vehicleTable.make,
      vehicleModel: schema.vehicleTable.model,
      vehiclePlate: schema.vehicleTable.licensePlate
    })
    .from(schema.maintenanceLogTable)
    .leftJoin(schema.vehicleTable, eq(schema.maintenanceLogTable.vehicleId, schema.vehicleTable.id))
    .orderBy(
      schema.maintenanceLogTable.vehicleId,
      schema.maintenanceLogTable.date,
      schema.maintenanceLogTable.odometer
    );

  return rows.map((r) => ({ ...r, date: new Date(r.date) }));
};
