import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq, getTableColumns } from 'drizzle-orm';
import { createOwnedEntityService } from '../utils/entity-service-factory';
import { clearFixedEndDate } from './domain-payload.helper';
import type { z } from 'zod';
import { insuranceSchema } from '$lib/domain/insurance';

type InsurancePayload = Omit<z.infer<typeof insuranceSchema>, 'id' | 'vehicleId'>;
type InsuranceUpdatePayload = Partial<InsurancePayload>;

const { add, getById, update, remove } = createOwnedEntityService<
  InsurancePayload,
  InsuranceUpdatePayload
>({
  table: schema.insuranceTable,
  entityName: 'Insurance',
  sanitize: clearFixedEndDate
});

export const addInsurance = add;
export const getInsuranceById = getById;
export const updateInsurance = update;
export const deleteInsurance = remove;

export const getInsurances = async (vehicleId?: string) => {
  if (vehicleId) {
    const insurance = await db.query.insuranceTable.findMany({
      where: (insurances, { eq }) => eq(insurances.vehicleId, vehicleId)
    });
    return insurance.map((i) => (i.recurrenceType !== 'none' ? { ...i, endDate: null } : i));
  }

  const rows = await db
    .select({
      ...getTableColumns(schema.insuranceTable),
      vehicleMake: schema.vehicleTable.make,
      vehicleModel: schema.vehicleTable.model,
      vehiclePlate: schema.vehicleTable.licensePlate
    })
    .from(schema.insuranceTable)
    .leftJoin(schema.vehicleTable, eq(schema.insuranceTable.vehicleId, schema.vehicleTable.id));

  return rows.map((i) => (i.recurrenceType !== 'none' ? { ...i, endDate: null } : i));
};
