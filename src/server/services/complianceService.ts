import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq, getTableColumns } from 'drizzle-orm';
import { createOwnedEntityService } from '../utils/entity-service-factory';
import { clearFixedEndDate } from './domain-payload.helper';
import type { z } from 'zod';
import { complianceSchema } from '$lib/domain/compliance';

type CompliancePayload = Omit<z.infer<typeof complianceSchema>, 'id' | 'vehicleId'>;
type ComplianceUpdatePayload = Partial<CompliancePayload>;

const { add, getById, update, remove } = createOwnedEntityService<
  CompliancePayload,
  ComplianceUpdatePayload
>({
  table: schema.complianceDocumentTable,
  entityName: 'Compliance document',
  sanitize: clearFixedEndDate
});

export const addComplianceDocument = add;
export const getComplianceDocumentById = getById;
export const updateComplianceDocument = update;
export const deleteComplianceDocument = remove;

export const getComplianceDocuments = async (vehicleId?: string, type?: string) => {
  if (vehicleId) {
    const documents = await db.query.complianceDocumentTable.findMany({
      where: (docs, { and, eq }) =>
        type
          ? and(eq(docs.vehicleId, vehicleId), eq(docs.type, type))
          : eq(docs.vehicleId, vehicleId)
    });
    return documents.map((d) => (d.recurrenceType !== 'none' ? { ...d, endDate: null } : d));
  }

  const rows = await db
    .select({
      ...getTableColumns(schema.complianceDocumentTable),
      vehicleMake: schema.vehicleTable.make,
      vehicleModel: schema.vehicleTable.model,
      vehiclePlate: schema.vehicleTable.licensePlate
    })
    .from(schema.complianceDocumentTable)
    .leftJoin(
      schema.vehicleTable,
      eq(schema.complianceDocumentTable.vehicleId, schema.vehicleTable.id)
    )
    .where(type ? eq(schema.complianceDocumentTable.type, type) : undefined);

  return rows.map((d) => (d.recurrenceType !== 'none' ? { ...d, endDate: null } : d));
};
