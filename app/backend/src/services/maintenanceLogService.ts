import { AppError, Status } from "@exceptions/AppError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@tracktor/common";
import { validateVehicleExists } from "@utils/serviceUtils";

export const addMaintenanceLog = async (
  vehicleId: string,
  maintenanceLogData: any,
): Promise<ApiResponse> => {
  await validateVehicleExists(vehicleId);

  const maintenanceLog = await db
    .insert(schema.maintenanceLogTable)
    .values({
      ...maintenanceLogData,
      vehicleId: vehicleId,
      id: undefined,
    })
    .returning();
  return {
    data: maintenanceLog[0],
    success: true,
    message: "Maintenance log added successfully.",
  };
};

export const getMaintenanceLogs = async (vehicleId: string): Promise<ApiResponse> => {
  const maintenanceLogs = await db.query.maintenanceLogTable.findMany({
    where: (logs, { eq }) => eq(logs.vehicleId, vehicleId),
    orderBy: (logs, { asc }) => [asc(logs.date), asc(logs.odometer)],
  });
  return {
    data: maintenanceLogs,
    success: true,
  };
};

export const getMaintenanceLogById = async (id: string): Promise<ApiResponse> => {
  const maintenanceLog = await db.query.maintenanceLogTable.findFirst({
    where: (logs, { eq }) => eq(logs.id, id),
  });
  if (!maintenanceLog) {
    throw new AppError(
      `No Maintenence log found for id : ${id}`,
      Status.NOT_FOUND,
    );
  }
  return {
    data: maintenanceLog,
    success: true,
  };
};

export const updateMaintenanceLog = async (
  id: string,
  maintenanceLogData: any,
): Promise<ApiResponse> => {
  await getMaintenanceLogById(id);
  const updatedLog = await db
    .update(schema.maintenanceLogTable)
    .set({
      ...maintenanceLogData,
    })
    .where(eq(schema.maintenanceLogTable.id, id))
    .returning();
  return {
    data: updatedLog[0],
    success: true,
    message: "Maintenance log updated successfully.",
  };
};

export const deleteMaintenanceLog = async (id: string): Promise<ApiResponse> => {
  const result = await db
    .delete(schema.maintenanceLogTable)
    .where(eq(schema.maintenanceLogTable.id, id))
    .returning();
  if (result.length === 0) {
    throw new AppError(
      `No Maintenence log found for id : ${id}`,
      Status.NOT_FOUND,
    );
  }
  return {
    data: { id },
    success: true,
    message: "Maintenance log deleted successfully.",
  };
};
