import { AppError, Status } from "@exceptions/AppError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@tracktor/common";
import { validateVehicleExists, performDelete } from "@utils/serviceUtils";

export const addPollutionCertificate = async (
  vehicleId: string,
  pollutionCertificateData: any,
): Promise<ApiResponse> => {
  await validateVehicleExists(vehicleId);
  const pollutionCertificate = await db
    .insert(schema.pollutionCertificateTable)
    .values({
      ...pollutionCertificateData,
      vehicleId: vehicleId,
      id: undefined,
    })
    .returning();
  return {
    data: pollutionCertificate[0],
    success: true,
    message: "Pollution certificate added successfully.",
  };
};

export const getPollutionCertificates = async (vehicleId: string): Promise<ApiResponse> => {
  const pollutionCertificates =
    await db.query.pollutionCertificateTable.findMany({
      where: (certificates, { eq }) => eq(certificates.vehicleId, vehicleId),
    });
  return {
    data: pollutionCertificates,
    success: true,
  };
};

export const getPollutionCertificateById = async (id: string): Promise<ApiResponse> => {
  const pollutionCertificate = await db.query.pollutionCertificateTable.findFirst({
    where: (certificates, { eq }) => eq(certificates.id, id),
  });
  if (!pollutionCertificate) {
    throw new AppError(`No PUCC found for id : ${id}`, Status.NOT_FOUND);
  }
  return {
    data: pollutionCertificate,
    success: true,
  };
};

export const updatePollutionCertificate = async (
  vehicleId: string,
  id: string,
  pollutionCertificateData: any,
): Promise<ApiResponse> => {
  const pollutionCertificate =
    await db.query.pollutionCertificateTable.findFirst({
      where: (certificates, { eq, and }) =>
        and(eq(certificates.vehicleId, vehicleId), eq(certificates.id, id)),
    });
  if (!pollutionCertificate) {
    throw new AppError(`No PUCC found for id : ${id}`, Status.NOT_FOUND);
  }

  const updatedCertificate = await db
    .update(schema.pollutionCertificateTable)
    .set({
      ...pollutionCertificateData,
    })
    .where(eq(schema.pollutionCertificateTable.id, id))
    .returning();
  return {
    data: updatedCertificate[0],
    success: true,
    message: "Pollution certificate updated successfully.",
  };
};

export const deletePollutionCertificate = async (id: string): Promise<ApiResponse> => {
  return await performDelete(schema.pollutionCertificateTable, id, "Pollution certificate");
};
