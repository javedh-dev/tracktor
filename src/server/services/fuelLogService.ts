import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import type { ApiResponse } from '$lib/response';
import {
  validateVehicleExists,
  validateVehicleExistsByLicensePlate,
  performDelete
} from '../utils/serviceUtils';
import { createSuccessResponse, requireRecord } from './service-response.helper';

type FuelLogPayload = {
  date: string;
  odometer: number | null;
  filled: boolean;
  missedLast: boolean;
  fuelAmount: number | null;
  cost: number;
  notes: string | null;
  attachment: string | null;
};

export const addFuelLog = async (
  vehicleId: string,
  fuelLogData: FuelLogPayload
): Promise<ApiResponse> => {
  await validateVehicleExists(vehicleId);
  const fuelLog = await db
    .insert(schema.fuelLogTable)
    .values({
      ...fuelLogData,
      vehicleId: vehicleId,
      id: undefined
    })
    .returning();
  return createSuccessResponse(fuelLog[0], 'Fuel log added successfully.');
};

export const getFuelLogs = async (vehicleId: string): Promise<ApiResponse> => {
  // Fetch mileage unit format config
  const mileageFormatConfig = await db.query.configTable.findFirst({
    where: (config, { eq }) => eq(config.key, 'mileageUnitFormat')
  });
  const distanceUnit = (
    await db.query.configTable.findFirst({
      where: (config, { eq }) => eq(config.key, 'unitOfDistance')
    })
  )?.value;
  const volumeUnit = (
    await db.query.configTable.findFirst({
      where: (config, { eq }) => eq(config.key, 'unitOfVolume')
    })
  )?.value;
  const mileageFormat = mileageFormatConfig?.value || 'distance-per-fuel';

  const fuelLogs = await db.query.fuelLogTable.findMany({
    where: (log, { eq }) => eq(log.vehicleId, vehicleId),
    orderBy: (log, { asc }) => [asc(log.date), asc(log.odometer)]
  });

  // Calculate mileage
  const mileageData = fuelLogs.map((log, index, arr) => {
    // mileage can only be calculated for a full tank and a previous log is needed
    // also need valid odometer and fuel amount values
    if (
      index === 0 ||
      !log.filled ||
      log.missedLast ||
      log.odometer === null ||
      log.fuelAmount === null
    ) {
      return { ...log, mileage: null };
    }

    // find the previous full tank log that serves as a starting point
    // a missed log acts as a barrier, preventing searching further back
    let startIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (arr[i]?.filled && arr[i]?.odometer !== null) {
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
    const distance = log.odometer - startLog.odometer!;

    // sum all fuel added after the starting log (accounts for partial fills)
    // skip logs with null fuel amounts
    let totalFuel = 0;
    for (let i = startIndex + 1; i <= index; i++) {
      const fuelAmount = arr[i]!.fuelAmount;
      if (fuelAmount !== null) {
        totalFuel += fuelAmount;
      }
    }

    // avoid division by zero and ensure distance is positive
    if (totalFuel === 0 || distance <= 0) {
      return { ...log, mileage: null };
    }

    // Calculate mileage based on format
    let mileage: number;
    if (mileageFormat === 'fuel-per-distance') {
      // Fuel per 100 distance units (e.g., L/100km, gal/100mi)
      mileage = (totalFuel / distance) * 100;
    } else if (mileageFormat === 'uk-mpg' && distanceUnit === 'mile' && volumeUnit === 'liter') {
      // Miles per imperial gallon (mpg)
      mileage = (distance / totalFuel) * 4.546;
    } else {
      // Distance per fuel unit (e.g., km/L, mpg) - default
      mileage = distance / totalFuel;
    }

    return { ...log, mileage: parseFloat(mileage.toFixed(2)) };
  });
  return createSuccessResponse(mileageData);
};

export const getFuelLogById = async (id: string): Promise<ApiResponse> => {
  const fuelLog = requireRecord(
    await db.query.fuelLogTable.findFirst({
      where: (log, { eq }) => eq(log.id, id)
    }),
    `No Fuel Logs found for id : ${id}`
  );

  return createSuccessResponse(fuelLog);
};

export const updateFuelLog = async (
  vehicleId: string,
  id: string,
  fuelLogData: FuelLogPayload
): Promise<ApiResponse> => {
  // Validate that the fuel log exists and belongs to the specified vehicle
  requireRecord(
    await db.query.fuelLogTable.findFirst({
      where: (log, { eq, and }) => and(eq(log.vehicleId, vehicleId), eq(log.id, id))
    }),
    `No Fuel Log found for id: ${id}`
  );

  const updatedLog = await db
    .update(schema.fuelLogTable)
    .set({
      ...fuelLogData
    })
    .where(eq(schema.fuelLogTable.id, id))
    .returning();
  return createSuccessResponse(updatedLog[0], 'Fuel log updated successfully.');
};

export const deleteFuelLog = async (id: string): Promise<ApiResponse> => {
  return await performDelete(schema.fuelLogTable, id, 'Fuel log');
};

export const addFuelLogByLicensePlate = async (
  licensePlate: string,
  fuelLogData: FuelLogPayload
): Promise<ApiResponse> => {
  await validateVehicleExistsByLicensePlate(licensePlate);
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicle, { eq }) => eq(vehicle.licensePlate, licensePlate)
  });
  return await addFuelLog(vehicle!.id, fuelLogData);
};

export const getFuelLogsByLicensePlate = async (licensePlate: string): Promise<ApiResponse> => {
  await validateVehicleExistsByLicensePlate(licensePlate);
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicle, { eq }) => eq(vehicle.licensePlate, licensePlate)
  });
  return await getFuelLogs(vehicle!.id);
};
