import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq, sql } from 'drizzle-orm';
import type { Vehicle } from '$lib/domain/vehicle';
import { performDelete } from '../utils/serviceUtils';
import { requireRecord } from './service-response.helper';
import {
  computeAverageMileage,
  computeLatestOdometer,
  type FuelLogInput
} from '$lib/domain/fuel/mileage';

type VehiclePayload = Omit<Vehicle, 'insuranceStatus' | 'puccStatus'>;
type VehicleMutationPayload = Omit<VehiclePayload, 'id'>;

function serializeVehiclePayload(vehicleData: VehicleMutationPayload) {
  const { id: _, ...data } = vehicleData as VehicleMutationPayload & { id?: unknown };
  return {
    ...data,
    customFields: vehicleData.customFields ? JSON.stringify(vehicleData.customFields) : null
  };
}

function parseVehicleRecord<T extends { customFields: string | null }>(vehicle: T) {
  return {
    ...vehicle,
    customFields: vehicle.customFields ? JSON.parse(vehicle.customFields) : null
  };
}

const getStatusFromDates = (dates: Date[], today: Date) => {
  if (dates.length === 0) return 'Not Available';
  return dates.some((date) => date > today) ? 'Active' : 'Expired';
};

export const addVehicle = async (vehicleData: VehicleMutationPayload) => {
  const processedData = serializeVehiclePayload(vehicleData);
  const [vehicle] = await db.insert(schema.vehicleTable).values(processedData).returning();

  return parseVehicleRecord(vehicle);
};

export const getAllVehicles = async () => {
  const [
    vehicles,
    insurances,
    pollutionCerts,
    maxFuelOdometerRows,
    maxMaintenanceOdometerRows,
    allFuelLogs
  ] = await Promise.all([
    db.query.vehicleTable.findMany({
      columns: {
        id: true,
        make: true,
        model: true,
        year: true,
        licensePlate: true,
        color: true,
        odometer: true,
        vin: true,
        image: true,
        fuelType: true,
        customFields: true
      }
    }),
    db.query.insuranceTable.findMany({
      columns: { vehicleId: true, endDate: true }
    }),
    db.query.pollutionCertificateTable.findMany({
      columns: { vehicleId: true, expiryDate: true }
    }),
    db
      .select({
        vehicleId: schema.fuelLogTable.vehicleId,
        maxOdometer: sql<number>`MAX(${schema.fuelLogTable.odometer})`.as('max_odometer')
      })
      .from(schema.fuelLogTable)
      .where(sql`${schema.fuelLogTable.odometer} IS NOT NULL`)
      .groupBy(schema.fuelLogTable.vehicleId),
    db
      .select({
        vehicleId: schema.maintenanceLogTable.vehicleId,
        maxOdometer: sql<number>`MAX(${schema.maintenanceLogTable.odometer})`.as('max_odometer')
      })
      .from(schema.maintenanceLogTable)
      .where(sql`${schema.maintenanceLogTable.odometer} IS NOT NULL`)
      .groupBy(schema.maintenanceLogTable.vehicleId),
    db.query.fuelLogTable.findMany({
      columns: {
        vehicleId: true,
        filled: true,
        missedLast: true,
        odometer: true,
        fuelAmount: true
      },
      orderBy: (log, { asc }) => [asc(log.date), asc(log.odometer)]
    })
  ]);

  const maxFuelOdometer = new Map(maxFuelOdometerRows.map((r) => [r.vehicleId, r.maxOdometer]));
  const maxMaintenanceOdometer = new Map(
    maxMaintenanceOdometerRows.map((r) => [r.vehicleId, r.maxOdometer])
  );

  const fuelLogsByVehicle = new Map<string, FuelLogInput[]>();
  for (const log of allFuelLogs) {
    if (!fuelLogsByVehicle.has(log.vehicleId)) {
      fuelLogsByVehicle.set(log.vehicleId, []);
    }
    fuelLogsByVehicle.get(log.vehicleId)!.push(log);
  }

  const today = new Date();

  const enrichedVehicles = vehicles.map((vehicle) => {
    const vehicleFuelLogs = fuelLogsByVehicle.get(vehicle.id) || [];

    const latestOdometer = computeLatestOdometer(
      vehicle.odometer,
      maxFuelOdometer.get(vehicle.id) ?? null,
      maxMaintenanceOdometer.get(vehicle.id) ?? null
    );

    const overallMileage = computeAverageMileage(vehicleFuelLogs);

    const vehicleInsuranceDates = insurances
      .filter((ins) => ins.vehicleId === vehicle.id && ins.endDate)
      .map((ins) => new Date(ins.endDate!));

    const vehiclePuccDates = pollutionCerts
      .filter((pucc) => pucc.vehicleId === vehicle.id && pucc.expiryDate)
      .map((pucc) => new Date(pucc.expiryDate!));

    const parsedVehicle = parseVehicleRecord(vehicle);

    return {
      ...parsedVehicle,
      odometer: latestOdometer || vehicle.odometer || 0,
      overallMileage,
      insuranceStatus: getStatusFromDates(vehicleInsuranceDates, today),
      puccStatus: getStatusFromDates(vehiclePuccDates, today)
    };
  });

  return enrichedVehicles;
};

export const getVehicleById = async (id: string) => {
  const vehicle = requireRecord(
    await db.query.vehicleTable.findFirst({
      where: (vehicles, { eq }) => eq(vehicles.id, id)
    }),
    `No vehicle found for id : ${id}`
  );

  const [fuelLogs, maxFuelOdometerRow, maxMaintenanceOdometerRow] = await Promise.all([
    db.query.fuelLogTable.findMany({
      where: (log, { eq }) => eq(log.vehicleId, id),
      columns: { filled: true, missedLast: true, odometer: true, fuelAmount: true },
      orderBy: (log, { asc }) => [asc(log.date), asc(log.odometer)]
    }),
    db.query.fuelLogTable.findFirst({
      where: (log, { and, eq }) => and(eq(log.vehicleId, id), sql`${log.odometer} IS NOT NULL`),
      orderBy: (log, { desc }) => [desc(log.odometer)],
      columns: { odometer: true }
    }),
    db.query.maintenanceLogTable.findFirst({
      where: (log, { and, eq }) => and(eq(log.vehicleId, id), sql`${log.odometer} IS NOT NULL`),
      orderBy: (log, { desc }) => [desc(log.odometer)],
      columns: { odometer: true }
    })
  ]);

  const currentOdometer = computeLatestOdometer(
    vehicle.odometer,
    maxFuelOdometerRow?.odometer ?? null,
    maxMaintenanceOdometerRow?.odometer ?? null
  );
  const overallMileage = computeAverageMileage(fuelLogs);

  return {
    ...parseVehicleRecord(vehicle),
    currentOdometer: currentOdometer || vehicle.odometer || 0,
    overallMileage
  };
};

export const updateVehicle = async (id: string, vehicleData: VehicleMutationPayload) => {
  requireRecord(
    await db.query.vehicleTable.findFirst({
      where: (vehicles, { eq }) => eq(vehicles.id, id),
      columns: { id: true }
    }),
    `No vehicle found for id : ${id}`
  );

  const processedData = serializeVehiclePayload(vehicleData);

  const [updatedVehicle] = await db
    .update(schema.vehicleTable)
    .set(processedData)
    .where(eq(schema.vehicleTable.id, id))
    .returning();

  return parseVehicleRecord(updatedVehicle);
};

export const deleteVehicle = async (id: string) => {
  return await performDelete(schema.vehicleTable, id, 'Vehicle');
};

// Get vehicles with minimal data for dropdown/selection purposes
export const getVehicleSummary = async (id: string) => {
  const [vehicle, fuelLogsCount, maintenanceLogsCount] = await Promise.all([
    getVehicleById(id),
    db.query.fuelLogTable.findMany({
      where: (log, { eq }) => eq(log.vehicleId, id),
      columns: { id: true }
    }),
    db.query.maintenanceLogTable.findMany({
      where: (log, { eq }) => eq(log.vehicleId, id),
      columns: { id: true }
    })
  ]);

  return {
    ...vehicle,
    totalFuelLogs: fuelLogsCount.length,
    totalMaintenanceLogs: maintenanceLogsCount.length
  };
};
