import { AppError, Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import type { ApiResponse } from '$lib/response';
import type { Insurance } from '$lib/domain/insurance';
import { validateVehicleExists, performDelete } from '../utils/serviceUtils';
import { clearFixedEndDate } from './domain-payload.helper';
import { createSuccessResponse, requireRecord } from './service-response.helper';

type InsurancePayload = {
  provider: string;
  policyNumber: string;
  startDate: string;
  endDate: string | null;
  recurrenceType: Insurance['recurrenceType'];
  recurrenceInterval: number;
  cost: number;
  notes: string | null;
  attachment: string | null;
};

export const addInsurance = async (
  vehicleId: string,
  insuranceData: InsurancePayload
): Promise<ApiResponse> => {
  await validateVehicleExists(vehicleId);
  const sanitizedInsuranceData = clearFixedEndDate(insuranceData);
  const insurance = await db
    .insert(schema.insuranceTable)
    .values({
      ...sanitizedInsuranceData,
      vehicleId: vehicleId
    })
    .returning();
  return createSuccessResponse(insurance[0], 'Insurance details added successfully.');
};

export const getInsurances = async (vehicleId: string): Promise<ApiResponse> => {
  const insurance = await db.query.insuranceTable.findMany({
    where: (insurances, { eq }) => eq(insurances.vehicleId, vehicleId)
  });
  // Ensure response does not include endDate for non-fixed recurrence
  const normalized = insurance.map((i) =>
    i.recurrenceType !== 'none' ? { ...i, endDate: null } : i
  );
  return createSuccessResponse(normalized);
};

export const getInsuranceById = async (id: string): Promise<ApiResponse> => {
  const insurance = requireRecord(
    await db.query.insuranceTable.findFirst({
      where: (insurances, { eq }) => eq(insurances.id, id)
    }),
    `No insurance found for id: ${id}`
  );

  return createSuccessResponse(insurance);
};

export const updateInsurance = async (
  vehicleId: string,
  id: string,
  insuranceData: InsurancePayload
): Promise<ApiResponse> => {
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
  return createSuccessResponse(updatedInsurance[0], 'Insurance details updated successfully.');
};

export const deleteInsurance = async (id: string): Promise<ApiResponse> => {
  return await performDelete(schema.insuranceTable, id, 'Insurance');
};
