import { AppError, Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import type { ApiResponse } from '$lib/response';
import { validateVehicleExists, performDelete } from '../utils/serviceUtils';

export const addInsurance = async (vehicleId: string, insuranceData: any): Promise<ApiResponse> => {
	await validateVehicleExists(vehicleId);
	// Sanitize: remove endDate on backend when recurrence is not fixed
	if (insuranceData && insuranceData.recurrenceType !== 'none') {
		insuranceData.endDate = null;
	}
	const insurance = await db
		.insert(schema.insuranceTable)
		.values({
			...insuranceData,
			vehicleId: vehicleId,
			id: undefined
		})
		.returning();
	return {
		data: insurance[0],
		success: true,
		message: 'Insurance details added successfully.'
	};
};

export const getInsurances = async (vehicleId: string): Promise<ApiResponse> => {
	const insurance = await db.query.insuranceTable.findMany({
		where: (insurances, { eq }) => eq(insurances.vehicleId, vehicleId)
	});
	// Ensure response does not include endDate for non-fixed recurrence
	const normalized = insurance.map((i) =>
		i.recurrenceType !== 'none' ? { ...i, endDate: null } : i
	);
	return {
		data: normalized,
		success: true
	};
};

export const getInsuranceById = async (id: string): Promise<ApiResponse> => {
	const insurance = await db.query.insuranceTable.findFirst({
		where: (insurances, { eq }) => eq(insurances.id, id)
	});
	if (!insurance) {
		throw new AppError(`No insurance found for id: ${id}`, Status.NOT_FOUND);
	}
	return {
		data: insurance,
		success: true
	};
};

export const updateInsurance = async (
	vehicleId: string,
	id: string,
	insuranceData: any
): Promise<ApiResponse> => {
	const insurance = await db.query.insuranceTable.findFirst({
		where: (insurances, { eq, and }) =>
			and(eq(insurances.vehicleId, vehicleId), eq(insurances.id, id))
	});
	if (!insurance) {
		throw new AppError(`No Insurances found for id: ${id}`, Status.NOT_FOUND);
	}
	const updatedInsurance = await db
		.update(schema.insuranceTable)
		.set({
			...(insuranceData && insuranceData.recurrenceType !== 'none'
				? { ...insuranceData, endDate: null }
				: insuranceData)
		})
		.where(eq(schema.insuranceTable.id, id))
		.returning();
	return {
		data: updatedInsurance[0],
		success: true,
		message: 'Insurance details updated successfully.'
	};
};

export const deleteInsurance = async (id: string): Promise<ApiResponse> => {
	return await performDelete(schema.insuranceTable, id, 'Insurance');
};
