import { AppError, Status } from "@exceptions/AppError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";

export const addInsurance = async (vehicleId: string, insuranceData: any) => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicles, { eq }) => eq(vehicles.id, vehicleId),
  });
  if (!vehicle) {
    throw new AppError(
      `No vehicle found for id : ${vehicleId}`,
      Status.NOT_FOUND,
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
  return insurance;
};

export const updateInsurance = async (
  vehicleId: string,
  id: string,
  insuranceData: any,
) => {
  const insurance = await db.query.insuranceTable.findFirst({
    where: (insurances, { eq, and }) =>
      and(eq(insurances.vehicleId, vehicleId), eq(insurances.id, id)),
  });
  if (!insurance) {
    throw new AppError(`No Insurances found for id: ${id}`, Status.NOT_FOUND);
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
    throw new AppError(`No Insurances found for id: ${id}`, Status.NOT_FOUND);
  }
  return { message: "Insurance details deleted successfully." };
};
