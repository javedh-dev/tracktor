import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { createOwnedEntityService } from '../utils/entity-service-factory';
import type { z } from 'zod';
import { maintenanceSchema } from '$lib/domain/maintenance';

type MaintenanceLogPayload = Omit<z.infer<typeof maintenanceSchema>, 'id' | 'vehicleId'>;
type MaintenanceLogUpdatePayload = Partial<MaintenanceLogPayload>;

const { add, getById, update, removeScoped } = createOwnedEntityService<
  MaintenanceLogPayload,
  MaintenanceLogUpdatePayload
>({
  table: schema.maintenanceLogTable,
  entityName: 'Maintenance log'
});

export const addMaintenanceLog = add;
export const getMaintenanceLogById = getById;
export const updateMaintenanceLog = update;
export const deleteMaintenanceLog = removeScoped;

export const getMaintenanceLogs = async (vehicleId: string) => {
  const rows = await db.query.maintenanceLogTable.findMany({
    where: (logs, { eq }) => eq(logs.vehicleId, vehicleId),
    orderBy: (logs, { asc }) => [asc(logs.date), asc(logs.odometer)]
  });
  return rows.map((r) => ({ ...r, date: new Date(r.date) }));
};
