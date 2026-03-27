import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import type { ApiResponse } from '$lib/response';
import type { PollutionCertificate } from '$lib/domain/pucc';
import { validateVehicleExists, performDelete } from '../utils/serviceUtils';
import { clearFixedEndDate } from './domain-payload.helper';
import { createSuccessResponse, requireRecord } from './service-response.helper';

type PollutionCertificatePayload = {
  certificateNumber: string;
  issueDate: string;
  expiryDate: string | null;
  recurrenceType: PollutionCertificate['recurrenceType'];
  recurrenceInterval: number;
  testingCenter: string;
  notes: string | null;
  attachment: string | null;
};

export const addPollutionCertificate = async (
  vehicleId: string,
  pollutionCertificateData: PollutionCertificatePayload
): Promise<ApiResponse> => {
  await validateVehicleExists(vehicleId);
  const sanitizedPayload = clearFixedEndDate(pollutionCertificateData);
  const pollutionCertificate = await db
    .insert(schema.pollutionCertificateTable)
    .values({
      ...sanitizedPayload,
      vehicleId: vehicleId,
      id: undefined
    })
    .returning();
  return createSuccessResponse(
    pollutionCertificate[0],
    'Pollution certificate added successfully.'
  );
};

export const getPollutionCertificates = async (vehicleId: string): Promise<ApiResponse> => {
  const pollutionCertificates = await db.query.pollutionCertificateTable.findMany({
    where: (certificates, { eq }) => eq(certificates.vehicleId, vehicleId)
  });
  const normalized = pollutionCertificates.map((c) =>
    c.recurrenceType !== 'none' ? { ...c, expiryDate: null } : c
  );
  return createSuccessResponse(normalized);
};

export const getPollutionCertificateById = async (id: string): Promise<ApiResponse> => {
  const pollutionCertificate = requireRecord(
    await db.query.pollutionCertificateTable.findFirst({
      where: (certificates, { eq }) => eq(certificates.id, id)
    }),
    `No PUCC found for id : ${id}`
  );

  return createSuccessResponse(pollutionCertificate);
};

export const updatePollutionCertificate = async (
  vehicleId: string,
  id: string,
  pollutionCertificateData: PollutionCertificatePayload
): Promise<ApiResponse> => {
  requireRecord(
    await db.query.pollutionCertificateTable.findFirst({
      where: (certificates, { eq, and }) =>
        and(eq(certificates.vehicleId, vehicleId), eq(certificates.id, id))
    }),
    `No PUCC found for id : ${id}`
  );

  const updatedCertificate = await db
    .update(schema.pollutionCertificateTable)
    .set(clearFixedEndDate(pollutionCertificateData))
    .where(eq(schema.pollutionCertificateTable.id, id))
    .returning();
  return createSuccessResponse(
    updatedCertificate[0],
    'Pollution certificate updated successfully.'
  );
};

export const deletePollutionCertificate = async (id: string): Promise<ApiResponse> => {
  return await performDelete(schema.pollutionCertificateTable, id, 'Pollution certificate');
};
