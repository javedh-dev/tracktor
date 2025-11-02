import { Status } from "@exceptions/AppError";
import { AppError } from "@exceptions/AppError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@tracktor/common";
import { performDelete } from "@utils/serviceUtils";

// Helper functions
const getLatestOdometer = async (vehicleId: string) => {
  // Get the vehicle's base odometer
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicles, { eq }) => eq(vehicles.id, vehicleId),
    columns: { odometer: true },
  });

  // Get highest odometer from fuel logs
  const latestFuelLog = await db.query.fuelLogTable.findFirst({
    where: (log, { eq }) => eq(log.vehicleId, vehicleId),
    orderBy: (log, { desc }) => [desc(log.odometer)],
    columns: { odometer: true },
  });

  // Get highest odometer from maintenance logs
  const latestMaintenanceLog = await db.query.maintenanceLogTable.findFirst({
    where: (log, { eq }) => eq(log.vehicleId, vehicleId),
    orderBy: (log, { desc }) => [desc(log.odometer)],
    columns: { odometer: true },
  });

  // Find the highest value among all sources
  const odometerValues = [
    vehicle?.odometer || 0,
    latestFuelLog?.odometer || 0,
    latestMaintenanceLog?.odometer || 0,
  ].filter((value) => value > 0);

  return odometerValues.length > 0 ? Math.max(...odometerValues) : 0;
};

const getStatusFromDates = (dates: Date[], today: Date) => {
  if (dates.length === 0) return "Not Available";
  return dates.some((date) => date > today) ? "Active" : "Expired";
};

const calculateOverallMileage = async (vehicleId: string) => {
  const fuelLogs = await db.query.fuelLogTable.findMany({
    where: (log, { eq }) => eq(log.vehicleId, vehicleId),
    orderBy: (log, { asc }) => [asc(log.date), asc(log.odometer)],
  });

  if (fuelLogs.length < 2) return null;

  const validMileages: number[] = [];

  fuelLogs.forEach((log, index, arr) => {
    if (index === 0 || !log.filled || log.missedLast) return;

    // Find the last filled log before current
    const startIndex = arr
      .slice(0, index)
      .reverse()
      .findIndex((prevLog) => {
        if (prevLog?.filled) return true;
        if (prevLog?.missedLast) return false;
        return false;
      });

    if (startIndex === -1) return;

    const actualStartIndex = index - 1 - startIndex;
    const startLog = arr[actualStartIndex];
    if (!startLog) return;

    const distance = log.odometer - startLog.odometer;

    // Sum fuel from start to current log
    const totalFuel = arr
      .slice(actualStartIndex + 1, index + 1)
      .reduce((sum, fuelLog) => sum + fuelLog.fuelAmount, 0);

    if (totalFuel > 0 && distance > 0) {
      validMileages.push(distance / totalFuel);
    }
  });

  if (validMileages.length === 0) return null;

  const avgMileage =
    validMileages.reduce((sum, mileage) => sum + mileage, 0) /
    validMileages.length;
  return parseFloat(avgMileage.toFixed(2));
};

export const addVehicle = async (vehicleData: any): Promise<ApiResponse> => {
  const [vehicle] = await db
    .insert(schema.vehicleTable)
    .values({ ...vehicleData, id: undefined })
    .returning();

  return {
    data: vehicle,
    success: true,
    message: "Vehicle added successfully.",
  };
};

export const getAllVehicles = async (): Promise<ApiResponse> => {
  const [vehicles, insurances, pollutionCerts] = await Promise.all([
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
      },
    }),
    db.query.insuranceTable.findMany({
      columns: { vehicleId: true, endDate: true },
    }),
    db.query.pollutionCertificateTable.findMany({
      columns: { vehicleId: true, expiryDate: true },
    }),
  ]);

  const today = new Date();

  // Get enriched data for all vehicles in parallel
  const enrichedVehicles = await Promise.all(
    vehicles.map(async (vehicle) => {
      const [latestOdometer, overallMileage] = await Promise.all([
        getLatestOdometer(vehicle.id),
        calculateOverallMileage(vehicle.id),
      ]);

      // Calculate statuses
      const vehicleInsuranceDates = insurances
        .filter((ins) => ins.vehicleId === vehicle.id)
        .map((ins) => new Date(ins.endDate));

      const vehiclePuccDates = pollutionCerts
        .filter((pucc) => pucc.vehicleId === vehicle.id)
        .map((pucc) => new Date(pucc.expiryDate));

      return {
        ...vehicle,
        odometer: latestOdometer || vehicle.odometer || 0,
        overallMileage,
        insuranceStatus: getStatusFromDates(vehicleInsuranceDates, today),
        puccStatus: getStatusFromDates(vehiclePuccDates, today),
      };
    }),
  );

  return {
    data: enrichedVehicles,
    success: true,
  };
};

export const getVehicleById = async (id: string): Promise<ApiResponse> => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicles, { eq }) => eq(vehicles.id, id),
  });

  if (!vehicle) {
    throw new AppError(`No vehicle found for id : ${id}`, Status.NOT_FOUND);
  }

  const [currentOdometer, overallMileage] = await Promise.all([
    getLatestOdometer(id),
    calculateOverallMileage(id),
  ]);

  return {
    data: {
      ...vehicle,
      currentOdometer: currentOdometer || vehicle.odometer || 0,
      overallMileage,
    },
    success: true,
  };
};

export const updateVehicle = async (
  id: string,
  vehicleData: any,
): Promise<ApiResponse> => {
  await getVehicleById(id); // Validates vehicle exists

  const [updatedVehicle] = await db
    .update(schema.vehicleTable)
    .set(vehicleData)
    .where(eq(schema.vehicleTable.id, id))
    .returning();

  return {
    data: updatedVehicle,
    success: true,
    message: "Vehicle updated successfully.",
  };
};

export const deleteVehicle = async (id: string): Promise<ApiResponse> => {
  return await performDelete(schema.vehicleTable, id, "Vehicle");
};

// Get vehicles with minimal data for dropdown/selection purposes
export const getVehiclesMinimal = async (): Promise<ApiResponse> => {
  const vehicles = await db.query.vehicleTable.findMany({
    columns: {
      id: true,
      make: true,
      model: true,
      year: true,
      licensePlate: true,
    },
  });
  return {
    data: vehicles,
    success: true,
  };
};

export const getVehicleSummary = async (id: string): Promise<ApiResponse> => {
  const [vehicle, fuelLogsCount, maintenanceLogsCount] = await Promise.all([
    getVehicleById(id),
    db.query.fuelLogTable.findMany({
      where: (log, { eq }) => eq(log.vehicleId, id),
      columns: { id: true },
    }),
    db.query.maintenanceLogTable.findMany({
      where: (log, { eq }) => eq(log.vehicleId, id),
      columns: { id: true },
    }),
  ]);

  return {
    data: {
      ...vehicle.data,
      totalFuelLogs: fuelLogsCount.length,
      totalMaintenanceLogs: maintenanceLogsCount.length,
    },
    success: true,
  };
};
