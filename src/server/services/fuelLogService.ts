import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { fuelSchema } from '$lib/domain/fuel';
import { computeMileagePerWindow, type FuelLogInput } from '$lib/domain/fuel/mileage';
import {
  validateVehicleExists,
  validateVehicleExistsByLicensePlate,
  performDelete
} from '../utils/serviceUtils';
import { requireRecord } from './service-response.helper';

type FuelLogPayload = Omit<z.infer<typeof fuelSchema>, 'id' | 'vehicleId'>;
type FuelLogUpdatePayload = Partial<FuelLogPayload>;

export const addFuelLog = async (vehicleId: string, fuelLogData: FuelLogPayload) => {
  await validateVehicleExists(vehicleId);
  const fuelLog = await db
    .insert(schema.fuelLogTable)
    .values({
      ...fuelLogData,
      vehicleId: vehicleId,
      id: undefined
    })
    .returning();
  return fuelLog[0];
};

export const getFuelLogs = async (vehicleId: string) => {
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

  const rawMileagePerWindow = computeMileagePerWindow(fuelLogs as FuelLogInput[]);

  const fuelLogsWithMetrics = fuelLogs.map((log, index, arr) => {
    let distanceDriven: number | null = null;

    if (index > 0 && !log.missedLast && log.odometer !== null) {
      const previousLog = arr[index - 1];
      if (previousLog?.odometer !== null) {
        const distance = log.odometer - previousLog.odometer;
        if (distance > 0) {
          distanceDriven = parseFloat(distance.toFixed(2));
        }
      }
    }

    const rawMileage = rawMileagePerWindow[index];
    let mileage: number | null = null;

    if (rawMileage !== null) {
      if (mileageFormat === 'fuel-per-distance') {
        mileage = (1 / rawMileage) * 100;
      } else if (mileageFormat === 'uk-mpg' && distanceUnit === 'mile' && volumeUnit === 'liter') {
        mileage = rawMileage * 4.546;
      } else {
        mileage = rawMileage;
      }
      mileage = parseFloat(mileage.toFixed(2));
    }

    return { ...log, distanceDriven, mileage };
  });
  return fuelLogsWithMetrics;
};

export const getFuelLogById = async (id: string) => {
  const fuelLog = requireRecord(
    await db.query.fuelLogTable.findFirst({
      where: (log, { eq }) => eq(log.id, id)
    }),
    `No Fuel Logs found for id : ${id}`
  );

  return fuelLog;
};

export const updateFuelLog = async (
  vehicleId: string,
  id: string,
  fuelLogData: FuelLogUpdatePayload
) => {
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
  return updatedLog[0];
};

export const deleteFuelLog = async (id: string) => {
  return await performDelete(schema.fuelLogTable, id, 'Fuel log');
};

export const addFuelLogByLicensePlate = async (
  licensePlate: string,
  fuelLogData: FuelLogPayload
) => {
  await validateVehicleExistsByLicensePlate(licensePlate);
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicle, { eq }) => eq(vehicle.licensePlate, licensePlate)
  });
  return await addFuelLog(vehicle!.id, fuelLogData);
};

export const getFuelLogsByLicensePlate = async (licensePlate: string) => {
  await validateVehicleExistsByLicensePlate(licensePlate);
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicle, { eq }) => eq(vehicle.licensePlate, licensePlate)
  });
  return await getFuelLogs(vehicle!.id);
};
