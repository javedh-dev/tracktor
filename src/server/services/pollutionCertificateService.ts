import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { pollutionCertificateSchema } from '$lib/domain/pucc';
import { validateVehicleExists, performDelete } from '../utils/serviceUtils';
import { clearFixedEndDate } from './domain-payload.helper';
import { requireRecord } from './service-response.helper';

type PollutionCertificatePayload = Omit<
  z.infer<typeof pollutionCertificateSchema>,
  'id' | 'vehicleId'
>;
type PollutionCertificateUpdatePayload = Partial<PollutionCertificatePayload>;

export const addPollutionCertificate = async (
  vehicleId: string,
  pollutionCertificateData: PollutionCertificatePayload
) => {
  await validateVehicleExists(vehicleId);
  const sanitizedPayload = clearFixedEndDate(pollutionCertificateData);
  const [pollutionCertificate] = await db
    .insert(schema.pollutionCertificateTable)
    .values({
      ...sanitizedPayload,
      vehicleId: vehicleId,
      id: undefined
    })
    .returning();
  return pollutionCertificate;
};

export const getPollutionCertificates = async (vehicleId: string) => {
  const pollutionCertificates = await db.query.pollutionCertificateTable.findMany({
    where: (certificates, { eq }) => eq(certificates.vehicleId, vehicleId)
  });
  const normalized = pollutionCertificates.map((c) =>
    c.recurrenceType !== 'none' ? { ...c, expiryDate: null } : c
  );
  return normalized;
};

export const getPollutionCertificateById = async (id: string) => {
  const pollutionCertificate = requireRecord(
    await db.query.pollutionCertificateTable.findFirst({
      where: (certificates, { eq }) => eq(certificates.id, id)
    }),
    `No PUCC found for id : ${id}`
  );

  return pollutionCertificate;
};

export const updatePollutionCertificate = async (
  vehicleId: string,
  id: string,
  pollutionCertificateData: PollutionCertificateUpdatePayload
) => {
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
  return updatedCertificate[0];
};

export const deletePollutionCertificate = async (id: string) => {
  return await performDelete(schema.pollutionCertificateTable, id, 'Pollution certificate');
};
