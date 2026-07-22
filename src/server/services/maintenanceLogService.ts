import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { maintenanceSchema } from '$lib/domain/maintenance';
import { validateVehicleExists, performDelete } from '../utils/serviceUtils';
import { requireRecord } from './service-response.helper';

type MaintenanceLogPayload = Omit<z.infer<typeof maintenanceSchema>, 'id' | 'vehicleId'>;
type MaintenanceLogUpdatePayload = Partial<MaintenanceLogPayload>;

export const addMaintenanceLog = async (
  vehicleId: string,
  maintenanceLogData: MaintenanceLogPayload
) => {
  await validateVehicleExists(vehicleId);

  const maintenanceLog = await db
    .insert(schema.maintenanceLogTable)
    .values({
      ...maintenanceLogData,
      vehicleId: vehicleId,
      id: undefined
    })
    .returning();
  return maintenanceLog[0];
};

export const getMaintenanceLogs = async (vehicleId: string) => {
  const rows = await db.query.maintenanceLogTable.findMany({
    where: (logs, { eq }) => eq(logs.vehicleId, vehicleId),
    orderBy: (logs, { asc }) => [asc(logs.date), asc(logs.odometer)]
  });
  return rows.map((r) => ({ ...r, date: new Date(r.date) }));
};

export const getMaintenanceLogById = async (id: string) => {
  const maintenanceLog = requireRecord(
    await db.query.maintenanceLogTable.findFirst({
      where: (logs, { eq }) => eq(logs.id, id)
    }),
    `No Maintenance log found for id : ${id}`
  );

  return maintenanceLog;
};

export const updateMaintenanceLog = async (
  vehicleId: string,
  id: string,
  maintenanceLogData: MaintenanceLogUpdatePayload
) => {
  const existingLog = requireRecord(
    await db.query.maintenanceLogTable.findFirst({
      where: (logs, { eq, and }) => and(eq(logs.vehicleId, vehicleId), eq(logs.id, id))
    }),
    `No Maintenance log found for id : ${id} on vehicle ${vehicleId}`
  );

  const updatedLog = await db
    .update(schema.maintenanceLogTable)
    .set({
      ...maintenanceLogData
    })
    .where(
      and(
        eq(schema.maintenanceLogTable.vehicleId, vehicleId),
        eq(schema.maintenanceLogTable.id, id)
      )
    )
    .returning();
  return updatedLog[0];
};

export const deleteMaintenanceLog = async (vehicleId: string, id: string) => {
  await requireRecord(
    await db.query.maintenanceLogTable.findFirst({
      where: (logs, { eq, and }) => and(eq(logs.vehicleId, vehicleId), eq(logs.id, id))
    }),
    `No Maintenance log found for id : ${id} on vehicle ${vehicleId}`
  );

  return await performDelete(schema.maintenanceLogTable, id, 'Maintenance log');
};
