import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq, sql } from 'drizzle-orm';
import type { Vehicle, VehicleActivityEntry } from '$lib/domain/vehicle';
import { performDelete } from '../utils/serviceUtils';
import { requireRecord } from './service-response.helper';
import {
  computeAverageMileage,
  computeLatestOdometer,
  type FuelLogInput
} from '$lib/domain/fuel/mileage';

type VehicleMutationPayload = Omit<Vehicle, 'id'>;

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

export const addVehicle = async (vehicleData: VehicleMutationPayload) => {
  const processedData = serializeVehiclePayload(vehicleData);
  const [vehicle] = await db.insert(schema.vehicleTable).values(processedData).returning();

  return parseVehicleRecord(vehicle);
};

export const getAllVehicles = async () => {
  const [vehicles, maxFuelOdometerRows, maxMaintenanceOdometerRows, allFuelLogs] =
    await Promise.all([
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
          vehicleType: true,
          customFields: true
        }
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

  const enrichedVehicles = vehicles.map((vehicle) => {
    const vehicleFuelLogs = fuelLogsByVehicle.get(vehicle.id) || [];

    const latestOdometer = computeLatestOdometer(
      vehicle.odometer,
      maxFuelOdometer.get(vehicle.id) ?? null,
      maxMaintenanceOdometer.get(vehicle.id) ?? null
    );

    const overallMileage = computeAverageMileage(vehicleFuelLogs);

    const parsedVehicle = parseVehicleRecord(vehicle);

    return {
      ...parsedVehicle,
      odometer: latestOdometer || vehicle.odometer || 0,
      overallMileage
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

type ValidityStatus = 'valid' | 'expired' | 'not_available';

function latestValidity(
  dates: Array<string | null>,
  today: Date
): { validTill: string | null; status: ValidityStatus } {
  const parsed = dates.filter((d): d is string => !!d);
  if (parsed.length === 0) return { validTill: null, status: 'not_available' };

  const latest = parsed.reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
  return { validTill: latest, status: new Date(latest) >= today ? 'valid' : 'expired' };
}

// Get vehicles with minimal data for dropdown/selection purposes
export const getVehicleSummary = async (id: string) => {
  const [vehicle, fuelLogs, maintenanceLogs, complianceDocuments, reminders] = await Promise.all([
    getVehicleById(id),
    db.query.fuelLogTable.findMany({
      where: (log, { eq }) => eq(log.vehicleId, id),
      orderBy: (log, { desc }) => [desc(log.date)]
    }),
    db.query.maintenanceLogTable.findMany({
      where: (log, { eq }) => eq(log.vehicleId, id),
      orderBy: (log, { desc }) => [desc(log.date)]
    }),
    db.query.complianceDocumentTable.findMany({
      where: (doc, { eq }) => eq(doc.vehicleId, id),
      orderBy: (doc, { desc }) => [desc(doc.startDate)]
    }),
    db.query.reminderTable.findMany({
      where: (reminder, { eq, and }) =>
        and(eq(reminder.vehicleId, id), eq(reminder.isCompleted, false))
    })
  ]);

  const today = new Date();
  const insurances = complianceDocuments.filter((doc) => doc.type === 'insurance');
  const otherCompliance = complianceDocuments.filter((doc) => doc.type !== 'insurance');
  const insuranceValidity = latestValidity(
    insurances.map((i) => i.endDate),
    today
  );
  const otherComplianceValidity = latestValidity(
    otherCompliance.map((d) => d.endDate),
    today
  );

  const recentActivity: VehicleActivityEntry[] = [
    ...fuelLogs.slice(0, 1).map((log) => ({
      id: `fuel-${log.id}`,
      kind: 'fuel' as const,
      date: log.date,
      cost: log.cost,
      fuelAmount: log.fuelAmount
    })),
    ...maintenanceLogs.slice(0, 1).map((log) => ({
      id: `maintenance-${log.id}`,
      kind: 'maintenance' as const,
      date: log.date,
      cost: log.cost,
      serviceCenter: log.serviceCenter
    })),
    ...complianceDocuments.slice(0, 1).map((doc) => ({
      id: `compliance-${doc.id}`,
      kind: 'compliance' as const,
      date: doc.startDate,
      documentNumber: doc.documentNumber
    }))
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return {
    ...vehicle,
    totalFuelLogs: fuelLogs.length,
    totalMaintenanceLogs: maintenanceLogs.length,
    insuranceValidTill: insuranceValidity.validTill,
    insuranceValidityStatus: insuranceValidity.status,
    otherComplianceValidTill: otherComplianceValidity.validTill,
    otherComplianceValidityStatus: otherComplianceValidity.status,
    upcomingRemindersCount: reminders.length,
    recentActivity
  };
};
