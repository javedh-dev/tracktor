import { FuelLogError } from "@exceptions/FuelLogError";
import { Status } from "@exceptions/ServiceError";
import { VehicleError } from "@exceptions/VehicleError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";

export const addFuelLog = async (vehicleId: string, fuelLogData: any) => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicles, { eq }) => eq(vehicles.id, vehicleId),
  });
  if (!vehicle) {
    throw new VehicleError(
      `No vehicle found for id : ${vehicleId}`,
      Status.NOT_FOUND
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
  return { id: fuelLog[0]?.id, message: "Fuel log added successfully." };
};

export const getFuelLogs = async (vehicleId: string) => {
  const fuelLogs = await db.query.fuelLogTable.findMany({
    where: (log, { eq }) => eq(log.vehicleId, vehicleId),
    orderBy: (log, { asc }) => asc(log.date),
  });

  // Calculate mileage
  return fuelLogs.map((log, index, arr) => {
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
};

export const getFuelLogById = async (id: string) => {
  const fuelLog = await db.query.fuelLogTable.findFirst({
    where: (log, { eq }) => eq(log.id, id),
  });

  if (!fuelLog) {
    throw new FuelLogError(
      `No Fuel Logs found for id : ${id}`,
      Status.NOT_FOUND
    );
  }
  return fuelLog;
};

export const updateFuelLog = async (
  vehicleId: string,
  id: string,
  fuelLogData: any
) => {
  getFuelLogById(id);
  await db
    .update(schema.fuelLogTable)
    .set({
      ...fuelLogData,
    })
    .where(eq(schema.fuelLogTable.id, id));
  return { message: "Fuel log updated successfully." };
};

export const deleteFuelLog = async (id: string) => {
  const result = await db
    .delete(schema.fuelLogTable)
    .where(eq(schema.fuelLogTable.id, id))
    .returning();
  if (result.length === 0) {
    throw new FuelLogError(
      `No Fuel Logs found for id : ${id}`,
      Status.NOT_FOUND
    );
  }
  return { message: "Fuel log deleted successfully." };
};

export const addFuelLogByLicensePlate = async (
  licensePlate: string,
  fuelLogData: any
) => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicle, { eq }) => eq(vehicle.licensePlate, licensePlate),
  });
  if (!vehicle) {
    throw new VehicleError(
      `No vehicle found for license plate : ${licensePlate}`,
      Status.NOT_FOUND
    );
  }
  return await addFuelLog(vehicle.id, fuelLogData);
};

export const getFuelLogsByLicensePlate = async (licensePlate: string) => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicle, { eq }) => eq(vehicle.licensePlate, licensePlate),
  });
  if (!vehicle) {
    throw new VehicleError(
      `No vehicle found for license plate : ${licensePlate}`,
      Status.NOT_FOUND
    );
  }
  return await getFuelLogs(vehicle.id);
};
