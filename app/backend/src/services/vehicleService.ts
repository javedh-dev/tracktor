import { Status } from "@exceptions/AppError";
import { AppError } from "@exceptions/AppError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";

export const addVehicle = async (vehicleData: any) => {
  const vehicle = await db
    .insert(schema.vehicleTable)
    .values({ ...vehicleData, id: undefined })
    .returning();
  return { id: vehicle[0]?.id, message: "Vehicle added successfully." };
};

// Helper function to calculate overall mileage for a vehicle
const calculateOverallMileage = async (vehicleId: string) => {
  const fuelLogs = await db.query.fuelLogTable.findMany({
    where: (log, { eq }) => eq(log.vehicleId, vehicleId),
    orderBy: (log, { asc }) => asc(log.date),
  });

  if (fuelLogs.length < 2) return null;

  const validMileages: number[] = [];

  fuelLogs.forEach((log, index, arr) => {
    if (index === 0 || !log.filled || log.missedLast) return;

    let startIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (arr[i]?.filled) {
        startIndex = i;
        break;
      }
      if (arr[i]?.missedLast) break;
    }

    if (startIndex === -1) return;

    const startLog = arr[startIndex]!;
    const distance = log.odometer - startLog.odometer;

    let totalFuel = 0;
    for (let i = startIndex + 1; i <= index; i++) {
      totalFuel += arr[i]!.fuelAmount;
    }

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

export const getAllVehicles = async () => {
  const vehicles = await db.query.vehicleTable.findMany({
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
  });

  const today = new Date();

  // Get active insurances and pollution certificates efficiently
  const activeInsurances = await db.query.insuranceTable.findMany({
    columns: {
      vehicleId: true,
      endDate: true,
    },
  });

  const activePollutionCertificates =
    await db.query.pollutionCertificateTable.findMany({
      columns: {
        vehicleId: true,
        expiryDate: true,
      },
    });

  // Get latest fuel logs for current odometer readings
  const latestFuelLogs = await Promise.all(
    vehicles.map(async (vehicle) => {
      const latestLog = await db.query.fuelLogTable.findFirst({
        where: (log, { eq }) => eq(log.vehicleId, vehicle.id),
        orderBy: (log, { desc }) => desc(log.date),
        columns: {
          odometer: true,
        },
      });
      return { vehicleId: vehicle.id, latestOdometer: latestLog?.odometer };
    }),
  );

  // Calculate overall mileage for each vehicle
  const vehicleMileages = await Promise.all(
    vehicles.map(async (vehicle) => ({
      vehicleId: vehicle.id,
      overallMileage: await calculateOverallMileage(vehicle.id),
    })),
  );

  return vehicles.map((vehicle) => {
    // Find insurance status
    const vehicleInsurances = activeInsurances.filter(
      (insurance) => insurance.vehicleId === vehicle.id,
    );
    let insuranceStatus = "Not Available";
    if (vehicleInsurances.length > 0) {
      insuranceStatus = vehicleInsurances.some(
        (insurance) => new Date(insurance.endDate) > today,
      )
        ? "Active"
        : "Expired";
    }

    // Find PUCC status
    const vehiclePollutionCerts = activePollutionCertificates.filter(
      (pucc) => pucc.vehicleId === vehicle.id,
    );
    let puccStatus = "Not Available";
    if (vehiclePollutionCerts.length > 0) {
      puccStatus = vehiclePollutionCerts.some(
        (pucc) => new Date(pucc.expiryDate) > today,
      )
        ? "Active"
        : "Expired";
    }

    // Get current odometer and overall mileage
    const latestFuelLog = latestFuelLogs.find(
      (log) => log.vehicleId === vehicle.id,
    );
    const mileageData = vehicleMileages.find((m) => m.vehicleId === vehicle.id);

    const currentOdometer =
      latestFuelLog?.latestOdometer || vehicle.odometer || 0;

    return {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      vin: vehicle.vin,
      color: vehicle.color,
      odometer: currentOdometer,
      image: vehicle.image,
      overallMileage: mileageData?.overallMileage,
      insuranceStatus,
      puccStatus,
    };
  });
};

export const getVehicleById = async (id: string) => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicles, { eq }) => eq(vehicles.id, id),
  });
  if (!vehicle) {
    throw new AppError(`No vehicle found for id : ${id}`, Status.NOT_FOUND);
  }

  // Get current odometer from latest fuel log
  const latestFuelLog = await db.query.fuelLogTable.findFirst({
    where: (log, { eq }) => eq(log.vehicleId, id),
    orderBy: (log, { desc }) => desc(log.date),
    columns: {
      odometer: true,
    },
  });

  // Calculate overall mileage
  const overallMileage = await calculateOverallMileage(id);

  const currentOdometer = latestFuelLog?.odometer || vehicle.odometer || 0;

  return {
    ...vehicle,
    currentOdometer,
    overallMileage,
  };
};

export const updateVehicle = async (id: string, vehicleData: any) => {
  await getVehicleById(id);
  await db
    .update(schema.vehicleTable)
    .set({
      ...vehicleData,
    })
    .where(eq(schema.vehicleTable.id, id));
  return { message: "Vehicle updated successfully." };
};

export const deleteVehicle = async (id: string) => {
  const result = await db
    .delete(schema.vehicleTable)
    .where(eq(schema.vehicleTable.id, id))
    .returning();
  if (result.length === 0) {
    throw new AppError(`No vehicle found for id : ${id}`, Status.NOT_FOUND);
  }
  return { message: "Vehicle deleted successfully." };
};

// Get vehicles with minimal data for dropdown/selection purposes
export const getVehiclesMinimal = async () => {
  return await db.query.vehicleTable.findMany({
    columns: {
      id: true,
      make: true,
      model: true,
      year: true,
      licensePlate: true,
    },
  });
};

// Get vehicle summary with key metrics
export const getVehicleSummary = async (id: string) => {
  const vehicle = await getVehicleById(id);

  // Get total fuel logs count
  const fuelLogsCount = await db.query.fuelLogTable.findMany({
    where: (log, { eq }) => eq(log.vehicleId, id),
    columns: { id: true },
  });

  // Get maintenance logs count
  const maintenanceLogsCount = await db.query.maintenanceLogTable.findMany({
    where: (log, { eq }) => eq(log.vehicleId, id),
    columns: { id: true },
  });

  return {
    ...vehicle,
    totalFuelLogs: fuelLogsCount.length,
    totalMaintenanceLogs: maintenanceLogsCount.length,
  };
};
