import { InsuranceError } from "@exceptions/InsuranceError.js";
import { Status } from "@exceptions/ServiceError.js";
import { VehicleError } from "@exceptions/VehicleError.js";
import * as schema from "@db/schema/index.js";
import { db } from "@db/index.js";
import { eq, and } from "drizzle-orm";

export const addInsurance = async (vehicleId: string, insuranceData: any) => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicles, { eq }) => eq(vehicles.id, vehicleId),
  });
  if (!vehicle) {
    throw new VehicleError(
      `No vehicle found for id : ${vehicleId}`,
      Status.NOT_FOUND
    );
  }
  const insurance = await db
    .insert(schema.insuranceTable)
    .values({
      ...insuranceData,
      vehicleId: vehicleId,
      id: undefined,
    })
    .returning();
  return {
    id: insurance[0]?.id,
    message: "Insurance details added successfully.",
  };
};

export const getInsurances = async (vehicleId: string) => {
  const insurance = await db.query.insuranceTable.findMany({
    where: (insurances, { eq }) => eq(insurances.vehicleId, vehicleId),
  });
  if (!insurance || insurance.length === 0) {
    throw new InsuranceError(
      `No Insurances found for vehicle id : ${vehicleId}`,
      Status.NOT_FOUND
    );
  }
  return insurance;
};

export const updateInsurance = async (
  vehicleId: string,
  id: string,
  insuranceData: any
) => {
  const insurance = await db.query.insuranceTable.findFirst({
    where: (insurances, { eq, and }) =>
      and(eq(insurances.vehicleId, vehicleId), eq(insurances.id, id)),
  });
  if (!insurance) {
    throw new InsuranceError(
      `No Insurances found for id: ${id}`,
      Status.NOT_FOUND
    );
  }
  await db
    .update(schema.insuranceTable)
    .set({
      ...insuranceData,
    })
    .where(eq(schema.insuranceTable.id, id));
  return { message: "Insurance details updated successfully." };
};

export const deleteInsurance = async (id: string) => {
  const result = await db
    .delete(schema.insuranceTable)
    .where(eq(schema.insuranceTable.id, id))
    .returning();
  if (result.length === 0) {
    throw new InsuranceError(
      `No Insurances found for id: ${id}`,
      Status.NOT_FOUND
    );
  }
  return { message: "Insurance details deleted successfully." };
};
