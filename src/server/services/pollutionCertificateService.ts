import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq, getTableColumns } from 'drizzle-orm';
import { createOwnedEntityService } from '../utils/entity-service-factory';
import { clearFixedEndDate } from './domain-payload.helper';
import type { z } from 'zod';
import { pollutionCertificateSchema } from '$lib/domain/pucc';

type PollutionCertificatePayload = Omit<
  z.infer<typeof pollutionCertificateSchema>,
  'id' | 'vehicleId'
>;
type PollutionCertificateUpdatePayload = Partial<PollutionCertificatePayload>;

const { add, getById, update, remove } = createOwnedEntityService<
  PollutionCertificatePayload,
  PollutionCertificateUpdatePayload
>({
  table: schema.pollutionCertificateTable,
  entityName: 'Pollution certificate',
  sanitize: clearFixedEndDate
});

export const addPollutionCertificate = add;
export const getPollutionCertificateById = getById;
export const updatePollutionCertificate = update;
export const deletePollutionCertificate = remove;

export const getPollutionCertificates = async (vehicleId?: string) => {
  if (vehicleId) {
    const pollutionCertificates = await db.query.pollutionCertificateTable.findMany({
      where: (certificates, { eq }) => eq(certificates.vehicleId, vehicleId)
    });
    return pollutionCertificates.map((c) =>
      c.recurrenceType !== 'none' ? { ...c, expiryDate: null } : c
    );
  }

  const rows = await db
    .select({
      ...getTableColumns(schema.pollutionCertificateTable),
      vehicleMake: schema.vehicleTable.make,
      vehicleModel: schema.vehicleTable.model,
      vehiclePlate: schema.vehicleTable.licensePlate
    })
    .from(schema.pollutionCertificateTable)
    .leftJoin(
      schema.vehicleTable,
      eq(schema.pollutionCertificateTable.vehicleId, schema.vehicleTable.id)
    );

  return rows.map((c) => (c.recurrenceType !== 'none' ? { ...c, expiryDate: null } : c));
};
