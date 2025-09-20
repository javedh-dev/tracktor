import { Status } from "@exceptions/ServiceError.js";
import { VehicleError } from "@exceptions/VehicleError.js";
import * as schema from "@db/schema/index.js";
import { db } from "@db/index.js";
import { eq } from "drizzle-orm";

export const addVehicle = async (vehicleData: any) => {
  const vehicle = await db
    .insert(schema.vehicleTable)
    .values({ ...vehicleData, id: undefined })
    .returning();
  return { id: vehicle[0]?.id, message: "Vehicle added successfully." };
};

export const getAllVehicles = async () => {
  const vehicles = await db.query.vehicleTable.findMany();

  // Get all insurances and pollution certificates for all vehicles
  const allInsurances = await db.query.insuranceTable.findMany();
  const allPollutionCertificates =
    await db.query.pollutionCertificateTable.findMany();

  return vehicles.map((vehicle) => {
    const insurances = allInsurances.filter(
      (insurance) => insurance.vehicleId === vehicle.id,
    );
    const pollutionCertificates = allPollutionCertificates.filter(
      (pucc) => pucc.vehicleId === vehicle.id,
    );

    let insuranceStatus = "Not Available";
    if (insurances && insurances.length > 0) {
      insuranceStatus = "Expired";
      insurances.forEach((insurance) => {
        const endDate = new Date(insurance.endDate);
        const today = new Date();
        if (endDate > today) {
          insuranceStatus = "Active";
        }
      });
    }

    let puccStatus = "Not Available";
    if (pollutionCertificates && pollutionCertificates.length > 0) {
      puccStatus = "Expired";
      pollutionCertificates.forEach((pucc) => {
        const expiryDate = new Date(pucc.expiryDate);
        const today = new Date();
        if (expiryDate > today) {
          puccStatus = "Active";
        }
      });
    }

    return {
      ...vehicle,
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
    throw new VehicleError(`No vehicle found for id : ${id}`, Status.NOT_FOUND);
  }
  return vehicle;
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
    throw new VehicleError(`No vehicle found for id : ${id}`, Status.NOT_FOUND);
  }
  return { message: "Vehicle deleted successfully." };
};
