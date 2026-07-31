import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { z } from 'zod';
import { eq, getTableColumns } from 'drizzle-orm';
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

type FuelLogRow = typeof schema.fuelLogTable.$inferSelect;
type FuelLogVehicleFields = {
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehiclePlate?: string | null;
};

function withMileageMetrics<T extends FuelLogRow & FuelLogVehicleFields>(
  fuelLogs: T[],
  mileageFormat: string,
  configMap: Record<string, string | undefined>
) {
  const rawMileagePerWindow = computeMileagePerWindow(fuelLogs as FuelLogInput[]);

  return fuelLogs.map((log, index, arr) => {
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
}

export const getFuelLogs = async (vehicleId?: string) => {
  const configs = await getConfigsByKeys(['mileageUnitFormat', 'unitOfDistance', 'unitOfVolume']);
  const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]));
  const mileageFormat = configMap.mileageUnitFormat || 'distance-per-fuel';

  if (vehicleId) {
    const fuelLogs = await db.query.fuelLogTable.findMany({
      where: (log, { eq }) => eq(log.vehicleId, vehicleId),
      orderBy: (log, { asc }) => [asc(log.date), asc(log.odometer)]
    });

    return withMileageMetrics(fuelLogs, mileageFormat, configMap);
  }

  // Fleet mode: mileage windows are only meaningful within a single vehicle's
  // log sequence, so each vehicle's logs must be grouped and computed in
  // isolation before the results are flattened back together — running the
  // computation over the interleaved multi-vehicle list would corrupt it.
  const rows = await db
    .select({
      ...getTableColumns(schema.fuelLogTable),
      vehicleMake: schema.vehicleTable.make,
      vehicleModel: schema.vehicleTable.model,
      vehiclePlate: schema.vehicleTable.licensePlate
    })
    .from(schema.fuelLogTable)
    .leftJoin(schema.vehicleTable, eq(schema.fuelLogTable.vehicleId, schema.vehicleTable.id))
    .orderBy(schema.fuelLogTable.vehicleId, schema.fuelLogTable.date, schema.fuelLogTable.odometer);

  const groupedByVehicle = new Map<string, (typeof rows)[number][]>();
  for (const row of rows) {
    const group = groupedByVehicle.get(row.vehicleId);
    if (group) {
      group.push(row);
    } else {
      groupedByVehicle.set(row.vehicleId, [row]);
    }
  }

  return Array.from(groupedByVehicle.values()).flatMap((group) =>
    withMileageMetrics(group, mileageFormat, configMap)
  );
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
