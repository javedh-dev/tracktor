import { AppError, Status } from "@exceptions/AppError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@tracktor/common";

export const addFuelLog = async (
  vehicleId: string,
  fuelLogData: any,
): Promise<ApiResponse> => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicles, { eq }) => eq(vehicles.id, vehicleId),
  });
  if (!vehicle) {
    throw new AppError(
      `No vehicle found for id : ${vehicleId}`,
      Status.NOT_FOUND,
    );
  }
  const fuelLog = await db
    .insert(schema.fuelLogTable)
    .values({
      ...fuelLogData,
      id: undefined,
      vehicleId: vehicleId,
    })
    .returning();
  return {
    data: fuelLog[0],
    success: true,
    message: "Fuel log added successfully.",
  };
};

export const getFuelLogs = async (vehicleId: string): Promise<ApiResponse> => {
  const fuelLogs = await db.query.fuelLogTable.findMany({
    where: (log, { eq }) => eq(log.vehicleId, vehicleId),
  });

  // Calculate mileage
  const mileageData = fuelLogs.map((log, index, arr) => {
    // mileage can only be calculated for a full tank and a previous log is needed
    if (index === 0 || !log.filled || log.missedLast) {
      return { ...log, mileage: null };
    }

    // find the previous full tank log that serves as a starting point
    // a missed log acts as a barrier, preventing searching further back
    let startIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (arr[i]?.filled) {
        startIndex = i;
        break;
      }
      if (arr[i]?.missedLast) {
        break;
      }
    }

    // if there is no valid starting log, mileage can't be calculated
    if (startIndex === -1) {
      return { ...log, mileage: null };
    }

    const startLog = arr[startIndex]!;
    const distance = log.odometer - startLog.odometer;

    // sum all fuel added after the starting log (accounts for partial fills)
    let totalFuel = 0;
    for (let i = startIndex + 1; i <= index; i++) {
      totalFuel += arr[i]!.fuelAmount;
    }

    // avoid division by zero and ensure distance is positive
    if (totalFuel === 0 || distance <= 0) {
      return { ...log, mileage: null };
    }

    const mileage = distance / totalFuel;
    return { ...log, mileage: parseFloat(mileage.toFixed(2)) };
  });
  return {
    data: mileageData,
    success: true,
  };
};

export const getFuelLogById = async (id: string): Promise<ApiResponse> => {
  const fuelLog = await db.query.fuelLogTable.findFirst({
    where: (log, { eq }) => eq(log.id, id),
  });

  if (!fuelLog) {
    throw new AppError(`No Fuel Logs found for id : ${id}`, Status.NOT_FOUND);
  }
  return { data: fuelLog, success: true };
};

export const updateFuelLog = async (
  vehicleId: string,
  id: string,
  fuelLogData: any,
): Promise<ApiResponse> => {
  await getFuelLogById(id);
  const updatedLog = await db
    .update(schema.fuelLogTable)
    .set({
      ...fuelLogData,
    })
    .where(eq(schema.fuelLogTable.id, id))
    .returning();
  return {
    data: updatedLog[0],
    success: true,
    message: "Fuel log updated successfully.",
  };
};

export const deleteFuelLog = async (id: string): Promise<ApiResponse> => {
  const result = await db
    .delete(schema.fuelLogTable)
    .where(eq(schema.fuelLogTable.id, id))
    .returning();
  if (result.length === 0) {
    throw new AppError(`No Fuel Logs found for id : ${id}`, Status.NOT_FOUND);
  }
  return {
    data: { id },
    success: true,
    message: "Fuel log deleted successfully.",
  };
};

export const addFuelLogByLicensePlate = async (
  licensePlate: string,
  fuelLogData: any,
): Promise<ApiResponse> => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicle, { eq }) => eq(vehicle.licensePlate, licensePlate),
  });
  if (!vehicle) {
    throw new AppError(
      `No vehicle found for license plate : ${licensePlate}`,
      Status.NOT_FOUND,
    );
  }
  return await addFuelLog(vehicle.id, fuelLogData);
};

export const getFuelLogsByLicensePlate = async (
  licensePlate: string,
): Promise<ApiResponse> => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicle, { eq }) => eq(vehicle.licensePlate, licensePlate),
  });
  if (!vehicle) {
    throw new AppError(
      `No vehicle found for license plate : ${licensePlate}`,
      Status.NOT_FOUND,
    );
  }
  return await getFuelLogs(vehicle.id);
};
