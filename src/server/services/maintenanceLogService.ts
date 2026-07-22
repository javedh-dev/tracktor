import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse } from '$lib/response';
import { maintenanceSchema } from '$lib/domain/maintenance';
import { validateVehicleExists, performDelete } from '../utils/serviceUtils';
import { createSuccessResponse, requireRecord } from './service-response.helper';

type MaintenanceLogPayload = Omit<z.infer<typeof maintenanceSchema>, 'id' | 'vehicleId'>;
type MaintenanceLogUpdatePayload = Partial<MaintenanceLogPayload>;

export const addMaintenanceLog = async (
  vehicleId: string,
  maintenanceLogData: MaintenanceLogPayload
): Promise<ApiResponse> => {
  await validateVehicleExists(vehicleId);

  const maintenanceLog = await db
    .insert(schema.maintenanceLogTable)
    .values({
      ...maintenanceLogData,
      vehicleId: vehicleId,
      id: undefined
    })
    .returning();
  return createSuccessResponse(maintenanceLog[0], 'Maintenance log added successfully.');
};

export const getMaintenanceLogs = async (vehicleId: string): Promise<ApiResponse> => {
  const maintenanceLogs = await db.query.maintenanceLogTable.findMany({
    where: (logs, { eq }) => eq(logs.vehicleId, vehicleId),
    orderBy: (logs, { asc }) => [asc(logs.date), asc(logs.odometer)]
  });
  return createSuccessResponse(maintenanceLogs);
};

export const getMaintenanceLogById = async (id: string): Promise<ApiResponse> => {
  const maintenanceLog = requireRecord(
    await db.query.maintenanceLogTable.findFirst({
      where: (logs, { eq }) => eq(logs.id, id)
    }),
    `No Maintenance log found for id : ${id}`
  );

  return createSuccessResponse(maintenanceLog);
};

export const updateMaintenanceLog = async (
  vehicleId: string,
  id: string,
  maintenanceLogData: MaintenanceLogUpdatePayload
): Promise<ApiResponse> => {
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
  return createSuccessResponse(updatedLog[0], 'Maintenance log updated successfully.');
};

export const deleteMaintenanceLog = async (vehicleId: string, id: string): Promise<ApiResponse> => {
  await requireRecord(
    await db.query.maintenanceLogTable.findFirst({
      where: (logs, { eq, and }) => and(eq(logs.vehicleId, vehicleId), eq(logs.id, id))
    }),
    `No Maintenance log found for id : ${id} on vehicle ${vehicleId}`
  );

  return await performDelete(schema.maintenanceLogTable, id, 'Maintenance log');
};
