import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { insuranceSchema } from '$lib/domain/insurance';
import { validateVehicleExists, performDelete } from '../utils/serviceUtils';
import { clearFixedEndDate } from './domain-payload.helper';
import { requireRecord } from './service-response.helper';

type InsurancePayload = Omit<z.infer<typeof insuranceSchema>, 'id' | 'vehicleId'>;
type InsuranceUpdatePayload = Partial<InsurancePayload>;

export const addInsurance = async (vehicleId: string, insuranceData: InsurancePayload) => {
  await validateVehicleExists(vehicleId);
  const sanitizedInsuranceData = clearFixedEndDate(insuranceData);
  const insurance = await db
    .insert(schema.insuranceTable)
    .values({
      ...sanitizedInsuranceData,
      vehicleId: vehicleId,
      id: undefined
    })
    .returning();
  return insurance[0];
};

export const getInsurances = async (vehicleId: string) => {
  const insurance = await db.query.insuranceTable.findMany({
    where: (insurances, { eq }) => eq(insurances.vehicleId, vehicleId)
  });
  // Ensure response does not include endDate for non-fixed recurrence
  const normalized = insurance.map((i) =>
    i.recurrenceType !== 'none' ? { ...i, endDate: null } : i
  );
  return normalized;
};

export const getInsuranceById = async (id: string) => {
  const insurance = requireRecord(
    await db.query.insuranceTable.findFirst({
      where: (insurances, { eq }) => eq(insurances.id, id)
    }),
    `No insurance found for id: ${id}`
  );

  return insurance;
};

export const updateInsurance = async (
  vehicleId: string,
  id: string,
  insuranceData: InsuranceUpdatePayload
) => {
  requireRecord(
    await db.query.insuranceTable.findFirst({
      where: (insurances, { eq, and }) =>
        and(eq(insurances.vehicleId, vehicleId), eq(insurances.id, id))
    }),
    `No Insurances found for id: ${id}`
  );
  const updatedInsurance = await db
    .update(schema.insuranceTable)
    .set(clearFixedEndDate(insuranceData))
    .where(eq(schema.insuranceTable.id, id))
    .returning();
  return updatedInsurance[0];
};

export const deleteInsurance = async (id: string) => {
  return await performDelete(schema.insuranceTable, id, 'Insurance');
};
