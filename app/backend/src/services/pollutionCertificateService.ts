import { PollutionCertificateError } from "@exceptions/PollutionCertificateError.js";
import { Status } from "@exceptions/ServiceError.js";
import { VehicleError } from "@exceptions/VehicleError.js";
import * as schema from "@db/schema/index.js";
import { db } from "@db/index.js";
import { eq } from "drizzle-orm";

export const addPollutionCertificate = async (
  vehicleId: string,
  pollutionCertificateData: any
) => {
  const vehicle = await db.query.vehicleTable.findFirst({
    where: (vehicles, { eq }) => eq(vehicles.id, vehicleId),
  });
  if (!vehicle) {
    throw new VehicleError(
      `No vehicle found for id : ${vehicleId}`,
      Status.NOT_FOUND
    );
  }
  const pollutionCertificate = await db
    .insert(schema.pollutionCertificateTable)
    .values({
      ...pollutionCertificateData,
      vehicleId: vehicleId,
      id: undefined,
    })
    .returning();
  return {
    id: pollutionCertificate[0]?.id,
    message: "Pollution certificate added successfully.",
  };
};

export const getPollutionCertificates = async (vehicleId: string) => {
  const pollutionCertificates =
    await db.query.pollutionCertificateTable.findMany({
      where: (certificates, { eq }) => eq(certificates.vehicleId, vehicleId),
    });
  if (!pollutionCertificates || pollutionCertificates.length === 0) {
    throw new PollutionCertificateError(
      `No PUCC found for vehicle id : ${vehicleId}`,
      Status.NOT_FOUND
    );
  }
  return pollutionCertificates;
};

export const updatePollutionCertificate = async (
  vehicleId: string,
  id: string,
  pollutionCertificateData: any
) => {
  const pollutionCertificate =
    await db.query.pollutionCertificateTable.findFirst({
      where: (certificates, { eq, and }) =>
        and(eq(certificates.vehicleId, vehicleId), eq(certificates.id, id)),
    });
  if (!pollutionCertificate) {
    throw new PollutionCertificateError(
      `No PUCC found for id : ${id}`,
      Status.NOT_FOUND
    );
  }

  await db
    .update(schema.pollutionCertificateTable)
    .set({
      ...pollutionCertificateData,
    })
    .where(eq(schema.pollutionCertificateTable.id, id));
  return { message: "Pollution certificate updated successfully." };
};

export const deletePollutionCertificate = async (id: string) => {
  const result = await db
    .delete(schema.pollutionCertificateTable)
    .where(eq(schema.pollutionCertificateTable.id, id))
    .returning();
  if (result.length === 0) {
    throw new PollutionCertificateError(
      `No PUCC found for id : ${id}`,
      Status.NOT_FOUND
    );
  }
  return { message: "Pollution certificate deleted successfully." };
};
