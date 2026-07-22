import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { z } from 'zod';
import { fuelSchema } from '$lib/domain/fuel';
import { computeMileagePerWindow, type FuelLogInput } from '$lib/domain/fuel/mileage';
import { validateVehicleExistsByLicensePlate } from '../utils/serviceUtils';
import { getConfigsByKeys } from './configService';
import { createOwnedEntityService } from '../utils/entity-service-factory';

type FuelLogPayload = Omit<z.infer<typeof fuelSchema>, 'id' | 'vehicleId'>;
type FuelLogUpdatePayload = Partial<FuelLogPayload>;

const { add, getById, update, remove } = createOwnedEntityService<
  FuelLogPayload,
  FuelLogUpdatePayload
>({
  table: schema.fuelLogTable,
  entityName: 'Fuel log'
});

export const addFuelLog = add;
export const getFuelLogById = getById;
export const updateFuelLog = update;
export const deleteFuelLog = remove;

export const getFuelLogs = async (vehicleId: string) => {
  const configs = await getConfigsByKeys(['mileageUnitFormat', 'unitOfDistance', 'unitOfVolume']);
  const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]));
  const mileageFormat = configMap.mileageUnitFormat || 'distance-per-fuel';

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
      const distanceUnit = configMap.unitOfDistance;
      const volumeUnit = configMap.unitOfVolume;

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
