import { MaintenanceLogError } from "@exceptions/MaintenanceLogError";
import { Status } from "@exceptions/ServiceError";
import { VehicleError } from "@exceptions/VehicleError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";

export const addMaintenanceLog = async (
  vehicleId: string,
  maintenanceLogData: any
) => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicles, { eq }) => eq(vehicles.id, vehicleId),
  });
  if (!vehicle) {
    throw new VehicleError(
      `No vehicle found for id : ${vehicleId}`,
      Status.NOT_FOUND
    );
  }

  const maintenanceLog = await db
    .insert(schema.maintenanceLogTable)
    .values({
      ...maintenanceLogData,
      vehicleId: vehicleId,
      id: undefined,
    })
    .returning();
  return {
    id: maintenanceLog[0]?.id,
    message: "Maintenance log added successfully.",
  };
};

export const getMaintenanceLogs = async (vehicleId: string) => {
  const maintenanceLogs = await db.query.maintenanceLogTable.findMany({
    where: (logs, { eq }) => eq(logs.vehicleId, vehicleId),
    orderBy: (logs, { asc }) => [asc(logs.date), asc(logs.odometer)],
  });
  return maintenanceLogs;
};

export const getMaintenanceLogById = async (id: string) => {
  const maintenanceLog = await db.query.maintenanceLogTable.findFirst({
    where: (logs, { eq }) => eq(logs.id, id),
  });
  if (!maintenanceLog) {
    throw new MaintenanceLogError(
      `No Maintenence log found for id : ${id}`,
      Status.NOT_FOUND
    );
  }
  return maintenanceLog;
};

export const updateMaintenanceLog = async (
  id: string,
  maintenanceLogData: any
) => {
  await getMaintenanceLogById(id);
  await db
    .update(schema.maintenanceLogTable)
    .set({
      ...maintenanceLogData,
    })
    .where(eq(schema.maintenanceLogTable.id, id));
  return { message: "Maintenance log updated successfully." };
};

export const deleteMaintenanceLog = async (id: string) => {
  const result = await db
    .delete(schema.maintenanceLogTable)
    .where(eq(schema.maintenanceLogTable.id, id))
    .returning();
  if (result.length === 0) {
    throw new MaintenanceLogError(
      `No Maintenence log found for id : ${id}`,
      Status.NOT_FOUND
    );
  }
  return { message: "Maintenance log deleted successfully." };
};
